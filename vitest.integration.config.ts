import { defineVitestConfig } from '@nuxt/test-utils/config'
import { fileURLToPath } from 'node:url'

export default defineVitestConfig({
  test: {
    globals: true,
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        rootDir: fileURLToPath(new URL('./tests/fixtures/basic', import.meta.url)),
      },
    },
    include: [
      'tests/integration/**/*.test.ts',
      'tests/integration/**/*.spec.ts',
      'tests/integration/**/*.test.js',
      'tests/integration/**/*.spec.js',
    ],
    exclude: [
      '**/node_modules/**',
      '**/.nuxt/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/playground/**',
      'tests/unit/**',
      'src/**/*.spec.ts',
    ],
    testTimeout: 20000,
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '@': fileURLToPath(new URL('./', import.meta.url)),
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
})
