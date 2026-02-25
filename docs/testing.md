# Testing

This repository uses a hybrid testing strategy:

- unit tests for pure logic
- integration tests for Nuxt runtime behavior
- type checks for TS/Vue contracts

There is currently no dedicated e2e runner configured in `package.json`.

## Commands

```bash
# Lint and formatting
npm run lint
npm run format

# Type checks
npm run test:types

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# All tests
npm run test

# Watch mode (unit)
npm run test:watch

# Coverage
npm run test:coverage
```

## Single Test Execution

```bash
# Specific file
vitest run --config vitest.config.ts tests/unit/helpers.spec.ts

# Pattern
vitest run --config vitest.config.ts --pattern "media-transformer"
```

## Test Layout

```text
tests/
  setup/
  unit/
  integration/
  fixtures/
```

- `tests/unit`: isolated utility and logic tests
- `tests/integration`: Nuxt runtime integration tests (`@nuxt/test-utils`)
- `tests/fixtures/basic`: fixture app for integration scenarios

## Recommended Command Matrix

| Change Type                   | Minimum Verification                                 |
| ----------------------------- | ---------------------------------------------------- |
| docs only                     | optional quick `npm run lint`                        |
| helper function logic         | `npm run test:unit`                                  |
| middleware/plugin behavior    | `npm run test:integration`                           |
| Nuxt runtime/component wiring | `npm run test:integration` + manual playground check |
| broad runtime changes         | `npm run test` + `npm run test:types`                |

## About E2E

No e2e script is currently defined.

When e2e-level confidence is needed today, use the playground manual/browser validation flow:

- [`playground-and-manual-validation.md`](./playground-and-manual-validation.md)

If you add e2e in the future, add a dedicated `tests/e2e` folder and explicit scripts in `package.json`.
