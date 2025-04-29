<template>
  <div class="container text-center sub-types" :class="{'containerWidth': !isSideBarOpen}">
    <div class="flex d-inline-flex w-full justify-center ml-2 md:ml-0">
      <div>
        <div
          class="px-2 h-45px flex justify-center items-center rounded-tl-lg"
          :class="currentTab === 'config' ? 'active-tab' : 'inactive-tab border border-Blue'"
          style="border-top-left-radius: 10px 10px; cursor: pointer;"
          @click="currentTab = 'config'"
        >
          <div
            class="font-light mt-2 mb-2"
            :class="currentTab === 'config' ? 'text-white' : 'inactive-text'"
          >
            <!-- Access nested props.props -->
            <div class="text-capitalize ">{{ props.props.linked_to ? formatTexts(formatName(props.props.linked_to, '/')) : formatTexts(formatName(props.props.name, " / ")) }}</div>
          </div>
        </div>
      </div>
      <!-- Custom form tab -->
      <div v-if="showCustomFormTab"
        class="px-2 h-45px flex justify-center items-center rounded-br-lg"
        :class="currentTab === 'custom' ? 'active-tab' : 'inactive-tab border border-Blue'"
        style="border-bottom-right-radius: 10px 10px; cursor: pointer;"
        @click="currentTab = 'custom'"
      >
        <div
          class="font-light mt-2 mb-2"
          :class="currentTab === 'custom' ? 'text-white' : 'inactive-text'"
        >
          {{ t('Custom form') }}
        </div>
      </div>
    </div>

    <!-- Config Tab Content -->
    <div v-show="currentTab === 'config'">
      <div class="error-message">
        {{ errorMessage }}
      </div>
      <div class="form-group">
        <form>
          <div
            class="flex flex-col justify-between"
            :class="{'content-wrapper': !isSideBarOpen}"
          >
            <!-- Global Section Specific Fields -->
            <div v-if="globalSectionMode">
              <div class="autoInsertRow">
                <div>
                  {{ t('autoInsertInstance') }}
                </div>
                <input v-model="autoInsert" type="checkbox" class="autoInsertInput" />
              </div>
              <div v-if="!props.linked_to" class="autoInsertRow">
                <input
                  class="py-4 pl-6 border rounded-xl border-FieldGray h-48px instanceInput my-2 focus:outline-none"
                  type="text"
                  :placeholder="t('instanceName')+'*'"
                  :disabled="!!props.props.linked_to"
                  v-model="instanceName"
                />
              </div>
              <span v-if="instanceNameError" class="pagesReference mb-2">{{ t('instanceNameRequired') }}</span>
            </div>
            <LazyBaseSubTypesGlobalReferences :global-section-mode="globalSectionMode" :show-pages-list="showPagesList" :pages="pages" @showPagesClicked="showPagesList = !showPagesList" />

            <!-- Translation Component -->
            <LazyTranslationsTranslationComponent v-if="translationComponentSupport" :locales="locales" :default-lang="defaultLang" @setFormLang="updateLocale"/>

            <!-- Dynamic Fields -->
            <div
              v-for="(field, idx) in props.props.fields"
              :key="idx"
              :class="getType(field.type) !== 'file' ? '' : ''"
            >
              <!-- Registered Custom Component -->
              <div v-if="registeredComponents[field.type + '_' + field.key]" class="element d-inline-block">
                 <component
                    :is="registeredComponents[field.type + '_' + field.key]"
                    :reference="sectionsConfigurableType"
                    :options="options"
                    :options-data="optionsData"
                    :field="field"
                    :custom-form-data="customFormData"
                    :sections-user-id="sectionsUserId"
                    :ref="el => fieldRefs[field.type + '-' + field.key] = el"
                    :locales="locales"
                    :selectedLang="formLang"
                    :default-lang="defaultLang"
                    :option-values="optionValues"
                 />
              </div>
              <!-- Unsupported Field Type -->
              <div v-else-if="!getType(field.type)" class="element w-full unsupportedFieldType">
                {{ t('unsupportedFieldType', { name: `"${field.type}_${field.key}"`, type: `"${field.type}"`}) }}
              </div>
              <!-- Standard Field Types -->
              <div v-else class="element d-inline-block">
                <div
                  v-if="field.name && field.type !== 'hidden'"
                  class="text-capitalize text-left"
                >
                  {{ changeFieldLabel(field) }}
                </div>
                <!-- WYSIWYG Editor -->
                <div v-if="field.type === 'wysiwyg'">
                  <div class="input">
                     <LazyEditorWysiwyg
                        :ref="el => fieldRefs[field.type + 'Editor'] = el"
                        class="wyzywig"
                        :html="computedWysiwygValue(field)"
                        @settingsUpdate="(content) => onEditorChange(content, idx, field.key)"
                     />
                  </div>
                </div>
                <!-- Textarea -->
                <div v-else-if="field.type === 'textarea'" class="w-full">
                  <textarea
                    v-model="optionsData[field.key][formLang]"
                    class="d-input py-4 pl-6 border rounded-xl border-FieldGray text-area-field w-full focus:outline-none"
                    :name="field.name"
                    :placeholder="changeFieldLabel(field)"
                    @change="changeFieldValue($event, idx, field.type, field.key)"
                  />
                </div>
                <!-- String/Textfield Input -->
                <div v-else-if="stringType(field.key)" class="w-full">
                   <input
                      v-model="optionsData[field.key][formLang]"
                      class="d-input pl-6 border rounded-xl border-FieldGray h-48px w-full focus:outline-none"
                      :name="field.name"
                      :placeholder="changeFieldLabel(field)"
                      @change="changeFieldValue($event, idx, field.type, field.key)"
                   />
                </div>
                <!-- Other Input Types (Media, Integer, Select etc.) -->
                <div v-else class="w-full justify-start">
                  <!-- Media Preview -->
                  <div v-if="field.type === 'media' && optionsData[field.key] && optionsData[field.key].length > 0 && optionsData[field.key][0].url" class="py-4 flex align-items-center">
                    <img
                      :src="optionsData[field.key][0].url"
                      alt="image"
                      class="w-95px h-63px object-contain"
                    />
                    <div class="cursor-pointer pl-2" @click="removeImage(field.key)">
                      <LazyBaseIconsClose />
                    </div>
                  </div>
                  <div v-else-if="field.type === 'media' && previewMedia" class="py-4 flex align-items-center">
                    <img
                      :src="previewMedia"
                      alt="image"
                      class="w-95px h-63px object-contain"
                    />
                    <div class="cursor-pointer pl-2" @click="removeImage(field.key)">
                      <LazyBaseIconsClose />
                    </div>
                  </div>
                  <!-- Media Upload Progress -->
                  <div v-else-if="field.type === 'media' && isInProgress" class="loadingCircle pl-4 p-2">
                    <LazyBaseIconsLoadingCircle />
                  </div>
                  <!-- Integer Multiple Options -->
                  <div v-else-if="field.type === 'integer' && optionValues.field === field.name && optionValues.option_values">
                    <div class="selectMultipleOptions">
                      <div v-for="option in optionValues.option_values" :key="option.id" class="multiple-options-wrapper">
                        <div class="single-multiple-option" :class="isSelected(option.id, field.name) ? 'multiple-options-selected' : ''" @click="selectOption(option.id, field.name)">{{ option.title + ' - ' + option.id }}</div>
                      </div>
                    </div>
                  </div>
                  <!-- Generic Input/Select -->
                  <component
                    v-show="(field.type === 'string' || field.type === 'textfield') || (!Array.isArray(optionValues.option_values) && field.type !== 'media' || (field.type === 'media' && !previewMedia && ( !optionsData[field.key] || (optionsData[field.key] && (optionsData[field.key].length === 0 || (optionsData[field.key].length > 0 && !optionsData[field.key][0].url))))))"
                    :value="computedComponentValue(field)"
                    :class="optionValues.field === field.name && optionValues.option_values ? 'd-input pl-6 border rounded-xl border-FieldGray w-full focus:outline-none' : field.type !== 'media' ? 'd-input pl-6 border rounded-xl border-FieldGray h-48px w-full focus:outline-none' : ''"
                    :id="field.key"
                    :is="getTag(field.type, field.name && field.name.includes(':') ? field.name.split(':')[1] : field.name)"
                    :type="getType(field.type)"
                    :name="field.name"
                    :title="'choose'"
                    :placeholder="changeFieldLabel(field)"
                    :multiple="optionValues.field === field.name && optionValues.option_values"
                    @input="changeFieldValue($event, idx, field.type, field.key)"
                  >
                    <option
                      v-for="option in optionValues.option_values"
                      :key="option.id"
                      :value="option.id"
                      :selected="optionValues.field === field.name && optionValues.option_values && optionsData[field.key] && optionsData[field.key].indexOf(option.id) !== -1"
                    >{{ option.title }}</option
                    >
                  </component>
                </div>
                <span v-if="field.type === 'media'" class="flex text-error py-2 text-xs">{{ mediaError }}</span>
              </div>
            </div>
          </div>
          <!-- Submit Buttons -->
          <button class="submit-btn mt-4" type="button" @click="addConfigurable">
            {{ t('Submit data') }}
          </button>
          <button
            v-if="!instance && !props.creation && !globalSectionMode"
            class="mt-4 submit-btn promote-btn"
            type="button"
            @click="emit('promote-section')"
          >
            {{ t('promoteSection') }}
          </button>
        </form>
      </div>
      <!-- Media Component -->
      <LazyMediasMediaComponent ref="sectionsMediaComponentRef" :sections-user-id="sectionsUserId" @emittedMedia="(media) => selectedMedia = media"></LazyMediasMediaComponent>
    </div>

    <!-- Custom Tab Content -->
    <div v-show="currentTab === 'custom'" class="sub-types">
      <div>
        <div class="text-video d-flex content-wrapper" v-show="formatName(props.props.name)">
           <component
              :is="getComponentForm"
              :ref="el => fieldRefs[formatName(props.props.name)] = el"
              :section-settings="props.props"
              :section-options="options[0]"
              @whitelistIdUpdated="updateWhitelistId"
              @customFormEvent="(data) => { customFormData = data }"
              @load="(value) => emit('load', value)"
              @customFormLoaded="showCustomFormTab = true"
           />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, defineProps, defineEmits, shallowRef, nextTick } from 'vue';
