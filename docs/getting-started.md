# Getting Started

This guide covers the fastest path from install to a working Sections page.

## 1) Install

```bash
npm install @geeks.solutions/nuxt-sections
```

## 2) Configure Nuxt

Add the module and runtime config in `nuxt.config.ts`:

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

Important:

- Runtime behavior reads from `runtimeConfig.public.sections`.
- Module options (`sections-cms`) are currently not used for runtime requests.

## 3) Run

```bash
npm run dev
```

If you are working in this library repository, use:

```bash
npm run dev:prepare
npm run dev
```

## 4) Understand Route Ownership

The module injects these routes:

- `/:pathMatch(.*)*` (default Sections page renderer)
- `/admin` and `/:prefix/admin` (redirect to Sections admin login)
- `/health` and `/:prefix/health`

Your app-specific routes still work, but unknown paths fall through to the catch-all Sections renderer.

## 5) Optional: Use `<Sections>` Manually In A Custom Page

The catch-all page already renders sections for you. If you need explicit control in your own page component:

```vue
<template>
  <Sections
    :admin="admin"
    :page-name="pageName"
    :lang="locale"
    :variations="[]"
    @load="onSectionsLoad"
  />
</template>

<script setup lang="ts">
import { computed, useCookie } from '#imports'

const pageName = 'home'
const locale = 'en'
const admin = computed(() => Boolean(useCookie('sections-auth-token').value))

function onSectionsLoad(_payload: unknown) {
  // Hook point for host-page logic after sections load cycle
}
</script>
```

## 6) Add Your Local `sections/` Directory

Create a root-level `sections` directory in your app to define custom views/forms/hooks:

```text
sections/
  views/
  forms/
  type-icons/
  js/
```

See [`section-authoring.md`](./section-authoring.md) and [`hooks-reference.md`](./hooks-reference.md).

## Next

- Configure runtime keys: [`configuration.md`](./configuration.md)
- Learn component APIs: [`components.md`](./components.md)
- Implement hooks safely: [`hooks-reference.md`](./hooks-reference.md)
