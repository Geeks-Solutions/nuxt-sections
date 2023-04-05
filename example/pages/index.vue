<template>
  <Sections
    :admin="admin"
    :page-name="pageName"
    :lang="lang"
    :variations="[]"
  />
</template>

<script>
export default {
  name: 'IndexPage',
  data() {
    return {
      pageName: "Home"
    };
  },
  computed: {
    lang() {
      return this.$i18n.locale.toString()
    },
    admin() {
      // return !!this.$cookies.get("sections-auth-token")
      return false
    }
  }
}
</script>
