<template>
  <div class="page-builder">
    <!-- Empty state -->
    <div v-if="isEmpty && admin && editMode" class="empty-state">
      <LayoutElementsRegionHandle
        type="empty"
        :drag-support="false"
        @add="handleEmptyAdd"
      />
    </div>

    <!-- Layout lines -->
    <LayoutElementsLayoutLine
      v-for="(line, lineIndex) in layouts"
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
      v-model:show="showLayoutModal"
      :path="modalContext.path"
      @select="handleLayoutSelect"
    />

    <!-- Content Selection Modal -->
    <LayoutElementsContentSelectionModal
      v-model:show="showContentModal"
      :path="modalContext.path"
      @select="handleContentSelect"
    />
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
const layouts = ref(props.pageData.metadata?.layouts || [])
const sections = ref(props.pageData.sections || [])
const showLayoutModal = ref(false)
const showContentModal = ref(false)
const modalContext = ref({ path: null, insertAfter: true })

// Computed
const isEmpty = computed(() => {
  return layouts.value.length === 0 && sections.value.length === 0
})

// Watch for external changes
watch(() => props.pageData, (newData) => {
  layouts.value = newData.metadata?.layouts || []
  sections.value = newData.sections || []
}, { deep: true })

// Emit changes
const emitUpdate = () => {
  emit('update:pageData', {
    ...props.pageData,
    metadata: {
      ...props.pageData.metadata,
      layouts: layouts.value
    },
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
  })
}

// Generate unique ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Recalculate weights based on current order
const recalculateWeights = () => {
  sections.value.forEach((section, index) => {
    section.weight = index
  })
}

// Handle empty state add
const handleEmptyAdd = () => {
  // showContentModal.value = true
  // modalContext.value = { path: '0/0', insertAfter: false }
  handleAddLayout({ path: '0/0', insertAfter: true })
  // Create initial layout if doesn't exist
  // if (layouts.value.length === 0) {
  //   layouts.value.push({
  //     id: generateId(),
  //     regions: [{ id: generateId() }]
  //   })
  // }
}

// Handle add layout from region/section handle
const handleAddLayout = ({ path, insertAfter = true }) => {
  if (showLayoutModal.value === true) {
    showLayoutModal.value = false
  } else {
    modalContext.value = { path, insertAfter }
    showLayoutModal.value = true
  }
}

// Handle add content from region/section handle
const handleAddContent = ({ path }) => {
  modalContext.value = { path, insertAfter: true }
  showContentModal.value = true
}

// Handle layout selection
const handleLayoutSelect = (regionCount) => {
  const { path, insertAfter } = modalContext.value

  if (!path) return

  const pathParts = path.split('/')
  console.log('pathParts', pathParts)
  const lineIndex = Number.parseInt(pathParts[0])
  console.log('lineIndex', lineIndex)
  console.log('insertAfter', insertAfter)
  // Create new layout line
  const newLine = {
    id: generateId(),
    regions: Array.from({ length: regionCount }, () => ({ id: generateId() }))
  }

  if (pathParts.length === 2) {
    // Adding at line level
    const insertIndex = insertAfter ? lineIndex + 1 : lineIndex
    layouts.value.splice(insertIndex, 0, newLine)

    // Update paths for sections after insertion
    updatePathsAfterLineInsertion(insertIndex)
  } else {
    // Adding nested layout within a region
    const regionIndex = Number.parseInt(pathParts[1])
    const parentRegion = getRegionByPath(path)

    if (parentRegion) {
      if (!parentRegion.nested) {
        parentRegion.nested = []
      }
      parentRegion.nested.push(newLine)
    }
  }

  emitUpdate()
  showLayoutModal.value = false
}

// Handle content selection
const handleContentSelect = (sectionData) => {
  const { path } = modalContext.value

  // Create new section
  const newSection = {
    ...sectionData,
    id: generateId(),
    region: { path },
    weight: sections.value.length
  }

  sections.value.push(newSection)
  recalculateWeights()
  emitUpdate()
  showContentModal.value = false
}

// Handle region deletion
const handleDeleteRegion = (path) => {
  const pathParts = path.split('/')
  const lineIndex = parseInt(pathParts[0])

  if (pathParts.length === 2) {
    // Deleting a region from a line
    const regionIndex = parseInt(pathParts[1])
    const line = layouts.value[lineIndex]

    if (line.regions.length === 1) {
      // If last region, delete entire line
      layouts.value.splice(lineIndex, 1)
      updatePathsAfterLineInsertion(lineIndex)
    } else {
      line.regions.splice(regionIndex, 1)
    }

    // Remove sections in this region
    sections.value = sections.value.filter(s =>
      !s.region?.path?.startsWith(path + '/')
    )
  } else {
    // Deleting nested region
    const parentPath = pathParts.slice(0, -1).join('/')
    const parentRegion = getRegionByPath(parentPath)
    const nestedIndex = parseInt(pathParts[pathParts.length - 1])

    if (parentRegion?.nested) {
      parentRegion.nested.splice(nestedIndex, 1)
      if (parentRegion.nested.length === 0) {
        delete parentRegion.nested
      }
    }

    // Remove sections in this nested region
    sections.value = sections.value.filter(s =>
      !s.region?.path?.startsWith(path + '/')
    )
  }

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
  if (section) {
    section.region.path = newPath
    section.weight = newWeight
  }

  recalculateWeights()
  emitUpdate()
}

// Helper: Get region by path
const getRegionByPath = (path) => {
  const pathParts = path.split('/')
  const lineIndex = parseInt(pathParts[0])
  const line = layouts.value[lineIndex]

  if (!line) return null

  let current = line.regions[parseInt(pathParts[1])]

  for (let i = 2; i < pathParts.length; i++) {
    if (!current?.nested) return null
    current = current.nested[parseInt(pathParts[i])]
  }

  return current
}

// Helper: Update paths after line insertion/deletion
const updatePathsAfterLineInsertion = (fromIndex) => {
  sections.value.forEach(section => {
    if (section.region?.path) {
      const pathParts = section.region.path.split('/')
      const lineIndex = parseInt(pathParts[0])

      if (lineIndex >= fromIndex) {
        pathParts[0] = (lineIndex + 1).toString()
        section.region.path = pathParts.join('/')
      }
    }
  })
}
</script>

<style scoped>
.page-builder {
  position: relative;
}
</style>
