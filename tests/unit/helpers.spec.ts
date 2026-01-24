import { describe, it, expect } from 'vitest'
import {
  formatName,
  formatTexts,
  validatePagePath,
  validateQS,
  dummyDataPresets,
  getRandomElement,
  populateWithDummyValues,
  sectionHeader,
} from '../../src/runtime/utils/helpers'

describe('formatName', () => {
  it('formats section names by extracting last part', () => {
    expect(formatName('type:section:name')).toBe('name')
    expect(formatName('single')).toBe('single')
    expect(formatName('prefix:name')).toBe('name')
  })

  it('replaces underscores with spaces', () => {
    expect(formatName('hello_world')).toBe('hello world')
    expect(formatName('test_case_name')).toBe('test case name')
  })

  it('returns "unlabeled" for empty name', () => {
    expect(formatName('')).toBe('unlabeled')
  })
})

describe('formatTexts', () => {
  it('formats text by adding separator before capital letters', () => {
    expect(formatTexts('helloWorld')).toBe('Hello World')
    expect(formatTexts('testCase')).toBe('Test Case')
  })

  it('uses custom separator', () => {
    expect(formatTexts('helloWorld', '-')).toBe('Hello-World')
    expect(formatTexts('testCase', '_')).toBe('Test_Case')
  })

  it('capitalizes first letter', () => {
    expect(formatTexts('hello')).toBe('Hello')
    expect(formatTexts('test')).toBe('Test')
  })
})

describe('validatePagePath', () => {
  it('validates empty and root paths', () => {
    expect(validatePagePath('', [])).toEqual({ valid: true, error: null })
    expect(validatePagePath('/', [])).toEqual({ valid: true, error: null })
  })

  it('allows all paths when no locales defined', () => {
    expect(validatePagePath('/fr/home', [])).toEqual({ valid: true, error: null })
    expect(validatePagePath('/en', [])).toEqual({ valid: true, error: null })
  })

  it('rejects paths that exactly match a locale code', () => {
    expect(validatePagePath('en', ['en', 'fr'])).toEqual({
      valid: false,
      error: 'Page path "en" conflicts with language code. Please choose a different path.',
    })
    expect(validatePagePath('fr', ['en', 'fr'])).toEqual({
      valid: false,
      error: 'Page path "fr" conflicts with language code. Please choose a different path.',
    })
  })

  it('rejects paths that start with a locale code', () => {
    expect(validatePagePath('/en/home', ['en', 'fr'])).toEqual({
      valid: false,
      error: 'Page path cannot start with language code "en". Please choose a different path.',
    })
    expect(validatePagePath('/fr/about', ['en', 'fr'])).toEqual({
      valid: false,
      error: 'Page path cannot start with language code "fr". Please choose a different path.',
    })
  })

  it('normalizes paths correctly', () => {
    expect(validatePagePath('///home///', ['en', 'fr'])).toEqual({ valid: true, error: null })
    expect(validatePagePath('  home  ', ['en', 'fr'])).toEqual({ valid: true, error: null })
  })

  it('allows valid paths without locale prefix', () => {
    expect(validatePagePath('/about', ['en', 'fr'])).toEqual({ valid: true, error: null })
    expect(validatePagePath('/contact-us', ['en', 'fr'])).toEqual({ valid: true, error: null })
  })
})

describe('validateQS', () => {
  it('returns undefined when editMode is false', () => {
    expect(validateQS({ key: 'value' }, ['key'], false)).toBeUndefined()
  })

  it('replaces null and undefined values with "n/a" in edit mode', () => {
    const result = validateQS(
      { key1: null, key2: undefined, key3: 'value' },
      ['key1', 'key2'],
      true
    )
    expect(result).toEqual({ key1: 'n/a', key2: 'n/a' })
  })

  it('only processes keys in qsKeys array', () => {
    const qsObject = { key1: null, key2: null, key3: null }
    const result = validateQS(qsObject, ['key1', 'key2'], true)
    expect(result).toEqual({ key1: 'n/a', key2: 'n/a' })
    expect(result).not.toHaveProperty('key3')
  })

  it('preserves non-null values in edit mode', () => {
    const result = validateQS({ key1: 'value', key2: null }, ['key1', 'key2'], true)
    expect(result).toEqual({ key2: 'n/a' })
  })
})

