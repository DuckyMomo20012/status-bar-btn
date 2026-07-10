import type { Command } from 'vscode'
import { computed, defineExtension, useActiveTextEditor, useCommands, useStatusBarItem, watch, watchEffect } from 'reactive-vscode'
import { ConfigurationTarget, MarkdownString, StatusBarAlignment, ThemeColor, workspace } from 'vscode'
import { useClockContext } from './composables/useClockContext'
import { useOsContext } from './composables/useOsContext'
import { useWorkspaceContext } from './composables/useTemplateContext'
import { config } from './config'
import { getValueByPath, logger } from './utils'

const DEFAULT_BTN_VISIBILITY = false

function toRegExp(str: string): RegExp {
  const regexMatch = str.match(/^\/(.*)\/([gimsuy]*)$/)

  if (regexMatch) {
    const [_, pattern, flags] = regexMatch
    return new RegExp(pattern, flags)
  }

  return new RegExp(str)
}

function activationStringCheck(a: string, b: string[]) {
  if (!Array.isArray(b) || b.length === 0) {
    return true
  }

  return b.some((str) => {
    try {
      const regex = toRegExp(str)
      logger.info(`Checking if "${a}" matches regex pattern "${regex}"`)
      return regex.test(a)
    }
    catch (error) {
      logger.info(`Invalid regex pattern provided "${str}": ${error}`)
      return false
    }
  })
}

function interpolate(template: string, contextData: any): string {
  return template.replace(/\$\{([^}]+)\}/g, (_, targetPath) => getValueByPath(contextData, targetPath))
}

