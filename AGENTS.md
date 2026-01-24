# Agent Guidelines for @geeks.solutions/nuxt-sections

This repository contains a Nuxt 3 module for the Sections CMS. Follow these guidelines when contributing.

## Build/Lint/Test Commands

### Development

- `npm run dev` - Start development server (runs playground)
- `npm run dev:build` - Build playground for production
- `npm run dev:prepare` - Build stub module and prepare playground

### Code Quality

- `npm run lint` - Run ESLint on the codebase
- `npm run format` - Format code with Prettier
- `npm run test:types` - Run TypeScript type checking (vue-tsc)

### Testing

- `npm run test` - Run all tests (unit + integration)
- `npm run test:unit` - Run unit tests (happy-dom, fast)
- `npm run test:integration` - Run integration tests (@nuxt/test-utils)
- `npm run test:watch` - Run tests in watch mode (unit tests only)
- `npm run test:coverage` - Run tests with coverage report (thresholds: 80%)

**Run a single test:**

```bash
# Run specific unit test file
vitest run --config vitest.config.ts path/to/test.spec.ts

# Run tests matching pattern
vitest run --config vitest.config.ts --pattern "media-transformer"
```

## Code Style Guidelines

### Formatting (Prettier)

- **No semicolons**
- Single quotes only
- 2-space indentation (tabs: 2)
- ES5 trailing commas
- 100 character line width

### ESLint Rules

- `no-console` and `no-debugger` are errors
- `@typescript-eslint/no-explicit-any` is disabled
- `@typescript-eslint/no-unused-vars` is disabled
- `vue/multi-word-component-names` is disabled
- `vue/no-v-html` is allowed

**Critical:** Multiline v-on handlers are only allowed when containing a single statement. Move complex logic to methods to avoid build crashes.

### Vue Components

- Use `<script setup>` syntax exclusively
- Use Composition API with imports from `#imports`
- Define props with `defineProps({ prop: { type, default } })`
- Define emits with `defineEmits(['event1', 'event2'])`
- Use `ref()` for reactive primitives, `computed()` for derived values
- Use async/await for async operations
- Import composables from `#app` or `#imports`
- Use `@ts-ignore` sparingly when needed for type bypasses

### TypeScript

- Type checking is minimal (explicit any allowed)
- Define interfaces for module options (e.g., `ModuleOptions`)
- Use type annotations in `src/` but avoid over-typing runtime code
- Type check with `npm run test:types` before committing

### Naming Conventions

- **Component files:** PascalCase (e.g., `MediaViewer.vue`, `wysiwyg_static.vue`)
- **Type component files:** PascalCase based on type (e.g., `Static.vue`, `Dynamic.vue`, `Configurable.vue`)
- **Helper components:** PascalCase in CamelCase dirs (e.g., `base/icons/upload.vue`, `base/SubTypes/sectionItem.vue`)
- **Utility files:** lowercase with hyphens for shared utils
- **Config components:** Organized in subdirectories (e.g., `configs/views/`, `configs/forms/`, `configs/type-icons/`)
- **Icons:** lowercase (e.g., `upload.vue`, `save.vue`)
- **Test files:** `.spec.ts` suffix in `__tests__/` subdirectories
- **Functions:** camelCase (e.g., `formatName`, `importComp`, `renderPageData`)

### File Structure

- `src/module.ts` - Nuxt module definition
- `src/runtime/components/` - Vue components (auto-registered)
- `src/runtime/plugins/` - Nuxt plugins
- `src/runtime/utils/` - Helper functions (auto-imported)
- `src/runtime/middleware/` - Route middleware
- `src/runtime/pages/` - Custom pages
- `tests/setup/unit.ts` - Global setup for unit tests
- `tests/unit/` - Unit tests (happy-dom, pure functions, isolated logic)
- `tests/integration/` - Integration tests (@nuxt/test-utils, plugins, module config)

### Testing

- Framework: Vitest with hybrid testing approach
- Unit Tests: happy-dom for fast, isolated testing of pure functions
- Integration Tests: @nuxt/test-utils for plugins, modules, and components with full Nuxt context
- Use `vi.mock()` for mocking when necessary (prefer testing real implementations)
- Use `vi.fn()` for spy/mock functions
- Write descriptive test names
- Coverage target: 80% across lines, functions, branches, statements

**Testing Philosophy:**

- Test real implementations whenever possible
- Minimize mocking - only mock what absolutely needs to be mocked
- Unit tests for pure functions and utilities
- Integration tests for Nuxt-specific code (plugins, middleware, components)

### Imports

- Import Nuxt composables from `#app` or `#imports`
- Import local modules with relative paths from current file
- Use `import.meta.glob()` for dynamic imports
- Import Vue utilities like `defineAsyncComponent` from 'vue'

### Error Handling

- Wrap API calls in try-catch blocks
- Return error objects: `{ data, success: boolean, error: any }`
- Use `console.warn()` for non-critical issues (no-console rule can be overridden)
- Handle missing data gracefully (empty strings, empty arrays, null checks)

### Module Development

- Extend pages with `extendPages()` helper from `@nuxt/kit`
- Register components with `addComponentsDir()`
- Auto-import utilities with `addImports()`
- Use `createResolver(import.meta.url)` for file paths
- Hook into vite config for optimization when needed

### Important Notes

- The module auto-registers `@pinia/nuxt` and `@nuxtjs/i18n` if not present
- Component paths use `/sections/**/*.vue` pattern for dynamic loading
- Support for query strings must be enabled via config (not default)
- The module provides a `/health` endpoint for health checks
- Always test in playground (`npm run dev`) before committing changes
