<template>
  <div class="layout-line">
    <!-- Sortable nested regions/lines -->
    <draggable
      v-if="line && line.items && line.items.length > 0"
      :list="line.items"
      :group="{ name: 'regions', pull: true, put: false }"
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
          :sections-format-errors="sectionsFormatErrors"
          :editable="editable"
          :sections-theme-components="sectionsThemeComponents"
          :page-metadata="pageMetadata"
          @seo-support="(view) => emit('seo-support', view)"
          @refresh-section="(data) => emit('refresh-section', data)"
          @add-layout="emit('add-layout', $event)"
          @add-content="emit('add-content', $event)"
          @delete-region="emit('delete-region', $event)"
          @drag-line="emit('drag-line', $event)"
          @drag-region="emit('drag-region', $event)"
          @drag-section="emit('drag-section', $event)"
          @section-alert="emit('section-alert', $event)"
          @section-edit="emit('section-edit', $event)"
          @section-delete="emit('section-delete', $event)"
          @section-anchor="emit('section-anchor', $event)"
          @section-seo="emit('section-seo', $event)"
          @section-paint-brush="emit('section-paint-brush', $event)"
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

const emit = defineEmits([
  'seo-support',
  'refresh-section',
  'add-layout',
  'add-content',
  'delete-region',
  'drag-line',
  'drag-region',
  'drag-section',
  'section-alert',
  'section-edit',
  'section-delete',
  'section-anchor',
  'section-seo',
  'section-paint-brush'
])

function onRegionDragEnd(evt) {
  const item = evt.item?.__draggable_context?.element
  const path = evt.to?.firstChild?.__draggable_context?.element?.path
  const newPath = `${path.substring(0, path.length - 1)}${evt.newIndex}`
  emit('drag-region', {
    oldPath: item?.path,
    newPath: newPath || props.region.path,
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
