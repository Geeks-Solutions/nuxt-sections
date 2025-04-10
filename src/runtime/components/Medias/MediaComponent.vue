<template>
  <div v-if="isOpen" class="section-module-modal-overlay" @click="handleOverlayClick">
    <div class="section-module-modal">
      <div class="section-module-modal-close-icon" @click="isOpen = false">
        <CloseIcon />
      </div>
      <div class="section-module-modal-content">
        <div>
          <gMedia :components-prefix="'g'" :show-create-media-button="true" :media-category="mediaCategory" :media-translation-prefix="'mediaComponent.'" :media-uri-prop="mediasUri" :authors-uri-prop="authorsUri" :project-id-prop="projectId" :auth-token="$cookies.get('sections-auth-token')" :media-by-id-uri-prop="mediaByIdUri" :media-id-prop="selectedMediaId" :sections-user-id-prop="sectionsUserId" :with-select-media-button="true" :nuxt-sections="true" :media-id-editing="mediaIdEditing" @getSelectedMedia="emitMedia" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CloseIcon from "~/src/runtime/components/base/icons/close.vue";

export default {
  name: "Medias",
  components: { CloseIcon },
  props: {
    sectionsUserId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      projectId: this.$sections.projectId,
      authorsUri: '',
      mediasUri: '',
      mediaByIdUri: '',
      selectedMediaId: this.$route.query.id,
      loading: false,
      isOpen: false,
      mediaIdEditing: '',
      mediaCategory: ''
    }
  },
  created() {
    this.authorsUri = `${this.$sections.serverUrl}/project/${this.projectId}/users`
    this.mediasUri = `${this.$sections.serverUrl}/project/${this.projectId}/medias`
    this.mediaByIdUri = `${this.$sections.serverUrl}/project/${this.projectId}/media/`
  },
  methods: {
    emitMedia(media) {
      this.$emit('emittedMedia', media)
    },
    openModal(mediaId, category) {
      if (mediaId && mediaId !== '') {
        this.mediaIdEditing = mediaId
      } else {
        this.mediaIdEditing = null
      }
      this.mediaCategory = category
      this.isOpen = true;
    },
    closeModal() {
      this.isOpen = false;
    },
    handleOverlayClick(event) {
      if (event.target.classList.contains('section-module-modal-overlay')) {
        this.isOpen = false;
      }
    }
  }
}
</script>

<style>
.text-ellipsis {
  text-overflow: ellipsis !important;
}
.section-module-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.section-module-modal {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px 4px 4px 4px;
  height: 98%;
  width: 96%;
  max-width: 96%;
  max-height: 98%;
  overflow-y: auto;
  position: relative;
}

.section-module-modal-content {
  margin: 10px;
  text-align: start;
}

.section-module-modal-close-icon {
  position: fixed;
  top: 20px;
  right: 60px;
  height: 20px;
  width: 20px;
  margin: 4px;
  cursor: pointer;
  z-index: 1;
}

.section-module-modal-close-icon svg {
  color: #31a9db;
}

/* Scrollbar Styles */
.section-module-modal::-webkit-scrollbar {
  width: 6px;
  background-color: transparent;
  border-radius: 12px;
}

.section-module-modal::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
}

.section-module-modal::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.5);
}

.section-module-modal::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>
