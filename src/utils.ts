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

export function isObject(item: any): item is Record<string, any> {
  return item !== null && typeof item === 'object' && !Array.isArray(item)
}

type UnionToIntersection<U>
  = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

/**
 * Recursively merges source objects into a target object.
 * Returns a new object without mutating the inputs.
 */
export function deepMerge<T extends Record<string, any>[]>(...objects: T): UnionToIntersection<T[number]> {
  const result: Record<string, any> = {}

  for (const obj of objects) {
    if (!isObject(obj))
      continue

    for (const [key, value] of Object.entries(obj)) {
      const prevValue = result[key]

      if (isObject(value) && isObject(prevValue)) {
        result[key] = deepMerge(prevValue, value)
      }
      else if (Array.isArray(value)) {
        // Clone arrays to prevent shared references. If you want to merge arrays,
        // you can change this to: result[key] = [...(Array.isArray(prevValue) ? prevValue : []), ...value];
        result[key] = [...value]
      }
      else if (isObject(value)) {
        // Clone objects to prevent shared references
        result[key] = deepMerge({}, value)
      }
      else {
        result[key] = value
      }
    }
  }

  return result as any
}

/**
 * Checks if `candidate` is deeply contained within `target`.
 * Returns true if all keys/values in `candidate` match `target` recursively.
 */
export function isDeepSubset(target: any, candidate: any): boolean {
  // If they are strictly equal, they definitely match (handles primitives, null, undefined)
  if (Object.is(target, candidate)) {
    return true
  }

  // If one is an object and the other isn't, they don't match
  if (!isObject(target) || !isObject(candidate)) {
    return false
  }

  // Check every key in the candidate object
  for (const key of Object.keys(candidate)) {
    // Target must contain the key
    if (!Object.hasOwn(target, key)) {
      return false
    }

    const targetVal = target[key]
    const candidateVal = candidate[key]

    if (isObject(candidateVal)) {
      // Recursively check nested objects
      if (!isDeepSubset(targetVal, candidateVal)) {
        return false
      }
    }
    else if (Array.isArray(candidateVal)) {
      // For arrays, ensure target is also an array, has the same length,
      // and every element matches recursively.
      if (!Array.isArray(targetVal) || targetVal.length !== candidateVal.length) {
        return false
      }
      for (let i = 0; i < candidateVal.length; i++) {
        if (!isDeepSubset(targetVal[i], candidateVal[i])) {
          return false
        }
      }
    }
    else {
      // Primitive fallback
      if (!Object.is(targetVal, candidateVal)) {
        return false
      }
    }
  }

  return true
}
