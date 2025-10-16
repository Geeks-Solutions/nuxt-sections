<template>
  <div
    class="section-wrapper section-view"
    :data-section-id="section.id"
    :class="{'hide-placeholder-section': section._isPlaceholder && sectionDraggingState}"
  >
    <!-- Section Handle -->
    <LayoutElementsLayoutHandle
      type="section"
      :path="path"
      :section-id="section.id"
      :section-weight="section.weight"
      :section-idx="sectionIdx"
      :drag-support="!section._isPlaceholder"
      :drop-down-menu-support="true"
      class="section-handle"
      :style="`z-index: ${900 - section.weight}`"
      @add-layout="$emit('add-layout', { path, type: $event.type, sectionWeight: $event.sectionWeight, event: $event.event, sectionIndex })"
      @add-content="$emit('add-content', { path, type: $event.type, sectionWeight: $event.sectionWeight, event: $event.event, sectionIndex })"
    >
      <template #dropDownMenu>
        <div
          class="controls flexSections sections-flex-row sections-justify-center sections-p-1 rounded-xl hide-mobile"
          v-if="admin && editMode && view.altered !== true"
        >
          <!-- Alert icon -->
          <button
            v-if="sectionsFormatErrors[view.weight] || (view.error && view.status_code !== 404)"
            class="hp-button"
            @click="emit('section-alert', view)"
          >
            <LazyBaseIconsAlert/>
          </button>

          <!-- Edit icon + label -->
          <button
            v-if="editable(view.type) || (view.linked_to !== '' && view.linked_to !== undefined)"
            class="hp-button"
            @click="emit('section-edit', view)"
          >
            <LazyBaseIconsEdit
              :color="(view.linked_to !== '' && view.linked_to !== undefined) ? '#FF0000' : '#FFFFFF'"
              class="edit-icon"
            />
            <span class="sections-pl-2 sections-no-wrap">{{ $t('sections.updateContent') }}</span>
          </button>

          <!-- Delete icon + label -->
          <button
            class="hp-button"
            @click="emit('section-delete', view)"
          >
            <LazyBaseIconsTrash :color="'#FFFFFF'" class="trash-icon"/>
            <span class="sections-pl-2 sections-no-wrap">{{ $t('sections.deleteContent') }}</span>
          </button>

          <!-- Anchor icon -->
          <button
            class="hp-button"
            @click="emit('section-anchor', view)"
          >
            <LazyBaseIconsAnchor
              :title="(view.linked_to !== '' && view.linked_to !== undefined)
                ? `Anchor id: #${view.linked_to}-${view.id}, ${$t('clickToCopy')}`
                : `Anchor id: #${view.name}-${view.id}, ${$t('clickToCopy')}`"
              :color="'#FFFFFF'"
              class="edit-icon"
            />
          </button>

          <!-- SEO button -->
          <div
            v-if="seoSectionsSupport[view.name]"
            @click="emit('section-seo', view)"
          >
            <div
              :title="pageMetadata.seo && pageMetadata.seo[view.id] === true ? $t('seoDisable') : $t('seoEnable')"
              class="seo-btn"
              :class="{'enabled': pageMetadata.seo && pageMetadata.seo[view.id] === true}"
            >
              SEO
            </div>
          </div>

          <!-- Brush icon + label -->
          <button
            v-if="sectionsThemeComponents[view.name] && !view.id.startsWith('id-')"
            class="hp-button"
            @click="emit('section-paint-brush', view)"
          >
            <LazyBaseIconsPaintBursh :color="'#FFFFFF'" />
            <span class="sections-pl-2 sections-no-wrap">{{ $t('sections.styleContent') }}</span>
          </button>
        </div>
      </template>
    </LayoutElementsLayoutHandle>

    <!-- Actual Section Component -->
    <div class="section-content">
      <section
        :id="(view.linked_to !== '' && view.linked_to !== undefined) ? `${view.linked_to}-${view.id}` : `${view.name}-${view.id}`"
        :key="view.id"
        :section-id="view.id"
        :class="{ [view.name]: true, 'view-in-edit-mode': editMode }"
      >
        <div class="section-view relativeSections">
          <div
            class="view-component"
            :class="admin && editMode && invalidSectionsErrors[`${view.name}-${view.weight}`] && invalidSectionsErrors[view.name].error && invalidSectionsErrors[`${view.name}-${view.weight}`].weight === view.weight ? 'invalidSection' : ''"
            :style="{ background: viewsBgColor }"
          >
            <div
              v-if="admin && editMode && invalidSectionsErrors[`${view.name}-${view.weight}`] && invalidSectionsErrors[`${view.name}-${view.weight}`].error && invalidSectionsErrors[`${view.name}-${view.weight}`].weight === view.weight"
              class="error-section-loaded">
              {{ $t('invalidSectionsError') + invalidSectionsErrors[`${view.name}-${view.weight}`].error }}
            </div>
            <div
              v-else-if="admin && editMode && (view.error && view.status_code !== 404)"
              class="error-section-loaded error-section-empty"
            />
            <component
              :is="getComponent(view.name, view.type, view)"
              v-if="view.settings || view.type === 'local' || view.type === 'dynamic'"
              :section="view"
              :lang="lang"
              :locales="locales"
              :default-lang="defaultLang"
              @seo-support="emit('seo-support', view)"
              @refresh-section="(data) => emit('refresh-section', { view, data })"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {useState} from "#imports";

const props = defineProps({
  section: {
    type: Object,
    required: true
  },
  path: {
    type: String,
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
  },
  sectionIdx: {
    type: Number,
    default: null
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

const sectionDraggingState = useState('sectionDraggingState')

const view = computed(() => {
  return props.section
})

const emit = defineEmits([
  'add-layout',
  'add-content',
  'refresh-section',
  'seo-support',
  'section-alert',
  'section-edit',
  'section-delete',
  'section-anchor',
  'section-seo',
  'section-paint-brush',
])

const sectionIndex = computed(() => {
  // Find this section's index in the parent region
  const parentSections = (props.section.region && props.section.region.path === props.path) ? [props.section] : []
  // fallback: let parent region pass the index as a prop if needed
  return parentSections.length ? 0 : undefined
})

// Handle settings click
const handleSettings = () => {
  // Emit event to open settings dropdown
  // You'll implement this dropdown separately
  console.log('Open settings for section:', props.section.id)
}
</script>

<style scoped>
.section-wrapper {
  position: relative;
  border: 1px dashed transparent;
  transition: border-color 0.2s;
}

.section-wrapper:hover {
  border-color: #e0e0e0;
}

.section-handle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.section-handle:not(.layout-handle-menu-active) {
  opacity: 0;
}

.section-wrapper:hover .section-handle {
  opacity: 1;
}

.section-content {
  min-height: 50px;
}

.section-wrapper.section-view.hide-placeholder-section {
  display: none;
}
</style>
