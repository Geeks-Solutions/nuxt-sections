<template>
  <!-- Conditionally render based on props -->
  <div v-if="globalSectionMode && pages.length > 0">
    <div class="global-sections-reference-section">
      <div class="global-sections-first-row">
        <span>{{ t('referencedSection1') }}</span>
        <div class="relative">
          <!-- Emit event on click -->
          <span class="global-sections-pages-link" @click="emit('showPagesClicked')">
            {{ pages.length }}
          </span>
          <!-- Show popup based on prop -->
          <div v-if="showPagesList" class="global-sections-popup">
            <ul>
              <li v-for="(page, index) in pages" :key="`referenced-pages-${index}`">{{ page }}</li>
            </ul>
          </div>
        </div>
        <span>{{ t('referencedSection1Pages') }}</span>
      </div>
      <div class="global-sections-second-row">
        <span>{{ t('referencedSection2') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from '#imports'

const { t } = useI18n() // Get translation function

// Props definition
const props = defineProps({
  pages: {
    type: Array,
    default: () => [], // Use factory function for default array
  },
  globalSectionMode: {
    type: Boolean,
    default: false,
  },
  showPagesList: {
    type: Boolean,
    default: false,
  },
})

// Emits definition
const emit = defineEmits(['showPagesClicked'])

// No methods or complex logic needed in script setup for this component
</script>

<!-- Add scoped styles if specific styling is needed for this component -->
<!-- <style scoped> -->
<!-- </style> -->
