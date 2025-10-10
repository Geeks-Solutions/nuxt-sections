<template>
  <div class="layout-line">
    <draggable
      :list="line.regions"
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
          :path="`${lineIndex}/${regionIndex}`"
          :is-first="regionIndex === 0"
          :region-count="line.regions.length"
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

const emit = defineEmits(['add-layout', 'add-content', 'delete-region', 'drag-region', 'drag-section', 'seo-support', 'refresh-section'])

// Handle region drag end
const onRegionDragEnd = (evt) => {
  const { oldIndex, newIndex } = evt

  if (oldIndex === newIndex) return

  const oldPath = `${props.lineIndex}/${oldIndex}`
  const newPath = `${props.lineIndex}/${newIndex}`

  emit('drag-region', { oldPath, newPath })
}
</script>

<style scoped>
.layout-line {
  margin-bottom: 1px; /* Minimal spacing between lines - invisible to user */
}

.regions-container {
  display: flex;
  gap: 1px; /* Minimal gap between regions - invisible to user */
  min-height: 100px;
}
</style>
