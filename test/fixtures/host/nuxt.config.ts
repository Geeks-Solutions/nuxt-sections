import { defineNuxtConfig } from 'nuxt/config'
import SectionsModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [SectionsModule],
  imports: { autoImport: true },

  // Si besoin selon ton build
  build: {
    transpile: ['../../../src'],
  },
})
