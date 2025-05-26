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

    // https://github.com/nuxt/nuxt/issues/27000
    _nuxt.hook('vite:extendConfig', (config: any) => {
      config.optimizeDeps = config.optimizeDeps || {}
      config.optimizeDeps.include = config.optimizeDeps.include || []
      config.optimizeDeps.needsInterop = config.optimizeDeps.needsInterop || []

      if (!config.optimizeDeps.include.includes('@marshallswain/vuedraggable')) {
        config.optimizeDeps.include.push('@marshallswain/vuedraggable')
      }

      if (!config.optimizeDeps.needsInterop.includes('@marshallswain/vuedraggable')) {
        config.optimizeDeps.needsInterop.push('@marshallswain/vuedraggable')
      }
    })

  }
})
