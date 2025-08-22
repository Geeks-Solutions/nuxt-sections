<template>
  <div>
    <gWysiwyg
      :html="props.html"
      :auth-token="authToken"
      :project-id-prop="sectionsConfig.projectId"
      :sections-user-id="null"
      :server-url="alterMediasServerUrl()"
      :selected-media-id="route.query.id"
      :media-translation-prefix="'mediaComponent.'"
      :alter-error-received="alterErrorReceived"
      :response-received="mediaResponseReceived"
      :request-pre-sent="mediaRequestReceived"
      @wysiwygMedia="(media) => emit('wysiwygMedia', media)"
      @settingsUpdate="(content) => emit('settingsUpdate', content)"
    />
    <span v-if="props.htmlError" :class="props.htmlErrorClass">{{ props.htmlError }}</span>
    <div class="flex flex-col items-start justify-start mt-8">
      <label class="mr-4 font-medium">{{ t("forms.cssClasses") }}</label>
      <span class="text-xs text-Gray_800">{{ t("forms.cssClassesDesc") }}</span>
      <span class="text-xs text-Gray_800 pb-1">{{ t("forms.cssClassesDesc2") }}</span>
      <input
        v-model="cssClasses"
        type="text"
        :placeholder="t('forms.cssClasses')"
        class="cssClassesInput"
        @input="(event) => emit('cssClassesChanged', event.target.value)"
      />
    </div>
  </div>
</template>

<script setup>
import {useI18n, ref, useNuxtApp, useRoute, useCookie, watch, importJs} from '#imports'

// --- Composables ---
const nuxtApp = useNuxtApp()
const sectionsConfig = nuxtApp.$sections;
const route = useRoute();
const { t } = useI18n();
// Use useCookie composable - returns a Ref<string | null | undefined>
const authToken = useCookie('sections-auth-token');

// --- Props ---
const props = defineProps({
  html: {
    type: String,
    default: ""
  },
  cssClassesProp: {
    type: String,
    default: ""
  },
  htmlError: {
    type: String,
    default: ""
  },
  htmlErrorClass: {
    type: String,
    default: "sections-required-field-error"
  }
});

// --- Emits ---
const emit = defineEmits(['wysiwygMedia', 'settingsUpdate', 'cssClassesChanged']);

// --- Refs ---
const cssClasses = ref(props.cssClassesProp);

function alterMediasServerUrl() {
  let updatedServerUrl
  try {
    const hooksJs = importJs(`/js/global-hooks`)
    if (hooksJs && hooksJs['medias_server_url'] && hooksJs['medias_server_url'](useCookie, sectionsConfig.projectId)) {
      updatedServerUrl = hooksJs['medias_server_url'](useCookie, sectionsConfig.projectId)
    }
  } catch {}

  if (updatedServerUrl) {
    return updatedServerUrl
  } else return sectionsConfig.serverUrl
}

function alterErrorReceived(error) {
  try {
    const hooksJs = importJs(`/js/global-hooks`)
    if (hooksJs && hooksJs['medias_api_error_received']) {
      return hooksJs['medias_api_error_received'](useCookie, error)
    }
  } catch {}
}

async function mediaResponseReceived(method, url, payload, response) {
  try {
    const hooksJs = importJs(`/js/global-hooks`)
    if (hooksJs && hooksJs['medias_api_response_received']) {
      return await hooksJs['medias_api_response_received'](useCookie, method, url, payload, response)
    }
  } catch {}
}

async function mediaRequestReceived(method, url, payload) {
  try {
    const hooksJs = importJs(`/js/global-hooks`)
    if (hooksJs && hooksJs['medias_api_request_received']) {
      return await hooksJs['medias_api_request_received'](useCookie, method, url, payload)
    }
  } catch {}
}

// --- Watchers ---
watch(() => props.cssClassesProp, (newValue) => {
  cssClasses.value = newValue;
});

// Optional: Watch the local ref and emit changes if direct v-model on input is not used
// watch(cssClasses, (newValue) => {
//   emit('cssClassesChanged', newValue);
// });

</script>

<style scoped>
/* Add scoped styles if needed, e.g., for cssClassesInput */
.cssClassesInput {
  /* Example styles */
  border: 1px solid #ccc;
  padding: 8px;
  width: 100%;
  margin-top: 4px;
}
</style>
