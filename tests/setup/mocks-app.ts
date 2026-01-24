import { ref } from 'vue'

export function defineNuxtPlugin(plugin: any) {
  return plugin
}

export function defineNuxtRouteMiddleware(middleware: any) {
  return middleware
}

export function useNuxtApp() {
  return {
    $sections: {
      projectId: 'test-project',
      serverUrl: 'http://localhost:3000',
      queryStringSupport: 'disabled',
      projectLocales: '',
      cname: false,
    },
    provide: () => {},
    callHook: () => Promise.resolve(),
  }
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
