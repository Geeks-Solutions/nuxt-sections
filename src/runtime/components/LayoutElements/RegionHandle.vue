<template>
  <div class="region-handle-wrapper">
    <div class="handle-controls">
      <!-- Plus Icon - Only for first-region and section types -->
      {{ type }}
      {{ props.path }}
      W {{ sectionWeight }}
      <button
        v-if="showPlus"
        class="handle-btn plus-btn"
        @click="handleAdd($event)"
        title="Add content or layout"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>

      <!-- Drag Handle (6 dots) -->
      <button
        v-if="dragSupport"
        class="handle-btn drag-handle"
        :class="{ 'section-drag-handle': type === 'section' }"
        @click="handleDotsClick"
        title="Drag or open menu"
      >
        <svg width="20" height="20" viewBox="0 0 20 20">
          <circle cx="5" cy="5" r="2" fill="#666"/>
          <circle cx="15" cy="5" r="2" fill="#666"/>
          <circle cx="5" cy="10" r="2" fill="#666"/>
          <circle cx="15" cy="10" r="2" fill="#666"/>
          <circle cx="5" cy="15" r="2" fill="#666"/>
          <circle cx="15" cy="15" r="2" fill="#666"/>
        </svg>
      </button>

      <!-- Delete Icon - Only for regions and sections -->
<!--      <button-->
<!--        v-if="type !== 'empty'"-->
<!--        class="handle-btn delete-btn"-->
<!--        @click="handleDelete"-->
<!--        title="Delete"-->
<!--      >-->
<!--        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">-->
<!--          <path d="M3 4h10M6 4V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M5 7v5a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V7M7 7v4M9 7v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>-->
<!--        </svg>-->
<!--      </button>-->
    </div>

    <!-- Dropdown Menu (shown on dots click) -->
    <div v-if="showDropdown" class="dropdown-menu" ref="dropdownRef">
<!--      <div class="dropdown-item" @click="handleSettings">-->
<!--        <span>Settings</span>-->
<!--      </div>-->
<!--      <div class="dropdown-item" @click="handleDuplicate">-->
<!--        <span>Duplicate</span>-->
<!--      </div>-->
<!--      <div v-if="type === 'section'" class="dropdown-item" @click="handleVisibility">-->
<!--        <span>Toggle Visibility</span>-->
<!--      </div>-->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

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
  dragSupport: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['add', 'add-layout', 'add-content', 'delete', 'settings'])

const showDropdown = ref(false)
const dropdownRef = ref(null)

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
    emit('add-layout', { path: props.path, type: props.type, insertAfter: true, event })
  }
}

// Handle dots click (toggle dropdown)
const handleDotsClick = (e) => {
  e.stopPropagation()
  showDropdown.value = !showDropdown.value
}

// Handle delete
const handleDelete = () => {
  if (confirm('Are you sure you want to delete this?')) {
    emit('delete')
  }
}

// Handle settings
const handleSettings = () => {
  showDropdown.value = false
  emit('settings')
}

// Handle duplicate
const handleDuplicate = () => {
  showDropdown.value = false
  console.log('Duplicate clicked')
  // Implement duplication logic
}

// Handle visibility toggle
const handleVisibility = () => {
  showDropdown.value = false
  console.log('Toggle visibility clicked')
  // Implement visibility toggle logic
}

// Close dropdown on outside click
const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
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

.delete-btn:hover {
  color: #f44336;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  z-index: 1000;
}

.dropdown-item {
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;
  color: #333;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-item:first-child {
  border-radius: 6px 6px 0 0;
}

.dropdown-item:last-child {
  border-radius: 0 0 6px 6px;
}
</style>
