import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import draggable from "@marshallswain/vuedraggable"
import * as vt from 'vue-toastification'
import mitt from "mitt";

export default defineNuxtPlugin((_nuxtApp) => {
  const config = useRuntimeConfig()
  const sectionsConfig : any = config.public.sections
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
    position: "top-right",
    maxToasts: 20,
    newestOnTop: true
  }

  _nuxtApp.vueApp.use(vt.default, options)
  _nuxtApp.vueApp.component('draggable', draggable);
  // @ts-ignore
  _nuxtApp.provide('toast', vt.useToast ? vt.useToast() : vt.default.useToast())

  const emitter = mitt()

  if (process.client) {
    // @ts-ignore
    import('vue-toastification/dist/index.css')
  }

  return {
    provide: {
      event: emitter.emit, // Will emit an event
      listen: emitter.on // Will register a listener for an event
    }
  }
})
