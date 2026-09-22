# Work logs

## 2026-09-21 — PR #79 review fixes

- Synced `origin/feat/collection-route-filters` before editing.
- Moved the mobile facet disclosure into `mc--filters` so its `showCounts`
  setting controls both mobile and desktop. Updated the section settings copy
  and DOM coverage.
- Removed the unused `collectionBrowse.total` field from the route, context,
  and test fixtures.
- Verified with Bun 1.3.14: frozen install, typecheck, lint, format check,
  tests, GraphQL check, build, theme and route checks, route smoke test, and
  the aggregate `check` command.
- Removed the empty `main-collection` shell's implicit child composition after
  review. Studio's preset supplies the toolbar, filters, and grid; the DOM
  composition test now renders that authored tree explicitly.
