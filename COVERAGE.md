# Test Coverage

This library uses [Vitest](https://vitest.dev/) for testing with coverage reporting.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Coverage Reports

Coverage reports are generated in multiple formats:
- **HTML**: Open `coverage/index.html` in your browser for an interactive report
- **LCOV**: `coverage/lcov.info` for CI/CD integration (Codecov, Coveralls, etc.)
- **JSON Summary**: `coverage/coverage-summary.json` for programmatic access
- **Text**: Printed to console during test runs

## Coverage Thresholds

The project maintains the following coverage thresholds:
- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 80%
- **Statements**: 80%

## GitHub Integration

Coverage reports are automatically generated on:
- Push to `main`, `master`, or `develop` branches
- Pull requests to these branches

Coverage data is uploaded to [Codecov](https://codecov.io/) and PR comments show coverage changes.

## Configuration

Coverage configuration is in [`vitest.config.ts`](./vitest.config.ts):
- **Provider**: V8 (fast, accurate)
- **Included**: All files in `src/**/*.{js,ts,vue}`
- **Excluded**: Tests, config files, playground, node_modules

## Badge

Add this badge to your README to show coverage status:

```markdown
[![codecov](https://codecov.io/gh/YOUR_ORG/nuxt-sections/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_ORG/nuxt-sections)
```
