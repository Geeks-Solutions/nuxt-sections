<template>
  <div class="sub-types">
    <!-- Access nested props.props -->
    <h4 class="local-t">{{ props.props.linked_to ? formatTexts(formatName(props.props.linked_to, '/')) : t('Adding section') }}</h4>

    <!-- Global Instance Fields -->
    <div v-if="globalSectionMode" class="mt-4">
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

    <!-- Submit Button for Global Instances -->
    <button
        v-if="globalSectionMode"
        class="mt-4 submit-btn"
        type="button"
        @click="addLocal"
    >
      {{ t('Submit data') }}
    </button>
  </div>
</template>

<script setup>
import { getGlobalTypeData, useI18n, ref, computed, onMounted, formatName, formatTexts } from '#imports'

const { t } = useI18n();

// Props
const props = defineProps({
  props: { // Nested object containing name, linked_to, instance_name etc.
    type: Object,
    default: () => ({}),
  },
  savedView: {
    type: Object,
    default: () => ({}),
  },
  instance: {
    type: Boolean,
    default: false
  },
  linked: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['addSectionType', 'load']);

// Reactive State
const autoInsert = ref(false);
const instanceNameError = ref(false);
const showPagesList = ref(false);
const instanceName = ref('');
const pages = ref([]);

// Computed Properties
const id = computed(() => props.savedView.id || `id-${Date.now()}`);
const weight = computed(() => props.savedView.weight || 0); // Default to 0 as per original
const globalSectionMode = computed(() => props.instance || props.linked);

// Methods converted to functions
function addLocal() {
  instanceNameError.value = false;
  if (globalSectionMode.value && !instanceName.value) {
    instanceNameError.value = true;
    return;
  }
  emit("addSectionType", {
    name: props.props.name, // Access nested props
    type: 'local',
    id: id.value,
    weight: weight.value,
    auto_insertion: autoInsert.value,
    instance_name: instanceName.value
  });
}

async function getGlobalType() {
  emit("load", true);
  try {
    // Access nested props.props.linked_to
    const result = await getGlobalTypeData(props.props.linked_to); // Assuming helper is adapted for Nuxt 3
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

// Lifecycle Hooks
onMounted(() => {
  // Emit immediately if not in instance mode
  if (!props.instance) {
    // add a little time for the user to see the popup and know that the section is adding
    setTimeout(() => {
      emit("addSectionType", {
        name: props.props.name, // Access nested props
        type: "local",
        id: id.value,
        weight: weight.value, // Include weight
        auto_insertion: autoInsert.value, // Use current value
        instance_name: props.props.instance_name // Access nested props
      });
    }, 500);
  }
  // Fetch global type if linked
  if (props.props.linked_to) { // Access nested props
    getGlobalType();
  }
});

</script>

<style scoped> /* Changed to scoped */
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
.local-t {
  min-width: 550px;
  min-height: 40px;
  margin-bottom: 1rem; /* Added spacing */
}
.sub-types { /* Added padding */
    padding: 20px;
    text-align: center;
}
.sub-types button.submit-btn {
  border: none;
  font-size: 24px;
  margin-top: 1rem;
  padding: 7px;
  background: #31a9db;
  color: white;
  border-radius: 16px;
  transition: 0.2s;
  width: 385px;
  height: 70px;
  text-align: center;
}
.pagesReference {
    color: #dc3545;
    font-size: 0.875rem;
    display: block;
}
.border-FieldGray {
  --tw-border-opacity: 1!important;
  border-color: #f2f2f3!important;
  border-color: rgba(242,242,243,var(--tw-border-opacity))!important;
}
</style>
