<template>
  <SectionsMain
    :admin="admin"
    :pageName="pageName"
    :lang="lang"
    :variations="variations"
    :viewsBgColor="viewsBgColor"
    :_sections-options="_sectionsOptions"
    :sections-page-data="sectionsPageData"
    @load="loaded"
  />
</template>

<script>
// import "../assets/scss/variables.scss"
import SectionsMain from "./index.vue"

export default {
  name: "Sections",
  props: {
    pageName: {
      type: String,
      default: "",
    },
    lang: {
      type: String,
      default: "en",
    },
    admin: {
      type: Boolean,
      default: false,
    },
    variations: {
      type: Array,
      default: () => [],
    },
    viewsBgColor: {
      type: String,
      default: "transparent",
    },
    _sectionsOptions: {
      type: Object
    },
    sectionsPageData: {
      type: Object
    }
  },
  components: {
    SectionsMain,
  },
  methods: {
    loaded(e) {
      this.$emit('finishLoad', e)
    },
  },
}
</script>
