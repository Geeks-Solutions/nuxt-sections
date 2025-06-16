import { defineVitestConfig } from '@nuxt/test-utils/config'
import { fileURLToPath } from 'node:url'

export default defineVitestConfig({
  plugins: [],
  test: {
    globals: true,
    environment: 'nuxt',
    setupFiles: ['./tests/setup/mocks.js'],
    server: {
      deps: {
        inline: [/vue-router/]
      }
    },
    testTimeout: 5000
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '@': fileURLToPath(new URL('./', import.meta.url)),
      '#app': fileURLToPath(new URL('./node_modules/nuxt/dist/app', import.meta.url)),
      'vue': 'vue/dist/vue.esm-bundler.js'
    }
  }
})
