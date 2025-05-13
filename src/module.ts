import {
  defineNuxtModule,
  createResolver,
  extendPages,
  addComponentsDir,
  addImportsDir,
  addPluginTemplate,
  installModule
} from '@nuxt/kit'

// Module options TypeScript interface definition
export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'Sections CMS',
    configKey: 'sections-cms',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  async setup(_options, _nuxt) {
    const { resolve } = createResolver(import.meta.url)

    await installModule('@nuxtjs/i18n', {
      vueI18n: resolve('./runtime/i18n.config.ts'),
      langDir: resolve('./runtime/lang'),
      locales: [
        {
          code: 'en',
          file: resolve('./runtime/lang/en.json'),
        },
        {
          code: 'fr',
          file: resolve('./runtime/lang/fr.json'),
        },
      ]
    })

    // Extend routes
    extendPages((pages) => {
      pages.push({
        name: 'all',
        path: '/:pathMatch(.*)*',
        file: resolve('./runtime/pages/[...pathMatch].vue'),
      })
      pages.push({
        name: 'Health',
        path: '/health',
        file: resolve('./runtime/pages/health.vue'),
      })
    })

    // Register components
    addComponentsDir({
      path: resolve('./runtime/components')
    })

    // Register utils function
    addImportsDir(resolve('./runtime/utils'), {
      prepend: true
    })

    // Register $sections configuration plugin
    addPluginTemplate(resolve('./runtime/plugin'))

    await installModule('@geeks.solutions/vue-components')
    _nuxt.options.css.push('@geeks.solutions/vue-components/icomoon.css')

  }
})
