import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  checkStringPattern,
  deepMerge,
  getValueByPath,
  interpolate,
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
})
