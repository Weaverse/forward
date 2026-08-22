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

## 2026-08-22 — Phase 1 semantic Tailwind theme

- Starting SHA: `3e3946113ab65e99adfe1a95d7b55d33a2433a2b` (pushed Phase 0 behavior-coverage commit).
- Replaced the two stacked legacy palette definitions with one semantic Tailwind v4 `@theme static` contract in `src/app/globals.css`. The remaining legacy stylesheet owns one temporary alias block only; every alias resolves to a semantic theme variable and is deleted with that stylesheet in Phase 5.
- Effective token table:

| Role | Semantic tokens | Winning values |
| --- | --- | --- |
| Surfaces and text | `canvas`, `surface-subtle`, `media-placeholder`, `surface-dark`, `ink`, muted/inverse roles | `#f2eee4`, `#e8e2d4`, `#c8c0b0`, `#2f3a2f`, `#11130f`, accepted dark/inverse muted values |
| Signal and state | `signal`, `signal-strong`, `accent-warm`, `sale`, `focus`, disabled roles | `#d9ff57`, `#485c00`, `#ff9b77`, sale aliases signal, `#b8dc38`, accepted disabled colours |
| Typography | `font-heading`, `font-body`, `font-field-meta`, semantic text/weight/tracking roles | Archivo, Manrope, IBM Plex Mono; accepted effective clamp scales and weights |
| Layout and controls | `container-page`, `spacing-page-gutter`, Header/announcement/touch spacing, control radii, button/panel shadows | `1540px`, `clamp(22px, 4.2vw, 72px)`, `84px`/`66px` Header heights, `44px` touch target, accepted hard shadows |
| Responsive | `breakpoint-xs/sm/md/lg/xl` | `430px`, `560px`, `820px`, `1100px`, `1260px` |
| Motion | `duration-fast/panel/media`, `ease-standard`, `ease-enter` | `180ms`, `240ms`, `320ms`, `ease`, `cubic-bezier(0.22, 1, 0.36, 1)` |

- Added `class-variance-authority@0.7.1` as a production presentation dependency for later reusable multi-axis variants; no component was forced into `cva` during token extraction.
- Added a non-rendering root-layout meta probe and `bun run check:theme`. The checker reads compiled Next/Tailwind CSS and proves `bg-canvas`, `font-heading`, `text-signal`, and `max-w-page` plus representative theme variables are emitted; it is part of `bun run check` after `next build`.
- Replaced repeated legacy colour literals with semantic variables and verified every old palette alias has exactly one declaration; no repeated six-digit legacy colour literal remains across the three legacy stylesheets.
- Verification: frozen install unchanged; typecheck, Biome lint/format, `git diff --check`, 323 node tests, 54 DOM tests, GraphQL, Production build with 42 pages, compiled theme check, route contract `20 + 4`, and `bun run check` passed. Fresh explicit-empty browser matrix passed `128 / 7 intentional cross-viewport skips / 0 failures`, preserving computed typography, geometry, controls, focus, and runtime behavior. `bun audit --production` reported no vulnerabilities.
- No Shopify, account, Weaverse, deployment, GitHub, or Production mutation occurred.

## 2026-08-22 — Phase 2A document and global shell

- Starting SHA: `07308763d1b6e28a623b32d8039858f23213e8d1` (pushed Phase 1 semantic-theme commit).
- Migrated the root document, announcement, sticky Header, primary navigation, Shop/About desktop panels, mobile dialog, localization indicator, account/search/cart controls, mini-cart, wordmarks/icons, skip link, and Footer to semantic Tailwind utilities colocated with their JSX.
- Replaced selector-coupled shell targeting with explicit `data-shell-background` and `data-mini-cart-mount` ownership markers. Mobile body lock now uses Tailwind's `overflow-hidden` utility while preserving inert state, focus trap/restoration, Escape/outside dismissal, and repeated navigation behavior.
- Kept only truly global base/reset, focus/reduced-motion policy, and three named shell entrance keyframes in `globals.css`; every other shell style is utility-owned. `site-header.css` is now an empty compatibility import comment pending final stylesheet deletion. Full CSS search found no remaining Header/field-index/mobile-menu/mini-cart/Footer/wordmark/country/cart-count/skip-link selectors in the legacy stylesheets.
- During browser verification, a shared control constant initially combined base `inline-flex` with `hidden`, making the mobile Menu visible at desktop utility order. The constant was split so each consumer owns display; `hidden max-lg:inline-flex` now passes the real responsive contract without weakening the test.
- Verification: typecheck, Biome lint/format, `323/323` node tests, `54/54` DOM tests, GraphQL, Production build with 42 pages, compiled semantic-theme check, route contract `20 + 4`, `git diff --check`, and full `bun run check` passed. Fresh explicit-empty browser matrix passed `128 / 7 intentional cross-viewport skips / 0 failures` after the responsive fix, covering desktop, short desktop, tablet Footer, and true mobile shell behavior.
- No dependency, commerce/data/security, Shopify, account, Weaverse, deployment, GitHub, or Production mutation occurred.

