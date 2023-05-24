<template>
  <div>
    <Sections
      :admin="admin"
      :page-name="pageName"
      :lang="lang"
      :variations="[]"
    />
  </div>
</template>

<script>
export default {
  name: "DynamicSectionsPage",
  layout: 'defaults',
  data() {
    return {
      pageName: this.$route.params.pageName
    }
  },
  head() {
    return {
      title: this.pageName
    }
  },
  computed: {
    lang() {
      return this.$i18n.locale.toString()
    },
    admin() {
      return !!this.$cookies.get("sections-auth-token")
    }
  }
};
</script>
