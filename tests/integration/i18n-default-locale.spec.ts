import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useNuxtApp } from '#app'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
let i18nDefaultLocale: any

mockNuxtImport('importJs', () => () => ({
  available_locales: () => ['en', 'de', 'fr', 'es'],
}))
mockNuxtImport('abstractPathLanguage', () => (path: any) => {
  const normalized = String(path || '')
  if (normalized.startsWith('fr/')) {
    return { path: 'about', matchedLocale: 'fr' }
  }
  return { path: normalized, matchedLocale: undefined }
})
mockNuxtImport('parseQS', () => (path: any, hasQuery: any, query: any) => ({
  path,
  hasQuery,
  query,
}))
mockNuxtImport('sectionHeader', () => (config: any) => ({
  'Content-Type': 'application/json',
  ...config,
}))
mockNuxtImport('getSectionProjectIdentity', () => () => 'test-project-id')
mockNuxtImport('useApiRequest', () => vi.fn())

describe('i18n-default-locale middleware', () => {
  beforeEach(async () => {
    if (!i18nDefaultLocale) {
      i18nDefaultLocale = (await import('../../src/runtime/middleware/i18n-default-locale')).default
    }

    const nuxtApp = useNuxtApp()
    Object.assign((nuxtApp as any).$sections, {
      serverUrl: 'http://localhost:3000',
      queryStringSupport: 'enabled',
    })

    const i18n = nuxtApp.$i18n as any
    i18n.locale.value = 'en'
    nuxtApp.$i18n.setLocale = vi.fn()
    vi.clearAllMocks()
  })

  it('sets locale on client-side with matched locale', async () => {
    const to: any = {
      params: { pathMatch: 'fr/about' },
      query: {},
    }

    await i18nDefaultLocale(to, {} as any)

    const nuxtApp = useNuxtApp()
    expect(nuxtApp.$i18n.locale.value).toBe('fr')
    expect(nuxtApp.$i18n.setLocale).toHaveBeenCalledWith('fr')
  })

  it('uses default locale when no locale matches', async () => {
    const to: any = {
      params: { pathMatch: 'about' },
      query: {},
    }

    await i18nDefaultLocale(to, {} as any)

    const nuxtApp = useNuxtApp()
    expect(nuxtApp.$i18n.setLocale).toHaveBeenCalledWith('en')
  })

  it('ignores unsupported locale and keeps default', async () => {
    const to: any = {
      params: { pathMatch: 'de/about' },
      query: {},
    }

    await i18nDefaultLocale(to, {} as any)

    const nuxtApp = useNuxtApp()
    expect(nuxtApp.$i18n.setLocale).toHaveBeenCalledWith('en')
  })
})
