<template>
  <component :is="wrapperTag">
    <Sections
      :admin="admin"
      :page-name="pageName"
      :lang="lang"
      :variations="[]"
      :sections-page-data="sectionsPageData"
    />
  </component>
</template>

<script>
import {importJs, renderPageData} from "../utils";

export default {
  name: "DynamicSectionsPage",
  layout: 'defaults',
  data() {
    return {
      pageName: this.$route.params.pathMatch ? this.$route.params.pathMatch : '/',
      sectionsPageData: null,
      wrapperTag: "div"
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
  async asyncData({ app }) {
    if (process.client) {
      return { sectionsPageData: await renderPageData(app) }
    }
  },
  mounted() {
    this.importHooks('mounted')
  },
  created() {
    this.importHooks('created')
    const inBrowser = typeof window !== 'undefined';
    let websiteDomain = ""
    if (inBrowser) {
      websiteDomain = window.location.host
    } else {
      websiteDomain = this.$nuxt.context.req.headers.host
    }
    let hooksJs = importJs(`/js/global-hooks`)
    let ssrDisabledJs = hooksJs['ssr_disabled']
    if (ssrDisabledJs) {
      if (ssrDisabledJs({ pageName: this.pageName, route: this.$route, url: websiteDomain, headers: this.$nuxt.context && this.$nuxt.context.req ? this.$nuxt.context.req.headers : {}, reqBody: this.$nuxt.context && this.$nuxt.context.req ? this.$nuxt.context.req.body : {} }) === true) {
        this.wrapperTag = "client-only"
      }
    }
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