const { activate, deactivate } = defineExtension(() => {
  const activeTextEditor = useActiveTextEditor()
  const workspaceCtx = useWorkspaceContext()
  const osContext = useOsContext()

  watch(() => [config.enabled, config.btns, activeTextEditor], async ([enabled, btns], _, onCleanup) => {
    if (!enabled || !Array.isArray(btns)) {
      return
    }

    const currentBtns = await Promise.all(btns.map(async (btn) => {
      const clockContext = useClockContext(() => btn.interpolation?.clockTimezone)

      const context = computed(() => ({
        ...workspaceCtx.value,
        os: osContext.value,
        clock: clockContext.value,
      }))

      let tooltip: string | MarkdownString | undefined = btn.tooltip as string | MarkdownString | undefined
      if (btn.tooltip && typeof btn.tooltip === 'object') {
        const tooltipObj = btn.tooltip as MarkdownString
        const md = new MarkdownString(interpolate(tooltipObj.value, context.value))
        md.isTrusted = !!tooltipObj.isTrusted
        md.supportThemeIcons = !!tooltipObj.supportThemeIcons
        tooltip = md
      }
      else if (btn.tooltip && typeof btn.tooltip === 'string') {
        tooltip = interpolate(btn.tooltip, context.value)
      }

      const showOnWorkspaceContains = btn.showOnWorkspaceContains ? (await (workspace.findFiles(btn.showOnWorkspaceContains))).length > 0 : undefined

      const showOnLanguage = btn.showOnLanguage ? activationStringCheck(activeTextEditor?.value?.document.languageId ?? '', btn.showOnLanguage) : undefined

      const showOnFileName = btn.showOnFileName ? activationStringCheck(activeTextEditor?.value?.document.fileName ?? '', btn.showOnFileName) : undefined

      const showOnFileText = btn.showOnFileText ? activationStringCheck(activeTextEditor?.value?.document.getText() ?? '', btn.showOnFileText) : undefined

      const isVisible = btn.visible ?? showOnWorkspaceContains ?? showOnLanguage ?? showOnFileName ?? showOnFileText ?? DEFAULT_BTN_VISIBILITY

      const item = useStatusBarItem({
        id: btn.id,
        alignment: btn.alignment === 'left' ? StatusBarAlignment.Left : StatusBarAlignment.Right,
        priority: btn.priority,
        name: btn.name,
        text: () => {
          if (!btn.text)
            return ''
          return interpolate(btn.text, context.value)
        },
        tooltip,
        color: btn.color as string | ThemeColor | undefined,
        backgroundColor: btn.backgroundColor?.id ? new ThemeColor(btn.backgroundColor.id) : undefined,
        command: btn.command as string | Command | undefined,
        accessibilityInformation: btn.accessibilityInformation,
        visible: isVisible,
      })

      watchEffect(() => {
        logger.info(`Button \"${btn.id ?? btn.name ?? btn.text ?? btn.command}\" visibility changed to: ${btn.visible ?? DEFAULT_BTN_VISIBILITY}`)
      })

      return item
    }))

    onCleanup(() => {
      currentBtns.forEach((btn) => {
        btn.hide()
        btn.dispose()
      })
    })
  }, { deep: true, immediate: true })

  useCommands({
    'status-bar-btn.toggle': () => {
      const inspect = config.inspect('enabled')

      let target = ConfigurationTarget.Global
      if (inspect?.workspaceValue !== undefined) {
        target = ConfigurationTarget.Workspace
      }
      else if (inspect?.workspaceFolderValue !== undefined) {
        target = ConfigurationTarget.WorkspaceFolder
      }

      logger.info(`Toggling status bar button (current value: ${config.enabled})`)

      config.update('enabled', !config.enabled, target)
    },
    'status-bar-btn.changeSettingsJson': (...args: Array<{
      setting: string
      value?: string | number | boolean | null | undefined
      enums?: Array<string | number | boolean | null | undefined>
      forceWriteDefault?: boolean
    }>) => {
      // NOTE: Should determine the target based on the current setting value,
      // not the new value being set. This ensures that we respect the user's
      // existing configuration scope.
      const inspect = config.inspect('enabled')

      let target = ConfigurationTarget.Global
      if (inspect?.workspaceValue !== undefined) {
        target = ConfigurationTarget.Workspace
      }
      else if (inspect?.workspaceFolderValue !== undefined) {
        target = ConfigurationTarget.WorkspaceFolder
      }

      for (const arg of args) {
        const { setting, value, enums } = arg
        if (!setting) {
          logger.error(`Missing "setting" property in argument: ${JSON.stringify(arg)}`)
        }

        const inspect = workspace.getConfiguration().inspect(setting)

        // NOTE: Direct changing value has higher priority than cycling through
        // enums. If both are provided, the value will be set directly.
        if (value) {
          if (arg.forceWriteDefault && value === 'undefined' && inspect?.defaultValue) {
            workspace.getConfiguration().update(setting, inspect.defaultValue, target)
          }
          else {
            workspace.getConfiguration().update(setting, value, target)
          }

          continue
        }

        if (enums) {
          let currentValue = workspace.getConfiguration().get(setting) as string | number | boolean | null | undefined
          if (currentValue === 'undefined') {
            currentValue = undefined
          }
          const currentEnumIdx = enums.indexOf(currentValue)

          if (currentEnumIdx === -1) {
            logger.error(`Current value "${currentValue}" of setting "${setting}" is not in the provided enums: ${JSON.stringify(enums)}, set to the first enum value "${enums[0]}"`)
          }

          let newValue = enums[(currentEnumIdx + 1) % enums.length]
          logger.info(`Cycling setting "${setting}" from current value "${currentValue}" to new value "${newValue}"`)
          if (newValue === 'undefined') {
            newValue = undefined
          }

          // NOTE: By default behavior, update with undefined will remove the
          // setting from the configuration file, and fallback to the default
          // value. If the user explicitly wants to write the value by setting
          // forceWriteDefault to true, we will write the default value instead of
          // removing the setting from the configuration file.
          if (arg.forceWriteDefault && newValue === undefined && inspect?.defaultValue) {
            workspace.getConfiguration().update(setting, inspect.defaultValue, target)
          }
          else {
            workspace.getConfiguration().update(setting, newValue, target)
          }
          continue
        }
      }
    },
  })
})

export { activate, deactivate }
