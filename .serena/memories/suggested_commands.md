# Commands

- Setup: nvm use, npm ci. Preparation: npm run dev:prepare.
- Library build: npm run prepack. Playground: npm run dev; production playground: npm run dev:build.
- Focus file: npm run test:unit -- tests/unit/<file>.spec.ts; integration equivalent: npm run test:integration -- tests/integration/<file>.spec.ts. Names: -t "test name", not --pattern.
- npm run test runs unit then integration; test:watch and test:coverage are unit-only.
- npm run test:types checks root then playground; npm run lint uses ESLint flat config.
- npx prettier --check <files>; npm run format rewrites the entire repo.
- Playground uses HTTPS port 443; CMS env prerequisites: docs/playground-and-manual-validation.md.
- bw prime at session start/resume; bw ready, bw show <id>, bw comment <id> "..." for persistent task context. bw sync performs network fetch/replay/push.
