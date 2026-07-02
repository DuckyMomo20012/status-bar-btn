import type { Command } from 'vscode'
import { defineExtension, defineLogger, useCommands, useStatusBarItem, watch, watchEffect } from 'reactive-vscode'
import { ConfigurationTarget, MarkdownString, StatusBarAlignment, ThemeColor } from 'vscode'
import { config } from './config'

const DEFAULT_BTN_VISIBILITY = true

const { activate, deactivate } = defineExtension(() => {
  const logger = defineLogger('status-bar-btn')

  watch(() => [config.enabled, config.btns], ([enabled, btns], _, onCleanup) => {
    if (!enabled || !Array.isArray(btns))
      return

    const currentBtns = btns.map((btn) => {
      let tooltip: string | MarkdownString | undefined = btn.tooltip as string | undefined
      if (btn.tooltip && typeof btn.tooltip === 'object') {
        const tooltipObj = btn.tooltip as MarkdownString
        const md = new MarkdownString(tooltipObj.value)
        md.isTrusted = !!tooltipObj.isTrusted
        md.supportThemeIcons = !!tooltipObj.supportThemeIcons
        tooltip = md
      }

      const item = useStatusBarItem({
        id: btn.id,
        alignment: btn.alignment === 'left' ? StatusBarAlignment.Left : StatusBarAlignment.Right,
        priority: btn.priority,
        name: btn.name,
        text: btn.text,
        tooltip,
        color: btn.color as string | ThemeColor | undefined,
        backgroundColor: btn.backgroundColor?.id ? new ThemeColor(btn.backgroundColor.id) : undefined,
        command: btn.command as string | Command | undefined,
        accessibilityInformation: btn.accessibilityInformation,
        visible: btn.visible ?? DEFAULT_BTN_VISIBILITY,
      })

      watchEffect(() => {
        logger.appendLine(`Button \"${btn.id ?? btn.name ?? btn.text ?? btn.command}\" visibility changed to: ${btn.visible ?? DEFAULT_BTN_VISIBILITY}`)
      })

      return item
    })

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
  })
})

export { activate, deactivate }
