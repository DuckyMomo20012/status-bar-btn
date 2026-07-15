import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  checkStringPattern,
  deepMerge,
  getValueByPath,
  interpolate,
  isDeepEqual,
  isDeepSubset,
  isObject,
  toRegExp,
} from '../src/utils'

const { loggerInfo } = vi.hoisted(() => ({
  loggerInfo: vi.fn(),
}))

vi.mock('reactive-vscode', () => ({
  defineLogger: vi.fn(() => ({
    info: loggerInfo,
  })),
}))

vi.mock('../src/generated/meta', () => ({
  displayName: 'status-bar-btn',
}))

describe('utils', () => {
  beforeEach(() => {
    loggerInfo.mockClear()
  })

  it('toRegExp', () => {
    expect(toRegExp('/foo/i')).toEqual(/foo/i)
    expect(toRegExp('foo.bar')).toEqual(/foo.bar/)
  })

  it('checkStringPattern', () => {
    expect(checkStringPattern('hello', [])).toBe(true)
    expect(checkStringPattern('hello', ['/^he/'])).toBe(true)
    expect(checkStringPattern('hello', ['/^no/'])).toBe(false)

    expect(checkStringPattern('hello', ['('])).toBe(false)
    expect(loggerInfo).toHaveBeenCalledWith(
      expect.stringContaining('Invalid regex pattern provided "("'),
    )
  })

  it('interpolate', () => {
    // eslint-disable-next-line no-template-curly-in-string
    const result = interpolate('Hi ${user.name}, ${user.roles[0]}', {
      user: { name: 'Ada', roles: ['dev'] },
    })

    expect(result).toBe('Hi Ada, dev')
  })

  it('getValueByPath', () => {
    const data = {
      a: {
        'b.c': { d: 3 },
        'list': [{ x: 1 }],
      },
    }

    expect(getValueByPath(data, 'a[\'b.c\'].d')).toBe('3')
    expect(getValueByPath(data, 'a?.list[0]?.x')).toBe('1')
    expect(getValueByPath(data, 'a')).toBe('{"b.c":{"d":3},"list":[{"x":1}]}')
    expect(getValueByPath(data, 'a.missing')).toBe('')
  })

  it('isObject', () => {
    expect(isObject({})).toBe(true)
    expect(isObject({ a: 1 })).toBe(true)
    expect(isObject([])).toBe(false)
    expect(isObject(null)).toBe(false)
    expect(isObject('x')).toBe(false)
  })

  it('deepMerge', () => {
    const left = { a: { b: 1 }, arr: [1, 2], keep: true }
    const right = { a: { c: 2 }, arr: [3], extra: 'x' }

    const merged = deepMerge(left, right)

    expect(merged).toEqual({
      a: { b: 1, c: 2 },
      arr: [3],
      keep: true,
      extra: 'x',
    })
    expect(left).toEqual({ a: { b: 1 }, arr: [1, 2], keep: true })
    expect(right).toEqual({ a: { c: 2 }, arr: [3], extra: 'x' })
  })

  it('deepMerge with nested objects and arrays', () => {
    const result = deepMerge(
      { a: { b: { c: 1 } }, list: [{ x: 1 }] },
      { a: { b: { d: 2 } }, list: [{ y: 2 }] },
    )

    expect(result).toEqual({
      a: { b: { c: 1, d: 2 } },
      list: [{ y: 2 }],
    })
  })

  it('isDeepSubset', () => {
    expect(isDeepSubset(
      { a: { b: 1, c: 2 }, arr: [1, 2] },
      { a: { b: 1 }, arr: [1, 2] },
    )).toBe(true)

    expect(isDeepSubset(
      { a: { b: 1 } },
      { a: { b: 2 } },
    )).toBe(false)

    expect(isDeepSubset(
      { arr: [1, 2] },
      { arr: [1] },
    )).toBe(false)
  })

  it('isDeepEqual primitives', () => {
    expect(isDeepEqual(5, 5)).toBe(true)
    expect(isDeepEqual('hello', 'hello')).toBe(true)
    expect(isDeepEqual(5, '5')).toBe(false)
    expect(isDeepEqual(null, null)).toBe(true)
    expect(isDeepEqual(undefined, undefined)).toBe(true)
  })

  it('isDeepEqual objects', () => {
    expect(isDeepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true)
    expect(isDeepEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true)
    expect(isDeepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false)
    expect(isDeepEqual({ a: 1 }, { a: 2 })).toBe(false)
  })

  it('isDeepEqual arrays', () => {
    expect(isDeepEqual([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(isDeepEqual([{ x: 1 }], [{ x: 1 }])).toBe(true)
    expect(isDeepEqual([1, 2], [1, 2, 3])).toBe(false)
    expect(isDeepEqual([1], [1])).toBe(true)
  })

  it('isDeepEqual dates and regex', () => {
    expect(isDeepEqual(new Date('2026-07-15'), new Date('2026-07-15'))).toBe(true)
    expect(isDeepEqual(new Date('2026-07-15'), new Date('2026-07-16'))).toBe(false)
    expect(isDeepEqual(/foo/i, /foo/i)).toBe(true)
    expect(isDeepEqual(/foo/i, /foo/g)).toBe(false)
  })
})
