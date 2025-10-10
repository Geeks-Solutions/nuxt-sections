<template>
  <div
    class="layout-region"
    :style="{ width: regionWidth }"
  >
    <!-- Region Handle - Only for first region or non-first regions -->
    <LayoutElementsRegionHandle
      :type="isFirst ? 'first-region' : 'region'"
      :path="path"
      :region-count="regionCount"
      class="region-handle"
      @add-layout="$emit('add-layout', $event)"
      @add-content="$emit('add-content', $event)"
      @add-line-below="$emit('add-line-below', $event)"
      @add-content-or-nested-layout="$emit('add-content-or-nested-layout', $event)"
      @delete="$emit('delete-region', path)"
    />

    <!-- Sections and nested lines in this region -->
    <div class="region-content">
      <template v-for="(section, sectionIdx) in sortedSections" :key="section.id">
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
        <!-- Render nested line after this section if it exists -->
        <div v-if="nestedLines[sectionIdx]" class="nested-line">
          <div class="nested-line-inner">
            <LayoutElementsLayoutRegion
              v-for="(nestedRegion, nestedIndex) in nestedLines[sectionIdx]"
              :key="nestedRegion.id"
              :region="nestedRegion"
              :path="nestedRegion.path"
              :is-first="nestedIndex === 0"
              :region-count="nestedLines[sectionIdx].length"
              :sections="nestedRegion.sections"
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
          </div>
        </div>
      </template>
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
  return [...props.region.sections].sort((a, b) => a.weight - b.weight)
})

// Handle section drag end
const onSectionDragEnd = (evt) => {
  const { oldIndex, newIndex } = evt
  if (oldIndex === newIndex) return
  const section = sortedSections.value[oldIndex]
  emit('drag-section', {
    sectionId: section.id,
    newPath: props.path,
    newWeight: newIndex
  })
}

// Group nested regions by line index, keyed by section index
const nestedLines = computed(() => {
  if (!props.region.regions || !props.region.regions.length) return {}
  const lines = {}
  props.region.regions.forEach(region => {
    // The line index is the first segment after the parent path
    const parentDepth = props.path.split('/').length
    const regionParts = region.path.split('/')
    const lineIdx = Number(regionParts[parentDepth]) || 0
    if (!lines[lineIdx]) lines[lineIdx] = []
    lines[lineIdx].push(region)
  })
  // Sort each line's regions by their region index
  Object.keys(lines).forEach(idx => {
    lines[idx].sort((a, b) => {
      const aIdx = Number(a.path.split('/').pop())
      const bIdx = Number(b.path.split('/').pop())
      return aIdx - bIdx
    })
  })
  return lines
})
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

.nested-regions {
  display: flex;
  flex-direction: row;
  gap: 1px;
  width: 100%;
}
.nested-line {
  width: 100%;
  margin-bottom: 1px;
}
.nested-line-inner {
  display: flex;
  flex-direction: row;
  gap: 1px;
  width: 100%;
}
</style>
