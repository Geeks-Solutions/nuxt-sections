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
      // vueI18n: resolve('./i18n.config.ts'),
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
    // _nuxt.hook('i18n:registerModule', register => {
    //   register({
    //     langDir: resolve('./runtime/lang'),
    //     locales: [
    //       {
    //         code: 'en',
    //         file: 'en.json'
    //       },
    //       {
    //         code: 'fr',
    //         file: 'fr.json'
    //       }
    //     ]
    //   })
    // })

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

    // Detect Tailwind installation
    // const isTailwindInstalled = ['@nuxtjs/tailwindcss'].some(pkg =>
    //     _nuxt.options.modules?.some(m =>
    //       typeof m === 'string' ? m.includes(pkg) : m[0]?.includes(pkg)
    //     ) || _nuxt.options.buildModules?.some(m =>
    //       typeof m === 'string' ? m.includes(pkg) : m[0]?.includes(pkg)
    //     )
    // )

    // Fallback CSS if Tailwind not installed
    // if (!isTailwindInstalled) {
    //   _nuxt.options.css.push(resolver.resolve('src/assets/css/sections.css'))
    //   _nuxt.options.css.push('@geeks.solutions/vue-components/assets/media/media.css')
    // }

    // Public runtime config override
    // const runtimeOptions = _nuxt.options.runtimeConfig.public?.sections || {}
    // const options = {
    //   ..._options,
    //   ...runtimeOptions
    // }

    // if (!options.namespace) options.namespace = 'sections'
    // const { namespace } = options

    // Ensure quill is transpiled
    // _nuxt.options.build.transpile = _nuxt.options.build.transpile || []
    // if (!_nuxt.options.build.transpile.includes('quill')) {
    //   _nuxt.options.build.transpile.push('quill')
    // }

    // Add third-party module
    // _nuxt.options.modules.push('@geeks.solutions/vue-components/nuxt')
    // _nuxt.options.css.push('@geeks.solutions/vue-components/assets/icons/icomoon/style.css')

    // Add plugins
    // const pluginsToRegister = ['plugin.js', 'src/components/index.js', 'src/utils/index.js']
    // for (const plugin of pluginsToRegister) {
    //   addPlugin({
    //     src: resolver.resolve(plugin),
    //     mode: 'client',
    //     // filename: join(namespace, plugin),
    //     // options,
    //   })
    // }

    // Sync files into build directory
    // const foldersToSync = [
    //   'src/components/Sections', 'src/components/Translations', 'src/components/Tooltip',
    //   'src/components/Editor', 'src/components/Medias', 'src/components/SectionsForms',
    //   'src/components/SectionsViews', 'src/utils', 'src/configs/forms',
    //   'src/configs/type-icons', 'src/configs/views', 'src/base/SubTypes',
    //   'src/base/types', 'src/base/icons', 'src/base/assets',
    // ]

    // for (const folder of foldersToSync) {
    //   const absPath = resolver.resolve(folder)
    //   for (const file of readdirSync(absPath)) {
    //     addTemplate({
    //       src: resolve(absPath, file),
    //       // filename: join(namespace, folder, file),
    //       options,
    //     })
    //   }
    // }
  }
})
