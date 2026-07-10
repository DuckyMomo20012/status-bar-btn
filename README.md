# status-bar-btn

<a href="https://marketplace.visualstudio.com/items?itemName=DuckyMomo20012.status-bar-btn" target="__blank"><img src="https://badgen.net/vs-marketplace/v/DuckyMomo20012.status-bar-btn?color=333&label=VS%20Code%20Marketplace" alt="Visual Studio Marketplace Version" /></a>
<a href="https://open-vsx.org/extension/DuckyMomo20012/status-bar-btn" target="__blank"><img src="https://img.shields.io/open-vsx/v/DuckyMomo20012/status-bar-btn" alt="Open VSX Version" /></a>
<a href="https://kermanx.github.io/reactive-vscode/" target="__blank"><img src="https://img.shields.io/badge/made_with-reactive--vscode-%23007ACC?style=flat&labelColor=%23229863"  alt="Made with reactive-vscode" /></a>

## Configurations

<!-- configs -->

| Key                                        | Description                                                           | Type      | Default |
| ------------------------------------------ | --------------------------------------------------------------------- | --------- | ------- |
| `status-bar-btn.enabled`                   | Enable or disable the status bar button.                              | `boolean` | `true`  |
| `status-bar-btn.interpolation.os.interval` | The interval in milliseconds for updating OS stats in the status bar. | `number`  | `2000`  |
| `status-bar-btn.btns`                      | An array of button configurations for the status bar.                 | `array`   | `[]`    |

<!-- configs -->

## Commands

<!-- commands -->

| Command                             | Title                                    |
| ----------------------------------- | ---------------------------------------- |
| `status-bar-btn.toggle`             | status-bar-btn: Toggle Status Bar Button |
| `status-bar-btn.changeSettingsJson` | status-bar-btn: Change Settings Json     |

<!-- commands -->

## Features

- **Custom Status Bar Buttons**: Add custom buttons to the VS Code status bar
  with configurable text, tooltip, color, background color, and command.

- **Button Visibility Logic**: Control the visibility of buttons based on
  workspace contents, active language, file name, or file text.

- **Change Settings Json File**: Change the `settings.json` file directly from
  the status bar button, allowing you to toggle settings or cycle through
  predefined values.

- **Workspace Context Interpolation**: Use workspace and file context variables
  in button text and tooltip for dynamic content.

- **OS Stats Interpolation**: Display real-time OS stats (CPU usage, memory
  usage, uptime) in button text and tooltip.

- **Clock Interpolation**: Display the current time and date in button text and
  tooltip, with support for custom IANA timezones.


## Button Visibility Logic

> [!WARNING]
> By default, all buttons are **HIDDEN** unless explicitly set to visible.
>
> Priority order (from highest to lowest): `isVisible` >
> `showOnWorkspaceContains` > `showOnLanguage` > `showOnFileName` >
> `showOnFileText`

The visibility of a button can be controlled using the following properties:

- `isVisible`: Highest priority. If set, it will override all other visibility
  conditions.

