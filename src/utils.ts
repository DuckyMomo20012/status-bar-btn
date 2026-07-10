import { defineLogger } from 'reactive-vscode'
import { displayName } from './generated/meta'

export const logger = defineLogger(displayName)

// NOTE: Safely tokens any valid JavaScript property accessor syntax into clean
// lookup strings. Handles: "a.b", "a['b.c']", "a[\"b\"]", "a[0]", and "a?.b?.c"
function parseObjectPath(pathStr: string): string[] {
  const segments: string[] = []
  let currentToken = ''
  let insideQuotes = false
  let activeQuoteChar = ''

  // Normalize VS Code's colon syntax (e.g., "config:my.key") into standard dot navigation
  const normalizedPath = pathStr.replace(':', '.')

  for (let i = 0; i < normalizedPath.length; i++) {
    const char = normalizedPath[i]

    if (insideQuotes) {
      if (char === activeQuoteChar) {
        insideQuotes = false
      }
      else {
        currentToken += char
      }
    }
    else if (char === '"' || char === '\'') {
      insideQuotes = true
      activeQuoteChar = char
    }
    else if (char === '[' || char === ']' || char === '.') {
      const trimmed = currentToken.trim()
      if (trimmed) {
        segments.push(trimmed)
        currentToken = ''
      }
    }
    else if (char === '?' && normalizedPath[i + 1] === '.') {
      continue
    }
    else {
      currentToken += char
    }
  }

  const finalTrim = currentToken.trim()
  if (finalTrim) {
    segments.push(finalTrim)
  }

  return segments
}

export function getValueByPath(obj: any, pathStr: string): string {
  try {
    const segments = parseObjectPath(pathStr)

    const result = segments.reduce((currentValue, key) => {
      if (currentValue === null || currentValue === undefined) {
        return undefined
      }
      return currentValue[key]
    }, obj)

    if (result === null || result === undefined)
      return ''
    if (typeof result === 'object')
      return JSON.stringify(result)
    return String(result)
  }
  catch {
    return ''
  }
}