import { useNuxtApp, useCookie, useRoute } from '#app'; // Import Nuxt 3 composables

// Composables
const nuxtApp = useNuxtApp();
const route = useRoute();
const { t, locale } = useI18n();
const authToken = useCookie("sections-auth-token");

// Props
const props = defineProps({
  props: { // This holds the nested object with fields like name, fields, linked_to etc.
    type: Object,
    default: () => ({}),
  },
  savedView: {
    type: Object,
    default: () => ({}),
  },
  headers: { // Likely unused now with Nuxt 3 fetching
    type: Object,
    default: () => ({}),
  },
  html: { // Likely related to WYSIWYG initial content
    type: String,
    default: ""
  },
  sectionsUserId: {
    type: String,
    default: ''
  },
  sectionsConfigurableType: {}, // Type could be more specific
  locales: {
    type: Array,
    default: () => ['en', 'fr']
  },
  defaultLang: {
    type: String,
    default: 'en'
  },
  translationComponentSupport: {
    type: Boolean,
    default: false
  },
  instance: { // Is this a global instance?
    type: Boolean,
    default: false
  },
  linked: { // Is this linked to a global instance?
    type: Boolean,
    default: false
  },
  basePath: {
    type: String,
    default: ''
  },
  isSideBarOpen: {
    type: Boolean,
    default: false
  },
  // Removed incorrect top-level props. Access via props.props.fieldName
  creation: { // Used in template logic - IS THIS PASSED SEPARATELY OR INSIDE props.props? Assuming separate for now.
      type: Boolean,
      default: false
  }
});

