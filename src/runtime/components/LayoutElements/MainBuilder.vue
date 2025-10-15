<template>
  <div class="page-builder">
    <!-- Empty state -->
    <div v-if="isEmpty && admin && editMode && !isSideBarOpen" class="empty-state">
      <LayoutElementsLayoutHandle
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
      :sections="line.sections"
      :get-component="getComponent"
      :admin="admin"
      :edit-mode="editMode"
      :invalid-sections-errors="invalidSectionsErrors"
      :views-bg-color="viewsBgColor"
      :lang="lang"
      :locales="locales"
      :default-lang="defaultLang"
      :seo-sections-support="seoSectionsSupport"
      :sections-format-errors="sectionsFormatErrors"
      :editable="editable"
      :sections-theme-components="sectionsThemeComponents"
      :page-metadata="pageMetadata"
      @seo-support="(view) => emit('seo-support', view)"
      @refresh-section="(data) => emit('refresh-section', data)"
      @add-layout="handleAddLayout"
      @add-content="handleAddContent"
      @delete-region="handleDeleteRegion"
      @drag-region="handleDragRegion"
      @drag-section="handleDragSection"
      @section-alert="emit('section-alert', $event)"
      @section-edit="emit('section-edit', $event)"
      @section-delete="emit('section-delete', $event)"
      @section-anchor="emit('section-anchor', $event)"
      @section-seo="emit('section-seo', $event)"
      @section-paint-brush="emit('section-paint-brush', $event)"
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
import {computed, ref, watch} from 'vue'

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
  },
  sectionsFormatErrors: {
    type: Object,
    default() {
      return {}
    }
  },
  editable: {
    type: Function,
    required: true
  },
  sectionsThemeComponents: {
    type: Object,
    default() {
      return {}
    }
  },
  pageMetadata: {
    type: Object,
    default() {
      return {}
    }
  }
})

const emit = defineEmits(['update:pageData', 'seo-support', 'refresh-section', 'section-alert',
  'section-edit',
  'section-delete',
  'section-anchor',
  'section-seo',
  'section-paint-brush'])

// Reactive state
const sections = ref(props.pageData.sections || [])
const layoutSelectionModal = ref(null)
const showLayoutModal = ref(false)
const showContentModal = ref(false)
const modalContext = ref({ path: null, type: null, insertAfter: true })

// Recursive function to build layout tree with sections and nested regions
function buildLayoutTree(sections, pathPrefix = []) {
  // Sections that belong directly to this region (path matches exactly)
  const directSections = sections.filter(section => {
    const pathParts = section.region?.path?.split('/') || []
    if (pathParts.length !== pathPrefix.length) return false
    return pathParts.every((part, idx) => part === String(pathPrefix[idx]))
  })
  // Group sections with longer paths by the next path part
  const groups = {}
  sections.forEach(section => {
    const pathParts = section.region?.path?.split('/') || []
    if (pathParts.length <= pathPrefix.length) return
    // Only consider sections that match the current prefix
    for (let i = 0; i < pathPrefix.length; i++) {
      if (pathParts[i] !== String(pathPrefix[i])) return
    }
    const nextPart = pathParts[pathPrefix.length]
    if (!groups[nextPart]) groups[nextPart] = []
    groups[nextPart].push(section)
  })

  // For each group, build its children recursively as nested lines
  const nestedLines = Object.keys(groups).map(part => {
    const childPath = [...pathPrefix, part]
    const id = `level-${childPath.join('-')}`
    const line = buildLayoutTree(groups[part], childPath)
    return {
      ...line,
      id,
      path: childPath.join('/'),
      itemType: 'line',
      weight: line.items && line.items.length > 0 && typeof line.items[0].weight === 'number' ? line.items[0].weight : 0
    }
  })

  // Merge sections and nested lines, sort by weight
  const items = [...directSections, ...nestedLines]

  return { items, path: pathPrefix.join('/'), id: `level-${pathPrefix.join('-')}` }
}

