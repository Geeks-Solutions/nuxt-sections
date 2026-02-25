# Components

This module auto-registers components from `src/runtime/components`.

For consumers, the primary component is `<Sections>`. Media helpers are also exposed and useful when building custom forms.

## `<Sections>`

Main renderer component used by the catch-all page and by custom pages.

### Key Props

| Prop                 | Type      | Default         | Purpose                                |
| -------------------- | --------- | --------------- | -------------------------------------- |
| `page-name`          | `string`  | `''`            | Target page path/name in Sections      |
| `admin`              | `boolean` | `false`         | Enables admin/edit UI if authenticated |
| `lang`               | `string`  | `'en'`          | Current locale                         |
| `variations`         | `array`   | `[]`            | Variation metadata                     |
| `views-bg-color`     | `string`  | `'transparent'` | Background color for section wrappers  |
| `sections-page-data` | `object`  | `undefined`     | Optional prefetched page payload       |

Advanced/internal props also exist (`headers`, `reactive-trigger`, `editor-options`, `_sections-options`).

### Emits

- `load`: emitted during the load cycle (used as a host-page integration hook)

### Example

```vue
<template>
  <Sections :admin="admin" :page-name="pageName" :lang="locale" :variations="[]" @load="onLoad" />
</template>

<script setup lang="ts">
import { computed, useCookie } from '#imports'

const pageName = 'home'
const locale = 'en'
const admin = computed(() => Boolean(useCookie('sections-auth-token').value))

function onLoad(_value: unknown) {}
</script>
```

## `<LazyMediasUploadMedia>`

Small media picker/preview UI used in section forms.

### Props

- `media-label` (`string`)
- `upload-text` (`string`)
- `change-text` (`string`)
- `seo-tag` (`string`)
- `is-document` (`boolean`)
- `media` (`array`)

### Emits

- `upload-container-clicked`
- `remove-uploaded-image`

## `<LazyMediasMediaComponent>`

Media modal wrapper around `gMedia` from `@geeks.solutions/vue-components`.

### Props

- `sections-user-id` (`string`)

### Emits

- `emitted-media` (selected media payload)

### Exposed Methods

- `openModal(mediaId?: string, category?: string)`
- `closeModal()`

### Example Integration In A Custom Form

```vue
<template>
  <LazyMediasUploadMedia
    :media="settings[0].media"
    :media-label="'Media'"
    :upload-text="'Upload'"
    :change-text="'Change'"
    :seo-tag="'SEO tag: '"
    @upload-container-clicked="openMediaModal"
    @remove-uploaded-image="removeMedia"
  />

  <LazyMediasMediaComponent ref="mediaModal" @emitted-media="onMediaSelected" />
</template>

<script setup lang="ts">
import { ref } from '#imports'

const mediaModal = ref<any>(null)
const settings = ref([{ media: [] as any[] }])

function openMediaModal() {
  const current = settings.value[0]?.media?.[0]?.media_id
  mediaModal.value?.openModal(current, 'image')
}

function removeMedia() {
  settings.value[0].media = []
}

function onMediaSelected(mediaObject: any) {
  settings.value[0].media = [
    {
      media_id: mediaObject.id,
      url: mediaObject.files?.[0]?.url || '',
      seo_tag: mediaObject.seo_tag || '',
      files: mediaObject.files || [],
    },
  ]
  mediaModal.value?.closeModal()
}
</script>
```

## Global Runtime APIs Exposed To Consumers

- `window.SectionsCMS.value.reRenderSection(payload)` for dynamic/configurable section refreshes
- Nuxt app hooks (`sectionsLoaded`, `sectionViewRefreshed`, `start-guide`, `page_pre_render`)
- Plugin event bus helpers: `nuxtApp.$event`, `nuxtApp.$eventAsync`, `nuxtApp.$listen`

See [`events-and-runtime.md`](./events-and-runtime.md) for signatures and examples.
