import {
  ref,
  computed,
  watch,
  reactive,
  nextTick,
  onMounted,
  onBeforeMount,
  onBeforeUnmount,
  onUnmounted,
  onServerPrefetch,
  defineAsyncComponent,
  provide,
  inject,
} from 'vue'
import { vi } from 'vitest'

export function defineNuxtPlugin(plugin: any) {
  return plugin
}

export function defineNuxtRouteMiddleware(middleware: any) {
  return middleware
}

export function useNuxtApp() {
  return nuxtAppInstance
}

export function useCookie(name: string) {
  return ref(null)
}

export function useRequestHeaders() {
  return {}
}

export function useRoute() {
  return {
    path: '/',
    params: { pathMatch: '' },
    query: {},
    meta: {},
  }
}

export function useRouter() {
  return {
    push: () => {},
    replace: () => {},
  }
}

export function useRuntimeConfig() {
  return {
    public: { sections: {} },
    app: {},
  }
}

export function useState(key: string, defaultValue: any) {
  return ref(typeof defaultValue === 'function' ? defaultValue() : defaultValue)
}

export function useHead() {}

export function useI18n() {
  return {
    locale: { value: 'en' },
    setLocale: () => {},
    t: (key: string) => key,
  }
}

export function useLocalePath() {
  return (path: string) => path
}

export function useScript() {
  return { load: () => Promise.resolve() }
}

export {
  formatName,
  formatTexts,
  importJs,
  importComp,
  sectionHeader,
  getSectionProjectIdentity,
  parsePath,
  parseQS,
  useApiRequest,
  validateQS,
  dummyDataPresets,
  getRandomElement,
  populateWithDummyValues,
  loadScript,
  showToast,
} from '../../src/runtime/utils/helpers'

export {
  ref,
  computed,
  watch,
  reactive,
  nextTick,
  onMounted,
  onBeforeMount,
  onBeforeUnmount,
  onUnmounted,
  onServerPrefetch,
  defineAsyncComponent,
  provide,
  inject,
}

const provideStore: Record<string, any> = {}

const nuxtAppInstance: any = {
  $sections: {
    projectId: 'test-project',
    serverUrl: 'http://localhost:3000',
    queryStringSupport: 'disabled',
    projectLocales: '',
    cname: false,
  },
  $i18n: {
    locale: { value: 'en' },
    availableLocales: ['en', 'fr', 'de', 'es'],
    setLocale: vi.fn(),
  },
  provide: (key: string, value: any) => {
    provideStore[key] = value
    nuxtAppInstance[`$${key}`] = value
    return value
  },
  callHook: () => Promise.resolve(),
}

let isSideBarOpenRef: any = null
let keepEditBarVisibleRef: any = null
let dynamicSideComponentRef: any = null
let currentSectionRef: any = null

export const registerSidebarRefs = (refs: Record<string, any>) => {
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

export const clearStateCache = () => {
  provideStore.__stateCacheCleared = true
}

nuxtAppInstance.$sideBarComponent = {
  show: vi.fn((options?: { keepEditBarVisible?: boolean }) => {
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
