<template>
  <teleport to="body">
    <transition name="modal">
      <div v-if="show" class="modal-overlay" @click="handleClose">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h2>Add Content</h2>
            <button class="close-btn" @click="handleClose">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- This is a placeholder - parent component should provide actual content types -->
            <slot>
              <div class="content-types-grid">
                <div
                  v-for="contentType in defaultContentTypes"
                  :key="contentType.name"
                  class="content-type-card"
                  @click="handleContentSelect(contentType)"
                >
                  <div class="content-icon">
                    <component :is="contentType.icon" />
                  </div>
                  <div class="content-info">
                    <h3>{{ contentType.label }}</h3>
                    <p>{{ contentType.description }}</p>
                  </div>
                </div>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  path: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['update:show', 'select'])

// Default content types (these should be provided by parent or config)
const defaultContentTypes = ref([
  {
    name: 'TextImage',
    label: 'Text & Image',
    description: 'Combine text content with an image',
    icon: 'IconTextImage'
  },
  {
    name: 'SimpleCTA',
    label: 'Call to Action',
    description: 'Simple CTA section with button',
    icon: 'IconCTA'
  },
  {
    name: 'Hero',
    label: 'Hero Section',
    description: 'Large hero banner with text and media',
    icon: 'IconHero'
  },
  {
    name: 'Features',
    label: 'Features Grid',
    description: 'Showcase multiple features in a grid',
    icon: 'IconFeatures'
  },
  {
    name: 'Testimonial',
    label: 'Testimonial',
    description: 'Customer testimonial section',
    icon: 'IconTestimonial'
  },
  {
    name: 'Gallery',
    label: 'Image Gallery',
    description: 'Grid or carousel of images',
    icon: 'IconGallery'
  }
])

const handleClose = () => {
  emit('update:show', false)
}

const handleContentSelect = (contentType) => {
  // Create a basic section structure
  const sectionData = {
    name: contentType.name,
    type: 'static',
    settings: [{}],
    status_code: null,
    query_string_keys: null,
    render_data: '',
    linked_to: null,
    private_data: {}
  }

  emit('select', sectionData)
  handleClose()
}

// Simple icon components (you can replace with actual icons)
const IconTextImage = {
  template: `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="4" width="32" height="32" rx="4" stroke="currentColor" stroke-width="2"/>
      <path d="M10 12h12M10 16h8M10 20h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      <rect x="24" y="12" width="8" height="8" rx="1" fill="currentColor" opacity="0.3"/>
    </svg>
  `
}

const IconCTA = {
  template: `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="8" y="14" width="24" height="12" rx="6" stroke="currentColor" stroke-width="2"/>
      <path d="M14 20h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `
}

const IconHero = {
  template: `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="8" width="32" height="24" rx="4" stroke="currentColor" stroke-width="2"/>
      <path d="M12 18h16M14 22h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `
}

const IconFeatures = {
  template: `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="4" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
      <rect x="22" y="4" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
      <rect x="4" y="22" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
      <rect x="22" y="22" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
    </svg>
  `
}

const IconTestimonial = {
  template: `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="14" r="6" stroke="currentColor" stroke-width="2"/>
      <path d="M12 28c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `
}

const IconGallery = {
  template: `
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="4" y="8" width="12" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
      <rect x="20" y="8" width="12" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
      <rect x="4" y="22" width="12" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
      <rect x="20" y="22" width="12" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
    </svg>
  `
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.content-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.content-type-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.content-type-card:hover {
  border-color: #4CAF50;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
  transform: translateY(-2px);
}

.content-icon {
  width: 40px;
  height: 40px;
  margin-bottom: 12px;
  color: #4CAF50;
}

.content-info h3 {
  margin: 0 0 6px 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.content-info p {
  margin: 0;
  font-size: 13px;
  color: #666;
  line-height: 1.4;
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
