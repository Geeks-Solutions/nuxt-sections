<template>
  <div>
    <LazyBaseIconsLoading :loading="true"/>
  </div>
</template>

<script setup>
import { useHead, useNuxtApp, useI18n, useRoute, navigateTo } from '#imports'

defineOptions({
  name: 'SectionsAdmin'
})
useHead({
  title: 'Admin'
})

const { locale } = useI18n()
const nuxtApp = useNuxtApp();
const route = useRoute();

let languagePrefix = locale.value
if (route.params.prefix) {
  languagePrefix = route.params.prefix
}

const baseUrl = nuxtApp.$sections.serverUrl
const baseUrlPath = languagePrefix === 'en' ? `/admin/Login` : `/admin/${languagePrefix}/Login`
const finalUrl = `${baseUrl.replace('/api/v1', baseUrlPath)}?sections_redirect=true&project_id=${nuxtApp.$sections.projectId}`
navigateTo(finalUrl, { external: true })
</script>