// Emits
const emit = defineEmits(['settingsUpdate', 'load', 'promote-section', 'errorAddingSection', 'addSectionType', 'loadReference']);

// Reactive State
const errorMessage = ref("");
const settings = reactive({}); // Consider structure based on usage
const options = reactive([{}]); // Array of option objects
const optionValues = reactive({}); // Holds dynamic option values fetched from API
const currentTab = ref('config');
const optionsData = reactive({}); // Holds the actual data for the fields, keyed by field.key
const showCustomFormTab = ref(false);
const previewMedia = ref("");
const isInProgress = ref(false); // For media uploads
const mediaError = ref('');
const customFormData = ref(null); // Data from custom form component
const formLang = ref(locale.value.toString()); // Use i18n locale
const autoInsert = ref(false); // For global instances
const instanceNameError = ref(false);
const showPagesList = ref(false);
const instanceName = ref('');
const pages = ref([]); // For global instance page references
const selectedMedia = ref(null); // From MediaComponent emit
const fieldRefs = reactive({}); // To hold dynamic template refs
const sectionsMediaComponentRef = ref(null); // Ref for MediaComponent
const registeredComponents = reactive({}); // To hold dynamically imported registered components

// Computed Properties
const id = computed(() => props.savedView.id || `id-${Date.now()}`);
const weight = computed(() => props.savedView.weight || null);

const getComponentForm = computed(() => {
  let path = "";
  // Access nested props.props.name
  if (props.props.name && props.props.name.includes(":")) {
    path = "/forms/" + props.props.name.split(":")[1];
  } else if (props.props.name) {
    path = "/forms/" + props.props.name;
  } else {
      return null; // Return null or a placeholder if name is not available
  }
  // Use shallowRef for components to avoid deep reactivity tracking
  const component = shallowRef(null);
  importComp(path).then(comp => {
      component.value = comp;
      // Check if the component loaded successfully to show the tab
      if (comp) {
          showCustomFormTab.value = true;
      }
  });
  return component;
});

const globalSectionMode = computed(() => props.instance || props.linked);

// Watchers
watch(settings, (newSettings) => {
  emit('settingsUpdate', newSettings);
}, { deep: true });

watch(() => props.html, (newHtml) => {
  // Assuming settings structure, adjust if needed
  if (typeof settings.data === 'object' && settings.data !== null) {
      settings.data = newHtml; // Or merge appropriately
  } else {
      settings.data = newHtml;
  }
});

