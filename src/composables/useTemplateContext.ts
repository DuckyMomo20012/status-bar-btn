import * as path from 'node:path'
import { computed, ref, useActiveTextEditor, useDisposable } from 'reactive-vscode'
import * as vscode from 'vscode'

export function useWorkspaceContext() {
  const activeEditor = useActiveTextEditor()
  const configTrigger = ref(0)

  // Track global settings updates to force context refreshes
  useDisposable(vscode.workspace.onDidChangeConfiguration(() => configTrigger.value++))

  return computed(() => {
    // NOTE: This is a workaround to ensure that the context is refreshed when
    // the configuration changes. The `configTrigger` is incremented whenever
    // the configuration changes, which forces the computed property to
    // re-evaluate and update the context accordingly.
    const _trigger = configTrigger.value

    const editor = activeEditor.value
    const doc = editor?.document

    // Workspace root definitions
    const workspaceFolders = vscode.workspace.workspaceFolders
    const primaryFolder = workspaceFolders?.[0]
    const workspaceFolder = primaryFolder ? primaryFolder.uri.fsPath : ''
    const workspaceFolderBasename = primaryFolder ? primaryFolder.name : ''

    // Breakdown parameters for file pathways
    let fsPath = ''
    let basename = ''
    let basenameNoExt = ''
    let dirname = ''
    let languageId = ''
    let ext = ''

    if (doc) {
      fsPath = doc.uri.fsPath
      basename = path.basename(fsPath)
      ext = path.extname(fsPath)
      basenameNoExt = path.basename(fsPath, ext)
      dirname = path.dirname(fsPath)
      languageId = doc.languageId
    }

    return {
      workspaceFolder,
      workspaceFolderBasename,
      config: vscode.workspace.getConfiguration(),
      env: {
        language: vscode.env.language,
        appName: vscode.env.appName,
        remoteName: (vscode.env.remoteName !== undefined) || 'local',
        uiKind: vscode.env.uiKind === vscode.UIKind.Desktop ? 'desktop' : 'web',
      },
      file: {
        fsPath,
        basename,
        ext,
        basenameNoExt,
        dirname,
        languageId,
      },
    }
  })
}
