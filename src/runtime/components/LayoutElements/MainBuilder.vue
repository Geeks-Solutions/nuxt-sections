<template>
  <div class="page-builder">
    <!-- Empty state -->
    <div v-if="isEmpty && admin && editMode && !isSideBarOpen" class="empty-state">
      <LayoutElementsRegionHandle
        type="empty"
        :drag-support="false"
        @add-layout="handleEmptyAdd"
      />
    </div>

    <!-- Recursive layout rendering -->
    <template v-for="(region, lineIndex) in layoutTree" :key="region.id">
      <LayoutElementsLayoutLine
        :line="region"
        :line-index="lineIndex"
        :sections="region.sections"
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
      >
        <template v-for="(nestedRegion, nestedIndex) in region.regions" :key="nestedRegion.id">
          <LayoutElementsLayoutLine
            :line="nestedRegion"
            :line-index="nestedIndex"
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
            @add-layout="handleAddLayout"
            @add-content="handleAddContent"
            @delete-region="handleDeleteRegion"
            @drag-region="handleDragRegion"
            @drag-section="handleDragSection"
          />
        </template>
      </LayoutElementsLayoutLine>
    </template>

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

// Computed
const isEmpty = computed(() => {
  return sections.value.length === 0
})

// --- Layout Tree Builder ---
function buildLayoutTree(sections) {
  // Build a tree structure from flat sections array
  const tree = []
  const regionMap = {}

  // Sort sections by weight
  const sortedSections = [...sections].sort((a, b) => a.weight - b.weight)

  for (const section of sortedSections) {
    const path = section.region?.path || '0/0'
    const pathParts = path.split('/').map(Number)
    let currentPath = ''
    for (let i = 0; i < pathParts.length; i++) {
      const idx = pathParts[i]
      currentPath = currentPath ? `${currentPath}/${idx}` : `${idx}`
      if (!regionMap[currentPath]) {
        const regionNode = {
          id: currentPath,
          path: currentPath,
          regions: [],
          sections: [],
          parent: null
        }
        regionMap[currentPath] = regionNode
        if (i === 0) {
          tree[idx] = regionNode
        } else {
          const parentPath = pathParts.slice(0, i).join('/')
          const parent = regionMap[parentPath]
          if (parent) {
            parent.regions[idx] = regionNode
            regionNode.parent = parent
          }
        }
      }
    }
    // Add section to the final region
    regionMap[currentPath].sections.push(section)
  }

  // Clean up undefined holes in arrays
  function clean(arr) {
    return arr.filter(Boolean)
  }
  function cleanTree(node) {
    node.regions = clean(node.regions)
    node.sections = clean(node.sections)
    node.regions.forEach(cleanTree)
  }
  clean(tree)
  tree.forEach(cleanTree)
  return clean(tree)
}

const layoutTree = computed(() => buildLayoutTree(sections.value))

// --- Normalization Function ---
function normalizeSections(sections) {
  // Recalculate region.path and weight for all sections based on their position in the tree
  const newSections = []
  function traverse(node, path) {
    // Sort sections by weight
    node.sections.sort((a, b) => a.weight - b.weight)
    node.sections.forEach((section, idx) => {
      section.region = { path }
      section.weight = idx
      newSections.push(section)
    })
    node.regions.forEach((region, idx) => {
      traverse(region, path ? `${path}/${idx}` : `${idx}`)
    })
  }
  layoutTree.value.forEach((region, idx) => {
    traverse(region, `${idx}`)
  })
  // Replace sections array
  sections.value = newSections
}

// Watch for external changes
watch(() => props.pageData, (newData) => {
  sections.value = newData.sections || []
}, { deep: true })

// Emit changes
const emitUpdate = () => {
  emit('update:pageData', {
    ...props.pageData,
    sections: sections.value
  })
}

