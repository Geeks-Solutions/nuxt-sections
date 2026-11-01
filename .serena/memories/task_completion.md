# Completion checks

- CI: npx prettier --check . then npm run test. CI lint step is commented out; typechecking is not a CI step.
- For code changes: appropriate focused tests, npm run test:types (root and playground); npm run lint as applicable. Prepare generated types first with npm run dev:prepare.
- Before committing runtime/UI changes validate the affected playground flow; see docs/playground-and-manual-validation.md for CMS env and browser checklist.
- Documentation-only changes: focused Prettier check and git diff --check.
- For tracked tasks update Beadwork status (bw start / bw close); persist context with bw comment. Issues live on separate beadwork branch, prefix nuxt-sections. bw sync fetches/replays/pushes issue data.
- Release automation uses Conventional Commits on main/master and updates versions/changelog; avoid manual release bumps for ordinary changes.
- After memory reference changes: serena memories check from repository root.
