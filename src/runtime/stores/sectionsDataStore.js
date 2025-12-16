import { defineStore } from 'pinia'

export const useSectionsDataStore = defineStore('sectionsDataStore', {
  state: () => ({
    pageData: null,
    defaultLocale: 'en',
  }),

  getters: {
    getPageData: (state) => state.pageData,
    getDefaultLocale: (state) => state.defaultLocale,
  },

  actions: {
    setPageData(value) {
      this.pageData = value
    },
    setDefaultLocale(value) {
      this.defaultLocale = value
    },
  },
})
