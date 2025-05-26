<template>
  <div>
    <gWysiwyg
      :html="props.html"
      :auth-token="authToken"
      :project-id-prop="sectionsConfig.projectId"
      :sections-user-id="null"
      :server-url="sectionsConfig.serverUrl"
      :selected-media-id="route.query.id"
      :media-translation-prefix="'mediaComponent.'"
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
import { useI18n, ref, useNuxtApp, useRoute, useCookie ,watch } from '#imports'

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
