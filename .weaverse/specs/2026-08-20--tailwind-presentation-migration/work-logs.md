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

## 2026-08-21 — Phase 0 behavior-first UI coverage

- Starting SHA: `b3fa79ac1cf33ddbd57f09d6ee13cd69b6082cd0` (the pushed docs-only specification commit).
- Replaced the source-coupled polish/Header and premium-theme assertions with 323 server/data/architecture tests plus 54 scoped Happy DOM behavior tests. A recursive architecture guard now rejects any node test that reads a legacy presentation stylesheet as a shopper-behavior proxy.
- Added exact React 19/Bun DOM dependencies and a `tests/dom`-only Happy DOM preload. Server tests run in a separate process without `document`/`window`, preserving the Shopify/account environment guards.
- Added permanent Playwright coverage for Home, shell/Header/Footer, PDP, cart lifecycle, account mode, route health, 404, reduced motion, repeated navigation, and layout geometry at desktop `1440x900`, short desktop `1280x400`, and true mobile `390x844`.
- Added controlled verification matrices and package scripts for explicit-empty static/account-disabled, live catalog/cart with account disabled, and complete live catalog/cart/account enabled. Matrix children hard-fail missing keys without reading or printing values, use isolated build directories/ports, reject occupied ports, restore both `tsconfig.json` and ignored `next-env.d.ts` after throwaway builds, and cleanly stop their production server.
- Behavior coverage exposed and fixed two baseline defects rather than weakening the tests: account-disabled Header renders no account link and no longer probes the unavailable `/account/status`; mobile product-card swatches now retain their full `44x44` target instead of flex-shrinking to about `30px`.
- Focused verification: `323/323` node tests, `54/54` DOM tests, zero legacy-CSS behavior assertions, typecheck, Biome lint/format, `git diff --check`, and byte-for-byte `tsconfig.json`/`next-env.d.ts` restoration passed.
- Full `bun run check` passed: 377 tests, GraphQL validation, Production build with 42 pages, and route contract `20 patterns + 4 redirects`.
- `bun run verify:static` passed the explicit-empty build, route contract, and `35/35` HTTP smoke checks. `bun run verify:live` passed the read-only Shopify contract (`9 products / 18 colorways / 78 variants / 4 collections / 7 pages / 6 articles / 4 policies`) and both account-disabled/account-enabled build-route-smoke matrices.
- Aggregate `bun run test:browser` passed all three fresh-build matrices. Each matrix reported `128 passed / 7 intentional cross-viewport skips / 0 failed`, for 384 browser passes total with no unexpected console/network failures, repeated route cycles, computed typography, responsive Home/PLP/PDP/Footer geometry, focus/inert/Escape, reduced motion, PDP gallery/zoom/options, exact URL state, and mini-cart repeated-add coverage.
- First exact-candidate test-quality review found the residual `premium-theme-contract` and Footer CSS regex assertions; both were replaced with real browser behavior and a permanent no-legacy-CSS architecture guard. The parallel correctness/security/operations review returned PASS. The corrected candidate is re-reviewed before commit.
- `bun install --frozen-lockfile` made no changes and `bun audit --production` reported no vulnerabilities.
- Generated browser builds/reports/traces remain ignored and untracked. No deployment, GitHub mutation, checkout, payment, account/address/customer, Shopify Admin, or Weaverse mutation occurred.

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
