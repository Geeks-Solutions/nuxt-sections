import {defineI18nConfig} from "#imports";

export default defineI18nConfig(() => {
  return {
    legacy: false, // Composition API mode
    missingWarn: false,
    fallbackWarn: false,
  }
})