## 2026-08-22 — Phase 2B Home and ProductCard

- Starting SHA: `0e661b46552f642b3522d2f17db500e6c04cabf1` (pushed Phase 2A shell commit).
- Migrated the complete Home composition and the shared interactive `ProductCard` to semantic Tailwind utilities colocated in `page.tsx` and `product-card.tsx`. Preserved exact section order, handles, copy, links, `next/image` ownership, priority/sizes contracts, 4:5 media, active colorway link/image/name updates, and all desktop/short-height/mobile layouts.
- Removed 585 lines of effective Home/ProductCard rules from the two remaining legacy stylesheets. `.home-commerce-head` remains intentionally because the unmigrated About route still owns that shared class; its Home consumer was removed. Generic PDP-owned `.product-price` rules likewise remain until Phase 2D.
- Review caught and corrected an agent-authored visual mismatch: negative margin had been applied to every 44px swatch target instead of only the first target, causing overlap. The browser contract now checks both minimum 44px geometry and non-overlap per colorway group at every project viewport.
- Verification: Biome format/lint, typecheck, `323/323` node tests, `54/54` DOM tests, GraphQL, Production build with 42 pages, compiled theme check, route contract `20 + 4`, `git diff --check`, and full `bun run check` passed. Fresh explicit-empty browser matrix passed `128 / 7 intentional cross-viewport skips / 0 failures`, including Home composition, image contracts, desktop/short-desktop/mobile geometry, overflow, viewport-bounded Spotlight/Kit, Journal alignment, reduced motion, ProductCard grids, and the strengthened swatch target contract.
- No dependency, commerce/data/security, Shopify, account, Weaverse, deployment, GitHub, or Production mutation occurred.

## 2026-08-22 — Phase 2C catalog, collections, and search

- Starting SHA: `8930bad42e989d2aa6e2d326f7269e35aa43f3a7` (pushed Phase 2B Home/ProductCard commit).
- Migrated `/shop`, collection landings, and `/search` to semantic Tailwind utilities while preserving normalized storefront reads, static/dynamic route ownership, metadata/not-found behavior, image source/alt/sizes contracts, no-JavaScript GET sorting/search, validated category/activity query state, selected `aria-current`, desktop sidebar/mobile disclosure, ProductCard colorway behavior, result counts, and start/empty/no-match states.
- Deleted 401 catalog/search/collection CSS lines from `canonical-source.css`. Shared `.page-hero`, `.product-grid`, `.empty-state`, and `.intro-grid` rules remain intentionally for unmigrated Phase 2D–2F owners; catalog/search no longer consume those classes.
- Added permanent browser behavior coverage for query-preserving filters/sort, responsive filter ownership, sticky tools/no overflow, collection composition/media hints, raw search-input restoration with trimmed result semantics, truthful counts/no-match state, and the exact desktop/mobile search input height.
- Review caught one omitted responsive winner: the Search input had retained desktop `110px` height on true mobile instead of the accepted `64px`; `max-sm:h-16` and a computed geometry assertion now protect that contract.
- Verification: Biome format/lint, typecheck, `323/323` node tests, `54/54` DOM tests, GraphQL, Production build with 42 pages, compiled theme check, route contract `20 + 4`, `git diff --check`, and full `bun run check` passed. The expanded fresh explicit-empty browser matrix ran 141 executions and passed `134 / 7 intentional cross-viewport skips / 0 failures` across desktop, short desktop, and true mobile.
- No dependency, commerce/data/security, Shopify, account, Weaverse, deployment, GitHub, or Production mutation occurred.

