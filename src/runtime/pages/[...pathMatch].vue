<template>
  <div>
    <Sections
      :admin="admin"
      :page-name="pageName"
      :lang="lang"
      :variations="[]"
      :sections-page-data="sectionsPageData"
    />
  </div>
</template>

<script setup>
import { useRoute } from '#app'
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
const pathMatch = Array.isArray(route.params.pathMatch)
  ? route.params.pathMatch.join('/')
  : route.params.pathMatch || ''
const pageName = pathMatch || '/'
// const lang = useNuxtApp().$i18n.locale.value.toString()
const lang = 'en'
const admin = !!useCookie('sections-auth-token').value

// Head title
useHead({
  title: pageName
})

// Load sectionsPageData
const { sectionsPageData } = await useAsyncData('sectionsPageData', async () => {
  console.log("GOT HERE")
  if (import.meta.client) {
    return await renderPageData({app: useNuxtApp()})
  } else return null
}, {
  watch: [() => route.fullPath],
  immediate: false
})

// Optional: Dynamic lifecycle hook imports
const importHooks = (hook, params) => {
  const hooksJs = importJs('/js/hooks')
  if (hooksJs[hook]) {
    return hooksJs[hook](params)
  }
}

// Lifecycle equivalents
onMounted(() => importHooks('mounted'))
onBeforeMount(() => importHooks('created'))
onBeforeMount(() => importHooks('fetch')) // Nuxt 3 doesn’t use `fetch` the same way, so call it early
</script>
