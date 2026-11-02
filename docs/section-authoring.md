# Section Authoring

Custom sections and overrides are discovered from a root-level `/sections` directory in your host Nuxt app.

## Directory Layout

```text
sections/
  views/
    <section-name>_<type>.vue
  forms/
    <section-name>.vue
    <section-name>_hooks.js
  type-icons/
    <section-name>.vue

  js/
    global-hooks.js
    hooks.js
    configurable-hooks.js

  layouts/
    <layout-name>.vue
  configurable_components/
    <field-type>_<field-key>.vue
  page_components/
    page_not_found.vue
    project_not_found.vue
  builder/
    settings/
      <tab-id>.vue
      builder-hooks.js
  theme/
    theme-hooks.js
```

All hook files are loaded through a JS glob and must be `.js` files.

## Naming Rules

### `views`

- Naming convention: `<section-name>_<type>.vue`
- `<type>` is one of `static`, `dynamic`, `local`, `configurable`
- The runtime resolves section names by stripping namespace and variant suffixes before lookup.

Examples:

- `hero_static.vue`
- `news_feed_dynamic.vue`

### `forms`

- Naming convention: `<section-name>.vue`
- Used when creating/editing section settings in admin mode.

### `type-icons`

- Naming convention: `<section-name>.vue`
- Icon shown in "add section" lists.

## Required Contract For Custom Form Components

When your form is used by static/local/configurable wrappers, the parent accesses form instance fields and methods.

Expose these from `<script setup>` with `defineExpose`:

- `settings` (required)
- `private_data` (optional)
- `validate()` (optional, should return `boolean`)

Example:

```vue
<script setup lang="ts">
import { ref } from '#imports'

const settings = ref([
  {
    title: { en: '', fr: '' },
    media: [],
  },
])

const private_data = ref({})

function validate() {
  return Boolean(settings.value[0].title.en)
}

defineExpose({ settings, private_data, validate })
</script>
```

## Register A New Static Section Type

Use the auto-imported helper in app code:

```ts
import { addNewStaticType } from '#imports'

await addNewStaticType('hero_banner')
```

Then provide matching files under `/sections/views`, `/sections/forms`, and optionally `/sections/type-icons`.

## Configurable Field Overrides

To override/add a configurable field component, add:

```text
sections/configurable_components/<field-type>_<field-key>.vue
```

Example: `sections/configurable_components/string_cta_label.vue`

## Custom Layouts

Layout files go in `sections/layouts`. A layout component must define a `slotNames` prop with an array default.

Minimal example:

```vue
<template>
  <div>
    <slot name="top" />
    <slot name="left" />
    <slot name="right" />
  </div>
</template>

<script setup>
defineProps({
  slotNames: {
    type: Array,
    default() {
      return ['top', 'left', 'right']
    },
  },
})
</script>
```

## Custom Error Pages

Runtime resolves these from `sections/page_components` when needed:

- `page_not_found.vue`
- `project_not_found.vue`

## Optional Preview Structure

For section preview generation, your view can expose a `viewStructure` prop describing settings shape using data types (`wysiwyg`, `html`, `integer`, `number`, `image`, `string`, `text`, `boolean`).

## Next

Use [`hooks-reference.md`](./hooks-reference.md) for all hook signatures and file locations.
