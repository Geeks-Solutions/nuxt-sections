<template>
  <div
    v-if="htmlContent"
    class="wys-wrapper view-section-component ql-snow"
    :class="htmlContent && htmlContent.length > 2 ? 'mtitle' + htmlContent.charAt(2) : 'mtitle'"
  >
    <!-- Use v-html to render the content. Ensure content is sanitized if necessary -->
    <gWysiwygContent tag="div" :wrapper-classes="`${cssClasses}`" :html-content="htmlContent" />
  </div>
</template>

<script setup>
// Remove types and use js
// Removed TypeScript interfaces and PropType import

// --- Props ---
import { computed } from '#imports'

const props = defineProps({
  section: {
    type: Object, // Removed 'as PropType<Section>'
    default: () => ({}),
  },
  lang: {
    type: String,
    default: 'en',
  },
  // viewStructure prop seems unused in the original script logic, kept for compatibility if needed elsewhere.
  viewStructure: {
    settings: [
      {
        en: 'wysiwyg',
        fr: 'wysiwyg',
      },
    ],
  },
})

// --- Computed Properties ---
const htmlContent = computed(() => {
  // Removed <string> type annotation
  const settings = props.section?.settings
  if (settings) {
    // Case 1: Settings is an array (most common case from the form component)
    if (Array.isArray(settings) && settings.length > 0 && settings[0]?.[props.lang] !== undefined) {
      return settings[0][props.lang]
    }
    // Case 2: Settings is an object with language keys directly (less likely based on form)
    else if (typeof settings === 'object' && !Array.isArray(settings) && settings?.[props.lang]) {
      // Check if it's not the array case missed somehow
      if (settings[props.lang]) {
        return settings[props.lang]
      }
    }
    // Case 3: Settings is just a string (fallback?)
    else if (typeof settings === 'string') {
      return settings
    }
  }
  // Return empty string or a placeholder if no content found
  return '' // Changed from "not found" to empty string for cleaner rendering
})

const cssClasses = computed(() => {
  // Removed <string> type annotation
  const settings = props.section?.settings
  // Check if settings is an array and has the classes property
  if (Array.isArray(settings) && settings.length > 0 && settings[0]?.classes !== undefined) {
    return settings[0].classes
  }
  // Return empty string if no classes found
  return ''
})
</script>

<style scoped>
.wys-wrapper {
  width: 87%;
  margin: 0 auto;
}
.wys-wrapper .title {
  /* This class seems unused in the template */
  max-width: 470px;
}
/* Added style for the v-html wrapper if needed */
.wysiwyg-content-wrapper {
  /* Add any necessary styles for the rendered HTML container */
}

/* Ensure Quill styles are globally available or imported if needed for ql-snow */
/* @import 'quill/dist/quill.snow.css'; */ /* Example if needed */
</style>
