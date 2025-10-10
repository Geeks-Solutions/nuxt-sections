<template>
  <div class="selection-modal-wrapper">
    <transition name="modal">
      <div
        v-if="visible"
        class="selection-modal-container-wrapper"
        @click="handleCloseModal"
      >
        <div
          class="modal-container"
          :style="{ top: `${position.y}px`, left: `${position.x}px` }"
          @click.stop
        >
          <div class="modal-header">
            <h2>Select Layout</h2>
            <button class="close-btn" @click="handleCloseModal">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path
                  d="M6 6l8 8M14 6l-8 8"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </div>

          <!-- Tabs -->
          <div class="tabs">
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'content' }"
              @click="activeTab = 'content'"
            >
              Content
            </button>
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'layout' }"
              @click="activeTab = 'layout'"
            >
              Layout
            </button>
          </div>

          <div class="modal-body">
            <!-- Layout Tab -->
            <div v-show="activeTab === 'layout'" class="layout-options">
              <div
                v-for="count in [1, 2, 3, 4, 5]"
                :key="count"
                class="layout-option"
                @click="handleLayoutSelect(count)"
              >
                <div class="layout-preview">
                  <div
                    v-for="i in count"
                    :key="i"
                    class="layout-column"
                    :style="{ width: `${100 / count}%` }"
                  />
                </div>
                <div class="layout-label">
                  {{ count }} {{ count === 1 ? 'Column' : 'Columns' }}
                </div>
              </div>
            </div>

            <!-- Content Tab -->
            <div v-show="activeTab === 'content'" class="content-tab">
              <slot name="sectionTypesContent"/>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import {onBeforeUnmount, ref} from 'vue'

const emit = defineEmits(['select', 'select-content'])

const visible = ref(false)
const position = ref({ x: 0, y: 0 })
const activeTab = ref('layout')

// Public function: open modal at given coordinates
const openSelectionModal = (x, y) => {
  position.value = { x, y: y - 56 }
  visible.value = true
  activeTab.value = 'layout'
}

// Close modal
const handleCloseModal = () => {
  visible.value = false
  activeTab.value = 'layout'
}

const handleLayoutSelect = (regionCount) => {
  emit('select', regionCount)
  handleCloseModal()
}

defineExpose({ openSelectionModal, handleCloseModal }) // allow parent to call modal.open(x,y)
</script>

<style scoped>
.selection-modal-wrapper {
  position: absolute;
  top: 0;
  left: 0;
}

.selection-modal-container-wrapper {
  width: 100vw;
  height: 100vh;
}

.modal-container {
  position: absolute;
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #333;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  padding: 0 24px;
}

.tab-btn {
  padding: 12px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  margin-bottom: -1px;
  border-radius: 0;
  margin: 0;
}

.tab-btn:hover {
  color: #333;
}

.tab-btn.active {
  color: #4CAF50;
  border-bottom-color: #4CAF50;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.layout-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.layout-option {
  cursor: pointer;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
  background: white;
}

.layout-option:hover {
  border-color: #4CAF50;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
  transform: translateY(-2px);
}

.layout-preview {
  display: flex;
  gap: 4px;
  height: 60px;
  margin-bottom: 12px;
  background: #f5f5f5;
  border-radius: 4px;
  padding: 8px;
}

.layout-column {
  background: #4CAF50;
  border-radius: 2px;
  opacity: 0.7;
}

.layout-label {
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: #666;
}

.content-tab {
  min-height: 200px;
}

.empty-message {
  text-align: center;
  color: #999;
  padding: 40px 20px;
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}
</style>
