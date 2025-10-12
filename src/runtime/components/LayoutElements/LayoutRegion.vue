<template>
  <div
    class="layout-region"
    :style="{ width: regionWidth }"
  >
    <!-- Region Handle - Only for first region or non-first regions -->
    <LayoutElementsRegionHandle
      :type="isFirst ? 'first-region' : 'region'"
      :path="path"
      class="region-handle"
      @add-layout="$emit('add-layout', $event)"
      @add-content="$emit('add-content', $event)"
      @delete="$emit('delete-region', path)"
    />

    <!-- Sections in this region -->
    <div class="region-content">
      <draggable
        :list="sortedSections"
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
            :path="path"
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

      <!-- Nested regions (if any) -->
      <div v-if="region.nested && region.nested.length > 0" class="nested-regions">
        <div
          v-for="(nestedLine, nestedIndex) in region.nested"
          :key="nestedLine.id"
          class="nested-line"
        >
          <draggable
            :list="nestedLine.regions"
            :group="{ name: 'regions', pull: false, put: false }"
            item-key="id"
            class="nested-regions-container"
            :animation="200"
            handle=".drag-handle"
            @end="(evt) => onNestedRegionDragEnd(evt, nestedIndex)"
          >
            <template #item="{ element: nestedRegion, index: nestedRegionIndex }">
              <LayoutElementsLayoutRegion
                :region="nestedRegion"
                :path="`${path}/${nestedIndex}/${nestedRegionIndex}`"
                :is-first="nestedRegionIndex === 0"
                :region-count="nestedLine.regions.length"
                :sections="getSectionsForNestedRegion(`${path}/${nestedIndex}/${nestedRegionIndex}`)"
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
              />
            </template>
          </draggable>
        </div>
      </div>
    </div>
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

const emit = defineEmits(['add-layout', 'add-content', 'delete-region', 'drag-section', 'seo-support', 'refresh-section'])

// Calculate region width
const regionWidth = computed(() => {
  return `${100 / props.regionCount}%`
})

// Sorted sections by weight
const sortedSections = computed(() => {
  return [...props.sections].sort((a, b) => a.weight - b.weight)
})

// Get sections for nested region
const getSectionsForNestedRegion = (nestedPath) => {
  return props.sections.filter(section => {
    if (!section.region?.path) return false
    return section.region.path.startsWith(nestedPath)
  })
}

// Handle section drag end
const onSectionDragEnd = (evt) => {
  const { item, newIndex } = evt
  const sectionId = item.dataset.sectionId

  // Calculate new weight based on position
  let newWeight = newIndex

  // Adjust weights of other sections
  sortedSections.value.forEach((section, index) => {
    if (section.id !== sectionId && index >= newIndex) {
      newWeight = Math.max(newWeight, section.weight + 1)
    }
  })

  emit('drag-section', {
    sectionId,
    newPath: props.path,
    newWeight
  })
}

// Handle nested region drag end
const onNestedRegionDragEnd = (evt, nestedIndex) => {
  const { oldIndex, newIndex } = evt

  if (oldIndex === newIndex) return

  const oldPath = `${props.path}/${nestedIndex}/${oldIndex}`
  const newPath = `${props.path}/${nestedIndex}/${newIndex}`

  emit('drag-region', { oldPath, newPath })
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
}

.nested-regions {
  margin-top: 16px;
}

.nested-line {
  margin-bottom: 1px;
}

.nested-regions-container {
  display: flex;
  gap: 1px;
  min-height: 80px;
}
</style>