// Watch the nested props.props.fields
watch(() => props.props.fields, (newFields) => {
  if (newFields) {
    newFields.forEach((field) => {
      // Initialize options structure if needed
      if (options[0][field.key] === undefined) {
        options[0][field.key] = null; // Or appropriate default
      }
      // Initialize optionsData structure
      if (optionsData[field.key] === undefined) {
        if (stringType(field.type)) {
          optionsData[field.key] = {};
          props.locales.forEach(loc => {
            optionsData[field.key][loc] = '';
          });
        } else {
          optionsData[field.key] = null; // Or appropriate default (e.g., [] for multi-select)
        }
      }
       // Pre-load registered components
       loadRegisteredComponent(field.type, field.key);
    });
  }
}, { deep: true, immediate: true });

watch(locale, (newLocale) => {
    // Update formLang when app locale changes
    formLang.value = newLocale.toString();
});

// Methods converted to functions
function formatFileName(name) {
  if (!name) return "Choose a file...";
  return "..." + name.substr(name.length - 8);
}

function removeRow(idx) {
  options.splice(idx, 1);
  // Assuming props.fields is not directly mutable, emit event if needed
  // props.fields.splice(idx, 1); // Avoid mutating props directly
}

function stringType(type) {
  return ['wysiwyg', 'string', 'textfield', 'textarea'].includes(type);
}

async function changeFieldValue(e, idx, type, fieldname) {
  const value = type === "media" ? e : e.target.value;
  const name = type === "media" ? fieldname : e.target.name; // 'name' here is the field key

  if (type === "media") {
    await mediaUpload(e, idx, name);
  } else if (type === 'integer') {
    // Ensure optionsData structure exists
    if (!optionsData[name]) optionsData[name] = null; // Or appropriate default
    optionsData[name] = parseInt(value); // Store in optionsData
    options[0][name] = parseInt(value); // Also update legacy options structure if needed elsewhere
  } else if (type === 'textarea') {
    if (!optionsData[name]) optionsData[name] = {};
    optionsData[name][formLang.value] = value;
    if (!options[0][name]) options[0][name] = {}; // Legacy
    options[0][name][formLang.value] = value; // Legacy
  } else if (stringType(type) && !(optionValues.field === fieldname && optionValues.option_values)) {
    if (!optionsData[name]) optionsData[name] = {};
    optionsData[name][formLang.value] = value;
    if (!options[0][name]) options[0][name] = {}; // Legacy
    options[0][name][formLang.value] = value; // Legacy
  } else {
    // Handle other types like select, checkbox, etc.
    if (!optionsData[name]) optionsData[name] = null;
    optionsData[name] = value;
    options[0][name] = value; // Legacy
  }
}

async function mediaUpload(e, idx, name) {
  isInProgress.value = true;
  const media = [{ media_id: "", url: "", filename: "" }]; // Corrected typo 'fielname'
  mediaError.value = '';
  try {
    const result = await globalFileUpload(e.target.files[0]); // Assuming globalFileUpload is adapted for Nuxt 3
    if (result.success) {
      media[0].url = result.data.files[0].url;
      media[0].filename = result.data.files[0].filename;
      media[0].media_id = result.data.id;
      previewMedia.value = media[0].url;
      optionsData[name] = media; // Update reactive data store
      options[0][name] = media; // Update legacy structure if needed
    } else {
      mediaError.value = `${result.error?.response?.data?.error || 'Upload failed'}. ${result.error?.response?.data?.message || ''}`;
    }
  } catch (error) {
      console.error("Media upload error:", error);
      mediaError.value = 'An unexpected error occurred during upload.';
  } finally {
      isInProgress.value = false;
  }
}

async function removeImage(name) {
  previewMedia.value = '';
  // Assuming optionsData[name] is the array [{ url: '...', ... }]
  if (optionsData[name] && optionsData[name][0]) {
      const mediaId = optionsData[name][0].media_id;
      if (mediaId) {
          try {
              await deleteMedia(mediaId); // Call delete helper
          } catch (error) {
              console.error("Failed to delete media from server:", error);
              // Optionally show a toast message
          }
      }
      optionsData[name] = []; // Clear the reactive data
      options[0][name] = []; // Clear legacy structure
  }
}


function onEditorChange(html, idx, fieldname) {
  if (!optionsData[fieldname]) optionsData[fieldname] = {};
  optionsData[fieldname][formLang.value] = html;
  if (!options[0][fieldname]) options[0][fieldname] = {}; // Legacy
  options[0][fieldname][formLang.value] = html; // Legacy
}

function addAnother() {
  // This logic seems flawed, it adds the *first* field definition again.
  // Re-evaluate if this feature is needed or how it should work.
  // If needed, it should likely clone the last set of fields/options.
  console.warn("'addAnother' functionality needs review for Nuxt 3 migration.");
  // Original logic (potentially problematic):
  // errorMessage.value = "";
  // let error = false;
  // options.forEach(opt => {
  //   const fields = props.fields[0]; // Always uses the first field definition
  //   fields.forEach(field => {
  //     if (!opt[field.name] || opt[field.name] === "no-value") {
  //       error = true;
  //     }
  //   });
  // });
  // if (error) {
  //   errorMessage.value = "You must fill your current fields before adding a new one";
  // } else {
  //   props.fields.push(props.fields[0]); // Mutating props!
  //   options.push({});
  // }
}

