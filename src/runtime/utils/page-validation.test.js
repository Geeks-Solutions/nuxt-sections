import { describe, it, expect, beforeEach, vi } from 'vitest'
import { validatePagePath } from './helpers'



describe('Page Path Validation - Language Prefix Conflicts', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('validatePagePath helper function', () => {
        it('should reject page path exactly matching language code', () => {
            // Test case: /en should be rejected (conflicts with English locale)
            const availableLocales = ['en', 'fr', 'de', 'es']
            const path = 'en'

            const result = validatePagePath(path, availableLocales)

            // EXPECTED: Should reject paths that exactly match language codes
            expect(result.valid).toBe(false)
            expect(result.error).toContain('conflicts with language code')
        })

        it('should reject page path starting with language code', () => {
            // Test case: /en/about should be rejected
            const availableLocales = ['en', 'fr', 'de', 'es']
            const path = 'en/about'

            const result = validatePagePath(path, availableLocales)

            // EXPECTED: Should reject paths starting with language codes
            expect(result.valid).toBe(false)
            expect(result.error).toContain('cannot start with language code')
        })

        it('should allow page path with language code in middle', () => {
            // Test case: /about/en/something should be allowed
            const availableLocales = ['en', 'fr', 'de', 'es']
            const path = 'about/en/something'

            const result = validatePagePath(path, availableLocales)

            // EXPECTED: Should allow paths with language codes in the middle
            expect(result.valid).toBe(true)
            expect(result.error).toBeNull()
        })

        it('should allow page path not matching any language code', () => {
            // Test case: /about should be allowed
            const availableLocales = ['en', 'fr', 'de', 'es']
            const path = 'about'

            const result = validatePagePath(path, availableLocales)

            // EXPECTED: Should allow paths that don't match language codes
            expect(result.valid).toBe(true)
            expect(result.error).toBeNull()
        })

        it('should handle edge case: root path', () => {
            // Test case: / should be allowed
            const availableLocales = ['en', 'fr', 'de', 'es']
            const path = '/'

            const result = validatePagePath(path, availableLocales)

            // EXPECTED: Root path should be allowed
            expect(result.valid).toBe(true)
            expect(result.error).toBeNull()
        })

        it('should handle edge case: empty path', () => {
            // Test case: empty string should be handled gracefully
            const availableLocales = ['en', 'fr', 'de', 'es']
            const path = ''

            const result = validatePagePath(path, availableLocales)

            // EXPECTED: Empty path should be allowed (treated as root)
            expect(result.valid).toBe(true)
            expect(result.error).toBeNull()
        })

        it('should handle paths with leading/trailing slashes', () => {
            // Test case: /en/ should be rejected (same as /en)
            const availableLocales = ['en', 'fr', 'de', 'es']
            const path = '/en/'

            const result = validatePagePath(path, availableLocales)

            // EXPECTED: Should normalize and reject /en/ as it matches language code
            expect(result.valid).toBe(false)
            expect(result.error).toContain('conflicts with language code')
        })

        it('should handle multiple slashes', () => {
            // Test case: //en//about// should be treated as /en/about
            const availableLocales = ['en', 'fr', 'de', 'es']
            const path = '//en//about//'

            const result = validatePagePath(path, availableLocales)

            // EXPECTED: Should normalize and reject as it starts with language code
            expect(result.valid).toBe(false)
            expect(result.error).toContain('cannot start with language code')
        })

        it('should be case-sensitive for language codes', () => {
            // Test case: EN should be allowed (not matching 'en')
            const availableLocales = ['en', 'fr', 'de', 'es']
            const path = 'EN'

            const result = validatePagePath(path, availableLocales)

            // EXPECTED: Should be case-sensitive
            expect(result.valid).toBe(true)
            expect(result.error).toBeNull()
        })

        it('should handle paths with dashes containing language codes', () => {
            // Test case: en-us should be allowed (not exactly matching 'en')
            const availableLocales = ['en', 'fr', 'de', 'es']
            const path = 'en-us'

            const result = validatePagePath(path, availableLocales)

            // EXPECTED: Should allow as it's not an exact match
            expect(result.valid).toBe(true)
            expect(result.error).toBeNull()
        })

        it('should allow paths that start with language code as substring', () => {
            // Test case: /hilarious should be allowed even though 'hi' is a language code
            const availableLocales = ['en', 'fr', 'hi', 'es']
            const path = 'hilarious'

            const result = validatePagePath(path, availableLocales)

            // EXPECTED: Should allow because 'hilarious' !== 'hi' (exact match required)
            expect(result.valid).toBe(true)
            expect(result.error).toBeNull()
        })
    })


    describe('Edge cases and special scenarios', () => {
        it('should handle empty locale list', () => {
            const availableLocales = []
            const path = 'en/about'

            const result = validatePagePath(path, availableLocales)

            // EXPECTED: Should allow all paths when no locales are defined
            expect(result.valid).toBe(true)
            expect(result.error).toBeNull()
        })

        it('should handle locale with multiple characters', () => {
            const availableLocales = ['en-US', 'fr-FR']
            const path = 'en-US/about'

            const result = validatePagePath(path, availableLocales)

            // EXPECTED: Should reject paths starting with multi-char locales
            expect(result.valid).toBe(false)
            expect(result.error).toContain('cannot start with language code')
        })

        it('should handle deeply nested paths', () => {
            const availableLocales = ['en', 'fr']
            const path = 'products/category/en/subcategory'

            const result = validatePagePath(path, availableLocales)

            // EXPECTED: Should allow as language code is not at the start
            expect(result.valid).toBe(true)
            expect(result.error).toBeNull()
        })
    })
})

describe('Page Path Validation - Integration Tests', () => {
    it.skip('should prevent page creation with language prefix path', () => {
        // TODO: Test that createNewPage rejects paths matching language codes
        // This will require mocking the admin.vue component
        // Skipped until admin.vue validation is implemented
    })

    it.skip('should prevent page update with language prefix path', () => {
        // TODO: Test that updatePageMetaData rejects paths matching language codes
        // Skipped until admin.vue validation is implemented
    })

    it.skip('should show user-friendly error message', () => {
        // TODO: Test that error toast is shown with clear message
        // Skipped until admin.vue validation is implemented
    })

    it.skip('should get available locales from global-hooks', () => {
        // TODO: Test that validation uses global-hooks.available_locales()
        // Skipped until admin.vue validation is implemented
    })
})

