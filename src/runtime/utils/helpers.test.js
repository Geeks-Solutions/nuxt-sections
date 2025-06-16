import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('abstractPathLanguage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return original path if no locale matches', () => {
    const result = globalThis.abstractPathLanguage('about')
    expect(result).toEqual({ path: 'about', matchedLocale: undefined })
  })

  it('should handle error in importJs gracefully', () => {
    const result = globalThis.abstractPathLanguage('de/home')
    expect(result).toEqual({ path: encodeURIComponent('home'), matchedLocale: 'de' })
  })

  it('should handle importJs returning object without available_locales', () => {
    const result = globalThis.abstractPathLanguage('en/about')
    expect(result).toEqual({ path: encodeURIComponent('about'), matchedLocale: 'en' })
  })

  it('should handle importJs returning null', () => {
    const result = globalThis.abstractPathLanguage('en/about')
    expect(result).toEqual({ path: encodeURIComponent('about'), matchedLocale: 'en' })
  })
})

describe('parsePath', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return original path if no = is present and no locale matches', () => {
    const result = globalThis.parsePath('xyz/about')
    expect(result).toBe('xyz/about')
  })

  it('should handle path with = but no matching locale', () => {
    const result = globalThis.parsePath('xyz/test=value')
    expect(result).toBe(encodeURIComponent('xyz'))
  })

  it('should handle path with = and matching locale', () => {
    const result = globalThis.parsePath('de/test=value')
    expect(result).toBe(encodeURIComponent('/'))
  })

  it('should strip locale from path when locale matches', () => {
    const result = globalThis.parsePath('en/about')
    expect(result).toBe(encodeURIComponent('about'))
  })
})
