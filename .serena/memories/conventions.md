# Non-default constraints

- ESLint 9 uses eslint.config.mjs, not legacy .eslintrc. Local no-multiline-v-on rule guards unplugin-vue-i18n build crashes: move multi-statement handlers to methods; single-expression and arrow handlers are exceptions.
- Root and playground disable Nuxt auto-imports; use explicit composable imports. Consumer-facing helpers require addImports registration in src/module.ts.
- Query-string handling requires literal "enabled", not boolean true.
- Follow .prettierrc for formatting; no-console is an error in active ESLint configuration.
- Maintain hook names and return contracts using docs/hooks-reference.md plus actual call sites; most shared hooks are consuming-app sections/js/global-hooks.js.
