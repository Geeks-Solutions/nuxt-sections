# Project map

- Nuxt module, not a standalone CMS. `src/module.ts` installs dependencies and registers catch-all/admin/health routes, components, middleware, plugins, and explicit helper imports.
- `src/runtime/plugin.ts` builds `$sections` from public runtime config; media transformation is a separate plugin.
- `src/runtime/utils/helpers.ts` discovers consuming-app `/sections/` components and eager JS hooks; these paths are not module-local. Rendering/editing entrypoints: `src/runtime/components/Sections/index.vue` and `admin.vue`.
- AGENTS.md is the repository instruction source. Detailed contracts: docs/hooks-reference.md; recipes: docs/ai-agent-playbook.md. Verify contracts in runtime call sites.
- Build/runtime constraints: `mem:tech_stack`. Developer and focused-test commands: `mem:suggested_commands`. Template/import traps: `mem:conventions`. Verification and delivery context: `mem:task_completion`.
