<template>
  <div>
    <div class="input mt-8">
      <LazyEditorWysiwyg
        :key="quillKey"
        ref="myQuillEditor"
        class="wyzywig"
        :html="settings[0][selectedLang]"
        :css-classes-prop="settings[0].classes"
        @wysiwygMedia="wysiwygMediaAdded"
        @settingsUpdate="updateContent"
        @cssClassesChanged="(v) => settings[0].classes = v"
      />
      <span v-if="errors.quill === true && selectedLang === 'en'" class="flexSections sections-required-field-error">{{ t('requiredField') }}</span>
      <span v-else-if="errors.quill === true && selectedLang !== 'en'" id="required-fields" class="flexSections sections-required-field-error">{{ t('checkRequiredField') }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, useI18n } from '#imports'

const { t } = useI18n();

// --- Props ---
const props = defineProps({
  locales: {
    type: Array,
    default: () => ['en', 'fr']
  },
  quillKey: {
    type: String,
    default: "quillKey"
  },
  selectedLang: {
    type: String,
    default: 'en'
  },
  // It seems the original component expected settings to potentially be passed differently,
  // but initialized it locally. We'll keep it as internal state for now.
  // initialSettings: { // Optional: If settings need to be passed in
  //   type: [Array, Object, String],
  //   default: null
  // }
});


// Initialize settings based on the original data structure
const settings = ref([
  {
    en: "",
    fr: "",
    classes: ""
  }
]);

const errors = ref({
  quill: false
});

// --- Watchers ---
// Watcher to handle potential external changes or initialization if needed
// This replicates the original watcher's normalization logic, though it might be simplified
// depending on how 'settings' is intended to be managed (passed as prop vs. internal state).
watch(() => settings.value, (newVal) => { // Example if using initialSettings prop
  if (typeof newVal === 'string') {
    settings.value = [{}];
    props.locales.forEach(lang => {
      settings.value[0][lang] = "";
    });
    settings.value[0]['en'] = newVal;
  } else if (newVal && !Array.isArray(newVal)) {
    settings.value = [newVal];
  } else if (Array.isArray(newVal) && newVal.length === 0) {
    settings.value = [{}];
  }
}, { immediate: true, deep: true }); // Run immediately and watch deeply


// --- Methods ---
const updateContent = (content) => {
  // Ensure the language key exists
  if (!settings.value[0][props.selectedLang]) {
     settings.value[0][props.selectedLang] = "";
  }
  settings.value[0][props.selectedLang] = content;
};

const wysiwygMediaAdded = (media) => {
  // This logic seems to add media info alongside the main content object.
  // Ensure this structure is intended.
  settings.value.push({
    wysiwygMedia: media,
    wysiwygLang: props.selectedLang
  });
};

const validate = () => {
  errors.value.quill = false;

  // 1. Clean up unused media references
  if (Array.isArray(settings.value)) {
    for (let i = settings.value.length - 1; i >= 0; i--) { // Iterate backwards when removing items
      const ob = settings.value[i];
      if (ob.wysiwygLang && settings.value[0][ob.wysiwygLang] !== undefined) {
        if (!settings.value[0][ob.wysiwygLang].includes(ob.wysiwygMedia?.url)) {
          settings.value.splice(i, 1);
        }
      }
    }
  }

  // 2. Add alt and loading attributes to images (Client-side only)
  if (process.client && settings.value[0]) {
      try {
        for (const lang of props.locales) {
          if (typeof settings.value[0][lang] === 'string') {
              const parser = new DOMParser();
              const doc = parser.parseFromString(settings.value[0][lang], 'text/html');
              const imgTags = doc.querySelectorAll('img');

              imgTags.forEach(img => {
                  const url = img.getAttribute('src');
                  let seo_tag = "";

                  // Find corresponding media info in settings array
                  const foundM = settings.value.find(m =>
                      m.wysiwygMedia !== undefined && m.wysiwygMedia.url === url && m.wysiwygLang === lang
                  );

                  if (foundM?.wysiwygMedia?.seo_tag) {
                      seo_tag = foundM.wysiwygMedia.seo_tag;
                  }

                  if (!img.hasAttribute('alt') && seo_tag) {
                      img.setAttribute('alt', seo_tag);
                  }
                  if (!img.hasAttribute('loading')) {
                      img.setAttribute('loading', 'lazy');
                  }
              });
              settings.value[0][lang] = doc.body.innerHTML;
          }
        }
      } catch (e) {
          console.error("Error processing HTML content:", e);
          // Handle parsing error if necessary
      }
  }


  // 3. Check if English content exists
  if (!settings.value[0]?.en) {
    errors.value.quill = true;
    return false;
  }

  return true;
};

// --- Expose methods (if needed by parent) ---
// Use defineExpose if the parent component needs to call validate directly
defineExpose({
  validate,
  settings // Expose settings if parent needs direct access (consider emitting updates instead)
});

</script>

<style scoped>
/* Styles remain the same, potentially add 'scoped' if they shouldn't be global */
.ql-save-format:after {
  content: "Save format";
}

.ql-apply-format:after {
  content: "Apply format";
}

.ql-formats button.ql-save-format {
  width: 100px;
  padding: 0 !important;
}

.ql-formats button.ql-apply-format {
  width: 100px;
  padding: 0 !important;
}
</style>
