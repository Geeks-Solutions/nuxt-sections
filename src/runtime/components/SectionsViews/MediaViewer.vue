<template>
  <div v-if="props.media && props.media.url" class="media-viewer">
    <!-- Display image -->
    <div v-if="props.media.type === 'image'" class="media-viewer-image-wrapper">
      <img
        :src="props.media.url"
        :alt="props.media.seo_tag || ''"
        class="media-viewer-image"
        loading="lazy"
      >
    </div>
    <!-- Display document -->
    <div v-else-if="props.media.type === 'document'" class="media-viewer-document-wrapper">
      <!-- Preview in iframe if enabled -->
      <iframe
        v-if="props.previewMedia"
        :src="props.media.url"
        :title="props.media.seo_tag || ''"
        class="media-viewer-document-iframe"
      ></iframe>
      <!-- Otherwise, show title and link -->
      <span v-else class="media-viewer-document-link-wrapper"> <!-- Specific class for link -->
        {{ props.media.title ? `${props.media.title} : ` : '' }}
        <a :href="props.media.url" target="_blank" class="media-viewer-document-link">{{ props.media.url }}</a>
      </span>
    </div>
    <!-- Add handling for other media types if necessary -->
    <!-- <div v-else>Unsupported media type: {{ props.media.type }}</div> -->
  </div>
  <div v-else class="media-viewer-empty">
    <!-- Optional: Placeholder when media or media.url is missing -->
    <!-- <p>No media to display.</p> -->
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

// --- Props ---
const props = defineProps({
  media: {
    type: Object,
    required: true, // Keep track that it's required, defineProps handles this by lack of default
    // Add a validator for better type checking in JS if needed
    validator: (value) => {
      return typeof value === 'object' && value !== null && typeof value.url === 'string';
    }
  },
  previewMedia: {
    type: Boolean,
    default: false
  }
});

</script>

<!--// TODO: Check component display after below styles that were automatically generated -->
<style scoped>
.media-viewer {
  /* Add base styles for the viewer container */
  width: 100%;
}

.media-viewer-image-wrapper,
.media-viewer-document-wrapper {
  /* Styles for wrappers */
}

.media-viewer-image {
  /* Styles for the image */
  max-width: 100%;
  height: auto;
  display: block;
}

.media-viewer-document-iframe {
  /* Styles for the iframe */
  width: 100%;
  height: 500px; /* Adjust as needed */
  border: 1px solid #ccc;
}

.media-viewer-document-link-wrapper {
   /* Styles for the link container */
   display: block;
   padding: 10px;
   border: 1px dashed #eee; /* Example style */
}

.media-viewer-document-link {
  /* Styles for the document link */
  color: blue;
  text-decoration: underline;
  word-break: break-all; /* Prevent long URLs from overflowing */
}

.media-viewer-empty {
   /* Styles for when no media is available */
   /* Example: min-height: 100px; border: 1px dashed #ccc; */
}
</style>
