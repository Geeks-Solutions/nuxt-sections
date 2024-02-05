<template>
  <div v-if="media && media.url" class="media-viewer">
    <div v-if="media.type === 'image'" class="media-viewer-image-wrapper">
      <img :src="media.url" :alt="media.seo_tag ? media.seo_tag : ''" class="media-viewer-image">
    </div>
    <div v-else-if="media.type === 'document'" class="media-viewer-document-wrapper">
      <iframe :src="media.url" :title="media.seo_tag ? media.seo_tag : ''" class="media-viewer-document"></iframe>
    </div>
  </div>
</template>

<script>
export default {
  name: "MediaViewer",
  props: {
    media: {
      type: Object,
      required: true,
    }
  }
}
</script>

<style scoped>

</style>
