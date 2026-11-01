# @geeks.solutions/nuxt-sections

## Agent tooling

- Serena configuration is in `.serena/project.yml` (Vue and TypeScript). Start with `mem:core`;
  keep memories focused on durable discoveries. Cache and local overrides are gitignored.
  Run `serena memories check` after changing memory references.
- Run `bw prime` when starting or resuming work. Beadwork stores issues on the separate
  `beadwork` branch with prefix `nuxt-sections`; use `bw ready` to find unblocked work and
  `bw show <id>` for context. Record progress with `bw comment <id> "..."`.
- For tracked work, use `bw start <id>` and `bw close <id>` to maintain status.
  `bw sync` fetches/replays/pushes issue storage; it is not a local-only save.

## Setup and verification

- Use `nvm use` before Node commands (`.nvmrc`: 22.16.0; CI uses Node 22), then `npm ci`.
- Run `npm run dev:prepare` before development: it builds module stubs and prepares Nuxt types,
  including the playground. Root and playground tsconfigs extend generated `.nuxt/tsconfig.json`.
- `npm run prepack` builds the published library into `dist/`; `npm run dev:build` builds the
  playground. Package exports point to `dist/`.
- `npm run test:types` checks both the root and playground. Run it before committing code changes.
- CI runs `npx prettier --check .`, `npm run lint`, then `npm run test`.
  Release on pushes to `main`/`master` depends on that checks job and does not rerun tests.
  `npm run format` rewrites the whole repository;
  use `npx prettier --write <files>` for focused formatting.

## Tests

- `npm run test` runs unit tests followed by integration tests, with separate Vitest configs.
- Focus a file with `npm run test:unit -- tests/unit/<file>.spec.ts` or
  `npm run test:integration -- tests/integration/<file>.spec.ts`.
  Filter test names with `npm run test:unit -- -t "test name"` (not `--pattern`).
- Unit tests use happy-dom; `#app` and `#imports` resolve to `tests/setup/mocks-app.ts`, with
  additional mocks in `tests/setup/unit.ts`. They do not exercise real Nuxt injection behavior.
- Integration tests use the Nuxt environment and `tests/fixtures/basic` app, which loads
  `src/module.ts`; shared stubs and console filters live in `tests/setup/integration.ts`.
- `npm run test:watch` and `npm run test:coverage` are unit-only. Coverage thresholds are 80%
  for lines, functions, branches, and statements.

## Runtime wiring

- `src/module.ts` registers routes, components, middleware, plugins, and explicit `addImports`
  entries. Exporting a new helper from `src/runtime/utils/helpers.ts` alone does not auto-import it.
- Runtime config under `runtimeConfig.public.sections` becomes `$sections` in
  `src/runtime/plugin.ts`. This plugin is separate from `src/runtime/plugins/media-transformer.ts`.
- The module adds a catch-all renderer, `/admin`, `/health`, and prefixed admin/health routes.
  Main rendering and editing logic lives in `src/runtime/components/Sections/index.vue` and
  `admin.vue`; preserve the route registration contract when changing routing.
- Helpers discover host-app components via `/sections/**/*.vue` and eagerly load JavaScript
  hooks under `/sections/`. These paths refer to the consuming app, not this module's components.
- Query-string support requires the literal value `'enabled'`, not a boolean.

## Repo-specific constraints

- `eslint.config.mjs` is the ESLint 9 configuration; do not treat the legacy `.eslintrc` as active.
- Move multi-statement event logic into methods. The local `no-multiline-v-on` rule prevents
  multiline handler build crashes with `unplugin-vue-i18n`; single-expression handlers and arrow
  functions are allowed.
- Root and playground configs disable Nuxt auto-imports; import composables explicitly.
- Before committing runtime/UI changes, validate the affected flow in the playground:
  `npm run dev:prepare`, then `npm run dev`. It defaults to HTTPS on `0.0.0.0:443`, not port 3000.
  Required CMS environment variables and smoke checks are in
  [playground validation](docs/playground-and-manual-validation.md).
- Consult [testing](docs/testing.md), [hook contracts](docs/hooks-reference.md), and the
  [agent playbook](docs/ai-agent-playbook.md) for detailed workflows; verify contracts at call sites.
- Releases on `main`/`master` use semantic-release with Conventional Commits; it updates the
  changelog, package version, and lockfile automatically.
