export default defineNuxtConfig({
  // devServer: {
  //   https: {},
  //   host: '0.0.0.0',
  //   port: 443,
  // },
  modules: ['../src/module', "@nuxtjs/i18n", "@nuxtjs/tailwindcss"],
  i18n: {
    strategy: "prefix_and_default",
    detectBrowserLanguage: false,
    defaultLocale: "en",
    locales: [
      {
        name: "French",
        code: "fr",
        iso: "fr",
        file: "fr.js"
      },
      {
        name: "English",
        code: "en",
        iso: "en",
        file: "en.js"
      }
    ],
    lazy: true,
    langDir: "lang/"
  },
  tailwindcss: {

  },
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
      },
      SIGNATURE_PACKAGES: process.env.NUXT_ENV_SIGNATURE_PACKAGES
    }
  },
  imports: {
    autoImport: false
  }
})
