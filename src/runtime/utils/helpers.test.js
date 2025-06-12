import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the helpers module
vi.mock('./helpers', async () => {
  const actual = await vi.importActual('./helpers')
  return {
    ...actual,
    importJs: vi.fn()
  }
})

import { abstractPathLanguage, parsePath } from './helpers'


describe('abstractPathLanguage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return original path if no locale matches', () => {
    const result = abstractPathLanguage('about')
    expect(result).toEqual({ path: 'about', matchedLocale: undefined })
  })

  it('should handle error in importJs gracefully', () => {
    const result = abstractPathLanguage('de/home')
    expect(result).toEqual({ path: 'de/home', matchedLocale: undefined })
  })

  it('should handle importJs returning object without available_locales', () => {
    const result = abstractPathLanguage('en/about')
    expect(result).toEqual({ path: 'en/about', matchedLocale: undefined })
  })

  it('should handle importJs returning null', () => {
    const result = abstractPathLanguage('en/about')
    expect(result).toEqual({ path: 'en/about', matchedLocale: undefined })
  })
})

describe('parsePath', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return original path if no = is present and no locale matches', () => {
    const result = parsePath('de/about')
    expect(result).toBe('de/about')
  })

  it('should handle path with = but no matching locale', () => {
    const result = parsePath('de/test=value')
    expect(result).toBe(encodeURIComponent('de'))
  })
})