## 2026-08-22 — Phase 2D product detail and add-to-cart presentation

- Starting SHA: `0dea9de0e19bb89d67bc5dc42c4114a259343a9f` (pushed Phase 2C catalog/search commit).
- Migrated the PDP route, URL-owned ProductDetail interface, gallery/zoom modal, field record, related products, and static/Shopify add-to-cart presentation to semantic Tailwind utilities. Preserved static params/metadata/not-found/revalidation, exact colorway/options query state, unrelated query retention, selected variant price/compare-at sale/sold-out truth, exact merchandise identity, cart ownership, full-screen zoom lifecycle, optimized media hints, and fourth-plus natural full-width images.
- Replaced CSS-coupled ProductDetail test locators with semantic `region`/`group` ownership. PDP options now expose native fieldset group names and permanent browser coverage requires every selectable/unavailable value to remain readable, at least 44px tall, and visibly focused.
- Deleted 606 PDP/ATC CSS lines across `canonical-source.css` and `production-polish.css`. Remaining generic `.quantity` and `.product-grid` rules are owned by unmigrated Cart/content surfaces and no longer style PDP markup.
- Verification: Biome format/lint, typecheck, `323/323` node tests, `54/54` DOM tests, GraphQL, Production build with 42 pages, compiled theme check, route contract `20 + 4`, `git diff --check`, and full `bun run check` passed. Fresh explicit-empty browser matrix passed `134 / 7 intentional cross-viewport skips / 0 failures` across 141 desktop, short-desktop, and true-mobile executions, including gallery geometry, no overflow, zoom/focus restoration, 44px option/focus contract, URL/price selection, and semantic panel/gallery order.
- No dependency, commerce/data/security, Shopify, account, Weaverse, deployment, GitHub, or Production mutation occurred.

## 2026-08-22 — Phase 2E cart and account presentation

- Starting SHA: `c09ed6b5b9b89ed5b531ce517c8729e213367667` (pushed Phase 2D PDP commit).
- Migrated static and Shopify Cart views plus all Account overview/orders/order-detail/addresses/access-shell/form presentation to semantic Tailwind utilities. Preserved separate cart ownership, line/quantity/remove/totals/shipping behavior, validated raw Shopify checkout handoff, disabled demo checkout truth, private dynamic Account routes, raw login/refresh handoffs, same-origin logout POST, generic failure copy, address Server Action validation, and no token/session exposure.
- Added direct DOM protocol coverage for selected account navigation, raw no-prefetch login/refresh links, generic login failure, and logout POST. Added real browser coverage for Cart mode truth, responsive line/summary/image/quantity geometry, disabled checkout, Account private/no-store response headers, signed-out access URL, responsive navigation order, and no horizontal overflow.
- Deleted 418 Cart/Account CSS lines from `canonical-source.css`; full CSS search now returns no Cart/Account/auth/address/order selector. Review restored the accepted Cart quantity frame winner: `44px` desktop and `48px` at ≤560 in both static and Shopify views, with a computed regression assertion.
- Full live browser verification initially exposed a pre-existing harness race: the lazy fourth remote PDP image remained below the viewport, so its rendered height was zero and the aspect-ratio calculation produced `Infinity`. The test now scrolls the continuation image and waits for `complete && naturalWidth > 0` in every mode before comparing its loaded natural/rendered ratios; PDP CSS was unchanged. The exact three-mode rerun passed.
- Verification: Biome format/lint, typecheck, `323/323` node tests, expanded `57/57` DOM tests, GraphQL, Production build with 42 pages, compiled theme check, route contract `20 + 4`, `git diff --check`, and `bun run check` passed. The exact browser aggregate passed `414 / 27 intentional skips / 0 failures`: static `137/10`, live account-disabled `137/10`, and live account-enabled `140/7`.
- No dependency, external account/login/address/order mutation, checkout/payment, deployment, GitHub, Weaverse, or Production mutation occurred.

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
