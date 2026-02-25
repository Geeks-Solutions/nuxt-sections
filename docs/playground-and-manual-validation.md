# Playground And Manual Validation

Use the playground to validate behavior that is difficult to assert via tests only (rendering, admin interactions, media flows, hook side effects).

## 1) Prepare Environment Variables

The playground reads these values from `playground/nuxt.config.ts`:

- `NUXT_ENV_SECTIONS_PROJECT_ID`
- `NUXT_ENV_SECTIONS_PROJECT_URL`
- `NUXT_ENV_SECTIONS_ENV`
- `NUXT_ENV_SECTIONS_QUERY_STRING_SUPPORT`
- `NUXT_ENV_SECTIONS_CNAME`
- `NUXT_ENV_SIGNATURE_PACKAGES`

Example shell setup:

```bash
export NUXT_ENV_SECTIONS_PROJECT_ID="your-project-id"
export NUXT_ENV_SECTIONS_PROJECT_URL="https://your-site.example"
export NUXT_ENV_SECTIONS_ENV="testing"
export NUXT_ENV_SECTIONS_QUERY_STRING_SUPPORT="enabled"
export NUXT_ENV_SECTIONS_CNAME=""
```

## 2) Start Playground

```bash
npm run dev:prepare
npm run dev
```

Playground config currently runs HTTPS on host `0.0.0.0` and port `443`.

## 3) Basic Smoke Checks

- Open `/health` and confirm page loads.
- Open any content path and confirm Sections renderer mounts.
- Open `/admin` and confirm redirect to Sections admin login flow.

## 4) Manual Validation Checklist By Change Type

## Section Rendering Changes

- Confirm page loads sections without console/runtime errors.
- Confirm dynamic/configurable section rerender still works.
- Validate `window.SectionsCMS.value.reRenderSection(...)` behavior if touched.

## Hooking Changes

- Add/adjust the relevant hook file under `sections/js` or `sections/forms`.
- Confirm hook is called and fallback behavior still works when hook returns nothing.
- Confirm no SSR/CSR mismatch errors.

## Media Changes

- Open media modal from a form.
- Select media and verify emitted data updates form settings.
- Remove media and verify state cleanup.

## Admin UI Extension Changes

- If using custom builder/theme tabs, verify tab rendering and save/reset flow.
- If using custom sidebar/options injections, verify open/close/back behaviors.

## 5) Browser-Capable AI Agent Workflow

If your AI agent can open webpages:

1. Start playground (`npm run dev:prepare && npm run dev`).
2. Navigate to:
   - `/health`
   - a content page path
   - `/admin`
3. Perform the exact user flow related to the code change.
4. Capture evidence (DOM state, console logs, screenshots if available).
5. Report:
   - what was validated manually
   - what remains unverified by automation/tests

## 6) When To Prefer Playground Over Tests

Use playground validation in addition to tests when:

- behavior depends on runtime hooks
- behavior depends on browser-only APIs
- visual/admin workflows changed
- integrations with `@geeks.solutions/vue-components` changed
