# @geeks.solutions/nuxt-sections

Nuxt 3 module for integrating the Sections CMS page builder and renderer.

This module provides:

- a default catch-all Sections page renderer
- admin and health routes
- auto-imported helpers for page/media/section workflows
- extension points through component conventions and hook files

[Release Notes](./CHANGELOG.md)

## Quickstart

1. Install the package:

```bash
npm install @geeks.solutions/nuxt-sections
```

2. Register the module and runtime config in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@geeks.solutions/nuxt-sections'],
  runtimeConfig: {
    public: {
      sections: {
        projectId: process.env.NUXT_ENV_SECTIONS_PROJECT_ID,
        projectUrl: process.env.NUXT_ENV_SECTIONS_PROJECT_URL,
        environment: process.env.NUXT_ENV_SECTIONS_ENV,
        queryStringSupport: process.env.NUXT_ENV_SECTIONS_QUERY_STRING_SUPPORT,
        projectLocales: process.env.NUXT_ENV_SECTIONS_LOCALES,
        cname: process.env.NUXT_ENV_SECTIONS_CNAME,
        cssPreset: process.env.NUXT_ENV_SECTIONS_CSS_PRESET,
        wysiwygEditorOptions: {},
      },
    },
  },
})
```

3. Run your app and open any route. The module injects a catch-all page renderer and will resolve Sections content for that path.

## Documentation

- Setup and first render: [`docs/getting-started.md`](docs/getting-started.md)
- Configuration reference: [`docs/configuration.md`](docs/configuration.md)
- Built-in components: [`docs/components.md`](docs/components.md)
- Creating custom section components: [`docs/section-authoring.md`](docs/section-authoring.md)
- Hooks reference (all hook files and signatures): [`docs/hooks-reference.md`](docs/hooks-reference.md)
- Runtime events and integrations: [`docs/events-and-runtime.md`](docs/events-and-runtime.md)
- Tests (unit/integration/typecheck) and expectations: [`docs/testing.md`](docs/testing.md)
- Playground and manual/browser validation: [`docs/playground-and-manual-validation.md`](docs/playground-and-manual-validation.md)
- AI coding playbook (how to change this library safely): [`docs/ai-agent-playbook.md`](docs/ai-agent-playbook.md)

## What The Module Adds Automatically

- Routes:
  - `/:pathMatch(.*)*` (Sections renderer)
  - `/admin` and `/:prefix/admin`
  - `/health` and `/:prefix/health`
- Components from `src/runtime/components/` (auto-registered)
- Utilities from `src/runtime/utils/helpers.ts` (auto-imported)
- Runtime plugin injections:
  - `nuxtApp.$sections`
  - `nuxtApp.$event`, `nuxtApp.$eventAsync`, `nuxtApp.$listen`

The module also ensures required runtime modules are present (`@pinia/nuxt`, `@nuxtjs/i18n`) and installs `@geeks.solutions/vue-components`.

## Local Development

```bash
npm run dev:prepare
npm run dev
```

See [`docs/playground-and-manual-validation.md`](docs/playground-and-manual-validation.md) for full playground details and manual verification flows.
