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
import {importJs} from "../utils";

export default {
  name: "DynamicSectionsPage",
  layout: 'defaults',
  data() {
    return {
      pageName: this.$route.params.pathMatch ? this.$route.params.pathMatch : '/'
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
  },
  mounted() {
    this.importHooks('mounted')
  },
  created() {
    this.importHooks('created')
  },
  fetch() {
    this.importHooks('fetch')
  },
  methods: {
    importHooks(hook, params) {
      let hooksJs = importJs(`/js/hooks`)
      if (hooksJs[hook]) {
        return hooksJs[hook](params)
      } else return;
    }
  }
};
</script>
