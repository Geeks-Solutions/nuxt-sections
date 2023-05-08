const { resolve } = require('path')

module.exports = {
  rootDir: resolve(__dirname, '..'),
  buildDir: resolve(__dirname, '.nuxt'),
  srcDir: __dirname,
  css: [
    '@/assets/css/main.css'
  ],
  buildModules: [
    '@nuxtjs/tailwindcss'
  ],
  modules: [
    [
      require('../'), {projectId: '60352afc1a9d7f0006327a38', projectUrl: 'http://localhost:3000', environment: 'testing', queryStringSupport: '' },
      'cookie-universal-nuxt',
      '@nuxtjs/axios',
      [
        "@nuxtjs/i18n",
        {
          lazy: true,
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
          loadLanguagesAsync: true,
          langDir: "lang/",
          defaultLocale: "en",
          vueI18n: {
            silentTranslationWarn: true,
            silentFallbackWarn: true
          }
        }
      ],
      ["vue-toastification/nuxt", {
        transition: "Vue-Toastification__fade",
        maxToasts: 20,
        newestOnTop: true
      }]
    ]
  ]
}
