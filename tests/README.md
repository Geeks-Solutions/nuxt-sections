# Test Architecture Overview

## Philosophy

This project uses a **hybrid testing approach** to balance test speed and confidence:

1. **Unit Tests** (fast, isolated) - Test pure functions and utilities
2. **Integration Tests** (slower, comprehensive) - Test Nuxt-specific code with full context

## Key Improvements

### Before

- 401 lines of manual mocks in `tests/setup/imports.mjs`
- Heavy reliance on mocking Nuxt composables
- Tests focused on mock behavior rather than real implementations
- Difficult to maintain (every internal change requires mock updates)

### After

- Minimal mocks (only what's absolutely necessary)
- Real implementations tested wherever possible
- Test structure: `tests/unit/` and `tests/integration/`
- Fast, maintainable tests that actually validate behavior

## Test Structure

```
tests/
├── setup/
│   ├── unit.ts          # Global setup for unit tests
│   └── mocks-app.ts    # Minimal mocks for #app/#imports
├── unit/               # Unit tests (happy-dom, fast)
│   ├── helpers.spec.ts   # Pure function tests
│   └── path-parsing.spec.ts
├── integration/         # Integration tests (Nuxt runtime)
└── fixtures/
    └── basic/           # Nuxt fixture app for integration tests
```

## Configuration

### Unit Tests (`vitest.config.ts`)

- Environment: `happy-dom`
- Purpose: Fast testing of pure functions
- Scripts: `npm run test:unit`

### Integration Tests (`vitest.integration.config.ts`)

- Environment: `nuxt` (via `defineVitestConfig`)
- Purpose: Full Nuxt context testing with real module wiring
- Fixture: `tests/fixtures/basic`
- Scripts: `npm run test:integration`

## Commands

```bash
# Run all tests
npm run test

# Run only unit tests (fast)
npm run test:unit

# Run only integration tests
npm run test:integration

# Watch mode (unit tests)
npm run test:watch

# Coverage report
npm run test:coverage
```

## Testing Guidelines

### Unit Tests

- **Test pure functions** without side effects
- **Use real implementations** when possible
- **Minimal mocking** - only mock external dependencies
- **Focus on behavior**, not implementation details
- **Examples**: `formatName`, `validatePagePath`, `parseQS`

### Integration Tests

- **Test Nuxt-specific code**: plugins, middleware, module config
- **Use @nuxt/test-utils** for proper Nuxt app context
- **Test real module behavior** in Nuxt environment
- **Examples**: Plugin initialization, module configuration

### What to Test

✅ **DO TEST:**

- Pure functions (formatName, parseQS, validatePagePath, etc.)
- Utility functions with clear inputs/outputs
- Plugin behavior with real implementations
- Error handling and edge cases
- Complex logic paths

❌ **DON'T TEST:**

- Third-party library internals
- Simple getters/setters
- Trivial UI components (unless they have complex logic)
- Implementation details that change frequently

### Mocking Strategy

**Use mocks for:**

- External API calls (`fetch`, `$fetch`)
- Browser APIs that aren't available in happy-dom
- Third-party services when testing integration points

**Don't mock:**

- Internal helper functions (test real implementations)
- Simple business logic
- Nuxt composables (unless testing plugin initialization)
- Pure functions

## Coverage

Current target: 80% across lines, functions, branches, statements

Focus coverage on:

- Core business logic in `src/runtime/utils/helpers.ts`
- Plugin behavior
- Middleware logic
- Module configuration

## Adding New Tests

### Adding a Unit Test

```typescript
// tests/unit/your-feature.spec.ts
import { describe, it, expect } from 'vitest'
import { yourFunction } from '../../src/runtime/utils/helpers'

describe('yourFunction', () => {
  it('does something', () => {
    expect(yourFunction('input')).toBe('expected')
  })
})
```

### Adding an Integration Test

```typescript
// tests/integration/plugin.spec.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MyComponent from '../../src/runtime/components/MyComponent.vue'

describe('plugin integration', () => {
  it('tests component in Nuxt context', async () => {
    const wrapper = await mountSuspended(MyComponent)
    expect(wrapper.exists()).toBe(true)
  })
})
```

## Migration Notes

### Old Test Files

Old tests in `src/**/__tests__/` will continue to work but should be migrated to `tests/unit/` over time.

### Mocking Migration

When migrating tests:

1. Remove heavy mocks
2. Test real implementations
3. Only mock external dependencies
4. Focus on behavior, not mocks
