import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup/mocks.js'],
    include: ['**/*.test.js', '**/*.test.ts'],
    exclude: [
      '**/node_modules/**',
      '**/.nuxt/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/playground/**',
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
      '#app': fileURLToPath(new URL('./tests/setup/imports.mjs', import.meta.url)),
      '#imports': fileURLToPath(new URL('./tests/setup/imports.mjs', import.meta.url)),
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
})
