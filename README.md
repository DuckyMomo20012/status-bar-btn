# status-bar-btn

<a href="https://marketplace.visualstudio.com/items?itemName=DuckyMomo20012.status-bar-btn" target="__blank"><img src="https://badgen.net/vs-marketplace/v/DuckyMomo20012.status-bar-btn?color=333&label=VS%20Code%20Marketplace" alt="Visual Studio Marketplace Version" /></a>
<a href="https://open-vsx.org/extension/DuckyMomo20012/status-bar-btn" target="__blank"><img src="https://img.shields.io/open-vsx/v/DuckyMomo20012/status-bar-btn" alt="Open VSX Version" /></a>
<a href="https://kermanx.github.io/reactive-vscode/" target="__blank"><img src="https://img.shields.io/badge/made_with-reactive--vscode-%23007ACC?style=flat&labelColor=%23229863"  alt="Made with reactive-vscode" /></a>

## Configurations

<!-- configs -->

| Key                      | Description                                           | Type      | Default |
| ------------------------ | ----------------------------------------------------- | --------- | ------- |
| `status-bar-btn.enabled` | Enable or disable the status bar button.              | `boolean` | `true`  |
| `status-bar-btn.btns`    | An array of button configurations for the status bar. | `array`   | `[]`    |

<!-- configs -->

## Commands

<!-- commands -->

| Command                 | Title                                    |
| ----------------------- | ---------------------------------------- |
| `status-bar-btn.toggle` | status-bar-btn: Toggle Status Bar Button |

<!-- commands -->

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
        - **required:**
          - text
          - command

</details>

## Button Visibility Logic

By default, all buttons are **HIDDEN** unless explicitly set to visible. The
visibility of a button can be controlled using the following properties:

> Priority order (from highest to lowest): `isVisible` >
> `showOnWorkspaceContains` > `showOnLanguage` > `showOnFileName` >
> `showOnFileText`


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

## Testing

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
