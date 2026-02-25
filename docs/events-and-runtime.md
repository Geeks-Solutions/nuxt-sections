# Events And Runtime

This module exposes multiple runtime surfaces:

- Nuxt app hooks
- Browser `CustomEvent` events
- A small event-bus plugin API
- A global section refresh helper on `window`

## Runtime Flow (High-Level)

1. Route middleware (`i18n-default-locale`) can prefetch page data server-side.
2. `<Sections>` or `<SectionsAdmin>` initializes page metadata, sections, and layout.
3. Hooks from `/sections/js/global-hooks.js` can alter payloads and rendering.
4. Runtime emits Nuxt hooks and browser events for external integrations.

## Nuxt App Hooks

Emitted with `nuxtApp.callHook(...)`.

| Hook                   | Payload                                                 |
| ---------------------- | ------------------------------------------------------- |
| `page_pre_render`      | full page API response object                           |
| `sectionsLoaded`       | `'pageMounted'` or `'pageSaved'`                        |
| `sectionViewRefreshed` | section render response or `{ error }`                  |
| `start-guide`          | `(topic, action)` when guide override flow is triggered |

When you implement `start-guide` override logic, keep runtime guide semantics aligned with core behavior:

- Persist top bar walkthrough completion so edit mode does not auto-show it repeatedly.
- Treat manual relaunch as explicit force behavior only.
- Do not couple onboarding eligibility to `current_pages` for `topBar`.

Listen from app/plugin code:

```ts
const nuxtApp = useNuxtApp()

nuxtApp.hook('sectionsLoaded', (origin) => {
  console.log('Sections loaded from', origin)
})

nuxtApp.hook('sectionViewRefreshed', (payload) => {
  // payload can be success object or { error }
})
```

## Browser Custom Events

Dispatched on `window`:

- `page_payload_preprocess`
  - Detail payload: sections payload right before rendering.
- `page_payload_postprocess`
  - Detail payload: `document.documentElement.outerHTML` after render lifecycle.

Usage:

```ts
window.addEventListener('page_payload_preprocess', (event: Event) => {
  const detail = (event as CustomEvent).detail
})
```

## Plugin Event Bus

`src/runtime/plugin.ts` provides:

- `nuxtApp.$event(type, payload)`
- `nuxtApp.$eventAsync(type, payload)`
- `nuxtApp.$listen(type, handler)` (returns unsubscribe function)

Example:

```ts
const { $listen, $event } = useNuxtApp()

const unsubscribe = $listen('my-topic', (payload) => {
  // handle payload
})

$event('my-topic', { ok: true })
unsubscribe()
```

## Global Refresh API

`<Sections>` initializes:

```ts
window.SectionsCMS.value.reRenderSection(payload)
```

Payload examples:

```ts
window.SectionsCMS.value.reRenderSection({
  qs: {
    offset: 12,
  },
})

window.SectionsCMS.value.reRenderSection({
  sections: [
    {
      name: '60df8a48d66ef20008f8e03a:categories_articles',
      qs: {
        categories_titles: ['News'],
      },
      options: [{ article_page_path: 'custom/path' }],
    },
  ],
  qs: {
    language: 'en',
  },
})
```

## Dependency Injection Provided By Sections Runtime

Inside Sections/Admin runtime, the following providers are used and can be consumed by child components:

- `languageSupport(sectionName)`
- `loadScript(src, uniqueness)`
- `sectionsThemeComponents(sectionName, themeComponents)` (admin)
- `nuxtApp.$sideBarComponent` (admin UI control)
- `nuxtApp.$sectionsOptionsComponent` (admin top bar options injection)

Use these as advanced integration points when extending the admin experience.
