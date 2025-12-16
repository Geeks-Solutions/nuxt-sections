import { defineVitestConfig } from '@nuxt/test-utils/config'
import { fileURLToPath } from 'node:url'

export default defineVitestConfig({
  plugins: [],
  test: {
    globals: true,
    environment: 'happy-dom', // Using happy-dom instead of nuxt to avoid plugin loading
    setupFiles: ['./tests/setup/mocks.js'],
    exclude: [
      '**/node_modules/**',
      '**/.nuxt/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        '**/node_modules/**',
        '**/.nuxt/**',
        '**/dist/**',
        '**/tests/**',
        '**/*.test.js',
        '**/*.test.ts',
        '**/playground/**',
        '**/coverage/**',
        '**/*.config.*',
        '**/mocks.js',
      ],
      include: ['src/**/*.{js,ts,vue}'],
      all: true,
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    server: {
      deps: {
        inline: [/vue-router/],
      },
    },
    testTimeout: 5000,
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '@': fileURLToPath(new URL('./', import.meta.url)),
      '#app': fileURLToPath(new URL('./node_modules/nuxt/dist/app', import.meta.url)),
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
})
