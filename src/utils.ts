import { defineLogger } from 'reactive-vscode'
import { displayName } from './generated/meta'

export const logger = defineLogger(displayName)

export function toRegExp(str: string): RegExp {
  const regexMatch = str.match(/^\/(.*)\/([gimsuy]*)$/)

  if (regexMatch) {
    const [_, pattern, flags] = regexMatch
    return new RegExp(pattern, flags)
  }

  return new RegExp(str)
}

/**
 * Check if a string matches any of the provided patterns (as regex)
 * @param a The string to check
 * @param b An array of regex patterns (as strings) to check against
 * @returns true if `a` matches any pattern in `b`, false otherwise
 */
export function checkStringPattern(a: string, b: string[]) {
  if (!Array.isArray(b) || b.length === 0) {
    return true
  }

  return b.some((str) => {
    try {
      const regex = toRegExp(str)
      logger.info(`Checking if "${a}" matches regex pattern "${regex}"`)
      return regex.test(a)
    }
    catch (error: any) {
      logger.info(`Invalid regex pattern provided "${str}": ${error}`)
      return false
    }
  })
}

/**
 * Interpolates a template string with values from a context object.
 * @param template The template string containing placeholders in the form of ${path.to.value}
 * @param contextData The context object to retrieve values from
 * @returns The interpolated string with placeholders replaced by actual values
 */
export function interpolate(template: string, contextData: any): string {
  return template.replace(/\$\{([^}]+)\}/g, (_, targetPath) => getValueByPath(contextData, targetPath as string))
}

/**
 * Safely tokens any valid JavaScript property accessor syntax into clean
 * lookup strings. Handles: "a.b", "a['b.c']", "a[\"b\"]", "a[0]", and "a?.b?.c"
 * @param pathStr The string path to parse (e.g., "a.b[0].c")
 * @returns An array of strings representing the path segments (e.g., ["a", "b", "0", "c"])
 */
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

/**
 * Retrieves a value from an object based on a string path, supporting nested properties and array indices.
 * @param obj The object to retrieve the value from.
 * @param pathStr The string path to the desired property (e.g., "a.b[0].c").
 * @returns The value at the specified path, or an empty string if not found.
 */
export function getValueByPath(obj: any, pathStr: string): string {
  try {
    const segments = parseObjectPath(pathStr)

    // eslint-disable-next-line ts/no-unsafe-assignment
    const result = segments.reduce((currentValue, key) => {
      if (currentValue === null || currentValue === undefined) {
        return undefined
      }
      // eslint-disable-next-line ts/no-unsafe-return, ts/no-unsafe-member-access
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
 * @param objects The source objects to merge.
 * @returns A new object that is the result of merging all source objects.
 */
export function deepMerge<T extends Record<string, any>[]>(...objects: T): UnionToIntersection<T[number]> {
  const result: Record<string, any> = {}

  for (const obj of objects) {
    if (!isObject(obj))
      continue

    for (const [key, value] of Object.entries(obj)) {
      // eslint-disable-next-line ts/no-unsafe-assignment
      const prevValue = result[key]

      if (isObject(value) && isObject(prevValue)) {
        result[key] = deepMerge(prevValue, value)
      }
      else if (Array.isArray(value)) {
        // Clone arrays to prevent shared references. If you want to merge arrays,
        // you can change this to: result[key] = [...(Array.isArray(prevValue) ? prevValue : []), ...value];
        // eslint-disable-next-line ts/no-unsafe-assignment
        result[key] = [...value]
      }
      else if (isObject(value)) {
        // Clone objects to prevent shared references
        result[key] = deepMerge({}, value)
      }
      else {
        // eslint-disable-next-line ts/no-unsafe-assignment
        result[key] = value
      }
    }
  }

  // eslint-disable-next-line ts/no-unsafe-return
  return result as any
}

/**
 * Checks if `candidate` is deeply contained within `target`.
 * Returns true if all keys/values in `candidate` match `target` recursively.
 * @param target The object to check against.
 * @param candidate The object to check if it is a deep subset of `target`.
 * @returns true if `candidate` is a deep subset of `target`, false otherwise.
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

    // eslint-disable-next-line ts/no-unsafe-assignment
    const targetVal = target[key]
    // eslint-disable-next-line ts/no-unsafe-assignment
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

/**
 * Performs a deep equality check between two values.
 * Returns true if they are deeply equal, false otherwise.
 * @param a The first value to compare.
 * @param b The second value to compare.
 * @returns true if `a` and `b` are deeply equal, false otherwise.
 */
export function isDeepEqual(a: any, b: any): boolean {
  // 1. Same reference or identical primitive values
  if (a === b)
    return true

  // 2. Handle structural null / Type mismatch guard
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return false
  }

  // 3. Special Object handling: Dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }

  // 4. Special Object handling: Regular Expressions
  if (a instanceof RegExp && b instanceof RegExp) {
    return a.toString() === b.toString()
  }

  // 5. Array/Object property key matching length check
  // eslint-disable-next-line ts/no-unsafe-argument
  const keysA = Object.keys(a)
  // eslint-disable-next-line ts/no-unsafe-argument
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length)
    return false

  // 6. Deep recursive comparison across matching key identities
  for (const key of keysA) {
    // eslint-disable-next-line ts/no-unsafe-argument
    if (!Object.hasOwn(b, key))
      return false
    // eslint-disable-next-line ts/no-unsafe-member-access
    if (!isDeepEqual(a[key], b[key]))
      return false
  }

  return true
}
