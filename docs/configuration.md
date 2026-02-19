# Configuration Reference

Runtime behavior is driven by `runtimeConfig.public.sections`.

## Runtime Config Keys

| Key                    | Required                          | Type               | Example                      | Behavior                                                             |
| ---------------------- | --------------------------------- | ------------------ | ---------------------------- | -------------------------------------------------------------------- |
| `projectId`            | Yes (unless `cname === 'active'`) | `string`           | `'62ff7827628cfa00099de9e1'` | Project identity for API calls                                       |
| `projectUrl`           | Recommended                       | `string`           | `'https://my-site.com'`      | Used as project URL context in some requests                         |
| `environment`          | Optional                          | `string`           | `'testing'`                  | `'testing'` uses testing API base URL, anything else uses production |
| `queryStringSupport`   | Optional                          | `string`           | `'enabled'`                  | Enables query string payload parsing for section render calls        |
| `projectLocales`       | Optional                          | `string`           | `'en,fr,it'`                 | Comma-separated locales used by sections localization helpers        |
| `wysiwygEditorOptions` | Optional                          | `object`           | `{}`                         | Wysiwyg editor options passed through runtime config                 |
| `cname`                | Optional                          | `string`           | `'active'`                   | When `'active'`, project identity can resolve from current hostname  |
| `cssPreset`            | Optional                          | `string \| object` | `''`                         | CSS preset metadata passthrough used by renderer/admin               |

## Example `nuxt.config.ts`

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
        wysiwygEditorOptions: {},
        cname: process.env.NUXT_ENV_SECTIONS_CNAME,
        cssPreset: process.env.NUXT_ENV_SECTIONS_CSS_PRESET,
      },
    },
  },
})
```

## Module Behavior Notes

- `@pinia/nuxt` is auto-added if missing.
- `@nuxtjs/i18n` is installed by the module.
- `@geeks.solutions/vue-components` is installed by the module.
- Catch-all and admin/health routes are always injected.

## Environment URL Mapping

- `environment === 'testing'` -> `https://api.sections-saas.k8s-dev.geeks.solutions/api/v1`
- otherwise -> `https://sections.geeks.solutions/api/v1`

## About `sections-cms` Module Options

The module metadata key is `sections-cms`, but runtime requests and plugin behavior currently read from
`runtimeConfig.public.sections`.

For implementation details, see `src/module.ts` and `src/runtime/plugin.ts`.