describe('dummyDataPresets', () => {
  it('contains presets for all expected types', () => {
    expect(dummyDataPresets.wysiwyg).toBeDefined()
    expect(dummyDataPresets.html).toBeDefined()
    expect(dummyDataPresets.integer).toBeDefined()
    expect(dummyDataPresets.number).toBeDefined()
    expect(dummyDataPresets.image).toBeDefined()
    expect(dummyDataPresets.string).toBeDefined()
    expect(dummyDataPresets.text).toBeDefined()
    expect(dummyDataPresets.boolean).toBeDefined()
  })

  it('wysiwyg presets contain HTML', () => {
    dummyDataPresets.wysiwyg.forEach((preset) => {
      expect(preset).toContain('<')
      expect(preset).toContain('>')
    })
  })

  it('integer presets are numbers', () => {
    dummyDataPresets.integer.forEach((preset) => {
      expect(typeof preset).toBe('number')
      expect(Number.isInteger(preset)).toBe(true)
    })
  })

  it('boolean presets are true or false', () => {
    dummyDataPresets.boolean.forEach((preset) => {
      expect(typeof preset).toBe('boolean')
    })
  })

  it('image presets contain expected structure', () => {
    dummyDataPresets.image.forEach((preset) => {
      expect(preset).toHaveProperty('media_id')
      expect(preset).toHaveProperty('url')
      expect(preset).toHaveProperty('seo_tag')
      expect(preset).toHaveProperty('files')
      expect(Array.isArray(preset.files)).toBe(true)
    })
  })
})

describe('getRandomElement', () => {
  it('returns an element from the array', () => {
    const arr = [1, 2, 3, 4, 5]
    const result = getRandomElement(arr)
    expect(arr).toContain(result)
  })

  it('returns single element from single-element array', () => {
    const arr = ['only']
    expect(getRandomElement(arr)).toBe('only')
  })

  it('works with different data types', () => {
    expect(getRandomElement(['a', 'b', 'c'])).toMatch(/[abc]/)
    expect(getRandomElement([1, 2, 3])).toBeGreaterThan(0)
    expect([true, false]).toContain(getRandomElement([true, false]))
  })
})

describe('populateWithDummyValues', () => {
  it('replaces type strings with random presets', () => {
    const obj = {
      title: 'string',
      count: 'integer',
      description: 'text',
    }
    const result = populateWithDummyValues(obj, dummyDataPresets)

    expect(result.title).not.toBe('string')
    expect(result.count).not.toBe('integer')
    expect(result.description).not.toBe('text')

    expect(typeof result.title).toBe('string')
    expect(typeof result.count).toBe('number')
    expect(typeof result.description).toBe('string')
  })

  it('handles nested objects', () => {
    const obj = {
      user: {
        name: 'string',
        age: 'integer',
      },
    }
    const result = populateWithDummyValues(obj, dummyDataPresets)

    expect(result.user.name).not.toBe('string')
    expect(result.user.age).not.toBe('integer')
    expect(typeof result.user.name).toBe('string')
    expect(typeof result.user.age).toBe('number')
  })

  it('handles arrays', () => {
    const obj = ['string', 'integer', 'text']
    const result = populateWithDummyValues(obj, dummyDataPresets)

    expect(result[0]).not.toBe('string')
    expect(result[1]).not.toBe('integer')
    expect(result[2]).not.toBe('text')
  })

  it('handles nested arrays', () => {
    const obj = {
      items: [
        { name: 'string', value: 'integer' },
        { name: 'string', value: 'integer' },
      ],
    }
    const result = populateWithDummyValues(obj, dummyDataPresets)

    expect(result.items[0].name).not.toBe('string')
    expect(result.items[0].value).not.toBe('integer')
    expect(result.items[1].name).not.toBe('string')
    expect(result.items[1].value).not.toBe('integer')
  })

  it('preserves non-type string values', () => {
    const obj = {
      name: 'string',
      id: '123',
      status: 'active',
    }
    const result = populateWithDummyValues(obj, dummyDataPresets)

    expect(result.name).not.toBe('string')
    expect(result.id).toBe('123')
    expect(result.status).toBe('active')
  })

  it('handles empty objects and arrays', () => {
    expect(populateWithDummyValues({}, dummyDataPresets)).toEqual({})
    expect(populateWithDummyValues([], dummyDataPresets)).toEqual([])
  })
})

describe('sectionHeader', () => {
  it('adds header key with project-id prefix', () => {
    const header = {}
    const result = sectionHeader(header)

    expect(Object.keys(result)).toHaveLength(1)
    const key = Object.keys(result)[0]
    expect(key).toMatch(/^project-id-\d+-\d+$/)
    expect(result[key]).toBe('a3b2cd1')
  })

  it('handles headers with token', () => {
    const header = { token: 'test-token' }
    const result = sectionHeader(header)

    expect(result.token).toBe('test-token')
    const key = Object.keys(result).find((k) => k.startsWith('project-id'))
    expect(key).toBeDefined()
  })

  it('handles headers with origin', () => {
    const header = { origin: 'https://example.com' }
    const result = sectionHeader(header)

    expect(result.origin).toBe('https://example.com')
    const key = Object.keys(result).find((k) => k.startsWith('project-id'))
    expect(result['access-control-request-headers']).toBe(key)
  })

  it('handles headers with undefined token', () => {
    const header: any = { token: undefined }
    const result = sectionHeader(header)

    expect(result).not.toHaveProperty('token')
  })

  it('generates unique keys', () => {
    const header1 = sectionHeader({})
    const header2 = sectionHeader({})

    const key1 = Object.keys(header1)[0]
    const key2 = Object.keys(header2)[0]

    expect(key1).not.toBe(key2)
  })
})
