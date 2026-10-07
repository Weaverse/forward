# Work Logs

## 2026-10-07 — @hta218

- Bumped to `@weaverse/next@0.1.0-alpha.19` and dropped the `buildRequestContext` prefix workaround from `76e51ba`.
- Added typed `label` callbacks to 11 schemas and their tests.
- Gates pass: typecheck, lint, format:check, 369 node and 200 DOM tests, `check:graphql`, build, `check:theme`, `check:routes` (20 + 4) and `smoke:routes` (41 checks). Local Bun is 1.4.2 against the pinned 1.3.14; moving the pin is deferred.
- Manual Studio QA passed (Leo): labels on every labelled element, live editing, empty and whitespace-only values fall back to the title, duplicate, drag overlay, undo/redo, preview language and page switch, `loaderData` labels follow the resource picker and fall back when unresolved, and Studio keeps `/de-de/...` after navigating.
