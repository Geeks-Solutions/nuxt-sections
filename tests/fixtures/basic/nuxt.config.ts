import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['@pinia/nuxt', '../../../src/module'],
  runtimeConfig: {
    public: {
      sections: {
        projectId: 'test-project',
        projectUrl: 'http://localhost:3000',
        environment: 'testing',
        queryStringSupport: 'enabled',
        projectLocales: '',
        wysiwygEditorOptions: {},
        cname: false,
        cssPreset: '',
      },
    },
  },
})
