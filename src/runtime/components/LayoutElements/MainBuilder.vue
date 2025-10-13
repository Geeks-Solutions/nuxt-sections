<template>
  <div class="page-builder">
    <!-- Empty state -->
    <div v-if="isEmpty && admin && editMode && !isSideBarOpen" class="empty-state">
      <LayoutElementsRegionHandle
        type="empty"
        :drag-support="false"
        @add="handleEmptyAdd"
      />
    </div>

    <!-- Layout lines -->
    <LayoutElementsLayoutLine
      v-for="(line, lineIndex) in computedLayouts"
      :key="line.id"
      :line="line"
      :line-index="lineIndex"
      :sections="getSectionsForLine(lineIndex)"
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
      @add-layout="handleAddLayout"
      @add-content="handleAddContent"
      @delete-region="handleDeleteRegion"
      @drag-region="handleDragRegion"
      @drag-section="handleDragSection"
    />

    <!-- Layout Selection Modal -->
    <LayoutElementsLayoutSelectionModal
      v-if="admin && editMode && !isSideBarOpen"
      ref="layoutSelectionModal"
      @select="handleLayoutSelect"
    >
      <template #sectionTypesContent>
        <slot name="sectionTypesContent"/>
      </template>
    </LayoutElementsLayoutSelectionModal>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  pageData: {
    type: Object,
    required: true
  },
  admin: {
    type: Boolean,
    default: false,
  },
  editMode: {
    type: Boolean,
    default: false,
  },
  isSideBarOpen: {
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

const emit = defineEmits(['update:pageData', 'seo-support', 'refresh-section'])

// Reactive state
const sections = ref(props.pageData.sections || [])
const layoutSelectionModal = ref(null)
const showLayoutModal = ref(false)
const showContentModal = ref(false)
const modalContext = ref({ path: null, type: null, insertAfter: true })

// Computed: Build layouts from sections' region.path
const computedLayouts = computed(() => {
  // Group sections by line index (first part of region.path)
  const lines = {}
  sections.value.forEach(section => {
    if (!section.region?.path) return
    const pathParts = section.region.path.split('/')
    const lineIndex = parseInt(pathParts[0])
    if (!lines[lineIndex]) lines[lineIndex] = { id: `line-${lineIndex}`, regions: {} }
    const regionIndex = parseInt(pathParts[1])
    if (!lines[lineIndex].regions[regionIndex]) lines[lineIndex].regions[regionIndex] = { id: `region-${lineIndex}-${regionIndex}` }
    // Nested regions not handled here for simplicity
  })
  // Convert to array and sort by line index
  return Object.keys(lines).sort((a, b) => a - b).map(lineIndex => {
    const line = lines[lineIndex]
    // Convert regions to array and sort by region index
    line.regions = Object.keys(line.regions).sort((a, b) => a - b).map(regionIndex => line.regions[regionIndex])
    return line
  })
})

// Computed
const isEmpty = computed(() => {
  return computedLayouts.value.length === 0 && sections.value.length === 0
})

// Watch for external changes
watch(() => props.pageData.sections, (newSections) => {
  sections.value = newSections || []
}, { deep: true })

// Emit changes
const emitUpdate = () => {
  emit('update:pageData', {
    ...props.pageData,
    sections: sections.value
  })
}

// Get sections for a specific line
const getSectionsForLine = (lineIndex) => {
  return sections.value.filter(section => {
    if (!section.region?.path) {
      // Legacy sections without path - show in first line if it exists
      return lineIndex === 0
    }
    return section.region.path.startsWith(`${lineIndex}/`)
  }).sort((a, b) => a.weight - b.weight)
}

// Generate unique ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Recalculate weights for all regions
const recalculateWeights = () => {
  // Group by region.path
  const regionGroups = {}
  sections.value.forEach(section => {
    const regionPath = section.region?.path
    if (!regionGroups[regionPath]) regionGroups[regionPath] = []
    regionGroups[regionPath].push(section)
  })
  Object.values(regionGroups).forEach(group => {
    group.sort((a, b) => a.weight - b.weight)
    group.forEach((section, idx) => {
      section.weight = idx
    })
  })
}

// Handle empty state add
const handleEmptyAdd = ({event}) => {
  handleAddLayout({ path: '0/0', insertAfter: true, event })
  emitUpdate()
}

const showLayoutSelectionModal = (event) => {
  layoutSelectionModal.value.openSelectionModal(event.clientX, event.clientY) // pass click coords
}

// Handle add layout from region/section handle
const handleAddLayout = ({ path, type, insertAfter = true, event }) => {
  modalContext.value = { path, type, insertAfter }
  showLayoutModal.value = true
  showLayoutSelectionModal(event)
}

// Handle add content from region/section handle
const handleAddContent = ({ path }) => {
  modalContext.value = { path, insertAfter: true }
  showContentModal.value = true
}

// Handle layout selection
const handleLayoutSelect = (regionCount) => {
  let insertLineIndex
  let afterLineIndex = null
  // If first-region, insert after the current line
  if (modalContext.value.type === 'first-region' && modalContext.value.path) {
    const currentLineIndex = parseInt(modalContext.value.path.split('/')[0])
    insertLineIndex = currentLineIndex + 1
    afterLineIndex = currentLineIndex
  } else {
    // Find the next available line index (at the end)
    const existingLines = sections.value
      .map(s => s.region?.path && parseInt(s.region.path.split('/')[0]))
      .filter(i => !isNaN(i))
    insertLineIndex = existingLines.length > 0 ? Math.max(...existingLines) + 1 : 0
  }

  // Shift all sections after insertLineIndex up by 1 (if inserting in the middle)
  if (afterLineIndex !== null) {
    sections.value.forEach(section => {
      const pathParts = section.region?.path?.split('/')
      if (pathParts && parseInt(pathParts[0]) >= insertLineIndex) {
        section.region.path = `${parseInt(pathParts[0]) + 1}/${pathParts[1]}`
      }
    })
  }

  // Add placeholder sections for the new line
  for (let regionIdx = 0; regionIdx < regionCount; regionIdx++) {
    sections.value.push({
      id: generateId(),
      region: { path: `${insertLineIndex}/${regionIdx}` },
      weight: 0,
      type: 'placeholder',
      _isPlaceholder: true
    })
  }
  recalculateWeights()
  emitUpdate()
  showLayoutModal.value = false
  layoutSelectionModal.value?.handleCloseModal()
}

// Handle content selection
const handleContentSelect = (sectionData) => {
  let { path, type } = modalContext.value

  // If first-region, add content in a new line directly after the current line
  if (type && type === 'first-region') {
    const currentLineIndex = parseInt(path.split('/')[0])
    const newLineIndex = currentLineIndex + 1
    path = `${newLineIndex}/0`
    // Shift all sections after newLineIndex up by 1
    sections.value.forEach(section => {
      const pathParts = section.region?.path?.split('/')
      if (pathParts && parseInt(pathParts[0]) >= newLineIndex) {
        section.region.path = `${parseInt(pathParts[0]) + 1}/${pathParts[1]}`
      }
    })
  }

  // Remove placeholder in the target region
  sections.value = sections.value.filter(s => !(s.region?.path === path && s._isPlaceholder))

  // Find the max weight in the target region
  const maxWeight = Math.max(-1, ...sections.value.filter(s => s.region?.path === path).map(s => s.weight))

  // Create new section
  const newSection = {
    ...sectionData,
    id: generateId(),
    region: { path },
    weight: maxWeight + 1
  }

  sections.value.push(newSection)
  recalculateWeights()
  emitUpdate()
  showContentModal.value = false
}

// Handle region deletion
const handleDeleteRegion = (path) => {
  // Remove all sections in this region and its subregions
  sections.value = sections.value.filter(s => !s.region?.path?.startsWith(path))
  recalculateWeights()
  emitUpdate()
}

// Handle region drag
const handleDragRegion = ({ oldPath, newPath }) => {
  // Update all sections within this region
  sections.value.forEach(section => {
    if (section.region?.path?.startsWith(oldPath)) {
      const relativePath = section.region.path.substring(oldPath.length)
      section.region.path = newPath + relativePath
    }
  })
  recalculateWeights()
  emitUpdate()
}

// Handle section drag
const handleDragSection = ({ sectionId, newPath, newWeight }) => {
  const section = sections.value.find(s => s.id === sectionId)
  if (!section) return
  const oldPath = section.region.path
  section.region.path = newPath
  section.weight = newWeight

  // Remove placeholder in the destination region
  sections.value = sections.value.filter(s => !(s.region?.path === newPath && s._isPlaceholder))

  // Recalculate weights for both old and new region
  const affectedPaths = [oldPath, newPath]
  affectedPaths.forEach(path => {
    const regionSections = sections.value.filter(s => s.region?.path === path)
    regionSections.sort((a, b) => a.weight - b.weight)
    regionSections.forEach((s, idx) => {
      s.weight = idx
    })
  })
  emitUpdate()
}

defineExpose({ handleContentSelect })
</script>

<style scoped>
.page-builder {
  position: relative;
}
</style>