- `showOnWorkspaceContains`: If set, the button will be visible if the workspace
  contains a file matching the specified [glob
  pattern](https://code.visualstudio.com/docs/editor/codebasics#_advanced-search-options).

  - For example, a button to run `pnpm dev` could be configured to only show if
    the workspace contains a `pnpm-lock.yaml` file.

  - Note that glob patterns can use the `{}` to group conditions (for example
    `{**/*.html,**/*.txt}` matches all HTML and text files).

- `showOnLanguage`: If set, the button will be visible if the **ACTIVE** text editor's
  language matches any of the specified [language
  identifiers](https://code.visualstudio.com/docs/languages/identifiers). RegEx
  patterns (and flags) are supported (e.g., `/^python/gm`).

  - For example, a button to run `pytest` could be configured to only show if
    the active text editor is a Python file.

- `showOnFileName`: If set, the button will be visible if the **ACTIVE** text editor's
  file name matches any of the specified file names or RegEx patterns. RegEx patterns (and
  flags) are supported (e.g., `/^README.md$/gm`).

  - For example, a button to `bump all dependencies` could be configured to only
    show if the active text editor is a `package.json` file.

  - Note that file name is **ABSOLUTE** path.

- `showOnFileText`: If set, the button will be visible if the **ACTIVE** text editor's
  file text matches any of the specified text patterns or RegEx patterns. RegEx patterns (and
  flags) are supported (e.g., `/TODO/gm`).

  - For example, a button to `toggle highlight TODO pattern` could be configured
    to only show if the active text editor contains the text `TODO`.

> [!NOTE]
> `showOnLanguage`, `showOnFileName`, and `showOnFileText` are only evaluated
> when there is an **ACTIVE** text editor. If there is no active text editor,
> these conditions will be ignored.

> [!WARNING]
> `showOnLanguage`, `showOnFileName`, and `showOnFileText` arrays are evaluated
> **iteratively** for each button. If you have a large number of buttons, this
> may cause performance issues. Use these conditions sparingly and only when
> necessary.

> [!NOTE]
> The `showOnWorkspaceContains` property has a powerful glob pattern matching
> feature that can filter multiple file name/extension types. `showOnLanguage`,
> `showOnFileName`, can also filter multiple file name/extension types, but they
> are only evaluated for the **ACTIVE** text editor. For example,
> `showOnWorkspaceContains` can be used as a button to `launch Node.js task` if
> the workspace **contains** a `package.json` file, but `showOnLanguage` can be
> a button to `bump all dependencies` if the **ACTIVE** text editor is a
> `package.json` file.

## Button Configuration Reactivity

Thanks to [reactive-vscode](https://github.com/kermanx/reactive-vscode), most of
the button configuration properties are **reactive**, meaning that if you change
the configuration in your `settings.json` file, the button will update
automatically without needing to reload VS. However, some properties are not
reactive and will require a reload to take effect. The following properties are
**NOT** reactive:

- `id`: The identifier of the button. Changing this will require a reload to
  take effect.

- `alignment`: The alignment of the button in the status bar. Changing this will
  require a reload to take effect.

- `priority`: The priority of the button in the status bar. Changing this will
  require a reload to take effect.

## UX Guidelines

Please refer to official [VS Code UX
Guidelines](https://code.visualstudio.com/api/ux-guidelines/status-bar) for best
practices when designing status bar buttons.

## Button Configuration Examples

- **Primitives Features Test**

  ```json
  {
    "id": "btn-test-primitives",
    "name": "Primitive Features Test",
    "alignment": "right",
    "priority": 1000,
    "text": "$(megaphone) Left-most Item",
    "tooltip": "This is a simple plain-text tooltip test.",
    "color": "#ff0055",
    "command": "status-bar-btn.toggle",
    "visible": true
  }
  ```

- **Error Background Test**: According to the [VS Code UX
  Guidelines](https://code.visualstudio.com/api/ux-guidelines/status-bar#error-and-warning-status-bar-items),
  you should avoid using the `statusBarItem.errorBackground` and `statusBarItem.warningBackground`
  colors for custom status bar items. However, this example demonstrates how to
  use these colors for testing purposes.

  ```json
  {
    "id": "btn-test-error-bg",
    "name": "Error Background Test",
    "alignment": "right",
    "priority": 500,
    "text": "$(alert) Warning Flag",
    "tooltip": "Testing out left-aligned items with errors.",
    "backgroundColor": {
      "id": "statusBarItem.errorBackground"
    },
    "command": "workbench.action.toggleSidebarVisibility",
    "visible": true
  }
  ```

- **Warning Background Test**

  ```json
  {
    "id": "btn-test-warning-bg",
    "name": "Warning Background Test",
    "alignment": "left",
    "priority": 200,
    "text": "$(unverified) Notice",
    "tooltip": "Testing left-aligned items with warnings.",
    "color": "charts.yellow",
    "backgroundColor": {
      "id": "statusBarItem.warningBackground"
    },
    "visible": true
  }
  ```

- **Complex Object Test**: Note that you can pass markdown strings to the
  tooltip, and you can also pass arguments to the command.

  ```json
  {
    "id": "btn-test-complex-objects",
    "name": "Complex Object Test",
    "alignment": "left",
    "priority": 100,
    "text": "$(terminal) Run Script",
    "tooltip": {
      "value": "### Markdown Tooltip Test\n\n* List item 1\n* List item 2\n\n[Click for Info](https://code.visualstudio.com)"
    },
    "color": {
      "id": "activityBar.foreground"
    },
    "command": {
      "command": "workbench.action.terminal.sendSequence",
      "title": "Send Sequence",
      "arguments": [{ "text": "echo 'Testing complete!'\n" }]
    },
    "accessibilityInformation": {
      "label": "Custom button accessibility descriptor label",
      "role": "button"
    },
    "visible": true
  }
  ```
- **Reset Font Zoom**: Sometimes, you may zoom the font in/out of the editor by
  accident (using `Ctrl` + `Mouse Wheel`). This button allows you to reset the font zoom
  back to the default value.

  ```json
  {
    "alignment": "left",
    "color": "#EA76CB",
    "command": "editor.action.fontZoomReset",
    "id": "reset-zoom",
    "name": "Reset Font Zoom",
    "priority": -1,
    "text": "$(refresh)",
    "tooltip": "Reset font zoom"
  }
  ```

- **Open `settings.json`**: This button allows you to quickly open the
  `settings.json` file.

  ```json
  {
    "alignment": "left",
    "color": "#E64553",
    "command": "workbench.action.openSettingsJson",
    "id": "open-settings",
    "name": "Open settings.json",
    "priority": -3,
    "text": "$(gear)",
    "tooltip": "Open settings.json"
  }
  ```

- **Reload VS Code**: This button allows you to quickly reload VS Code. Or you
  can use [natqe.reload](https://marketplace.visualstudio.com/items?itemName=natqe.reload)
  extension, lol.

  ```json
  {
    "alignment": "left",
    "color": "#E64553",
    "command": "workbench.action.reloadWindow",
    "id": "reload-vscode",
    "name": "Reload VS Code",
    "priority": -2,
    "text": "$(sync)",
    "tooltip": "Reload VS Code"
  }
  ```

- **Clear Terminal**: This button allows you to quickly clear the terminal. Only
  works if the terminal is focused.

  ```json
  {
    "alignment": "left",
    "color": "#E64553",
    "command": "workbench.action.terminal.clear",
    "id": "clear-terminal",
    "name": "Clear Terminal",
    "priority": -4,
    "text": "$(trash)",
    "tooltip": "Clear Terminal"
  }
  ```

## Changing Settings Json File

This extension provides a command `status-bar-btn.changeSettingsJson` that allows
you to change the `settings.json` file directly from the status bar button.

This command allows you to register **an array of arguments**, each of which can
change a specific setting in the `settings.json` file. When the button is
clicked, it will cycle through the provided arguments and update the
corresponding settings in the `settings.json` file accordingly. Therefore, you
can update multiple settings in the `settings.json` file with a single button
click.

> [!NOTE]
> This command is not registered to the command palette by default, so you can
> only use it by configuring a button in the `status-bar-btn.btns` array. This
> is because this command has complex arguments.

**Arguments**:

- `setting` (`string`) (**required**): Configuration name, supports dotted names
  (e.g., `editor.fontSize`).
  - By default, the settings are updated using
    [`WorkspaceConfiguration`](https://code.visualstudio.com/api/references/vscode-api#WorkspaceConfiguration)
    methods, so any string value that `WorkspaceConfiguration` supports can be
    used here. For example, you can use `editor.fontSize` to change the font
    size, or `workbench.colorTheme` to change the color theme.

- `value` (`string | number | boolean | null | undefined`) (optional): The new
  value to set for the setting.
  - Note that `value` has a higher priority than `enums`. If `value` is
    provided, it will be used directly to update the setting.

  - By default `undefined` value will **remove** the setting from the
    `settings.json` file and **fallback** to the default value.

  - To set value to `undefined`, you can use the string `"undefined"` (e.g.,
    `value: "undefined"`).

- `enums` (`Array<string | number | boolean | null | undefined>`) (optional): An
  optional array of allowed values for the setting. If provided, the command
  will cycle through these values when clicked.
  - If the current value of the setting is not in the `enums` array, it will be
    set to the first value in the `enums` array.

- `forceWriteDefault` (`boolean`) (optional): By default, if the new value is
  the same as the default value or `undefined`, the setting won't be written to
  the `settings.json` file. If you want to force writing the default value to
  the `settings.json` file, set this to `true`.

> [!NOTE]
> If the setting is not registered in the VS Code, nothing will happen. For
> example, if you try to change a setting that doesn't exist, or the setting is
> registered by an extension that is not installed or disabled, nothing will
> happen.


> [!NOTE]
> If the `setting`'s default value is `false`, and you set the `enums` to
> `[false, "undefined"]`, nothing will happen! Because the extension will
> retrieve the setting value, so first it will get `false` as default value,
> then it will set the value to `undefined` (next enum value), which will remove
> the setting from the `settings.json` file and fallback to the default value
> `false`. So the next time you click the button, it will get the value `false`
> again, so you won't see any changes, if you want to force writing the default
> value to the `settings.json` file, set `forceWriteDefault` to `true`.

**Examples**:

- **Toggle between pre-defined dark/light themes**: During presentation, no one
  wants to see a dark theme, so this button allows you to quickly toggle between
  the default dark and light themes.

  ```json
  {
    "alignment": "left",
    "color": "#E64553",
    "command": {
      "command": "status-bar-btn.changeSettingsJson",
      "title": "Toggle Theme",
      "arguments": [
        {
          "setting": "workbench.colorTheme",
          "enums": ["Dark+", "Light+"]
        }
      ]
    },
    "id": "toggle-theme",
    "name": "Toggle Theme",
    "priority": -5,
    "text": "$(paintcan)",
    "tooltip": "Toggle between Default Dark+ and Default Light+ themes",
    "visible": true
  }
  ```

- **Toggle AI features**: This button allows you to quickly toggle between
  enabling and disabling AI features in VS Code. Because VS Code doesn't provide
  a built-in command to toggle this setting, and this is why this extension
  provides a command to change the `settings.json` file directly.

  ```json
  {
    "alignment": "left",
    "color": "#E64553",
    "command": {
      "command": "status-bar-btn.changeSettingsJson",
      "title": "Toggle AI Features",
      "arguments": [
        {
          "setting": "chat.disableAIFeatures",
          "enums": [true, false]
        }
      ]
    },
    "id": "toggle-ai-features",
    "name": "Toggle AI Features",
    "priority": -6,
    "text": "$(robot)",
    "tooltip": "Toggle AI features on/off",
    "visible": true
  }
  ```

- **Combine multiple settings**: Or you can combine multiple settings (like
  change color theme, increase font size, change layout) for a temporary
  presentation mode, without having to switch to VS Code's profile.

  ```json
  {
    "alignment": "left",
    "color": "#E64553",
    "command": {
      "command": "status-bar-btn.changeSettingsJson",
      "title": "Presentation Mode",
      "arguments": [
        {
          "setting": "workbench.colorTheme",
          "enums": ["Dark+", "Light+"]
        },
        {
          "setting": "editor.fontSize",
          "enums": [14, 18]
        },
        {
          "setting": "workbench.activityBar.visible",
          "enums": [true, false]
        }
      ]
    },
    "id": "presentation-mode",
    "name": "Presentation Mode",
    "priority": -7,
    "text": "$(screen-full)",
    "tooltip": "Toggle presentation mode (theme, font size, layout)",
    "visible": true
  }
  ```

## Workspace Value Interpolation

Value interpolation is supported for these button configuration properties:

- `text`.
- `tooltip` (works for both plain text and markdown strings).

Interpolation values:

- **Workspace Context**:

  - `${workspaceFolder}`: The absolute path of the primary workspace folder. If
    there is no workspace folder, it will be an empty string.

  - `${workspaceFolderBasename}`: The name of the primary workspace folder. If
    there is no workspace folder, it will be an empty string.

  - `${config}`: The value of the configuration setting. For example, if you set
    `text` to `"$(zap) ${config:editor.fontSize}"`, it will display the current
    font size in the status bar.

  - `${env:language}`: The language of the VS Code environment. For example: `en`,
    etc.

  - `${env:appName}`: The name of the VS Code application. For example: `Visual
    Studio Code`, `VSCodium`, etc.

  - `${env:remoteName}`: The name of the remote environment. For example: `SSH`, `WSL`,
    etc. If there is no remote environment, it will be an default `local` value.

  - `${env:uiKind}`: The kind of the VS Code UI. For example: `desktop`, `web`.

  - `${file:fsPath}`: The absolute path of the **ACTIVE** text editor file. If
    there is no active text editor, it will be an empty string.

  - `${file:basename}`: The name of the **ACTIVE** text editor file. If there is
    no active text editor, it will be an empty string.

  - `${file:ext}`: The extension of the **ACTIVE** text editor file. If there is
    no active text editor, it will be an empty string.

  - `${file:basenameNoExt}`: The name of the **ACTIVE** text editor file without
    the extension. If there is no active text editor, it will be an empty string.

  - `${file:dirname}`: The directory name of the **ACTIVE** text editor file. If
    there is no active text editor, it will be an empty string.

  - `${file:languageId}`: The language identifier of the **ACTIVE** text editor
    file. If there is no active text editor, it will be an empty string.

- **OS Stats Context**:

  - `${os:platform}`: The platform of the OS. For example: `win32`, `linux`,
    `darwin`.

  - `${os:arch}`: The architecture of the OS. For example: `x64`, `arm64`, etc.

  - `${os:uptime}`: The uptime of the OS in seconds. Format: `HH:mm:ss`.

  - `${os:freemem}`: The free memory of the OS. Format: `<bytes> B`,
    `<kilobytes> KB`, `<megabytes> MB`, `<gigabytes> GB`, `terabytes> TB`, etc.

  - `${os:totalmem}`: The total memory of the OS. Format: `<bytes> B`, `<kilobytes> KB`, `<megabytes> MB`,
    `<gigabytes> GB`, `terabytes> TB`, etc.

  - `${os:cpuUsage}`: The CPU usage of the OS. Format: `<percentage>%`.

  You can use the `status-bar-btn.interpolation.os.interval` setting to control
  the interval in milliseconds for updating the OS stats in the status bar. The
  default value is `2000` milliseconds (2 seconds). The minimum value is `500`
  milliseconds (0.5 seconds).

- **Clock Context**:

  - `${clock:hhmmss}`: The current time in 24-hour format. For example:
    `17:18:42`.

  - `${clock:hhmm}`: The current time in 24-hour short format. For example:
    `17:18`.

  - `${clock:ampm}`: The current time in 12-hour format with AM/PM. For example:
    `5:18:42 PM`.

  - `${clock:fullDate}`: The current date in long format. For example:
    `July 10, 2026`.

  You can also use the `interpolation.clockTimezone` property to specify a custom
  IANA timezone for the clock interpolation. If omitted, it will default to the
  host system timezone.

  For example:

  ```json
  {
    "alignment": "left",
    "color": "#E64553",
    "id": "clock",
    "name": "Clock",
    "priority": -5,
    "text": "${clock:hhmmss} ${clock:fullDate}",
    "tooltip": "${clock:hhmmss} ${clock:fullDate}",
    "interpolation": {
      "clockTimezone": "America/New_York"
    },
    "visible": true
  }
  ```

## Full Configuration Schema

<details>
<summary>Click to expand</summary>

- Object
  - **type:** object
  - **title:** Status Bar Button
  - **properties:**
    - **status-bar-btn.enabled:**
      - **type:** boolean
      - **default:** `true`
      - **description:** Enable or disable the status bar button.
    - **status-bar-btn.interpolation.os.interval:**
      - **type:** number
      - **default:** `2000`
      - **description:** The interval in milliseconds for updating OS stats in the status bar.
    - **status-bar-btn.btns:**
      - **type:** array
      - **default:**
        - *(empty array)*
      - **description:** An array of button configurations for the status bar.
      - **items:**
        - **type:** object
        - **description:** Configuration for a single status bar button.
        - **additionalProperties:** `false`
        - **properties:**
          - **id:**
            - **type:** string
            - **description:** The identifier of this item. Falls back to extension ID if omitted.
          - **alignment:**
            - **type:** string
            - **enum:**
              - left
              - right
            - **default:** right
            - **description:** The alignment of this item in the status bar (Left or Right).
          - **priority:**
            - **type:** number
            - **description:** The priority of this item. Higher values push the item further to the left.
          - **name:**
            - **type:** string
            - **description:** The descriptive name of the entry (e.g., `Git Status`), visible in user settings.
          - **text:**
            - **type:** string
            - **description:** The text to show. Supports octicons using the `$(icon-name)` syntax.
          - **tooltip:**
            - **description:** The tooltip text displayed when hovering over this entry.
            - **anyOf:**
              - Object
                - **type:** string
                - **description:** Plain text tooltip.
              - Object
                - **type:** object
                - **description:** Markdown formatted string.
                - **required:**
                  - value
                - **properties:**
                  - **value:**
                    - **type:** string
                    - **description:** The markdown string.
                  - **isTrusted:**
                    - **type:** boolean
                    - **description:** Indicates that this markdown string is from a trusted source. Only *trusted* markdown supports links that execute commands, e.g. `[Run it](command:myCommandId)`. Defaults to `false` (commands are disabled).
                  - **supportThemeIcons:**
                    - **type:** boolean
                    - **description:** Indicates that this markdown string can contain [ThemeIcons](https://code.visualstudio.com/api/references/vscode-api#ThemeIcon), e.g. `$(zap)`.
          - **color:**
            - **description:** The foreground text/icon color for this entry.
            - **anyOf:**
              - Object
                - **type:** string
                - **description:** A traditional hex/color string or theme token identifier.
              - Object
                - **type:** object
                - **description:** A dedicated VS Code ThemeColor instance reference wrapper.
                - **required:**
                  - id
                - **properties:**
                  - **id:**
                    - **type:** string
                    - **description:** The id of this color.
          - **backgroundColor:**
            - **type:** object
            - **description:** The background color for this entry. Officially supports `statusBarItem.errorBackground` or `statusBarItem.warningBackground`.
            - **required:**
              - id
            - **properties:**
              - **id:**
                - **type:** string
                - **enum:**
                  - statusBarItem.errorBackground
                  - statusBarItem.warningBackground
          - **command:**
            - **description:** The identifier string or complete Command object to run on click.
            - **anyOf:**
              - Object
                - **type:** string
                - **description:** The ID string of the command to execute.
              - Object
                - **type:** object
                - **description:** Full command declaration metadata block.
                - **required:**
                  - command
                - **properties:**
                  - **command:**
                    - **type:** string
                    - **description:** The identifier of the actual command handler.
                  - **title:**
                    - **type:** string
                    - **description:** Title of the command, like `save`.
                  - **tooltip:**
                    - **type:** string
                    - **description:** A tooltip for the command, when represented in the UI.
                  - **arguments:**
                    - **type:** array
                    - **description:** Arguments that the command handler should be invoked with.
                    - **items:**
                      - *(empty object)*
          - **accessibilityInformation:**
            - **type:** object
            - **description:** Accessibility information used when a screen reader interacts with this item.
            - **required:**
              - label
            - **properties:**
              - **label:**
                - **type:** string
              - **role:**
                - **type:** string
          - **visible:**
            - **type:** boolean
            - **description:** Whether the status bar item is visible
            - **default:** `true`
          - **showOnWorkspaceContains:**
            - **type:** string
            - **markdownDescription:** A [glob pattern](https://code.visualstudio.com/docs/editor/codebasics#_advanced-search-options) that this status bar item should be visible for.
          - **showOnLanguage:**
            - **type:** array
            - **markdownDescription:** An array of [language identifiers](https://code.visualstudio.com/docs/languages/identifiers) that this status bar item should be visible for **ACTIVE** text editor. RegEx patterns (and flags) are supported (e.g., `/^python/gm`).
            - **items:**
              - **type:** string
          - **showOnFileName:**
            - **type:** array
            - **markdownDescription:** An array of file names (or RegEx patterns) that this status bar item should be visible for **ACTIVE** text editor. RegEx patterns (and flags) are supported (e.g., `/^README.md$/gm`).
            - **items:**
              - **type:** string
          - **showOnFileText:**
            - **type:** array
            - **markdownDescription:** An array of text patterns (or RegEx patterns) that this status bar item should be visible for **ACTIVE** text editor. RegEx patterns (and flags) are supported (e.g., `/TODO/gm`).
            - **items:**
              - **type:** string
          - **interpolation:**
            - **type:** object
            - **description:** Interpolation settings for this status bar item.
            - **properties:**
              - **clockTimezone:**
                - **type:** string
                - **description:** The IANA timezone name to use for clock interpolation. If omitted, defaults to host system timezone.
        - **required:**
          - text
          - command

</details>

## Debugging

You can launch the extension in a new VS Code window by pressing `F5` or running
the `Debug: Start Debugging` command. This will open a new VS Code window with
the extension loaded. You can then test the extension by modifying the
`settings.json` file in the new window and observing the changes in the status
bar.

The task file is configured in `.vscode/launch.json`.

If you want to test workspace-specific settings, you can update the
`.vscode/launch.json` file like this:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Extension",
      "type": "extensionHost",
      "request": "launch",
      "runtimeExecutable": "${execPath}",
      "args": [
        "${workspaceFolder}/src", // Set the workspace to the `src` folder, must be the first argument
        "--extensionDevelopmentPath=${workspaceFolder}",
        "--new-window" // Required to open a new VS Code window for testing
      ],
      "outFiles": [
        "${workspaceFolder}/dist/**/*.js"
      ],
      "preLaunchTask": "npm: dev"
    }
  ]
}
```

Which will launch the extension in a new VS Code window with the workspace set
to the `src` folder. You can then modify the `settings.json` file in the new
window and observe the changes in the status bar.

## Logging

To view the logs of the extension, you can open the `Output` panel in VS Code
and select `status-bar-btn` from the dropdown. The logs will show the current
state of the extension, including the current configuration and any errors that
may occur.

## Publishing

The workflows are configured in `.github/workflows/release.yml` to automatically
publish the extension to the [Visual Studio
Marketplace](https://marketplace.visualstudio.com/) and [Open VSX
Registry](https://open-vsx.org/) when a new release is created, with
[vsxpub](https://github.com/jinghaihan/vsxpub). The workflow will use the
`VSCE_PAT` and `OVSX_PAT` secrets to authenticate with the
respective marketplaces.

To prepare the extension for publishing, you have to get this tokens:

- `VSCE_PAT`: Personal Access Token for publishing to the Visual Studio
  Marketplace. You can get this token by following the instructions
  [here](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token).

- `OVSX_PAT`: Personal Access Token for publishing to the Open VSX Registry. You
  can get this token by following the instructions
  [here](https://github.com/eclipse-openvsx/openvsx/wiki/Publishing-Extensions).

Then configure the secrets in your forked repository by going to **Settings** >
**Secrets and variables** > **Actions** > **New repository secret**.

The extension is versioned using [semantic versioning](https://semver.org/), by
[release-please](https://github.com/googleapis/release-please). Therefore,
before publishing the extension, you have to enable these settings in
**Settings** > **Actions** > **General**:

- **Workflow permissions**: `Read and write permissions`.

- **Allow GitHub Actions to create and approve pull requests**: `Enabled`.

## License

This project is licensed under the **Creative Commons
Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)**
License.

[![License: CC BY-NC-SA
4.0](https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png)](https://creativecommons.org/licenses/by-nc-sa/4.0/).

See the **[LICENSE.md](./LICENSE.md)** file for full details.

## Acknowledgements

- This extension is inspired by the
[anweber.statusbar-commands](https://marketplace.visualstudio.com/items?itemName=anweber.statusbar-commands)
extension by Andreas Weber.

- Built with the [reactive-vscode](https://github.com/kermanx/reactive-vscode)
  framework, a more modern and reactive approach to configuration and
  reactivity.

- [antfu/starter-vscode](https://github.com/antfu/starter-vscode): A great
  starting point for building VS Code extensions with TypeScript and Vite.
