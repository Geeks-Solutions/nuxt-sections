<template>
  <div class="layout-line">
    <!-- Sortable sections in this line -->
<!--    <draggable-->
<!--      :list="line.sections"-->
<!--      :group="{ name: 'sections', pull: true, put: true }"-->
<!--      item-key="id"-->
<!--      class="sections-container"-->
<!--      :animation="200"-->
<!--      handle=".section-drag-handle"-->
<!--      @end="onSectionDragEnd"-->
<!--    >-->
<!--      <template #item="{ element: section }">-->
<!--        <LayoutElementsSectionWrapper-->
<!--          :section="section"-->
<!--          :path="line.path"-->
<!--          :get-component="getComponent"-->
<!--          :admin="admin"-->
<!--          :edit-mode="editMode"-->
<!--          :invalid-sections-errors="invalidSectionsErrors"-->
<!--          :views-bg-color="viewsBgColor"-->
<!--          :lang="lang"-->
<!--          :locales="locales"-->
<!--          :default-lang="defaultLang"-->
<!--          :seo-sections-support="seoSectionsSupport"-->
<!--          @seo-support="(view) => emit('seo-support', view)"-->
<!--          @refresh-section="(data) => emit('refresh-section', data)"-->
<!--          @add-layout="$emit('add-layout', $event)"-->
<!--          @add-content="$emit('add-content', $event)"-->
<!--        />-->
<!--      </template>-->
<!--    </draggable>-->

    <!-- Sortable nested regions/lines -->
    <draggable
      v-if="line && line.items && line.items.length > 0"
      :list="line.items"
      :group="{ name: 'regions', pull: true, put: true }"
      item-key="id"
      class="regions-container"
      :animation="200"
      handle=".drag-handle"
      @end="onRegionDragEnd"
    >
      <template #item="{ element: region, index: regionIndex }">
        <LayoutElementsLayoutRegion
          :region="region"
          :path="region.path"
          :is-first="regionIndex === 0"
          :region-count="line.items.length"
          :get-component="getComponent"
          :admin="admin"
          :edit-mode="editMode"
          :invalid-sections-errors="invalidSectionsErrors"
          :views-bg-color="viewsBgColor"
          :lang="lang"
          :locales="locales"
          :default-lang="defaultLang"
          :seo-sections-support="seoSectionsSupport"
          @seo-support="(view) => $emit('seo-support', view)"
          @refresh-section="(data) => $emit('refresh-section', data)"
          @add-layout="$emit('add-layout', $event)"
          @add-content="$emit('add-content', $event)"
          @delete-region="$emit('delete-region', $event)"
          @drag-section="$emit('drag-section', $event)"
        />
      </template>
    </draggable>
  </div>
</template>

<script setup>
const props = defineProps({
  line: {
    type: Object,
    required: true
  },
  lineIndex: {
    type: Number,
    required: true
  },
  sections: {
    type: Array,
    default: () => []
  },
  admin: {
    type: Boolean,
    default: false,
  },
  editMode: {
    type: Boolean,
    default: false,
  },
  invalidSectionsErrors: {
    type: Object,
    default() {
      return {}
    }
  },
  viewsBgColor: {
    type: String,
    default: "transparent"
  },
  lang: {
    type: String,
    default: "en"
  },
  locales: {
    type: Array,
    default() {
      return []
    }
  },
  defaultLang: {
    type: String,
    default: "en"
  },
  seoSectionsSupport: {
    type: Object,
    default() {
      return {}
    }
  },
  getComponent: {
    type: Function,
    required: true
  }
})

function onSectionDragEnd(evt) {
  // Emit drag-section event with enough context for parent to update
  emit('drag-section', {
    sectionId: evt.item?.__vue__?.section?.id,
    newPath: props.line.path,
    newWeight: evt.newIndex
  })
}

function onRegionDragEnd(evt) {
  // Emit drag-region event with enough context for parent to update
  emit('drag-region', {
    oldPath: evt.item?.__vue__?.region?.path,
    newPath: props.line.regions[evt.newIndex]?.path
  })
}
</script>

<style scoped>
.layout-line {
  margin-bottom: 1px;
  width: 100%;
}
.sections-container {
  display: flex;
  gap: 1px;
}
.regions-container {
  display: flex;
}
</style>