function getTag(type, name) {
  // Simplified logic based on original
  if ((type === 'integer' || type === 'string' || type === 'textfield' || type === 'textarea') && optionValues.field === name && optionValues.option_values) {
    return 'select';
  }
  if (type === 'media') return 'input';
  if (type === 'textarea') return 'textarea';
  return 'input';
}

function getType(type) {
  // Simplified logic based on original
  if (type === 'file' || type === 'media') return 'file';
  return 'text'; // Default for string, integer, textfield, textarea, hidden, wysiwyg
}

async function addConfigurable() {
  instanceNameError.value = false;
  if (globalSectionMode.value && !instanceName.value) {
    instanceNameError.value = true;
    return;
  }

  errorMessage.value = "";
  let error = false;
  let errorField = '';

  // Validate fields using optionsData
  // Iterate over nested props.props.fields
  for (const field of props.props.fields) {
      const key = field.key;
      const type = field.type;
      const value = optionsData[key];
      const isStringType = stringType(type);

      // Check registered component validation first
      const registeredComp = registeredComponents[type + '_' + key];
      if (registeredComp?.methods?.validateOptions) { // Check if component and method exist
          try {
              // Pass reactive optionsData, field definition, key, and component context (if needed)
              let validatedOptions = registeredComp.methods.validateOptions(optionsData, field, key, /* component instance proxy if needed */);
              if (validatedOptions.errorMessage === true) {
                  error = true;
                  errorField = `${key} (${validatedOptions.errors})`;
                  break;
              }
          } catch (e) {
              console.warn(`Error validating options for custom component ${key}:`, e);
          }
      }

      // Standard validation
      if (type === 'boolean' && value === null) {
          optionsData[key] = false; // Default boolean to false if null
      } else if (isStringType && typeof value === 'object' && value !== null && !value[props.defaultLang]) {
          error = true;
          errorField = `${key} / (${props.defaultLang})`;
          break;
      } else if (isStringType && typeof value !== 'object' && !value && typeof value !== 'boolean' && !Array.isArray(value)) {
          error = true;
          errorField = key;
          break;
      } else if (type === 'integer' && !Array.isArray(value) && (value === null || isNaN(value))) {
          error = true;
          errorField = key;
          break;
      } else if (value === null && type !== 'boolean') { // Allow null for non-required fields? Add check if field is required
          // This condition might be too strict depending on requirements
          // error = true;
          // errorField = key;
          // break;
      }
  }


  if (error) {
    errorMessage.value = `${t('fillRequiredFields')} (${errorField})`;
    return;
  }

  // Notify registered components validation passed (if method exists)
  // Iterate over nested props.props.fields
  props.props.fields.forEach(field => {
      const registeredComp = registeredComponents[field.type + '_' + field.key];
      if (registeredComp?.methods?.optionsValidated) {
          try {
              registeredComp.methods.optionsValidated(/* component instance proxy if needed */);
          } catch (e) {
              console.warn(`Error calling optionsValidated for custom component ${field.key}:`, e);
          }
      }
  });


  emit("load", true);

  const config = {
    headers: sectionHeader({ token: authToken.value || '' }), // Use token from useCookie
  };

  // Prepare payload using reactive optionsData
  const currentOptions = {};
  Object.keys(optionsData).forEach(key => {
      // Ensure the key corresponds to a defined field to avoid sending extra data
      // Check against nested props.props.fields
      if (props.props.fields && props.props.fields.some(f => f.key === key)) {
          currentOptions[key] = optionsData[key];
      }
  });


  const variables = {
    section: {
      // Access nested props.props.name
      name: props.props.name && props.props.name.includes(":") ? props.props.name : `${props.savedView.application_id}:${props.props.name}`, // Ensure savedView.application_id is available
      weight: 1, // Or use computed weight?
      options: [currentOptions] // Send the validated data
    },
    base_path: props.basePath
  };

  let currentLanguage = undefined;
  try {
    currentLanguage = locale.value;
  } catch {}

  if (nuxtApp.$sections.queryStringSupport === "enabled") {
    const query_string = parseQS(encodeURIComponent(route.params.pathMatch ? route.params.pathMatch.join('/') : '/'), Object.keys(route.query).length !== 0, route.query);
    // Access nested props.props.query_string_keys
    if (props.props.query_string_keys && props.props.query_string_keys.length > 0) {
      variables.query_string = {
        ...query_string,
        ...validateQS(query_string, props.props.query_string_keys, true) // Assuming validateQS is adapted
      };
    } else {
        variables.query_string = query_string;
    }
    variables.query_string = {
      ...variables.query_string,
      language: currentLanguage
    };
  }

  const URL = `${nuxtApp.$sections.serverUrl}/project/${nuxtApp.$sections.projectId}/section/render`;

  try {
    // Use $fetch for Nuxt 3
    const res = await $fetch(URL, {
        method: 'POST',
        body: variables,
        headers: config.headers // Pass headers directly
    });

    if (res && res.error) {
      emit('errorAddingSection', {
        closeModal: false,
        title: "Error adding " + props.props.name, // Access nested props.props
        message: res.error
      });
      return;
    }

    emit('addSectionType', {
      // Access nested props.props.name
      name: props.props.name && props.props.name.includes(":") ? props.props.name.split(":")[1] : props.props.name,
      nameID: props.props.name && props.props.name.includes(":") ? props.props.name : `${props.savedView.application_id}:${props.props.name}`, // Ensure savedView.application_id
      type: 'configurable',
      settings: currentOptions, // Send validated data
      id: id.value,
      weight: weight.value,
      render_data: res.render_data,
      query_string_keys: res.query_string_keys,
      auto_insertion: autoInsert.value,
      // Access nested props.props.addToPage and props.props.instance_name
      instance_name: props.props.addToPage ? props.props.instance_name : instanceName.value
    });

  } catch (e) {
    const errorData = e.response?._data || e.data || {}; // Nuxt 3 $fetch error structure
    const status = e.response?.status || e.status;

    if (status === 404) {
      // Handle 404 - potentially render with default data?
       emit('addSectionType', {
         // Access nested props.props.name
         name: props.props.name && props.props.name.includes(":") ? props.props.name.split(":")[1] : props.props.name,
         nameID: props.props.name && props.props.name.includes(":") ? props.props.name : `${props.savedView.application_id}:${props.props.name}`, // Ensure savedView.application_id
         type: 'configurable',
         settings: currentOptions, // Send validated data
         id: id.value,
         weight: weight.value,
         render_data: errorData.render_data, // Use error response data if available
         query_string_keys: errorData.query_string_keys,
         auto_insertion: autoInsert.value,
         // Access nested props.props.addToPage and props.props.instance_name
         instance_name: props.props.addToPage ? props.props.instance_name : instanceName.value
       });
    } else {
      emit('errorAddingSection', {
        closeModal: false,
        title: "Error adding " + props.props.name, // Access nested props.props
        message: errorData.error || errorData.message || t('saveConfigSectionError')
      });
    }
  } finally {
    emit("load", false);
  }
}

