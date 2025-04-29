<template>
  <div class="sub-types">
    <div>
      <div class="text-video" :class="{'content-wrapper': isSideBarOpen === false}" v-show="name">
        <!-- Translation Component -->
        <LazyTranslationsTranslationComponent
          v-if="translationComponentSupport && locales.length > 1"
          :locales="locales"
          :default-lang="defaultLang"
          @setFormLang="(locale) => formLang = locale"
        />
        <!-- Dynamic Form Component -->
        <component
          :is="getComponentForm"
          :ref="dynamicFormRef"
          :locales="locales"
          :selectedLang="formLang"
          :default-lang="defaultLang"
          :selected-media="selectedMedia"
          @openMediaModal="(mediaId, category) => sectionsMediaComponentRef?.openModal(mediaId, category)"
          @closeMediaModal="sectionsMediaComponentRef?.closeModal()"
        ></component> <!-- Added closing tag -->
        <!-- Media Component -->
        <LazyMediasMediaComponent
          ref="sectionsMediaComponentRef"
          :sections-user-id="sectionsUserId"
          @emittedMedia="(media) => selectedMedia = media"
        />
      </div>
    </div>
    <!-- Submit Button -->
    <button
      class="mt-4 submit-btn"
      type="button"
      @click="sendJsonData"
      :class="{ withTabs }"
    >
      {{ t('Submit data') }}
    </button>
    <!-- Promote Button -->
    <button
        v-if="promoteButton"
        class="mt-4 submit-btn promote-btn"
        type="button"
        @click="emit('promote-section')"
        :class="{ withTabs }"
    >
      {{ t('promoteSection') }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineProps, defineEmits, shallowRef, watch } from 'vue';

const { t, locale } = useI18n();

// Props
const props = defineProps({
  name: {
    type: String,
    default: "",
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
  promoteButton: {
    type: Boolean,
    default: false
  },
  isSideBarOpen: {
    type: Boolean,
    default: false
  },
  creationView: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['addStatic', 'promote-section', 'creationViewLoaded']);

// Reactive State
const withTabs = ref(false); // State removed from $root listener, default to false. Needs external control if required.
const formLang = ref(locale.value.toString());
const selectedMedia = ref(null);
const sectionsMediaComponentRef = ref(null); // Ref for MediaComponent
const dynamicFormRef = ref(null); // Ref for the dynamic component

const nuxtApp = useNuxtApp()

// Computed: Dynamic Component Loader
const getComponentForm = computed(() => {
  if (!props.name) return null;
  const path = `/forms/${props.name}`;
  const component = shallowRef(null);
  importComp(path).then(comp => component.value = comp);
  return component;
});

// Watch for locale changes
watch(locale, (newLocale) => {
    formLang.value = newLocale.toString();
});

// Methods
function sendJsonData() {
  // Access dynamic component via ref
  const formComponent = dynamicFormRef.value;
  if (!formComponent) {
      return;
  }

  // Attempt to validate and get settings - Requires form component to expose these
  let valid = true;
  if (typeof formComponent.validate === 'function') {
      valid = formComponent.validate();
  } else {
      console.warn(`Dynamic form component for "${props.name}" does not have a 'validate' method.`);
  }

  if (!valid) {
    return;
  }

  let settings = null;
  if (formComponent.settings !== undefined) {
      settings = formComponent.settings;
  } else {
      console.warn(`Dynamic form component for "${props.name}" does not have a 'settings' property.`);
      // Potentially try to gather data differently if 'settings' isn't exposed
      settings = {}; // Default to empty object if settings cannot be retrieved
  }

  emit("addStatic", settings);
}

// Lifecycle Hooks
onMounted(() => {
  // TODO: The below $root.$on will probably not work so consider checking an alternative for global event emitter, maybe using mitt library in utils helpers
  // import mitt from 'mitt';
  //
  // type Events = {
  //   toggleWithTabs: boolean;
  // };
  //
  // const emitter = mitt<Events>();
  //
  // export default emitter;

  // this.$root.$on("toggleWithTabs", (val) => {
  //   withTabs.value = val;
  // });

  nuxtApp.$on("toggleWithTabs", (val) => {
    withTabs.value = val;
  });

  // Handle creationView logic - attempt to get settings from the loaded component
  // This still relies on the dynamic component exposing 'settings'
  if (props.creationView) {
      watch(dynamicFormRef, (newRef) => {
          if (newRef && newRef.settings !== undefined) {
              emit('creationViewLoaded', newRef.settings);
          }
      }, { immediate: true }); // Check immediately if already mounted
  }
});

</script>

<style scoped> /* Changed to scoped */
.sub-types button.submit-btn {
  border: none;
  font-size: 1.25rem; /* Adjusted size */
  padding: 10px 20px; /* Adjusted padding */
  background: #31a9db;
  color: white;
  border-radius: 8px; /* Adjusted border-radius */
  transition: background-color 0.2s; /* Corrected transition property */
  width: auto; /* Let button size naturally */
  min-width: 150px; /* Added min-width */
  height: auto; /* Let height be natural */
  text-align: center;
  cursor: pointer; /* Added cursor pointer */
}
.submit-btn.withTabs {
  /* Re-evaluate if this margin is needed without the event bus */
  /* margin-left: 14%; */
}
.submit-btn:hover { /* Combined hover styles */
  background-color: #0881b3; /* Use darken color */
}
.content-wrapper {
  overflow-y: scroll;
  height: 550px;
}
.promote-btn {
  font-size: 1rem !important; /* Adjusted size */
  margin-left: 10px; /* Added spacing */
  background-color: #6c757d; /* Secondary color */
  border-color: #6c757d;
}
.promote-btn:hover {
    background-color: #5a6268;
    border-color: #545b62;
}
@media only screen and (max-height: 850px) {
  .content-wrapper {
    overflow-y: scroll;
    height: 450px;
  }
}
.sub-types { /* Added padding */
    padding: 20px;
}
.text-video { /* Ensure this class exists or styles are applied elsewhere */
    /* Add necessary styles for layout */
}
</style>
