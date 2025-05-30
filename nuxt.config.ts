// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/eslint", "@nuxt/test-utils", "@nuxtjs/i18n"],
  imports: {
    autoImport: false
  },
  nitro: {
    compressPublicAssets: {
      gzip: true,
      brotli: true
    },
  }
})
