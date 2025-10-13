<template>
  <div class="layout-region" :style="{ width: regionWidth }">
    <!-- Region Handle -->
    <LayoutElementsRegionHandle
      :type="isFirst ? 'first-region' : 'region'"
      :path="path"
      class="region-handle"
      @add-layout="$emit('add-layout', $event)"
      @add-content="$emit('add-content', $event)"
      @delete="$emit('delete-region', path)"
    />

    <!-- Sortable sections in this region -->
    <draggable
      :list="region.sections"
      :group="{ name: 'sections', pull: true, put: true }"
      item-key="id"
      class="sections-container-inner"
      :animation="200"
      handle=".section-drag-handle"
      @end="onSectionDragEnd"
    >
      <template #item="{ element: section }">
        <LayoutElementsSectionWrapper
          :section="section"
          :path="region.path"
          :get-component="getComponent"
          :admin="admin"
          :edit-mode="editMode"
          :invalid-sections-errors="invalidSectionsErrors"
          :views-bg-color="viewsBgColor"
          :lang="lang"
          :locales="locales"
          :default-lang="defaultLang"
          :seo-sections-support="seoSectionsSupport"
          @seo-support="(view) => emit('seo-support', view)"
          @refresh-section="(data) => emit('refresh-section', data)"
          @add-layout="$emit('add-layout', $event)"
          @add-content="$emit('add-content', $event)"
        />
      </template>
    </draggable>

    <!-- Sortable nested lines (regions) -->
    <draggable
      v-if="region.regions && region.regions.length > 0"
      :list="region.regions"
      :group="{ name: 'regions', pull: true, put: true }"
      item-key="id"
      class="nested-regions-container"
      :animation="200"
      handle=".drag-handle"
      @end="onRegionDragEnd"
    >
      <template #item="{ element: nestedLine, index: nestedLineIndex }">
        <LayoutElementsLayoutLine
          :line="nestedLine"
          :line-index="nestedLineIndex"
          :get-component="getComponent"
          :admin="admin"
          :edit-mode="editMode"
          :invalid-sections-errors="invalidSectionsErrors"
          :views-bg-color="viewsBgColor"
          :lang="lang"
          :locales="locales"
          :default-lang="defaultLang"
          :seo-sections-support="seoSectionsSupport"
          @seo-support="(view) => emit('seo-support', view)"
          @refresh-section="(data) => emit('refresh-section', data)"
          @add-layout="$emit('add-layout', $event)"
          @add-content="$emit('add-content', $event)"
          @delete-region="$emit('delete-region', $event)"
          @drag-section="$emit('drag-section', $event)"
          @drag-region="$emit('drag-region', $event)"
        />
      </template>
    </draggable>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  region: {
    type: Object,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  isFirst: {
    type: Boolean,
    default: false
  },
  regionCount: {
    type: Number,
    default: 1
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

const emit = defineEmits([
  'add-layout', 'add-content', 'delete-region', 'drag-region', 'drag-section', 'seo-support', 'refresh-section'
])

const regionWidth = computed(() => {
  // Example: equally divide width by regionCount
  if (!props.regionCount) return '100%'
  return (100 / props.regionCount) + '%'
})

function onSectionDragEnd(evt) {
  emit('drag-section', {
    sectionId: evt.item?.__vue__?.section?.id,
    newPath: props.region.path,
    newWeight: evt.newIndex
  })
}

function onRegionDragEnd(evt) {
  emit('drag-region', {
    oldPath: evt.item?.__vue__?.region?.path,
    newPath: props.region.regions[evt.newIndex]?.path
  })
}
</script>

<style scoped>
.layout-region {
  position: relative;
  min-height: 100px;
  border: 1px dashed transparent; /* Invisible border */
  transition: border-color 0.2s;
  border-color: #e0e0e0;
}

.layout-region:hover {
  border-color: #e0e0e0; /* Show border on hover for better UX */
}

.region-handle {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
  opacity: 0;
}

.layout-region:hover .region-handle {
  opacity: 1;
}

.region-content {
  margin-top: 40px; /* Space for region handle */
}

.sections-container-inner {
  min-height: 50px;
  margin-top: 40px;
}

.nested-regions {
  margin-top: 16px;
}

.nested-line {
  margin-bottom: 1px;
}

.nested-regions-container {
  min-height: 80px;
}
</style>