// Generate unique ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Handle empty state add
const handleEmptyAdd = ({event}) => {
  // Add a new section at the root (first region)
  handleAddLayout({ path: '0/0', insertAfter: true, event })
  normalizeSections(sections)
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

// Handle layout selection (add regions)
const handleLayoutSelect = (regionCount) => {
  const { path, type, insertAfter } = modalContext.value
  if (!path) return
  if (type === 'first-region') {
    // Insert a new line (row) of regions below the current line
    const pathParts = path.split('/')
    const currentLine = Number.parseInt(pathParts[0])
    // Shift all sections in lines after the current line down by 1
    sections.value.forEach(section => {
      if (section.region?.path) {
        const parts = section.region.path.split('/')
        if (Number.parseInt(parts[0]) > currentLine) {
          parts[0] = (Number.parseInt(parts[0]) + 1).toString()
          section.region.path = parts.join('/')
        }
      }
    })
    // Insert the new regions at the new line
    for (let i = 0; i < regionCount; i++) {
      const regionPath = `${currentLine + 1}/${i}`
      sections.value.push({
        id: generateId(),
        name: 'RegionPlaceholder',
        type: 'region',
        region: { path: regionPath },
        weight: 0
      })
    }
    normalizeSections(sections)
    emitUpdate()
    showLayoutModal.value = false
    layoutSelectionModal.value?.handleCloseModal()
    return
  }
  // NEW: Handle adding a layout under a Section
  if (type === 'section') {
    // Find the parent region for this section
    const section = sections.value.find(s => s.region?.path === path)
    if (!section) return
    // The parent region path is the same as the section's region.path
    const parentRegionPath = section.region.path
    // Find all regions that are direct children of this section (nested lines)
    const nestedRegions = sections.value.filter(s => s.region?.path.startsWith(parentRegionPath + '/'))
    // Determine the next line index for nesting
    let maxLineIdx = -1
    nestedRegions.forEach(r => {
      const parts = r.region.path.split('/')
      const lineIdx = Number(parts[parentRegionPath.split('/').length])
      if (lineIdx > maxLineIdx) maxLineIdx = lineIdx
    })
    const newLineIdx = maxLineIdx + 1
    // Add new regions as nested under this section
    for (let i = 0; i < regionCount; i++) {
      const regionPath = `${parentRegionPath}/${newLineIdx}/${i}`
      sections.value.push({
        id: generateId(),
        name: 'RegionPlaceholder',
        type: 'region',
        region: { path: regionPath },
        weight: 0
      })
    }
    normalizeSections(sections)
    emitUpdate()
    showLayoutModal.value = false
    layoutSelectionModal.value?.handleCloseModal()
    return
  }
  // fallback: legacy
  const pathParts = path.split('/').map(Number)
  const parentPath = pathParts.slice(0, -1).join('/')
  const baseIdx = pathParts[pathParts.length - 1]
  const insertIdx = insertAfter ? baseIdx + 1 : baseIdx
  for (let i = 0; i < regionCount; i++) {
    const regionPath = parentPath ? `${parentPath}/${insertIdx + i}` : `${insertIdx + i}`
    sections.value.push({
      id: generateId(),
      name: 'RegionPlaceholder',
      type: 'region',
      region: { path: regionPath },
      weight: 0
    })
  }
  normalizeSections(sections)
  emitUpdate()
  showLayoutModal.value = false
  layoutSelectionModal.value?.handleCloseModal()
}

// Handle content selection
const handleContentSelect = (sectionData) => {
  const { path, type } = modalContext.value
  if (type === 'first-region') {
    // Insert a new line (row) below the current line, with one region, and add the content there
    const pathParts = path.split('/')
    const currentLine = Number.parseInt(pathParts[0])
    // Shift all sections in lines after the current line down by 1
    sections.value.forEach(section => {
      if (section.region?.path) {
        const parts = section.region.path.split('/')
        if (Number.parseInt(parts[0]) > currentLine) {
          parts[0] = (Number.parseInt(parts[0]) + 1).toString()
          section.region.path = parts.join('/')
        }
      }
    })
    // Add the content in a new region in the new line
    const newRegionPath = `${currentLine + 1}/0`
    const newSection = {
      ...sectionData,
      id: generateId(),
      region: { path: newRegionPath },
      weight: 0
    }
    sections.value.push(newSection)
    normalizeSections(sections)
    emitUpdate()
    showContentModal.value = false
    return
  }
  if (type === 'section') {
    // Remove any placeholder in the target region
    sections.value = sections.value.filter(
      s => !(s.region?.path === path && s.name === 'RegionPlaceholder')
    )
    // Add the content to the region where the plus was clicked
    const newSection = {
      ...sectionData,
      id: generateId(),
      region: { path },
      weight: 0
    }
    sections.value.push(newSection)
    normalizeSections(sections)
    emitUpdate()
    showContentModal.value = false
    return
  }
  // fallback: legacy
}

// Handle region deletion
const handleDeleteRegion = (path) => {
  // Remove all sections in this region and its children
  sections.value = sections.value.filter(s => !s.region?.path?.startsWith(path))
  normalizeSections(sections)
  emitUpdate()
}

// Handle region drag
const handleDragRegion = ({ oldPath, newPath }) => {
  // Move all sections within this region to the new path
  sections.value.forEach(section => {
    if (section.region?.path?.startsWith(oldPath)) {
      const relativePath = section.region.path.substring(oldPath.length)
      section.region.path = newPath + relativePath
    }
  })
  normalizeSections(sections)
  emitUpdate()
}

// Handle section drag
const handleDragSection = ({ sectionId, newPath, newWeight }) => {
  const section = sections.value.find(s => s.id === sectionId)
  if (section) {
    section.region.path = newPath
    section.weight = newWeight
  }
  normalizeSections(sections)
  emitUpdate()
}
// Remove legacy helpers getRegionByPath and updatePathsAfterLineInsertion
defineExpose({ handleContentSelect })
</script>

<style scoped>
.page-builder {
  position: relative;
}
</style>
