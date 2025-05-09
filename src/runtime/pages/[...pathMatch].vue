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
defineOptions({
  name: 'DynamicSectionsPage'
})
definePageMeta({
  layout: 'defaults'
})

// Get route and language
const route = useRoute()
const nuxtApp = useNuxtApp()
const pathMatch = Array.isArray(route.params.pathMatch)
  ? route.params.pathMatch.join('/')
  : route.params.pathMatch || ''
const pageName = pathMatch || '/'
const lang = useI18n().locale.value
const admin = !!useCookie('sections-auth-token').value

// Head title
useHead({
  title: pageName
})

// Load sectionsPageData
const { data: sectionsPageData } = await useAsyncData('sectionsPageData', async () => {
  if (import.meta.client && !nuxtApp.isHydrating) {
    return await renderPageData()
  } else return null
}, {
  immediate: true
})

// Optional: Dynamic lifecycle hook imports
const importHooks = (hook, params) => {
  const hooksJs = importJs('/js/hooks')
  if (hooksJs && hooksJs[hook]) {
    return hooksJs[hook](params)
  }
}

// Lifecycle equivalents
onMounted(() => importHooks('mounted'))
onBeforeMount(() => importHooks('created'))
</script>
