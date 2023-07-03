<template>
  <div class="section-module-upload-media-main-container">
    <label class="section-module-upload-media-label">{{ mediaLabel }}</label>
    <div class="section-module-upload-media-sub-container">

      <div class="section-module-upload-media-container-wrapper">
        <div class="section-module-upload-media-white-container" @click="$emit('uploadContainerClicked')">
          <div
            class="section-module-upload-media-container"
          >
            <div>
              <EmptyImage v-if="media.length === 0 || (media.length > 0 && media[0].url === '')"
                          alt="empty"
                          class="section-module-upload-media-image"/>
              <div v-if="media.length > 0 && media[0].url !== ''">
                <img
                  v-if="media.length > 0 && media[0].url !== ''"
                  :src="media[0].url"
                  :alt="media[0].seo_tag"
                  class="section-module-upload-media-image"
                />
              </div>
            </div>
            <div>
              <div>
                <div v-if="media.length > 0 && media[0].seo_tag" class="section-module-upload-media-seo">{{ seoTag + media[0].seo_tag }}</div>
                <div>
                  <span v-if="media.length === 0 || (media.length > 0 && media[0].url === '')" class="section-module-upload-media-upload-text">{{ uploadText }}</span>
                  <span v-else class="section-module-upload-media-upload-text">{{ changeText }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div @click="$emit('removeUploadedImage')">
          <Cross v-if="media.length > 0 && media[0].url !== ''" alt="" class="section-module-upload-media-cross"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EmptyImage from "../../base/icons/EmptyImage.vue";
import Cross from "../../base/icons/cross.vue";

export default {
  name: 'UploadMedia',
  components: {
    Cross,
    EmptyImage
  },
  props: {
    mediaLabel: {
      type: String,
      default: 'Media'
    },
    uploadText: {
      type: String,
      default: 'Upload'
    },
    changeText: {
      type: String,
      default: 'Change'
    },
    seoTag: {
      type: String,
      default: 'SEO tag: '
    },
    media: {
      type: Array,
      default() {
        return []
      }
    }
  }
}
</script>

<style>
.section-module-upload-media-main-container {
  align-items: flex-start;
  flex-direction: column;
  display: flex;
}

.section-module-upload-media-label {
  font-weight: 700;
  margin-right: 1rem;
}

.section-module-upload-media-sub-container {
  display: flex;
  flex-direction: row;
}

.section-module-upload-media-container-wrapper {
  display: flex;
  align-items: center;
}

.section-module-upload-media-white-container {
  margin-right: 0.5rem;
}

.section-module-upload-media-container {
  --tw-shadow: 4px 2px 10px rgba(0, 0, 0, 0.1);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  border-radius: 0.75rem;
  text-align: center;
  padding: 0.5rem;
  --tw-border-opacity: 1;
  border-color: rgba(238, 238, 238, var(--tw-border-opacity));
  border-width: 1px;
  cursor: pointer;
  margin: 0 0 10px 0;
}

.section-module-upload-media-image {
  width: 200px;
  object-fit: contain;
}

.section-module-upload-media-seo {
  font-size: 0.75rem;
  line-height: 1rem;
  padding-top: 0.25rem;
  width: 200px;
}

.section-module-upload-media-upload-text {
  --tw-text-opacity: 1;
  color: rgba(130, 130, 130, var(--tw-text-opacity));
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.section-module-upload-media-loader {
  padding: 0.5rem;
  padding-left: 1rem;
  width: 86px;
}

.section-module-upload-media-cross {
  padding-left: 0.5rem;
  cursor: pointer;
}
</style>
