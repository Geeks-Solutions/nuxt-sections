<template>
  <div
    class="section-wrapper"
    :data-section-id="section.id"
  >
    <!-- Section Handle -->
    <RegionHandle
      type="section"
      :path="path"
      :section-id="section.id"
      class="section-handle"
      @add-layout="$emit('add-layout', { path: getInsertPath(), insertAfter: true })"
      @add-content="$emit('add-content', { path: getInsertPath() })"
      @settings="handleSettings"
    />

    <!-- Actual Section Component -->
    <div class="section-content">
      <section
        :id="(view.linked_to !== '' && view.linked_to !== undefined) ? `${view.linked_to}-${view.id}` : `${view.name}-${view.id}`"
        :key="view.id"
        :section-id="view.id"
        :class="{ [view.name]: true, 'view-in-edit-mode': editMode }"
      >
        <div class="section-view relativeSections">
<!--          <div-->
<!--            class="controls flexSections sections-flex-row sections-justify-center sections-p-1 rounded-xl sections-top-0 sections-right-2 sections-absolute hide-mobile"-->
<!--            v-if="admin && editMode && sectionOptions[view.id] && sectionOptions[view.id] === true && view.altered !== true"-->
<!--          >-->
<!--            <div v-if="sectionsFormatErrors[view.weight] || (view.error && view.status_code !== 404)"-->
<!--                 @click="isErrorsFormatModalOpen = true; displayedErrorFormat = sectionsFormatErrors[view.weight] ? sectionsFormatErrors[view.weight] : view.error">-->
<!--              <LazyBaseIconsAlert/>-->
<!--            </div>-->
<!--            <div-->
<!--              @click="toggleSectionsOptions(view.id); edit(currentViews.find(vw => vw.id === view.id), view.linked_to !== '' && view.linked_to !== undefined ? `#${view.linked_to}-${view.id}` : `#${view.name}-${view.id}`)"-->
<!--              v-if="editable(view.type) || (view.linked_to !== '' && view.linked_to !== undefined)">-->
<!--              <LazyBaseIconsEdit :color="(view.linked_to !== '' && view.linked_to !== undefined) ? '#FF0000' : undefined"-->
<!--                                 class="edit-icon"/>-->
<!--            </div>-->
<!--            <LazyBaseIconsDrag class="drag-icon handle"/>-->
<!--            <div-->
<!--              @click="isDeleteSectionModalOpen = true; deletedSectionId = view.id; deletedSectionName = view.name;">-->
<!--              <LazyBaseIconsTrash class="trash-icon"/>-->
<!--            </div>-->
<!--            <div-->
<!--              @click="copyAnchor((view.linked_to !== '' && view.linked_to !== undefined) ? `#${view.linked_to}-${view.id}` : `#${view.name}-${view.id}`, $event)">-->
<!--              <LazyBaseIconsAnchor-->
<!--                :title="(view.linked_to !== '' && view.linked_to !== undefined) ? `Anchor id: #${view.linked_to}-${view.id}, ${$t('clickToCopy')}` : `Anchor id: #${view.name}-${view.id}, ${$t('clickToCopy')}`"-->
<!--                class="edit-icon"/>-->
<!--            </div>-->
<!--            <div-->
<!--              v-if="seoSectionsSupport[view.name]"-->
<!--              @click="seoBtnClicked(view.id)">-->
<!--              <div :title="pageMetadata.seo && pageMetadata.seo[view.id] === true ? $t('seoDisable') : $t('seoEnable')" class="seo-btn" :class="{'enabled': pageMetadata.seo && pageMetadata.seo[view.id] === true}">SEO</div>-->
<!--            </div>-->
<!--            <div-->
<!--              v-if="sectionsThemeComponents[view.name] && !view.id.startsWith('id-')"-->
<!--              @click="toggleSectionsOptions(view.id); openSectionThemeModal(currentViews.find(vw => vw.id === view.id), sectionsThemeComponents[view.name])">-->
<!--              <LazyBaseIconsPaintBursh />-->
<!--            </div>-->
<!--          </div>-->
<!--          <div v-if="admin && editMode && view.altered !== true && !isSideBarOpen" :title="(view.linked_to !== '' && view.linked_to !== undefined) ? `${view.linked_to} (${view.id})` : `${view.name} (${view.id})`" @click="toggleSectionsOptions(view.id)"-->
<!--               class="controls optionsSettings sections-flex-row sections-justify-center sections-p-1 rounded-xl sections-top-0 sections-right-2 sections-absolute settings-icon-wrapper sections-cursor-pointer" :class="{'flexSections': !isSideBarOpen}">-->
<!--            <LazyBaseIconsSettings :color="'currentColor'" class="settings-icon"/>-->
<!--          </div>-->
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
import RegionHandle from './RegionHandle.vue'

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
  }
})

const view = computed(() => {
  return props.section
})

const emit = defineEmits([
  'add-layout',
  'add-content',
  'refresh-section',
  'seo-support'
])

// Get insert path for new content below this section
const getInsertPath = () => {
  // When adding content/layout after this section, we use the same path
  // The weight will determine the order
  return props.path
}

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
  margin-bottom: 16px;
  padding: 12px;
  border: 1px dashed transparent;
  transition: border-color 0.2s;
}

.section-wrapper:hover {
  border-color: #e0e0e0;
}

.section-handle {
  position: absolute;
  top: 50%;
  left: -40px;
  transform: translateY(-50%);
  z-index: 10;
}

.section-content {
  min-height: 50px;
}
</style>
