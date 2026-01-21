// Mock #app for test environment
// Provides Nuxt composables without loading actual Nuxt config
import { vi } from 'vitest'
import { ref as vueRef } from 'vue'

// Clear ref cache before each test to ensure test isolation
const refCache = new Map()
export const clearRefCache = () => {
  refCache.clear()
}

export const clearImportCache = () => {
  for (const key in importCache) {
    delete importCache[key]
  }
}

// Sidebar state tracking - store refs so mock can update them
let isSideBarOpenRef = null
let keepEditBarVisibleRef = null
let dynamicSideComponentRef = null
let currentSectionRef = null

export const registerSidebarRefs = (refs) => {
  if (refs.isSideBarOpen) isSideBarOpenRef = refs.isSideBarOpen
  if (refs.keepEditBarVisible) keepEditBarVisibleRef = refs.keepEditBarVisible
  if (refs.dynamicSideComponent) dynamicSideComponentRef = refs.dynamicSideComponent
  if (refs.currentSection) currentSectionRef = refs.currentSection
}

export const clearSidebarRefs = () => {
  isSideBarOpenRef = null
  keepEditBarVisibleRef = null
  dynamicSideComponentRef = null
  currentSectionRef = null
}

// Sidebar component mock - needs to match component's internal structure
const sideBarComponentMock = {
  show: vi.fn((options) => {
    if (keepEditBarVisibleRef) {
      keepEditBarVisibleRef.value = options?.keepEditBarVisible || false
    }
    if (isSideBarOpenRef) {
      isSideBarOpenRef.value = true
    }
    if (dynamicSideComponentRef) {
      dynamicSideComponentRef.value = true
    }
    if (currentSectionRef) {
      currentSectionRef.value = null
    }
  }),
  hide: vi.fn(() => {
    if (isSideBarOpenRef) {
      isSideBarOpenRef.value = false
    }
    if (keepEditBarVisibleRef) {
      keepEditBarVisibleRef.value = false
    }
    if (dynamicSideComponentRef) {
      dynamicSideComponentRef.value = false
    }
    if (currentSectionRef) {
      currentSectionRef.value = null
    }
  }),
}

export const getSidebarKeepEditBarVisible = () => keepEditBarVisibleRef?.value || false

// Store provided values
const provideStore = {}

// Shared nuxt app instance to ensure all calls reference same object
const nuxtAppInstance = {
  $sections: {
    serverUrl: 'http://localhost:3000',
    projectId: 'test-project',
    queryStringSupport: 'enabled',
    projectLocales: '',
  },
  $i18n: {
    locale: { value: 'en' },
    setLocale: vi.fn(),
  },
  ssrContext: {
    event: {
      req: {
        headers: {
          host: 'localhost:3000',
          'x-forwarded-proto': 'http',
        },
      },
    },
  },
  $sideBarComponent: sideBarComponentMock,
  provide: vi.fn((key, value) => {
    nuxtAppInstance[`$${key}`] = value
    provideStore[key] = value
    return value
  }),
  callHook: vi.fn((hook, data) => {
    return Promise.resolve()
  }),
}

export const useNuxtApp = vi.fn(() => nuxtAppInstance)

export const useState = vi.fn((key, init) => {
  // Return a real Vue ref to work properly in templates
  if (!refCache.has(key)) {
    const initialValue = typeof init === 'function' ? init() : init
    refCache.set(key, vueRef(initialValue))
  }
  return refCache.get(key)
})

export const useRoute = vi.fn(() => ({
  params: { pathMatch: '' },
  query: {},
}))

export const useCookie = vi.fn(() => ({ value: '' }))

export const useI18n = vi.fn(() => ({
  locale: { value: 'en' },
  setLocale: vi.fn(),
  t: vi.fn((key) => key),
}))

export const useRequestHeaders = vi.fn(() => ({}))

export const defineNuxtRouteMiddleware = vi.fn((fn) => fn)

export const useRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
}))

export const useLocalePath = vi.fn(() => (path) => path)

export const useRuntimeConfig = vi.fn(() => ({
  public: {},
}))

export const navigateTo = vi.fn()
export const useScript = vi.fn()
export const useHead = vi.fn()

export const onBeforeMount = vi.fn()

export const onServerPrefetch = vi.fn()

export const nextTick = vi.fn((fn) => {
  if (fn) fn()
  return Promise.resolve()
})

export const provide = nuxtAppInstance.provide

export const inject = vi.fn(() => ({}))

export const reactive = vi.fn((obj) => obj)

export const callHook = nuxtAppInstance.callHook

export const onMounted = vi.fn((fn) => fn())

export const onBeforeUnmount = vi.fn((fn) => fn())

export const watch = vi.fn()

export const computed = vi.fn()

// Export real Vue ref, not a mock
export { ref } from 'vue'

const importCache = {}

export const importComp = vi.fn((path) => {
  if (importCache[path]) {
    return importCache[path]
  }

  const result = {
    component: null,
    setup: Promise.resolve({ default: { props: {} } }),
  }

  importCache[path] = result
  return result
})

export const importJs = vi.fn(() => ({}))

// Export helper functions from helpers.js
import * as helpers from '../../src/runtime/utils/helpers.js'
export {
  formatName,
  formatTexts,
  getSectionProjectIdentity,
  importComp,
  parsePath,
  parseQS,
  populateWithDummyValues,
  sectionHeader,
  showToast,
  useApiRequest,
  validateQS,
  dummyDataPresets,
} from '../../src/runtime/utils/helpers.js'
