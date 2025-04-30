<template>
  <div class="text-center">
    <div class="element-type">
      <!-- Access nested props.props -->
      <h3>{{ props.props.linked_to ? formatTexts(formatName(props.props.linked_to, '/')) : formatTexts(formatName(props.props.name, " / ")) }}</h3>

      <!-- Global Instance Fields -->
      <div v-if="globalSectionMode">
        <div class="autoInsertRow">
          <div>
            {{ t('autoInsertInstance') }}
          </div>
          <input v-model="autoInsert" type="checkbox" class="autoInsertInput" />
        </div>
        <!-- Access nested props.props -->
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

      <!-- Form and SubType -->
      <form>
        <div>
           <LazyBaseSubTypesSubType
              ref="viewSaved"
              :name="props.props.name"
              :creationView="creationView"
              :promote-button="!instance && !props.props.creation && !globalSectionMode"
              :is-side-bar-open="isSideBarOpen"
              :locales="locales"
              :default-lang="defaultLang"
              :translation-component-support="translationComponentSupport"
              :sections-user-id="sectionsUserId"
              :saved-settings="savedView?.settings"
              @promote-section="emit('promote-section')"
              @addStatic="addStatic"
              @creationViewLoaded="(settings) => emit('creationViewLoaded', settings)"
           >
             <slot />
           </LazyBaseSubTypesSubType>
        </div>
      </form>
    </div>
    <!-- Dynamically imported component (kept for potential field access, though usage seems missing) -->
    <component :is="component" :section="props.props" v-show="false" ref="importedComponentRef" />
  </div>
</template>

<script setup>

const { t } = useI18n();

// Props
const props = defineProps({
  props: { // Nested object containing name, linked_to, type, region, instance_name etc.
    type: Object,
    default: () => ({}),
  },
  savedView: { // Contains id, weight, settings
    type: Object,
    default: () => ({}),
  },
  creationView: {
    type: Boolean,
    default: false
  },
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
  sectionsUserId: {
    type: String,
    default: ''
  },
  instance: {
    type: Boolean,
    default: false
  },
  linked: {
    type: Boolean,
    default: false
  },
  isSideBarOpen: {
    type: Boolean,
    default: false
  },
   // Prop 'creation' is nested within props.props
   // Removed incorrect top-level 'creation' prop definition.
});

// Emits
const emit = defineEmits(['addSectionType', 'load', 'promote-section', 'creationViewLoaded']);

// Reactive State
const showPagesList = ref(false);
const autoInsert = ref(false);
const instanceNameError = ref(false);
const instanceName = ref('');
const pages = ref([]);
const viewSaved = ref(null); // Ref for subType component
const importedComponentRef = ref(null); // Ref for the dynamically imported component
const elements = ref([]); // To store fields from imported component if needed

// Computed Properties
const component = computed(() => {
  // Access nested props.props.name and props.props.type
  if (!props.props.name || !props.props.type) return null;
  const path = `/views/${props.props.name}_${props.props.type}`;
  return importComp(path);
});

const id = computed(() => props.savedView.id || `id-${Date.now()}`);
// Ensure weight is handled correctly, default to null if not present or 0
const weight = computed(() => (props.savedView.weight === 0 || props.savedView.weight) ? props.savedView.weight : null);
const globalSectionMode = computed(() => props.instance || props.linked);

// Methods converted to functions
function addStatic(settings) {
  instanceNameError.value = false;
  if (globalSectionMode.value && !instanceName.value) {
    instanceNameError.value = true;
    return;
  }
  emit("addSectionType", {
    name: props.props.name, // Access nested props
    type: "static",
    settings,
    id: id.value,
    weight: weight.value,
    auto_insertion: autoInsert.value,
    instance_name: instanceName.value,
    region: props.props.region // Access nested props
  });
}

async function getGlobalType() {
  emit("load", true);
  try {
    // Access nested props.props.linked_to
    const result = await getGlobalTypeData(props.props.linked_to); // Assuming helper is adapted
    if (result.res && result.res.data) {
      autoInsert.value = result.res.data.auto_insertion;
      if (result.res.data.pages && result.res.data.pages.length > 0) {
        pages.value = result.res.data.pages.map(p => p.path);
      }
      instanceName.value = result.res.data.name;
    } else if (result.error) {
      // Handle error - Use Nuxt 3 compatible toast/notification
      console.error("Error loading global type:", result.error?.response?.data?.message || 'Unknown error');
      // showToast("Error", "error", result.error.response.data.message); // Replace if using a toast system
    }
  } catch (error) {
    console.error("Error fetching global type data:", error);
    // showToast("Error", "error", 'An unexpected error occurred.'); // Replace if using a toast system
  } finally {
    emit("load", false);
  }
}

watch(viewSaved, async (val) => {
  setTimeout(() => {
    if (val?.dynamicFormRef && props.savedView?.settings) {
      val.dynamicFormRef.settings = props.savedView.settings
    }
  }, 500)
})

// Lifecycle Hooks
onMounted(async () => {
  // Refactored: Settings are now passed as a prop to subType.

  // await nextTick()
  // if (props.savedView?.settings) {
  //   setTimeout(() => {
  //     console.log(viewSaved.value.dynamicFormRef)
  //     console.log(viewSaved.value)
  //     if (viewSaved.value?.$refs?.[props.props.name]) {
  //       viewSaved.value.$refs[props.props.name].settings = props.savedView.settings
  //     }
  //   }, 500)
  // }

  // Logic to get fields from the dynamically imported component.
  // This relies on the component exposing a 'fields' property.
  // Consider if this is still the best approach.
  // Use watch or nextTick if component loading is asynchronous.
  if (importedComponentRef.value && importedComponentRef.value.fields) {
      elements.value = importedComponentRef.value.fields;
  } else {
      // Watch for the component to load if it's async
      watch(component, (newCompInstance) => {
          if (newCompInstance && newCompInstance.fields) {
              elements.value = newCompInstance.fields;
          }
      }, { immediate: true }); // Check immediately in case it's already loaded
  }


  // Fetch global type if linked
  if (props.props.linked_to) { // Access nested props
    getGlobalType();
  }
});

</script>

<style scoped> /* Changed to scoped */
.dashboard button {
  background: black;
  margin: 10px;
  width: auto;
  height: auto;
  max-height: max-content;
  padding: 5px;
  min-width: 0;
  max-width: 1000px;
}
.element-type h3 {
  font-size: 29px;
}
.autoInsertRow {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 8px;
  align-items: center;
}
.autoInsertInput {
  width: 15px;
  height: 15px;
}
.instanceInput {
  width: 350px;
}
</style>
