<template>
  <div v-if="media && media.url" class="media-viewer">
    <div v-if="media.type === 'image'" class="media-viewer-image-wrapper">
      <img :src="media.url" :alt="media.seo_tag ? media.seo_tag : ''" class="media-viewer-image">
    </div>
    <div v-else-if="media.type === 'document'" class="media-viewer-document-wrapper">
      <iframe v-if="previewMedia" :src="media.url" :title="media.seo_tag ? media.seo_tag : ''" class="media-viewer-document"></iframe>
      <span v-else class="media-viewer-document">{{ media.title ? media.title + ' : ' : media.title }}<a :href="media.url" target="_blank" class="media-viewer-document-link">{{ media.url }}</a></span>
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
    },
    previewMedia: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>

</style>
