<template>
  <div>
    <div class="flex w-full justify-center ml-2 md:ml-0 translationWrapper">
      <div
        v-for="(loc, index) in props.locales"
        :key="loc"
        class="translationComponent"
        :class="[formLang === loc ? 'selectedLang' : 'unselectedLang', index === 0 ? 'roundedLeft' : index === props.locales.length - 1 ? 'roundedRight' : '']"
        @click="formLang = loc; emit('setFormLang', loc)"
      >
        <!-- Show checkmark if the global i18n locale matches this button's locale -->
        <div v-show="locale === loc" class="checkMark">
          <svg xmlns="http://www.w3.org/2000/svg" width="23" height="22" id="check">
            <g fill="none" fill-rule="evenodd" :stroke="formLang === loc ? '#FFFFFF' : '#03B1C7'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
              <path d="M21 10.07V11a10 10 0 1 1-5.93-9.14"></path>
              <path d="M22 2 11 13l-3-3"></path>
            </g>
          </svg>
        </div>
        <div
          class="SectionsFontLight"
          :class="formLang === loc ? 'SectionsTextWhite' : 'SetionsTextBlue'"
        >
          <!-- Use t() function for translation -->
          {{ t(`${loc}Translation`) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n, ref } from '#imports'

// --- Composables ---
const { t, locale } = useI18n(); // Get translation function and reactive locale

// --- Props ---
const props = defineProps({
  locales: {
    type: Array, // Removed 'as () => string[]'
    default: () => ['en', 'fr']
  },
  defaultLang: {
    type: String,
    default: 'en'
  }
});

// --- Emits ---
const emit = defineEmits(['setFormLang']);

// --- Refs ---
// Initialize formLang with the current global locale or the default prop
const formLang = ref(locale.value || props.defaultLang);

// Note: If you need formLang to always sync with the global locale,
// you could watch locale:
// watch(locale, (newLocale) => {
//   formLang.value = newLocale || props.defaultLang;
// });
// However, the original component seemed to manage formLang independently
// after initialization, only emitting changes.

</script>

<style scoped>
.translationWrapper {
  margin-top: 6px;
}
.translationComponent {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  background-color: #03B1C7;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  height: 45px;
  display: flex;
}
.selectedLang {
  background-color: #03B1C7;
}
.unselectedLang {
  background: white;
  border-color: #03B1C7;
  border-width: 1px;
}
.roundedRight {
  border-bottom-right-radius: 0.5rem
}
.roundedLeft {
  border-top-left-radius: 0.5rem
}
.SectionsFontLight {
  font-weight: 300;
}
.SectionsTextWhite {
  color: white;
}
.SetionsTextBlue { /* Typo in original? Should be SectionsTextBlue? */
  color: #03B1C7;
}
.checkMark {
  margin-right: 8px;
}
</style>
