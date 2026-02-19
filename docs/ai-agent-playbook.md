# AI Agent Playbook

This guide is for coding agents modifying this repository.

Goal: make safe, accurate changes to the Nuxt module and runtime, with predictable validation.

## Start Here (Fast Decision Tree)

- Need to change runtime fetch/transform logic -> `src/runtime/utils/helpers.ts`
- Need to change module registration/routes/imports -> `src/module.ts`
- Need to change plugin injections/config object -> `src/runtime/plugin.ts`
- Need to change page rendering/admin behaviors -> `src/runtime/components/Sections/index.vue` or `src/runtime/components/Sections/admin.vue`
- Need to update hook contracts/docs -> `docs/hooks-reference.md` and relevant runtime call sites

## Repository Map (Important Paths)

- Module entry: `src/module.ts`
- Runtime plugin: `src/runtime/plugin.ts`
- Middleware: `src/runtime/middleware/i18n-default-locale.ts`
- Main renderer: `src/runtime/components/Sections/index.vue`
- Admin renderer: `src/runtime/components/Sections/admin.vue`
- Shared helpers: `src/runtime/utils/helpers.ts`
- Runtime pages: `src/runtime/pages/`
- Unit tests: `tests/unit/`
- Integration tests: `tests/integration/`
- Integration fixture: `tests/fixtures/basic/`
- Playground app: `playground/`

## Key Dependencies And Why They Exist

- `@nuxt/kit`
  - Module authoring (`defineNuxtModule`, route/component/import registration).
- `@nuxtjs/i18n`
  - Locale handling for sections rendering and middleware behavior.
- `@pinia/nuxt`
  - Store used for SSR/CSR page data handoff (`sectionsDataStore`).
- `@geeks.solutions/vue-components`
  - Shared UI/runtime components (`gMedia`, viewers, etc.).
- `@marshallswain/vuedraggable`
  - Drag/drop ordering in sections admin UI.
- `vue-toastification`
  - Toast notifications.
- `intro.js`
  - Guided tour support (including override flow via `start-guide`).

If changing behavior tied to one dependency, search for direct runtime usage before editing docs.

## Invariants To Preserve

- Keep Nuxt 3 `<script setup>` conventions in runtime Vue files.
- Keep hook paths and names stable unless intentionally versioned.
- Keep fallback behavior when hooks are absent or throw.
- Do not introduce old import paths like `@geeks.solutions/nuxt-sections/lib/src/...`.
- If adding new hook support, document exact signature and return contract.

## Hook File Rules (Critical)

- Hook loader resolves JS from `/sections/**/!(*.spec).js`.
- Hook files must be `.js`.
- Main global hook file is `sections/js/global-hooks.js`.
- Per-section SEO hook file format is `sections/forms/<section-name>_hooks.js`.

When adding a new hook:

1. Add guarded runtime invocation (`try/catch` + fallback).
2. Update `docs/hooks-reference.md`.
3. Add/adjust tests if behavior is logic-testable.

## Change Recipes

## 1) Add A New Runtime Helper

1. Implement in `src/runtime/utils/helpers.ts`.
2. Export through `addImports` in `src/module.ts` if it must be auto-importable.
3. Add unit tests in `tests/unit/`.
4. Update docs if helper is public.

## 2) Add Or Modify A Hook Invocation

1. Implement invocation where behavior belongs (middleware/component/helper).
2. Keep default behavior identical when hook is missing.
3. If hook can alter payload, validate serializability where needed.
4. Update `docs/hooks-reference.md` with signature and return expectations.

## 3) Add A New Admin Extension Surface

1. Add DI/API in `Sections/admin.vue` (or related runtime component).
2. Ensure no break in existing flow when extension not used.
3. Document in `docs/events-and-runtime.md` and this playbook.

## 4) Modify Sections Rendering

1. Update `Sections/index.vue`.
2. Verify compatibility with:
   - `page_pre_render`
   - `section_pre_render`
   - `window.SectionsCMS.value.reRenderSection`
3. Run integration tests and manual playground flow.

## Testing Strategy For Agents

Run the narrowest useful verification first, then expand if needed.

### Commands

```bash
npm run lint
npm run test:unit
npm run test:integration
npm run test:types
npm run test
```

### What To Run By Change Type

- Helper-only logic change -> `npm run test:unit`
- Middleware/plugin/component wiring -> `npm run test:integration`
- Broad runtime or API changes -> `npm run test` and `npm run test:types`

There is no dedicated e2e script in this repo. For e2e-like confidence, use playground validation.

## Playground Validation For Agents

1. Set required env vars used by `playground/nuxt.config.ts`.
2. Run:

```bash
npm run dev:prepare
npm run dev
```

3. Validate target flows in browser:
   - `/health`
   - content route rendering
   - `/admin` redirect and edit-related flows

If browser automation is available, capture evidence (DOM assertions, screenshots, logs).

## Common Pitfalls

- Documenting a hook under the wrong file (most hooks are in `sections/js/global-hooks.js`).
- Assuming `sections/js/hooks.js` supports `fetch` (runtime currently calls only `created` and `mounted`).
- Forgetting that configurable field overrides use `<type>_<key>` naming.
- Breaking catch-all route assumptions when changing route behavior.
- Updating docs with stale APIs/imports.

## Done Checklist

- Code change is consistent with existing runtime conventions.
- Relevant tests pass.
- Playground/manual validation performed for runtime UX behavior.
- Docs updated for any public behavior surface changes.