async function getGlobalType() {
  emit("load", true);
  try {
    // Access nested props.props.linked_to
    const result = await getGlobalTypeData(props.props.linked_to); // Assuming getGlobalTypeData is adapted
    if (result.res && result.res.data) {
      autoInsert.value = result.res.data.auto_insertion;
      if (result.res.data.pages && result.res.data.pages.length > 0) {
        pages.value = result.res.data.pages.map(p => p.path);
      }
      instanceName.value = result.res.data.name;
    } else if (result.error) {
      showToast("Error", "error", result.error?.response?.data?.message || 'Failed to load global type data');
    }
  } catch (error) {
      console.error("Error fetching global type data:", error);
      showToast("Error", "error", 'An unexpected error occurred.');
  } finally {
      emit("load", false);
  }
}

function showToast(title, variant, message) {
  // Use a Nuxt 3 compatible toast library or implement a simple notification system
  // Example: console.log(`[${variant.toUpperCase()}] ${title}: ${message}`);
   if (nuxtApp.$toast && typeof nuxtApp.$toast[variant] === 'function') {
       nuxtApp.$toast[variant](message, {
           // Nuxt 3 toast options might differ
           position: "top-right",
           timeout: 5000,
           // ... other options
       });
   } else {
       console.warn(`Toast notification: [${variant}] ${title} - ${message}`);
   }
}

function updateWhitelistId(id) {
  optionsData['whitelist_id'] = id;
  options[0]['whitelist_id'] = id; // Legacy
}

function isSelected(id, name) {
    const data = optionsData[name];
    // Check if data is an array and includes the id
    return Array.isArray(data) && data.includes(parseInt(id));
}

function selectOption(value, name) {
  const intValue = parseInt(value);
  if (!optionsData[name]) {
      optionsData[name] = []; // Initialize as array if not exists
  }

  if (Array.isArray(optionsData[name])) {
      const index = optionsData[name].indexOf(intValue);
      if (index === -1) {
          optionsData[name].push(intValue); // Add if not present
      } else {
          optionsData[name].splice(index, 1); // Remove if present
      }
  } else {
      // If it wasn't an array before (e.g., null), start a new array
      optionsData[name] = [intValue];
  }
  options[0][name] = optionsData[name]; // Update legacy structure
}


function importHooks(hook, params) {
  // Ensure importJs is compatible with Nuxt 3/Vite
  try {
      const hooksJs = importJs(`/js/configurable-hooks`); // Might need refactoring
      if (hooksJs && typeof hooksJs[hook] === 'function') {
          return hooksJs[hook](params);
      }
  } catch (e) {
      console.warn(`Could not import or execute hook '${hook}':`, e);
  }
  return undefined; // Return undefined if hook doesn't exist or fails
}

