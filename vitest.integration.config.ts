import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    include: ['tests/integration/**/*.test.ts', 'tests/integration/**/*.spec.ts'],
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
    server: {
      deps: {
        inline: [/vue-router/],
      },
    },
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./', import.meta.url)),
      '@': fileURLToPath(new URL('./', import.meta.url)),
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
})
