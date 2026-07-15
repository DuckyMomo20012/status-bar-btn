import { execSync } from 'node:child_process'
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/index.ts',
  ],
  format: ['cjs'],
  shims: false,
  dts: false,
  deps: {
    neverBundle: ['vscode'],
  },
  hooks(hooks) {
    hooks.hookOnce('build:prepare', () => {
      execSync('nr update')
    })
  },
})
