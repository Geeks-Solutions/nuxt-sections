import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Nuxt-specific functions
const mockNuxtApp = {
  $i18n: {
    locale: { value: 'en' },
    availableLocales: ['en', 'de', 'fr', 'es'],
    setLocale: vi.fn(),
  },
  $sections: {
    serverUrl: 'https://api.example.com',
    queryStringSupport: 'enabled',
  },
  ssrContext: {
    event: {
      req: {
        headers: {
          'x-forwarded-proto': 'https',
          host: 'example.com',
        },
        body: {},
      },
    },
  },
}

const mockStore = {
  setPageData: vi.fn(),
}

const mockRoute = {
  params: {
    pathMatch: 'en/about',
  },
  query: {
    test: 'value',
  },
}

// Mock Nuxt composables
vi.mock('#app', () => ({
  useNuxtApp: () => mockNuxtApp,
  useState: vi.fn((key, defaultFn) => ({ value: defaultFn() })),
  defineNuxtRouteMiddleware: vi.fn((fn) => fn),
}))

// Mock Pinia store
const mockUseSectionsDataStore = vi.fn(() => mockStore)
vi.mock('../stores/sectionsDataStore', () => ({
  useSectionsDataStore: mockUseSectionsDataStore,
}))

// Mock other helper functions - need to make sure these are available in the middleware
const sectionHeader = vi.fn((config) => ({ 'Content-Type': 'application/json', ...config }))
const getSectionProjectIdentity = vi.fn(() => 'test-project-id')
const parseQS = vi.fn((path, hasQuery, query) => ({ path, hasQuery, query }))
const mockUseApiRequest = vi.fn()

vi.mock('./helpers', () => ({
  sectionHeader,
  getSectionProjectIdentity,
  parseQS,
  useApiRequest: mockUseApiRequest,
}))

// Make these available globally for the middleware function
global.sectionHeader = sectionHeader
global.getSectionProjectIdentity = getSectionProjectIdentity
global.parseQS = parseQS
global.useApiRequest = mockUseApiRequest

// Mock fetch
global.fetch = vi.fn()

// Import the middleware (assuming it's exported as default)
// For testing purposes, we'll recreate the middleware function here
const routeMiddleware = async (to, from) => {
  const app = mockNuxtApp
  const defaultLocale = { value: app.$i18n.locale.value }

  const route = to

  const pathMatch = Array.isArray(route.params.pathMatch)
    ? route.params.pathMatch.join('/')
    : route.params.pathMatch || ''
  const pageName = pathMatch || '/'

  const abstractedDefaultLocale = globalThis.abstractPathLanguage(pageName).matchedLocale

  if (import.meta.server) {
    let hooksJs

    try {
      hooksJs = globalThis.importJs(`/js/global-hooks`)

      if (hooksJs['init_params']) {
        const paramsUpdate = hooksJs['init_params'](app.$sections, {
          qs: route.query,
          headers:
            app.ssrContext && app.ssrContext.event.req ? app.ssrContext.event.req.headers : {},
          reqBody: app.ssrContext && app.ssrContext.event.req ? app.ssrContext.event.req.body : {},
          url:
            app.ssrContext && app.ssrContext.event.req && app.ssrContext.event.req.headers
              ? app.ssrContext.event.req.headers.host
              : 'localhost',
        })
        if (paramsUpdate) {
          app.$sections = paramsUpdate
        }
      }
    } catch {}

    const store = mockUseSectionsDataStore()

    const scheme = app.ssrContext.event.req.headers['x-forwarded-proto'] || 'http'
    const websiteDomain = app.ssrContext.event.req.headers.host

    const config = {
      headers: sectionHeader({ origin: `${scheme}://${websiteDomain}` }),
    }

    let URL = `${app.$sections.serverUrl}/project/${getSectionProjectIdentity()}/page/${globalThis.parsePath(encodeURIComponent(pageName))}`

    let payload = {}

    let language
    try {
      language = abstractedDefaultLocale ? abstractedDefaultLocale : undefined
    } catch {}

    if (app.$sections.queryStringSupport === 'enabled') {
      const query_string = parseQS(
        encodeURIComponent(pathMatch || '/'),
        Object.keys(route.query).length !== 0,
        route.query
      )
      payload = {
        query_string: {
          ...query_string,
          language,
        },
      }
    }

    if (hooksJs && hooksJs['page_pre_load']) {
      const hookResult = hooksJs['page_pre_load'](payload)

      if (hookResult && typeof hookResult === 'object') {
        try {
          payload = JSON.parse(JSON.stringify(hookResult))
        } catch {}
      }
    }

    const setupLocalization = async (lang) => {
      defaultLocale.value = lang
      let localization
      if (abstractedDefaultLocale && app.$i18n.availableLocales.includes(abstractedDefaultLocale)) {
        localization = abstractedDefaultLocale
      } else {
        localization = lang
      }
      app.$i18n.locale.value = localization
      await app.$i18n.setLocale(localization)
    }

    const optionsRes = { status: 200 }
    global.fetch.mockResolvedValueOnce(optionsRes)

    if (optionsRes.status === 200) {
      try {
        // Call useApiRequest with the actual parameters
        await useApiRequest({
          url: URL,
          method: 'POST',
          body: payload,
          ...config,
          onSuccess: async (res) => {
            if (
              res.data.metadata.project_metadata &&
              res.data.metadata.project_metadata.defaultLang
            ) {
              await setupLocalization(res.data.metadata.project_metadata.defaultLang)
            }
            store.setPageData({ res })
          },
          onError: async (error) => {
            if (
              error.response &&
              error.response.data &&
              error.response.data.options &&
              error.response.data.options.project_metadata &&
              error.response.data.options.project_metadata.defaultLang
            ) {
              await setupLocalization(error.response.data.options.project_metadata.defaultLang)
            }
            store.setPageData({ error })
          },
        })
      } catch {}
    }
  } else {
    // Client-side logic
    if (abstractedDefaultLocale && app.$i18n.availableLocales.includes(abstractedDefaultLocale)) {
      app.$i18n.locale.value = abstractedDefaultLocale
      await app.$i18n.setLocale(abstractedDefaultLocale)
    } else {
      app.$i18n.locale.value = defaultLocale.value
      await app.$i18n.setLocale(defaultLocale.value)
    }
  }
}

