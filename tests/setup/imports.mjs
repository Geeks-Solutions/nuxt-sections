import { vi } from 'vitest'
import {
  ref,
  computed,
  reactive,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
  onBeforeMount,
  onServerPrefetch,
  provide,
  inject,
  defineEmits,
  defineProps,
  defineExpose,
  withDefaults,
  toRef,
  toRefs,
  unref,
  isRef,
  shallowRef,
  triggerRef,
  customRef,
  shallowReactive,
  readonly,
  isReadonly,
  shallowReadonly,
  markRaw,
  toRaw,
  useCssModule,
  useCssVars,
  useTransitionState,
  onRenderTracked,
  onRenderTriggered,
  onActivated,
  onDeactivated,
  onUnmounted,
  onErrorCaptured,
  onScopeDispose,
  getCurrentInstance,
  getCurrentScope,
  h,
  Fragment,
  Text,
  Comment,
  Static,
  Suspense,
  Teleport,
  KeepAlive,
  BaseTransition,
  withDirectives,
  withAsyncContext,
  createVNode,
  createElementVNode,
  createTextVNode,
  createCommentVNode,
  createStaticVNode,
  openBlock,
  createBlock,
  setBlockTracking,
  createSlots,
  withCtx,
  renderSlot,
  renderList,
  toHandlers,
  renderStatic,
  mergeProps,
  normalizeProps,
  guardReactiveProps,
  toDisplayString,
  camelize,
  capitalize,
  toHandlerKey,
  normalizeClass,
  normalizeStyle,
  transformVNodeArgs,
  vModelText,
  vModelCheckbox,
  vModelRadio,
  vModelSelect,
  vModelDynamic,
  withModifiers,
  withKeys,
  vShow,
  vOnKeyup,
  vOnKeys,
  vOn,
  vBind,
  vHtml,
  vText,
  vCloak,
  vMemo,
  vOnce,
  vIs,
  vFor,
  vSlot,
  vPre,
} from 'vue'

// Re-export all Vue composables
export {
  ref,
  computed,
  reactive,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
  onBeforeMount,
  onServerPrefetch,
  provide,
  inject,
  defineEmits,
  defineProps,
  defineExpose,
  withDefaults,
  toRef,
  toRefs,
  unref,
  isRef,
  shallowRef,
  triggerRef,
  customRef,
  shallowReactive,
  readonly,
  isReadonly,
  shallowReadonly,
  markRaw,
  toRaw,
  useCssModule,
  useCssVars,
  useTransitionState,
  onRenderTracked,
  onRenderTriggered,
  onActivated,
  onDeactivated,
  onUnmounted,
  onErrorCaptured,
  onScopeDispose,
  getCurrentInstance,
  getCurrentScope,
  h,
  Fragment,
  Text,
  Comment,
  Static,
  Suspense,
  Teleport,
  KeepAlive,
  BaseTransition,
  withDirectives,
  withAsyncContext,
  createVNode,
  createElementVNode,
  createTextVNode,
  createCommentVNode,
  createStaticVNode,
  openBlock,
  createBlock,
  setBlockTracking,
  createSlots,
  withCtx,
  renderSlot,
  renderList,
  toHandlers,
  renderStatic,
  mergeProps,
  normalizeProps,
  guardReactiveProps,
  toDisplayString,
  camelize,
  capitalize,
  toHandlerKey,
  normalizeClass,
  normalizeStyle,
  transformVNodeArgs,
  vModelText,
  vModelCheckbox,
  vModelRadio,
  vModelSelect,
  vModelDynamic,
  withModifiers,
  withKeys,
  vShow,
  vOnKeyup,
  vOnKeys,
  vOn,
  vBind,
  vHtml,
  vText,
  vCloak,
  vMemo,
  vOnce,
  vIs,
  vFor,
  vSlot,
  vPre,
}

// Mock Nuxt composables
function useState(key, defaultValue) {
  if (arguments.length === 1) {
    return ref()
  }
  return ref(defaultValue)
}

const mockRoute = { path: '/', params: { pathMatch: '' }, query: {}, meta: {} }
function useRoute() {
  return mockRoute
}

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  go: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  beforeEach: vi.fn(),
  afterEach: vi.fn(),
}
function useRouter() {
  return mockRouter
}

function useRuntimeConfig() {
  return {
    public: {},
    app: {},
  }
}

function useHead() {}

function useCookie(name) {
  return ref(null)
}

function useLocalePath() {
  return (path) => path
}

function navigateTo(path) {
  return Promise.resolve(path)
}

function useI18n() {
  return {
    locale: ref('en'),
    setLocale: vi.fn(),
    t: vi.fn((key) => key),
  }
}

function useScript() {
  return {
    load: vi.fn(() => Promise.resolve()),
  }
}

function useRequestHeaders() {
  return {}
}

function defineNuxtRouteMiddleware(fn) {
  return fn
}

// Nuxt app mock
const nuxtAppInstance = {
  provide: vi.fn((key, value) => {
    nuxtAppInstance[`$${key}`] = value
    return value
  }),
  callHook: vi.fn(() => Promise.resolve()),
  ssrContext: {
    event: {
      req: {
        headers: {
          host: 'localhost:3000',
          'x-forwarded-proto': 'http',
        },
      },
      res: {
        statusCode: 200,
      },
    },
  },
}

// Initialize with defaults (can be overridden by tests)
nuxtAppInstance.$sections = {
  cname: true,
  serverUrl: 'http://localhost:3000',
  projectId: 'test-project',
  queryStringSupport: 'enabled',
  projectLocales: '',
}

nuxtAppInstance.$toast = vi.fn()

// Default page metadata (can be overridden by tests)
nuxtAppInstance.$pageMetadata = {
  project_metadata: {
    languages: ['en'],
  },
  languages: ['en'],
  defaultLocale: 'en',
}

// Mock process.env
globalThis.process = globalThis.process || { env: { NODE_ENV: 'test' } }

function useNuxtApp() {
  return nuxtAppInstance
}

// Sidebar state tracking for tests
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

// Re-export Nuxt composables
export {
  useState,
  useRoute,
  useRouter,
  useRuntimeConfig,
  useHead,
  useCookie,
  useLocalePath,
  navigateTo,
  useI18n,
  useScript,
  useRequestHeaders,
  defineNuxtRouteMiddleware,
  useNuxtApp,
}

// Import and re-export helper functions
export {
  formatName,
  formatTexts,
  getMySectionsPages,
  loadScript,
  validatePagePath,
  populateWithDummyValues,
  dummyDataPresets,
  sectionHeader,
  validateQS,
  parseQS,
  getSectionProjectIdentity,
  abstractPathLanguage,
  parsePath,
} from '../../src/runtime/utils/helpers.js'

// Additional mocks needed by tests
export const importComp = vi.fn((path) => ({
  component: null,
  setup: Promise.resolve({ default: { props: {} } }),
}))

export const importJs = vi.fn(() => ({}))

export const showToast = vi.fn()

export const useApiRequest = vi.fn(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}))
