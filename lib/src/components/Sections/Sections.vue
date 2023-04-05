<template>
  <SectionsMain
    :admin="admin"
    :pageName="pageName"
    :lang="lang"
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