// Function to load registered components dynamically
async function loadRegisteredComponent(type, key) {
    const componentKey = `${type}_${key}`;
    if (!registeredComponents[componentKey]) {
        let path = `/configurable_components/${type}_${key}`;
        try {
            const comp = await importComp(path);
            if (comp) {
                // Use shallowRef for performance with components
                registeredComponents[componentKey] = shallowRef(comp);
            } else {
                registeredComponents[componentKey] = null; // Mark as tried but failed
            }
        } catch (e) {
            // console.warn(`Could not load registered component for ${componentKey}:`, e);
            registeredComponents[componentKey] = null; // Mark as tried but failed
        }
    }
}


function updateLocale(newLocale) {
  formLang.value = newLocale;
  // Force reactivity update if needed, though direct v-model should handle it
  // nextTick(() => { /* potentially force update if direct binding fails */ });
  // this.$set(this.props, 'fields', [...this.props.fields])
  // this.$set(this, 'optionsData', {...this.optionsData})
  // this.$set(this, 'options', [...this.options])
}

function computedWysiwygValue(field) {
    // Use reactive optionsData
    return optionsData[field.key]?.[formLang.value] || '';
}

function computedComponentValue(field) {
    // Use reactive optionsData
    if (optionValues.field === field.name && optionValues.option_values) {
        return optionsData[field.key]; // For select bound to array/value
    } else if (stringType(field.type, field.name)) {
        return optionsData[field.key]?.[formLang.value] || ''; // For translatable strings
    }
    return optionsData[field.key]; // For other types
}

function changeFieldLabel(field) {
  let importedHook = importHooks('updateFieldLabel', field);
  if (importedHook) {
    return importedHook;
  }
  // Add * only if field is considered required (add logic if needed)
  return field.name.replace(/_/g, " ") + '*';
}

// Lifecycle Hooks
onMounted(() => {
  emit('loadReference'); // Emit event defined in defineEmits

  // Initialize options and optionsData from savedView
  if (props.savedView.fields) {
    const initialOptions = {};
    const savedRenderData = props.savedView.render_data || props.savedView.renderData || [];

    if (savedRenderData.length > 0) {
        // Assuming we only care about the first item's settings for this component instance
        Object.assign(initialOptions, savedRenderData[0].settings || {});
    }

    // Ensure all defined fields exist in initialOptions and optionsData
    // Iterate over nested props.props.fields
    if (props.props.fields) {
        props.props.fields.forEach(field => {
            if (initialOptions[field.key] === undefined) {
                initialOptions[field.key] = stringType(field.type) ?
                    props.locales.reduce((acc, loc) => ({ ...acc, [loc]: '' }), {}) :
                    null; // Or appropriate default like [] for multi-select
            }
            if (optionsData[field.key] === undefined) {
                 optionsData[field.key] = JSON.parse(JSON.stringify(initialOptions[field.key])); // Deep copy initial value
            }
        });
    }

    // Apply configurable_pre_render hook if exists
    let alteredOptions = null;
    try {
        const hooksJs = importJs(`/js/configurable-hooks`);
        if (hooksJs?.configurable_pre_render) {
            alteredOptions = hooksJs.configurable_pre_render(
                JSON.parse(JSON.stringify([initialOptions])), // Pass options structure expected by hook
                props.defaultLang,
                props.locales,
                props.props // Pass the nested props object itself
            );
        }
    } catch (e) {
        console.warn("Error running configurable_pre_render hook:", e);
    }

    // Update optionsData with altered values if hook returned data
    if (alteredOptions && alteredOptions[0]) {
        Object.keys(alteredOptions[0]).forEach(key => {
            if (optionsData.hasOwnProperty(key)) { // Update only existing keys
                optionsData[key] = alteredOptions[0][key];
            }
        });
    }
     // Update the legacy options array as well
     options[0] = { ...initialOptions, ...(alteredOptions ? alteredOptions[0] : {}) };


  } else {
      // Initialize optionsData for fields even if no savedView
      // Iterate over nested props.props.fields
      if (props.props.fields) {
          props.props.fields.forEach(field => {
              if (optionsData[field.key] === undefined) {
                  optionsData[field.key] = stringType(field.type) ?
                      props.locales.reduce((acc, loc) => ({ ...acc, [loc]: '' }), {}) :
                      null; // Or appropriate default
                  options[0][field.key] = optionsData[field.key]; // Sync legacy options
              }
          });
      }
  }


  // Initialize settings data
  if (props.savedView.settings) {
    settings.data = props.savedView.settings; // Assuming settings is reactive({ data: ... })
  }

  // Fetch dynamic options if needed
  // Access nested props.props.dynamic_options
  if (props.props.dynamic_options || props.savedView.dynamic_options) {
    emit("load", true);
    const header = { token: authToken.value || '' };
    const config = { headers: sectionHeader(header) };
    // Access nested props.props.nameID and props.props.name
    const URL = `${nuxtApp.$sections.serverUrl}/project/${nuxtApp.$sections.projectId}/section/${props.props.nameID || props.props.name}/options`;

    $fetch(URL, { headers: config.headers })
      .then((res) => {
        // Assuming res is an array and we need the first element
        if (res && res[0]) {
            Object.assign(optionValues, res[0]); // Update reactive optionValues

            // Pre-sort options if needed (example from original code)
            if (optionValues.option_values) {
                const sortedOptions = [...optionValues.option_values].sort((a, b) => {
                    const aSelected = isSelected(a.id, optionValues.field);
                    const bSelected = isSelected(b.id, optionValues.field);
                    if (aSelected && !bSelected) return -1;
                    if (!aSelected && bSelected) return 1;
                    return 0; // Keep original order otherwise or add more sorting criteria
                });
                optionValues.option_values = sortedOptions;
            }
        }

        // Access nested props.props.addToPage
        if (props.props.addToPage) {
          addConfigurable(); // Call addConfigurable after options are loaded
        }
      })
      .catch((err) => {
        const errorData = err.response?._data || err.data || {};
        showToast("Error", "error", errorData.message || 'Failed to load dynamic options');
      })
      .finally(() => {
        emit("load", false);
      });
  }

  // Run mounted hook from external JS file
  importHooks('mounted');

  // Fetch global type data if linked
  // Access nested props.props.linked_to
  if (props.props.linked_to) {
    getGlobalType();
  }
});

