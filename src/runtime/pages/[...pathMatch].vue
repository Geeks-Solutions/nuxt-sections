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
import { useNuxtApp, useRoute, useHead, useCookie, useAsyncData } from '#app'
import {definePageMeta, useI18n, onMounted, onBeforeMount, importJs, renderPageData, computed} from "#imports";


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
const { locale } = useI18n()

const lang = computed({
  get() {
    return locale.value
  },
  set(newLang) {
    locale.value = newLang
  }
})

const admin = computed({
  get() {
    return !!useCookie('sections-auth-token').value
  }
});

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
