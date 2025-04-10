import { defineNuxtPlugin, useRuntimeConfig } from '#app'

export default defineNuxtPlugin((_nuxtApp) => {
  const config = useRuntimeConfig()
  const sectionsConfig : any = config.public.sections

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
  _nuxtApp.provide('$sections', $sections)
})