</script>

<style scoped>
/* Styles remain largely the same, ensure preprocessor (like SASS for darken()) is set up */
.element {
  margin: 15px;
  flex-direction: column;
  align-items: flex-start;
  display: flex;
  text-align: left;
}
.element select {
  width: 100%;
  padding: 9px 19px;
  border-radius: 6px;
}
.deleteRow {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 130px;
}

.btn-primary {
  min-width: 100px;
}

.containerWidth {
  min-width: 800px;
}
.border-FieldGray {
  --tw-border-opacity: 1!important;
  border-color: #f2f2f3!important;
  border-color: rgba(242,242,243,var(--tw-border-opacity))!important;
}
.bg-blue {
  background: #31a9db;
  color: white;
  border: none;
  outline: none !important;
  transition: 0.2s;
}
.bg-blue:hover {
  background: #0881b3;
  transition: 0.2s;
}
.text-Blue {
  background: #31a9db;
}

.loadingCircle {
  width: 70px;
  height: 70px;
}
.content-wrapper {
  overflow-y: scroll;
  height: 550px; /* Consider using CSS variables or making this dynamic */
}
.error-message {
  color: #dc3545; /* Standard Bootstrap danger color */
}
.inactive-text {
  color: #03B1C7;
}
.active-tab {
  background: #03B1C7;
  color: white; /* Ensure text is visible */
}
.inactive-tab {
  background: #ffffff;
  border-color: #03B1C7;
}
@media only screen and (max-height: 800px) {
  .content-wrapper {
    overflow-y: scroll;
    height: 450px;
  }
}

.selectMultipleOptions {
  border-radius: 0.75rem;
  border-width: 1px;
  border-color: #f2f2f3; /* Match input border */
  overflow-y: scroll;
  align-items: flex-start;
  flex-direction: column;
  max-width: 32rem;
  height: 250px;
  display: flex;
  margin-top: 0.5rem;
}

.single-multiple-option {
  padding-left: 1rem;
  padding: 0.5rem;
  cursor: pointer;
  width: 100%;
}

.multiple-options-wrapper {
  width: 100%;
}
.multiple-options-wrapper:hover .single-multiple-option:not(.multiple-options-selected) {
    background-color: #f0f0f0; /* Add hover effect */
}

.multiple-options-selected {
  background: #C2C2C2;
  font-weight: bold; /* Indicate selection */
}

.text-area-field {
  min-height: 96px; /* Increase min-height for better usability */
}

.wl-col {
  padding: 0 20px;
}

.autoInsertRow {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px; /* Add some spacing */
}
.autoInsertInput {
  width: 15px;
  height: 15px;
}
.instanceInput {
  width: 350px;
}
.promote-btn {
  font-size: 1rem !important; /* Adjust size */
  margin-left: 10px; /* Add spacing */
  background-color: #6c757d; /* Secondary color */
  border-color: #6c757d;
}
.promote-btn:hover {
    background-color: #5a6268;
    border-color: #545b62;
}
.unsupportedFieldType {
    color: #dc3545;
    font-style: italic;
    padding: 10px;
    border: 1px dashed #dc3545;
    border-radius: 5px;
    margin-top: 10px;
}
.submit-btn {
    /* Add styles from your project's design system */
    padding: 10px 20px;
    background-color: #03B1C7;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.2s;
}
.submit-btn:hover {
    background-color: #028a9b;
}

</style>
