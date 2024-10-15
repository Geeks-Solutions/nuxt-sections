<template>
  <div v-if="globalSectionMode === true && pages.length > 0">
    <div class="global-sections-reference-section">
      <div class="global-sections-first-row">
        <span>{{ $t('referencedSection1') }}</span>
        <div class="relative">
          <span class="global-sections-pages-link" @click="$emit('showPagesClicked')">
            {{ pages.length }}
          </span>
          <div v-if="showPagesList" class="global-sections-popup">
            <ul>
              <li v-for="(page, index) in pages" :key="`referenced-pages-${index}`">{{ page }}</li>
            </ul>
          </div>
        </div>
        <span>{{ $t('referencedSection1Pages') }}</span>
      </div>
      <div class="global-sections-second-row">
        <span>{{ $t('referencedSection2') }}</span>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: "GlobalReferences",
  props: {
    pages: {
      type: Array,
      default() {
        return []
      },
    },
    globalSectionMode: {
      type: Boolean,
      default: false
    },
    showPagesList: {
      type: Boolean,
      default: false
    }
  }
};
</script>
