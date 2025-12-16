// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'
import pluginVue from 'eslint-plugin-vue'
import eslintConfigPrettier from 'eslint-config-prettier'

// Run `npx @eslint/config-inspector` to inspect the resolved config interactively
export default createConfigForNuxt({
  features: {
    // Rules for module authors
    tooling: true,
    // Rules for formatting
    stylistic: false,
  },
  dirs: {
    src: ['./playground'],
  },
}).append(
  ...pluginVue.configs['flat/essential'],
  {
    rules: {
      'no-console': 'error',
      'no-debugger': 'error',
      'no-useless-escape': 'off',
      'vue/no-v-html': 'off',
      'vue/no-use-v-if-with-v-for': 'off',
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-undef': 'off', // Temporary disable to clear noise if globals are used
    },
  },
  eslintConfigPrettier
)
