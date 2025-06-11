import { defineStore } from 'pinia'

export const useSectionsDataStore = defineStore('sectionsDataStore', {
  state: () => ({
    pageData: null
  }),

  getters: {
    getPageData: (state) => state.pageData
  },

  actions: {
    setPageData(value) {
      this.pageData = value;
    }
  }
})
