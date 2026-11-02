import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseQS, abstractPathLanguage, parsePath } from '../../src/runtime/utils/helpers'

describe('abstractPathLanguage', () => {
  it('returns path and undefined matchedLocale when no locales available', () => {
    const result = abstractPathLanguage('/en/home')
    expect(result.path).toBe('/en/home')
    expect(result.matchedLocale).toBeUndefined()
  })

  it('returns path and undefined matchedLocale when no locale matches', () => {
    const result = abstractPathLanguage('/en/home')
    expect(result.path).toBe('/en/home')
    expect(result.matchedLocale).toBeUndefined()
  })
})

describe('parsePath', () => {
  beforeEach(() => {
    vi.mock('../../src/runtime/utils/helpers', async (importOriginal) => {
      const mod = await importOriginal<any>()
      return {
        ...mod,
        importJs: vi.fn(() => ({ available_locales: () => [] })),
      }
    })
  })

  it('handles simple paths', () => {
    const result = parsePath('/home')
    expect(result).toBe('/home')
  })

  it('handles paths with query strings', () => {
    const result = parsePath('/home=value')
    expect(result).toBe(encodeURIComponent('/'))
  })

  it('handles complex query strings', () => {
    const result = parsePath('/about=value1=value2')
    expect(result).toBe(encodeURIComponent('/'))
  })

  it('handles empty paths', () => {
    const result = parsePath('')
    expect(result).toBe('')
  })

  it('handles root path', () => {
    const result = parsePath('/')
    expect(result).toBe('/')
  })
})

describe('parseQS', () => {
  beforeEach(() => {
    vi.mock('../../src/runtime/utils/helpers', async (importOriginal) => {
      const mod = await importOriginal<any>()
      return {
        ...mod,
        importJs: vi.fn(() => ({})),
      }
    })
  })

  it('returns page_path when no query string', () => {
    const result = parseQS('/home', false, {})
    expect(result.page_path).toBe('/home')
  })

  it('parses simple query string', () => {
    const result = parseQS('/home/key1=value1/key2=value2', false, {})
    expect(result.page_path).toBe('/home')
    expect(result.key1).toBe('value1')
    expect(result.key2).toBe('value2')
  })

  it('parses array query strings', () => {
    const result = parseQS('/home/key[]=value1,value2/value2=value3', false, {})
    expect(result.page_path).toBe('/home')
    expect(result.key).toEqual(['value1', 'value2'])
  })

  it('parses empty array query strings', () => {
    const result = parseQS('/home/key[]=/', false, {})
    expect(result.page_path).toBe('/home')
    expect(result.key).toEqual(['/'])
  })

  it('parses JSON query strings', () => {
    const result = parseQS('/home/key{}={"test":"value"}/key2=value2', false, {})
    expect(result.page_path).toBe('/home')
    expect(result.key).toEqual({ test: 'value' })
    expect(result.key2).toBe('value2')
  })

  it('handles invalid JSON gracefully', () => {
    const result = parseQS('/home/key{}=invalid-json/key2=value2', false, {})
    expect(result.page_path).toBe('/home')
    expect(result.key).toEqual({})
    expect(result.key2).toBe('value2')
  })

  it('merges route queries when routeQueries is true', () => {
    const result = parseQS('/home', true, { routeKey1: 'routeValue1', routeKey2: 'routeValue2' })
    expect(result.page_path).toBe('/home')
    expect(result.routeKey1).toBe('routeValue1')
    expect(result.routeKey2).toBe('routeValue2')
  })

  it('handles array route queries', () => {
    const result = parseQS('/home', true, { 'key[]': 'value1,value2' })
    expect(result.page_path).toBe('/home')
    expect(result.key).toEqual(['value1', 'value2'])
  })

  it('handles JSON route queries', () => {
    const result = parseQS('/home', true, { 'key{}': '{"test":"value"}' })
    expect(result.page_path).toBe('/home')
    expect(result.key).toEqual({ test: 'value' })
  })

  it('handles mixed route and URL queries', () => {
    const result = parseQS('/home/urlKey=urlValue', true, { routeKey: 'routeValue' })
    expect(result.page_path).toBe('/home')
    expect(result.routeKey).toBe('routeValue')
    expect(result.urlKey).toBe('urlValue')
  })

  it('handles encoded paths', () => {
    const result = parseQS(encodeURIComponent('/home/key=value'), false, {})
    expect(result.page_path).toBe('/home')
    expect(result.key).toBe('value')
  })

  it('returns page_path on error', () => {
    vi.mock('../../src/runtime/utils/helpers', async (importOriginal) => {
      const mod = await importOriginal<any>()
      return {
        ...mod,
        importJs: vi.fn(() => {
          throw new Error('Mock error')
        }),
      }
    })

    const result = parseQS('/home', false, {})
    expect(result.page_path).toBe('/home')
  })
})
