# Tailwind presentation migration — work log

## 2026-08-21 — specification baseline

- Leo authorized implementation of [Weaverse/forward#61](https://github.com/Weaverse/forward/issues/61) on a separate branch, with a docs-only spec commit/push before code, multiple logical implementation commits, full verification, push, and a PR to `main`.
- Created `refactor/tailwind-presentation-layer` from synchronized `main@8fa94b727cc7977d75dc2400bcddf8b2d492e83f` in the primary checkout. No remote branch existed at branch creation.
- Reconciled the earlier uncommitted Homepage continuation handoff into this broader issue-authoritative migration spec. The old “Homepage redesign Phase 2” direction is superseded; Home is one slice after Phase 0 tests, Phase 1 tokens, and the global shell sequence.
- Measured baseline: four presentation stylesheets / 4,638 lines; 3,616-line `canonical-source.css`; 498-line `site-header.css`; 512-line `production-polish.css`; 39 TSX files; 542 `className=` assignments; 241 distinct literal class names; 75 source-reading call sites across the four issue-named UI test suites; 367 existing tests.
- Confirmed Tailwind v4 is installed/imported but current TSX presentation uses the global semantic classes. Confirmed `cn()` exists and `cva`, DOM Testing Library, permanent browser E2E, and React Compiler configuration are absent.
- Confirmed current root layout imports all four stylesheets in cascade order. Confirmed the rich HTML parser structurally tokenizes/validates tags and attributes with regular expressions and requires a parser migration under this issue.
- Updated `AGENTS.md` so repository guidance names issue #61, points to this canonical spec, locks the phase order, and prevents new global component selectors/source-regex behavior tests during migration.
- First independent exact-spec review returned three planning blockers: no exact browser command, no explicit static/live account-mode verification matrix, and `cva` consumption before installation. The candidate now defines `bun run test:browser` with three mandatory subordinate matrices, adds exact `verify:static`/`verify:live` release gates, and installs `class-variance-authority` in Phase 1 before presentation slices.
- No production source, dependency, Shopify, Weaverse, deployment, issue, or PR mutation was performed during spec preparation.

## Phase log template

```text
Phase:
Starting SHA:
Scope/allowlist:
Implementation:
Focused verification:
Full verification:
Browser evidence:
Review findings/disposition:
Commit:
Remote SHA:
Open risks/next phase:
```
