export default defineNuxtConfig({
  modules: ['../src/module', "@nuxtjs/i18n"],
  i18n: {
    strategy: "no_prefix",
    detectBrowserLanguage: false
  },
  // myModule: {},
  devtools: { enabled: true },
  compatibilityDate: '2025-04-08',
  runtimeConfig: {
    public: {
      sections: {
        projectId: process.env.NUXT_ENV_SECTIONS_PROJECT_ID,
        projectUrl: process.env.NUXT_ENV_SECTIONS_PROJECT_URL,
        environment: process.env.NUXT_ENV_SECTIONS_ENV,
        queryStringSupport: process.env.NUXT_ENV_SECTIONS_QUERY_STRING_SUPPORT,
        // projectLocales: process.env.NUXT_ENV_SECTIONS_LOCALES ?? 'en,fr',
        cname: process.env.NUXT_ENV_SECTIONS_CNAME
      }
    }
  }
})
