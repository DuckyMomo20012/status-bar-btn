import type { UseStatusBarItemOptions } from 'reactive-vscode'
import type { Command } from 'vscode'
import { computed, defineExtension, useActiveTextEditor, useCommands, useStatusBarItem, watch, watchEffect } from 'reactive-vscode'
import { ConfigurationTarget, MarkdownString, StatusBarAlignment, ThemeColor, workspace } from 'vscode'
import { useClockContext } from './composables/useClockContext'
import { useOsContext } from './composables/useOsContext'
import { useWorkspaceContext } from './composables/useTemplateContext'
import { config } from './config'
import { checkStringPattern, deepMerge, interpolate, isDeepSubset, logger } from './utils'

const DEFAULT_BTN_VISIBILITY = false

const { activate, deactivate } = defineExtension(() => {
  const activeTextEditor = useActiveTextEditor()
  const workspaceCtx = useWorkspaceContext()
  const osContext = useOsContext()

  watch(() => [config.enabled, config.btns, activeTextEditor], async ([enabled, btns], _, onCleanup) => {
    if (enabled !== true || !Array.isArray(btns)) {
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
      if (btn.tooltip !== undefined && typeof btn.tooltip === 'object') {
        const tooltipObj = btn.tooltip as MarkdownString
        const md = new MarkdownString(interpolate(tooltipObj.value, context.value))
        md.isTrusted = Boolean(tooltipObj.isTrusted)
        md.supportThemeIcons = !!tooltipObj.supportThemeIcons
        tooltip = md
      }
      else if (btn.tooltip && typeof btn.tooltip === 'string') {
        tooltip = interpolate(btn.tooltip, context.value)
      }

      const showOnWorkspaceContains = (btn.showOnWorkspaceContains !== undefined) ? (await (workspace.findFiles(btn.showOnWorkspaceContains))).length > 0 : undefined

      const showOnLanguage = btn.showOnLanguage ? checkStringPattern(activeTextEditor?.value?.document.languageId ?? '', btn.showOnLanguage) : undefined

      const showOnFileName = btn.showOnFileName ? checkStringPattern(activeTextEditor?.value?.document.fileName ?? '', btn.showOnFileName) : undefined

      const showOnFileText = btn.showOnFileText ? checkStringPattern(activeTextEditor?.value?.document.getText() ?? '', btn.showOnFileText) : undefined

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
      value?: any
      enums?: Array<any>
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
        // eslint-disable-next-line ts/no-unsafe-assignment
        const { setting, value, enums } = arg
        if (!setting) {
          logger.error(`Missing "setting" property in argument: ${JSON.stringify(arg)}`)
        }

        const inspect = workspace.getConfiguration().inspect(setting)

        // NOTE: Direct changing value has higher priority than cycling through
        // enums. If both are provided, the value will be set directly.
        if (value !== undefined) {
          if (arg.forceWriteDefault && value === 'undefined' && inspect?.defaultValue !== undefined) {
            workspace.getConfiguration().update(setting, inspect.defaultValue, target)
          }
          else {
            workspace.getConfiguration().update(setting, value, target)
          }

          continue
        }

        if (enums) {
          let currentValue = workspace.getConfiguration().get(setting)
          if (currentValue === 'undefined') {
            currentValue = undefined
          }
          const currentEnumIdx = enums.indexOf(currentValue)

          if (currentEnumIdx === -1) {
            logger.error(`Current value "${currentValue as any}" of setting "${setting}" is not in the provided enums: ${JSON.stringify(enums)}, set to the first enum value "${enums[0]}"`)
          }

          // eslint-disable-next-line ts/no-unsafe-assignment
          let newValue = enums[(currentEnumIdx + 1) % enums.length]
          logger.info(`Cycling setting "${setting}" from current value "${currentValue as any}" to new value "${newValue}"`)
          if (newValue === 'undefined') {
            newValue = undefined
          }

          // NOTE: By default behavior, update with undefined will remove the
          // setting from the configuration file, and fallback to the default
          // value. If the user explicitly wants to write the value by setting
          // forceWriteDefault to true, we will write the default value instead of
          // removing the setting from the configuration file.
          if (arg.forceWriteDefault && newValue === undefined && inspect?.defaultValue !== undefined) {
            workspace.getConfiguration().update(setting, inspect.defaultValue, target)
          }
          else {
            workspace.getConfiguration().update(setting, newValue, target)
          }
          continue
        }
      }
    },
    'status-bar-btn.configRegisteredBtn': async (
      ...args: Array<{
        btnId: string
        value?: Omit<UseStatusBarItemOptions, 'id' | 'alignment' | 'priority'>
        enums?: Array<Omit<UseStatusBarItemOptions, 'id' | 'alignment' | 'priority'>>
      }>
    ) => {
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
        const { btnId, value, enums } = arg
        if (!btnId) {
          logger.error(`Missing "btnId" property in argument: ${JSON.stringify(arg)}`)
          return
        }

        const currentBtns = config.get('btns') as UseStatusBarItemOptions[] ?? []

        const btnIndex = currentBtns.findIndex(btn => btn.id === btnId)
        if (btnIndex === -1) {
          logger.error(`Button with id "${btnId}" not found in configuration`)
          return
        }

        // NOTE: Direct changing value has higher priority than cycling through
        // enums. If both are provided, the value will be set directly.
        if (value) {
          currentBtns[btnIndex] = deepMerge(currentBtns[btnIndex], value)

          logger.info(`Updating button with id "${btnId}" in configuration`)

          config.update('btns', currentBtns, target)
          return
        }

        if (enums) {
          const currentValue = currentBtns[btnIndex]
          const currentEnumIdx = enums.findIndex(enumValue => isDeepSubset(currentValue, enumValue))

          if (currentEnumIdx === -1) {
            logger.error(`Current value of button with id "${btnId}" is not in the provided enums: ${JSON.stringify(enums)}, set to the first enum value "${JSON.stringify(enums[0])}"`)
          }

          const newValue = deepMerge(currentValue, enums[(currentEnumIdx + 1) % enums.length])

          currentBtns[btnIndex] = newValue

          config.update('btns', currentBtns, target)
        }
      }
    },

  })
})

export { activate, deactivate }
