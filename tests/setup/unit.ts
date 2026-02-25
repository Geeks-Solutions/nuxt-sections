import { vi, beforeEach } from 'vitest'
import { ref } from 'vue'

beforeEach(() => {
  vi.clearAllMocks()
})

global.window = global.window || {}
global.process = global.process || { env: { NODE_ENV: 'test' } }
global.process.client = true

vi.mock('#app', () => ({
  defineNuxtPlugin: (plugin: any) => plugin,
  defineNuxtRouteMiddleware: (middleware: any) => middleware,
  useNuxtApp: vi.fn(() => ({
    $sections: {
      projectId: 'test-project',
      serverUrl: 'http://localhost:3000',
      queryStringSupport: 'disabled',
      projectLocales: '',
      cname: false,
    },
    provide: vi.fn(),
    callHook: vi.fn(() => Promise.resolve()),
  })),
  useCookie: vi.fn(() => ref(null)),
  useRequestHeaders: vi.fn(() => ({})),
  useRoute: vi.fn(() => ({
    path: '/',
    params: { pathMatch: '' },
    query: {},
    meta: {},
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
  useRuntimeConfig: vi.fn(() => ({
    public: { sections: {} },
    app: {},
  })),
  useState: vi.fn((key: string, defaultValue: any) =>
    ref(typeof defaultValue === 'function' ? defaultValue() : defaultValue)
  ),
  useHead: vi.fn(),
  useI18n: vi.fn(() => ({
    locale: { value: 'en' },
    setLocale: vi.fn(),
    t: vi.fn((key: string) => key),
  })),
  useLocalePath: vi.fn(() => (path: string) => path),
  useScript: vi.fn(() => ({ load: vi.fn(() => Promise.resolve()) })),
}))

vi.mock('vue', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue')>()
  return {
    ...actual,
    defineAsyncComponent: vi.fn((fn: any) => fn),
  }
})
