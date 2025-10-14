<template>
  <div v-if="!isSideBarOpen" class="region-handle-wrapper" :class="{'layout-handle-menu-active': showDropdown}">
    <div class="handle-controls">
      <!-- Plus Icon - Only for first-region and section types -->
      {{ type }}
      {{ props.path }}
      <button
        v-if="showPlus"
        class="handle-btn plus-btn"
        title="Add content or layout"
        @click="handleAdd($event)"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>

      <div class="relativeSections">
        <LazyBaseHelperComponentsBurgerMenu v-if="dragSupport">
          <template #trigger>
            <!-- Drag Handle (6 dots) -->
            <button
              v-if="dragSupport"
              class="handle-btn drag-handle"
              :class="{ 'section-drag-handle': type === 'section' }"
              title="Drag or open menu"
            >
              <LazyBaseIconsDragHandleDots />
            </button>
          </template>
          <template #content>
            <div v-if="dropDownMenuSupport" ref="handleDropdownRef" @click="showDropdown = false">
              <slot name="dropDownMenu"/>
            </div>
          </template>
        </LazyBaseHelperComponentsBurgerMenu>

        <!-- Dropdown Menu (shown on dots click) -->
<!--        <div v-if="dropDownMenuSupport && showDropdown" ref="handleDropdownRef" class="dropdown-menu" @click="showDropdown = false">-->
<!--          <slot name="dropDownMenu"/>-->
<!--        </div>-->
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {useState} from "#imports";

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['empty', 'first-region', 'region', 'section'].includes(value)
  },
  path: {
    type: String,
    default: null
  },
  sectionId: {
    type: String,
    default: null
  },
  sectionWeight: {
    type: Number,
    default: null
  },
  sectionIdx: {
    type: Number,
    default: null
  },
  dragSupport: {
    type: Boolean,
    default: true
  },
  dropDownMenuSupport: {
    type: Boolean,
    default: false
  }
})

const isSideBarOpen = useState('isSideBarOpen')

const emit = defineEmits(['add', 'add-layout', 'add-content'])

const showDropdown = ref(false)
const handleDropdownRef = ref(null)

// Computed
const showPlus = computed(() => {
  return props.type === 'first-region' || props.type === 'section' || props.type === 'empty'
})

// Handle add (plus button)
const handleAdd = (event) => {
  if (props.type === 'empty') {
    emit('add', {event})
  } else if (props.type === 'first-region') {
    // Show modal with Layout and Content tabs
    emit('add-layout', { path: props.path, type: props.type, insertAfter: true, event })
  } else if (props.type === 'section') {
    // Show modal with Layout and Content tabs
    emit('add-layout', { path: props.path, type: props.type, sectionWeight: props.sectionWeight, insertAfter: true, event })
  }
}
</script>

<style scoped>
.region-handle-wrapper {
  position: absolute;
  display: inline-flex;
  left: 0.25rem;
  top: 0.25rem;
}

.handle-controls {
  display: flex;
  gap: 4px;
  background: white;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  padding: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.handle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  color: #666;
  transition: all 0.2s;
  padding: 0;
  margin: 0;
}

.drag-handle {
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}

.dropdown-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: transparent;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 10px;
  border-radius: 6px;
  z-index: 1000;
}
</style>
