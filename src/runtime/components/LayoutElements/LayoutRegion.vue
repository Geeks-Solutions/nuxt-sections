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

    <!-- Unified sortable items (sections and lines) -->
    <draggable
      :list="region.items"
      :group="{ name: 'region-items', pull: true, put: true }"
      item-key="id"
      class="sections-container-inner"
      :animation="200"
      handle=".section-drag-handle, .line-drag-handle"
      @end="onItemDragEnd"
    >
      <template #item="{ element: item, index }">
        <LayoutElementsLayoutLine
          v-if="item.itemType === 'line'"
          v-bind="getItemProps(item, index)"
          class="nested-regions-container"
          @seo-support="(view) => emit('seo-support', view)"
          @refresh-section="(data) => emit('refresh-section', data)"
          @add-layout="$emit('add-layout', $event)"
          @add-content="$emit('add-content', $event)"
          @delete-region="$emit('delete-region', $event)"
          @drag-section="$emit('drag-section', $event)"
          @drag-region="$emit('drag-region', $event)"
        />
        <LayoutElementsSectionWrapper
          v-else
          v-bind="getItemProps(item, index)"
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
  if (!props.regionCount) return '100%'
  return (100 / props.regionCount) + '%'
})

function getItemProps(item, index) {
  if (item.itemType === 'line') {
    return {
      line: item,
      lineIndex: index,
      getComponent: props.getComponent,
      admin: props.admin,
      editMode: props.editMode,
      invalidSectionsErrors: props.invalidSectionsErrors,
      viewsBgColor: props.viewsBgColor,
      lang: props.lang,
      locales: props.locales,
      defaultLang: props.defaultLang,
      seoSectionsSupport: props.seoSectionsSupport
    }
  } else {
    return {
      section: item,
      path: props.region.path,
      getComponent: props.getComponent,
      admin: props.admin,
      editMode: props.editMode,
      invalidSectionsErrors: props.invalidSectionsErrors,
      viewsBgColor: props.viewsBgColor,
      lang: props.lang,
      locales: props.locales,
      defaultLang: props.defaultLang,
      seoSectionsSupport: props.seoSectionsSupport
    }
  }
  return {}
}

function onItemDragEnd(evt) {
  const item = evt.item?.__vue__?.item
  if (!item) return
  if (item.type === 'section') {
    emit('drag-section', {
      sectionId: item.id,
      newPath: props.region.path,
      newWeight: evt.newIndex
    })
  } else if (item.type === 'line') {
    emit('drag-region', {
      oldPath: item.path,
      newPath: props.region.items[evt.newIndex]?.path
    })
  }
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

.nested-regions-container .layout-region .region-handle {
  opacity: 0;
}

.nested-regions-container .layout-region:hover .region-handle {
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
</style>