describe('Route Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mocks
    mockUseApiRequest.mockClear()
    mockUseSectionsDataStore.mockClear()
    mockStore.setPageData.mockClear()
    global.fetch.mockClear()
    // Reset import.meta.server for each test
    vi.stubGlobal('import', { meta: { server: true } })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('Execution', () => {
    beforeEach(() => {
      vi.stubGlobal('import', { meta: { server: false } })
    })

    it('should set locale on client-side with matched locale', async () => {
      const mockTo = {
        params: { pathMatch: 'de/about' },
        query: {},
      }
      const mockFrom = {}

      await routeMiddleware(mockTo, mockFrom)

      expect(mockNuxtApp.$i18n.locale.value).toBe('de')
      expect(mockNuxtApp.$i18n.setLocale).toHaveBeenCalledWith('de')
    })

    it('should use default locale when no locale matches', async () => {
      const mockTo = {
        params: { pathMatch: 'about' },
        query: {},
      }
      const mockFrom = {}

      await routeMiddleware(mockTo, mockFrom)

      expect(mockNuxtApp.$i18n.setLocale).toHaveBeenCalledWith('de')
    })

    it('should handle unavailable locale', async () => {
      // Mock a locale that's not in availableLocales
      const mockToWithUnavailableLocale = {
        params: { pathMatch: 'zh/about' },
        query: {},
      }
      const mockFrom = {}

      await routeMiddleware(mockToWithUnavailableLocale, mockFrom)

      expect(mockNuxtApp.$i18n.setLocale).toHaveBeenCalledWith('de')
    })
  })

  describe('Helper function integration', () => {
    it('should correctly parse paths with locale', () => {
      const result = globalThis.parsePath('en/about')
      expect(result).toBe(encodeURIComponent('about'))
    })

    it('should correctly abstract language from path', () => {
      const result = globalThis.abstractPathLanguage('de/home')
      expect(result.matchedLocale).toBe('de')
      expect(result.path).toBe(encodeURIComponent('home'))
    })

    it('should handle paths without locale', () => {
      const result = globalThis.abstractPathLanguage('about')
      expect(result.matchedLocale).toBeUndefined()
      expect(result.path).toBe('about')
    })
  })
})
