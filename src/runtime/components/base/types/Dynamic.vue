<template>
  <div class="sub-types dynamic-s">
    <!-- Use props directly in template -->
    <h4 :class="{'dynamic-t': !isSideBarOpen}">{{ props.props.linked_to ? formatTexts(formatName(props.props.linked_to, '/')) : t('Adding section') }}</h4>

    <!-- Global Instance Fields -->
    <div v-if="globalSectionMode" class="mt-4">
      <div class="autoInsertRow">
        <div>
          {{ t('autoInsertInstance') }}
        </div>
        <input v-model="autoInsert" type="checkbox" class="autoInsertInput" />
      </div>
      <div v-if="!props.props.linked_to" class="autoInsertRow">
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

    <!-- Submit Button for Global Instances -->
    <button
        v-if="globalSectionMode"
        class="mt-4 submit-btn"
        type="button"
        @click="addStatic"
    >
      {{ t('Submit data') }}
    </button>
  </div>
</template>

<script setup>

const nuxtApp = useNuxtApp();
const route = useRoute();
const { t, locale } = useI18n();
const authToken = useCookie("sections-auth-token");

// Props
const props = defineProps({
  // Contains nested fields like name, linked_to, query_string_keys, instance_name
  props: {
    type: Object,
    default: () => ({}),
  },
  savedView: {
    type: Object,
    default: () => ({}),
  },
  // headers prop likely unused with $fetch
  instance: {
    type: Boolean,
    default: false
  },
  linked: {
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
  }
  // Removed incorrect top-level props: name, linked_to, query_string_keys, instance_name.
  // Access these via props.props.fieldName instead.
});

// Emits
const emit = defineEmits(['load', 'errorAddingSection', 'addSectionType']);

// Reactive State
const autoInsert = ref(false);
const instanceNameError = ref(false);
const showPagesList = ref(false);
const instanceName = ref('');
const pages = ref([]);

// Computed Properties
const id = computed(() => props.savedView.id || `id-${Date.now()}`);
const weight = computed(() => props.savedView.weight || null);
const globalSectionMode = computed(() => props.instance || props.linked);

// Methods converted to functions
async function renderSection(sectionName) { // Use parameter instead of props.name
  emit("load", true);
  const config = {
    headers: sectionHeader({ token: authToken.value || '' }),
  };

  const variables = {
    section: {
      name: sectionName, // Use the parameter
      weight: 1 // Or use computed weight?
    },
    base_path: props.basePath
  };

  let currentLanguage = undefined;
  try {
    currentLanguage = locale.value;
  } catch {}

  if (nuxtApp.$sections.queryStringSupport === "enabled") {
    const query_string = parseQS(encodeURIComponent(route.params.pathMatch ? route.params.pathMatch.join('/') : '/'), Object.keys(route.query).length !== 0, route.query);
    // Access nested props.props for query_string_keys
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

  const URL = `${nuxtApp.$sections.serverUrl}/project/${getSectionProjectIdentity()}/section/render`;

  try {
    const res = await $fetch(URL, {
        method: 'POST',
        body: variables,
        headers: config.headers
    });

    if (res && res.error) {
      emit('errorAddingSection', {
        closeModal: true,
        title: "Error adding " + sectionName, // Use parameter
        message: res.error
      });
      return;
    }

    emit('addSectionType', {
      name: sectionName, // Use the parameter
      type: 'dynamic',
      id: id.value,
      weight: weight.value,
      render_data: res.render_data,
      query_string_keys: res.query_string_keys,
      instance_name: props.props.instance_name // Access nested props.props
    });

  } catch (e) {
    const errorData = e.response?._data || e.data || {};
    const status = e.response?.status || e.status;

    if (status === 404) {
      emit('addSectionType', {
        name: sectionName, // Use the parameter
        type: 'dynamic',
        id: id.value,
        weight: weight.value,
        render_data: errorData.render_data,
        query_string_keys: errorData.query_string_keys,
        instance_name: props.props.instance_name // Access nested props.props
      });
    } else {
      emit('errorAddingSection', {
        closeModal: true,
        title: "Error adding " + sectionName, // Use the parameter
        message: errorData.error || errorData.message || t('saveConfigSectionError') // Use t() for translation
      });
    }
  } finally {
    emit("load", false);
  }
}

function addStatic() {
  instanceNameError.value = false;
  if (globalSectionMode.value && !instanceName.value) {
    instanceNameError.value = true;
    return;
  }
  emit("addSectionType", {
    name: props.props.name, // Access nested props.props
    type: 'dynamic',
    id: id.value,
    weight: weight.value,
    auto_insertion: autoInsert.value,
    instance_name: instanceName.value
  });
}

async function getGlobalType() {
  emit("load", true);
  try {
    // Access nested props.props for linked_to
    const result = await getGlobalTypeData(props.props.linked_to); // Assuming getGlobalTypeData is adapted
    if (result.res && result.res.data) {
      autoInsert.value = result.res.data.auto_insertion;
      if (result.res.data.pages && result.res.data.pages.length > 0) {
        pages.value = result.res.data.pages.map(p => p.path);
      }
      instanceName.value = result.res.data.name;
    } else if (result.error) {
      // Use a Nuxt 3 compatible toast or notification system
      console.error("Error loading global type:", result.error?.response?.data?.message || 'Unknown error');
      // showToast("Error", "error", result.error.response.data.message); // Replace with Nuxt 3 method
    }
  } catch (error) {
    console.error("Error fetching global type data:", error);
    // showToast("Error", "error", 'An unexpected error occurred.'); // Replace with Nuxt 3 method
  } finally {
    emit("load", false);
  }
}

// Lifecycle Hooks
onMounted(() => {
  // Access nested props.props
  if (props.props.linked_to) {
    getGlobalType();
  }
  // Render section immediately if not in instance mode
  if (!props.instance) {
    renderSection(props.props.name); // Access nested props.props
  }
});

</script>

<style scoped> /* Changed from <style> to <style scoped> */
.dynamic-t {
  min-width: 550px;
  min-height: 40px;
}
.autoInsertRow {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px; /* Added spacing */
}
.autoInsertInput {
  width: 15px;
  height: 15px;
}
.instanceInput {
  width: 350px;
}
.dynamic-s {
  text-align: center;
  padding: 20px; /* Added padding */
}
/* Added styles for submit button for consistency */
.submit-btn {
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
.pagesReference { /* Style for error message */
    color: #dc3545;
    font-size: 0.875rem;
    display: block; /* Ensure it takes its own line */
}
.border-FieldGray { /* Copied from Configurable.vue for consistency */
  --tw-border-opacity: 1!important;
  border-color: #f2f2f3!important;
  border-color: rgba(242,242,243,var(--tw-border-opacity))!important;
}
</style>
