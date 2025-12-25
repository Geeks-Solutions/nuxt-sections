import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import draggable from '@marshallswain/vuedraggable'
import * as vt from 'vue-toastification'
import mitt from 'mitt'

type Events = Record<string, any>
type Handler<T = any> = (payload?: T) => any

export default defineNuxtPlugin((_nuxtApp) => {
  const config = useRuntimeConfig()
  const sectionsConfig: any = config.public.sections
  _nuxtApp.vueApp.config.warnHandler = () => {
    // No-op: silence warnings
  }
  const $sections = {
    projectId: sectionsConfig.projectId,
    projectUrl: sectionsConfig.projectUrl,
    serverUrl:
      sectionsConfig.environment === 'testing'
        ? 'https://api.sections-saas.k8s-dev.geeks.solutions/api/v1'
        : 'https://sections.geeks.solutions/api/v1',
    queryStringSupport: sectionsConfig.queryStringSupport,
    projectLocales: sectionsConfig.projectLocales,
    wysiwygEditorOptions: sectionsConfig.wysiwygEditorOptions,
    cname: sectionsConfig.cname,
    cssPreset: sectionsConfig.cssPreset,
  }

  // Provide it globally via Nuxt app context
  _nuxtApp.provide('sections', $sections)

  const options = {
    position: 'top-right',
    maxToasts: 20,
    newestOnTop: true,
  }

  _nuxtApp.vueApp.use(vt.default, options)
  _nuxtApp.vueApp.component('draggable', draggable)
  // @ts-ignore
  _nuxtApp.provide('toast', vt.useToast ? vt.useToast() : vt.default.useToast())

  const emitter = mitt<Events>()

  if (process.client) {
    // @ts-ignore
    import('vue-toastification/dist/index.css')
  }

  // Track handlers so we can await them (mitt doesn't expose "get listeners")
  const handlersByType = new Map<string | symbol, Set<Handler>>()

  const listen = (type: string | symbol, handler: Handler) => {
    emitter.on(type as any, handler as any)
    const set = handlersByType.get(type) ?? new Set()
    set.add(handler)
    handlersByType.set(type, set)

    // return unsubscribe (nice to have)
    return () => {
      emitter.off(type as any, handler as any)
      set.delete(handler)
      if (set.size === 0) handlersByType.delete(type)
    }
  }

  const event = (type: string | symbol, payload?: any) => {
    // fire-and-forget (keep old behavior)
    emitter.emit(type as any, payload)
  }

  const eventAsync = async (type: string | symbol, payload?: any) => {
    const handlers = Array.from(handlersByType.get(type) ?? [])
    return await Promise.allSettled(handlers.map((h) => h(payload)))
  }

  return {
    provide: {
      event, // Will emit an event
      eventAsync, // will emit an Async event that awaits for all handlers to finish
      listen, // Will register a listener for an event
    },
  }
})
