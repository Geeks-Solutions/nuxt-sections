# Hooks Reference

This document lists all hook extension points currently used by runtime code.

## Hook Loader Rules

- Hook files are loaded from `/sections/**` using a JS glob.
- Use `.js` files (not `.ts`) for hook entry points.
- Every hook is optional.
- If a hook throws, runtime generally falls back to default behavior.

## File: `sections/js/global-hooks.js`

Main global extension file used across page rendering, API calls, media workflows, and admin UX.

```js
// sections/js/global-hooks.js
export const page_pre_load = (payload) => payload
```

### Page and Render Lifecycle

| Hook                                    | Signature                                                                     | Return Contract                                                    |
| --------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `init_params`                           | `(sectionsConfig, { qs, headers, reqBody, url })`                             | return updated config object to replace `nuxtApp.$sections`        |
| `page_pre_load`                         | `(payload)`                                                                   | return updated request payload object                              |
| `page_pre_render`                       | `(pageData, sectionsOrRegions, websiteDomain, sectionsConfig, runtimeConfig)` | return altered sections/regions payload, or falsy to keep original |
| `section_pre_render`                    | `({ sectionName, sectionType })`                                              | return component path/object to override resolved view             |
| `section_page_initialization_completed` | `(res, i18n, useCookie, route)`                                               | side-effect hook after page initialization                         |
| `fetch_on_server`                       | `(useCookie)`                                                                 | return `boolean`; `false` disables SSR fetching                    |
| `localize_on_csr`                       | `(useCookie)`                                                                 | return `boolean`; controls CSR locale reset behavior               |
| `reload_page_on_path_update`            | `(useCookie)`                                                                 | return `boolean` for admin path-update reload behavior             |
| `refetch_client_side`                   | `(useCookie)`                                                                 | return `boolean`; controls admin-side client refetch               |
| `clear_cookies`                         | `(useCookie)`                                                                 | custom cookie cleanup hook when runtime logs out/clears cookies    |
| `pre_open_edit_mode`                    | `(useCookie)`                                                                 | return `true` to prevent opening edit mode                         |
| `available_locales`                     | `()`                                                                          | return array of locale codes for path abstraction logic            |
| `update_section_name`                   | `(name)`                                                                      | return transformed section name string                             |

### API Request Pipeline

| Hook                | Signature                                                   | Return Contract                                                           |
| ------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------- |
| `api_pre_request`   | `async ($nuxt, method, url, body, options)`                 | return `{ url, body, apiOff }`; set `apiOff: true` to bypass native fetch |
| `api_calls_traffic` | `async ($nuxt, method, url, body, options)`                 | required when `apiOff` is true; return response-like object               |
| `api_post_request`  | `async ($nuxt, method, url, body, options, res, onSuccess)` | return transformed response object                                        |
| `api_request_error` | `($nuxt, method, url, body, error, options)`                | return custom handled value or throw                                      |

### Media Pipeline

| Hook                           | Signature                                           | Return Contract                                                             |
| ------------------------------ | --------------------------------------------------- | --------------------------------------------------------------------------- |
| `medias_api_url`               | `(useCookie, projectId, stringUrl)`                 | return object URLs for media modal, or string URL when `stringUrl === true` |
| `medias_api_request_received`  | `async (useCookie, method, url, payload)`           | return custom pre-request decision/data                                     |
| `medias_api_response_received` | `async (useCookie, method, url, payload, response)` | return transformed response                                                 |
| `medias_api_error_received`    | `(useCookie, error)`                                | return custom media error payload/message                                   |
| `media_transform`              | `async (url)`                                       | return transformed media URL (used via DI provider)                         |
| `supported_media_types`        | `()`                                                | return accepted file types string (ex: `'.jpg,.webp'`)                      |
| `wysiwyg_font_families`        | `(nuxtApp)`                                         | return array of font family definitions                                     |

### Guide and Theme UI

| Hook                                | Signature | Return Contract                                    |
| ----------------------------------- | --------- | -------------------------------------------------- |
| `guide_config`                      | `()`      | return `{ disabled, autoStart, override }`         |
| `library_sections_theme_components` | `(t)`     | return array: `[{ sectionName, themeComponents }]` |

## File: `sections/js/hooks.js`

Used only by the default dynamic catch-all page (`src/runtime/pages/[...pathMatch].vue`).

```js
// sections/js/hooks.js
export const created = () => {}
export const mounted = () => {}
```

Supported hooks:

- `created()`
- `mounted()`

`fetch` is not currently invoked from this file in runtime.

## File: `sections/js/configurable-hooks.js`

Hooks for configurable section forms.

```js
// sections/js/configurable-hooks.js
export const mounted = () => {}
export const updateFieldLabel = (field) => field.name
export const configurable_pre_render = (options, defaultLang, locales, props) => options
```

Supported hooks:

- `mounted()`
  - Called after configurable form mount.
- `updateFieldLabel(field)`
  - Return label string override.
- `configurable_pre_render(options, defaultLang, locales, props)`
  - Return altered options array before render.

## File: `sections/forms/<section-name>_hooks.js`

Per-section hooks loaded next to forms.

```js
// sections/forms/full_article_hooks.js
export const seo_management = (section, locale) => ({
  title: '',
  description: '',
  image: '',
})
```

Supported hooks:

- `seo_management(section, locale)`
  - Return SEO overrides `{ title, description, image }`.

## File: `sections/builder/settings/builder-hooks.js`

Hooks for custom builder tabs in metadata/settings sidebar.

```js
// sections/builder/settings/builder-hooks.js
export const initialize_builder_settings = (originalBuilderSettings, useHead, currentTab) => {}
export const handle_unsaved_settings = (isEqual, originalBuilderSettings, updated, tab) => false
export const builder_settings_payload = (originalBuilderSettings, settings, currentTab) => ({})
export const update_tab_title = (tab) => tab
export const reset_builder_settings = (originalBuilderSettings, tab) => ({})
```

Supported hooks:

- `initialize_builder_settings(originalBuilderSettings, useHead, currentSettingsTab)`
- `handle_unsaved_settings(isEqual, originalBuilderSettings, updatedSettings, tab)`
- `builder_settings_payload(originalBuilderSettings, settings, currentSettingsTab)`
- `update_tab_title(tab)`
- `reset_builder_settings(originalBuilderSettings, tab)`

## File: `sections/theme/theme-hooks.js`

Hooks for per-section theme settings tabs.

```js
// sections/theme/theme-hooks.js
export const initialize_theme_settings = (originalThemeSettings, useHead) => {}
export const section_removed = (originalThemeSettings, removedSectionId) => originalThemeSettings
export const handle_unsaved_settings = (
  isEqual,
  originalThemeSettings,
  currentTheme,
  tab,
  section
) => false
export const theme_settings_payload = (originalThemeSettings, settings, tabId, section) => ({})
export const reset_theme_settings = (originalThemeSettings, section, tabId) => ({})
```

Supported hooks:

- `initialize_theme_settings(originalThemeSettings, useHead)`
- `section_removed(originalThemeSettings, removedSectionId)`
- `handle_unsaved_settings(isEqual, originalThemeSettings, currentTheme, tab, section)`
- `theme_settings_payload(originalThemeSettings, settings, tabId, section)`
- `reset_theme_settings(originalThemeSettings, section, tabId)`

## Practical Tips

- Keep hooks pure where possible and return serializable data.
- `api_pre_request` should always return `{ url, body, apiOff }` when implemented.
- If you turn requests off with `apiOff: true`, you must implement `api_calls_traffic`.
- Keep media hooks tolerant of missing fields; runtime swallows many hook errors and falls back.