// Computed: Build layouts from sections' region.path (supports unlimited nesting)
const computedLayouts = computed(() => {
  // The root returns { items }, but we only want the top-level lines for the UI
  const tree = buildLayoutTree(sections.value)
  console.log('Tree:', tree.items)
  // Only return items of type 'line' at the root level (main lines)
  return (tree.items || []).filter(item => item.itemType === 'line')
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

// Generate unique ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Recalculate weights for all regions
const recalculateWeights = () => {
  // Sort sections by their region path (natural sort)
  sections.value.sort((a, b) => {
    const pathA = (a.region?.path || '').split('/').map(num => {
      const parsed = Number.parseInt(num, 10);
      return Number.isNaN(parsed) ? -1 : parsed;
    });
    const pathB = (b.region?.path || '').split('/').map(num => {
      const parsed = Number.parseInt(num, 10);
      return Number.isNaN(parsed) ? -1 : parsed;
    });

    for (let i = 0; i < Math.max(pathA.length, pathB.length); i++) {
      const numA = pathA[i] ?? -1;
      const numB = pathB[i] ?? -1;

      if (numA !== numB) {
        return numA - numB;
      }
    }

    return 0;
  });

  // Update weights based on sorted order
  sections.value.forEach((section, index) => {
    section.weight = index;
  });
}

// Handle empty state add
const handleEmptyAdd = ({event}) => {
  handleAddLayout({ path: '0/0', insertAfter: true, event })
  emitUpdate()
}

const showLayoutSelectionModal = (event) => {
  const sectionsMain = document.querySelector('.sections-main')
  const scrollY = sectionsMain ? sectionsMain.scrollTop : 0
  layoutSelectionModal.value.openSelectionModal(event.clientX + window.scrollX, event.clientY + scrollY) // pass click coords
}

// Handle add layout from region/section handle
const handleAddLayout = ({ path, type, sectionWeight, insertAfter = true, event }) => {
  modalContext.value = { path, type, sectionWeight, insertAfter }
  showLayoutModal.value = true
  showLayoutSelectionModal(event)
}

// Handle add content from region/section handle
const handleAddContent = ({ path }) => {
  modalContext.value = { path, insertAfter: true }
  showContentModal.value = true
}

const computeLayoutPath = (pathSuffix) => {
  if (modalContext.value.path.split('/').length > 2) {
    const parts = modalContext.value.path.split('/')
    parts.splice(-2, 2, ...pathSuffix.split('/')) // Extract the last 2 segments of the path, which is done to support nested regions path
    return parts.join('/')
  } else return pathSuffix
}

// Handle layout selection
const handleLayoutSelect = (regionCount) => {
  // eslint-disable-next-line prefer-const
  let { path, sectionWeight, type } = modalContext.value

  // If adding a nested line under a section
  if (type === 'section' && path) {

    const sectionPath = path
    const clickedSectionIndex = sections.value.findIndex(s => s.region?.path === sectionPath && s.weight === sectionWeight)

    // Find all sections that have region.path === sectionPath or are nested under it
    const relatedSections = sections.value
      .map((s, index) => {
        const sPath = s.region?.path
        if (!sPath) return null

        const parts = sPath.split('/')
        const targetParts = sectionPath.split('/')

        // Check if this is a direct match (section to convert)
        if (sPath === sectionPath) {
          return { section: s, index, type: 'direct', lineIndex: null }
        }

        // Check if this is already a nested line under sectionPath
        if (parts.length === targetParts.length + 2 &&
          parts.slice(0, targetParts.length).join('/') === sectionPath) {
          return {
            section: s,
            index,
            type: 'nested',
            lineIndex: Number.parseInt(parts[targetParts.length])
          }
        }

        return null
      })
      .filter(item => item !== null)

    // Sort by original index to maintain order
    relatedSections.sort((a, b) => a.index - b.index)

    // Find the position where the new line should be inserted
    const clickedItemPosition = relatedSections.findIndex(item => item.index === clickedSectionIndex)
    const insertPosition = clickedItemPosition + 1

    // Assign new line indices based on sorted order
    let currentLineIndex = 0
    relatedSections.forEach((item, idx) => {
      // Insert placeholder for new line at the correct position
      if (idx === insertPosition) {
        currentLineIndex++
      }

      if (item.type === 'direct') {
        // Convert direct match to nested line format
        item.section.region.path = `${sectionPath}/${currentLineIndex}/0`
        currentLineIndex++
      } else if (item.type === 'nested') {
        // Update existing nested line to new index
        const parts = item.section.region.path.split('/')
        parts[sectionPath.split('/').length] = currentLineIndex.toString()
        item.section.region.path = parts.join('/')
        currentLineIndex++
      }
    })

    // Add placeholder sections for the new nested line
    for (let regionIdx = 0; regionIdx < regionCount; regionIdx++) {
      sections.value.push({
        id: generateId(),
        region: { path: `${sectionPath}/${insertPosition}/${regionIdx}` },
        weight: 0,
        type: 'placeholder',
        _isPlaceholder: true
      })
    }

    recalculateWeights()
    emitUpdate()
    showLayoutModal.value = false
    layoutSelectionModal.value?.handleCloseModal()
    return
  }

  let newLineIndex
  let afterLineIndex = null
  // If first-region, insert after the current line
  if (type === 'first-region' && path) {
    const currentLineIndex = Number.parseInt(path.split('/')[path.split('/').length - 2])
    newLineIndex = currentLineIndex + 1
    afterLineIndex = currentLineIndex
  } else {
    // Find the next available line index (at the end)
    const existingLines = sections.value
      .map(s => s.region?.path && Number.parseInt(s.region.path.split('/')[0]))
      .filter(i => !Number.isNaN(i))
    newLineIndex = existingLines.length > 0 ? Math.max(...existingLines) + 1 : 0
  }

  // Shift all sections after newLineIndex up by 1 (if inserting in the middle)
  if (afterLineIndex !== null && path.split('/').length === 2) {
    sections.value.forEach(section => {
      const pathParts = section.region?.path?.split('/')
      if (pathParts && Number.parseInt(pathParts[0]) >= newLineIndex) {
        section.region.path = `${Number.parseInt(pathParts[0]) + 1}/${pathParts[1]}`
      }
    })
  } else if (afterLineIndex !== null && path.split('/').length > 2) {
    sections.value.filter(s => s.region?.path.length === path.length && s.region?.path.split('/').slice(0, -2).join('/') === path.split('/').slice(0, -2).join('/')).forEach(section => {
      const pathParts = section.region?.path?.split('/')
      if (pathParts && Number.parseInt(pathParts[path.split('/').length - 2]) >= newLineIndex) {
        section.region.path = computeLayoutPath(`${Number.parseInt(pathParts[path.split('/').length - 2]) + 1}/${pathParts[path.split('/').length - 1]}`)
      }
    })
  }

  // Add placeholder sections for the new line, which what makes the regions shows as the layout is built based on the region path of the sections
  for (let regionIdx = 0; regionIdx < regionCount; regionIdx++) {
    sections.value.push({
      id: generateId(),
      region: { path: computeLayoutPath(`${newLineIndex}/${regionIdx}`) },
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
  // eslint-disable-next-line prefer-const
  let { path, type, sectionWeight } = modalContext.value

  // If first-region, add content in a new line directly after the current line
  if (type && type === 'first-region') {
    const currentLineIndex = Number.parseInt(path.split('/')[path.split('/').length - 2])
    const newLineIndex = currentLineIndex + 1
    path = computeLayoutPath(`${newLineIndex}/0`)
    // Shift all sections after newLineIndex up by 1
    if (path.split('/').length === 2) {
      sections.value.forEach(section => {
        const pathParts = section.region?.path?.split('/')
        if (pathParts && Number.parseInt(pathParts[0]) >= newLineIndex) {
          section.region.path = `${Number.parseInt(pathParts[0]) + 1}/${pathParts[1]}`
        }
      })
    } else {
      sections.value.filter(s => s.region?.path.length === path.length && s.region?.path.split('/').slice(0, -2).join('/') === path.split('/').slice(0, -2).join('/')).forEach(section => {
        const pathParts = section.region?.path?.split('/')
        if (pathParts && Number.parseInt(pathParts[path.split('/').length - 2]) >= newLineIndex) {
          section.region.path = computeLayoutPath(`${Number.parseInt(pathParts[path.split('/').length - 2]) + 1}/${pathParts[path.split('/').length - 1]}`)
        }
      })
    }
  }

  // Remove placeholder in the target region
  sections.value = sections.value.filter(s => !(s.region?.path === path && s._isPlaceholder))

  // Find the max weight in the target region
  // const maxWeight = Math.max(-1, ...sections.value.filter(s => s.region?.path === path).map(s => s.weight))

  // Create new section
  const newSection = {
    ...sectionData,
    id: generateId(),
    region: { path },
    // weight: maxWeight - 1 // TODO: Check if needed to add a weight, as this might have conflict with the recalculate weight logic
  }

  sections.value.splice(sectionWeight || sectionWeight === 0 ? sectionWeight + 1 : 0, 0, newSection)
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
  // Remove placeholder in the destination region
  let filteredSections = sections.value.filter(s => !(s.region?.path === newPath && s._isPlaceholder))

  // Find the section to move
  const movingSection = filteredSections.find(s => s.id === sectionId)
  if (!movingSection) return
  const oldPath = movingSection.region.path

  // Remove the section from its old position
  filteredSections = filteredSections.filter(s => s.id !== sectionId)

  // Update the section's region.path
  movingSection.region.path = newPath

  // Get all sections in the destination region
  const destSections = filteredSections.filter(s => s.region?.path === newPath)

  // Insert the section at the newWeight position
  destSections.splice(newWeight, 0, movingSection)

  // Build the new sections array, preserving order in all regions
  const newSections = []
  // Add all regions except the destination region
  const regionPaths = [...new Set(filteredSections.map(s => s.region?.path))]
  regionPaths.forEach(path => {
    if (path === newPath) {
      newSections.push(...destSections)
    } else {
      newSections.push(...filteredSections.filter(s => s.region?.path === path))
    }
  })
  // If destination region was empty, just add destSections
  if (!regionPaths.includes(newPath)) {
    newSections.push(...destSections)
  }

  // Recalculate weights for both old and new region
  const affectedPaths = [oldPath, newPath]
  affectedPaths.forEach(path => {
    const regionSections = newSections.filter(s => s.region?.path === path)
    regionSections.forEach((s, idx) => {
      s.weight = idx
    })
  })

  // Replace the sections array to ensure reactivity
  sections.value = [...newSections]
  emitUpdate()
}

defineExpose({ handleContentSelect })
</script>

<style scoped>
.page-builder {
  position: relative;
}
</style>
