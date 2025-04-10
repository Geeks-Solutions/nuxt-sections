<template>
  <div>
    <Sections
      :admin="admin"
      :page-name="pageName"
      :lang="lang"
      :variations="[]"
      :sections-page-data="{}"
    />
  </div>
</template>

<script setup>
// import { useRoute, useCookie, useAsyncData, useHead } from '#imports'
// import { importJs, renderPageData } from '~/utils'
// import Sections from '~/components/Sections.vue'

defineOptions({
  name: 'DynamicSectionsPage'
})
definePageMeta({
  layout: 'defaults'
})

// Get route and language
const route = useRoute()
const pageName = route.params.pathMatch || '/'
const lang = useNuxtApp().$i18n.locale.toString()
const admin = !!useCookie('sections-auth-token').value

// Head title
useHead({
  title: pageName
})
//
// // Load sectionsPageData
// const { data: sectionsPageData } = await useAsyncData('sectionsPageData', async () => {
//   if (process.client) {
//     return await renderPageData(useNuxtApp())
//   }
//   return null
// })
//
// // Optional: Dynamic lifecycle hook imports
// const importHooks = (hook, params) => {
//   const hooksJs = importJs('/js/hooks')
//   if (hooksJs[hook]) {
//     return hooksJs[hook](params)
//   }
// }
//
// // Lifecycle equivalents
// onMounted(() => importHooks('mounted'))
// onBeforeMount(() => importHooks('created'))
// onBeforeMount(() => importHooks('fetch')) // Nuxt 3 doesn’t use `fetch` the same way, so call it early
</script>
