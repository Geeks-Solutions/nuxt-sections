# Toolchain boundaries

- Node pinned by .nvmrc (22.16.0); npm lockfiles at root and playground, no npm workspace declaration. Use nvm use.
- Nuxt 3 module with Vue SFCs and TypeScript; Serena uses Vue and TypeScript language servers.
- Package exports target generated dist; module-builder produces it. Playground loads ../src/module directly.
- Root/playground tsconfigs depend on generated .nuxt types. dev:prepare builds module stubs and prepares types.
- Vitest has separate happy-dom unit and Nuxt integration configs; fixture loads src/module. Unit #app/#imports are mocked, so unit success does not validate Nuxt injection.
