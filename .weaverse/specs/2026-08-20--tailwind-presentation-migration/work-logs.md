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

## 2026-08-22 — Phase 2F content and system states

- Starting SHA: `2bc2d7c67725fcede6977d012f636f3ef93cbac1` (pushed Phase 2E Cart/Account commit).
- Migrated Journal index/articles, Shopify pages/policies, About, Materials, Field Testing, loading, error, and not-found presentation to semantic Tailwind utilities. Preserved static params/metadata/not-found/data-source boundaries, structured rich-text runs and internal/external links, article block splitting, image sources/alts/sizes, editorial order, error retry, and canonical system-state actions.
- Added real browser coverage for Journal feature/card/article structure, desktop/mobile editorial order, Materials/Field Testing art direction, custom-page versus Shopify policy separation, canonical policy navigation/links, 404 status/actions, and viewport overflow. Added DOM coverage for loading status and error alert/reset behavior.
- Deleted 1,302 content/system/shared-button CSS lines. `canonical-source.css`, `site-header.css`, and `production-polish.css` now contain seven comment lines total and zero selectors; imports/files remain only for the ordered Phase 5 deletion.
- Verification: Biome format/lint, typecheck, `323/323` node tests, expanded `59/59` DOM tests, GraphQL, Production build with 42 pages, compiled theme check, route contract `20 + 4`, `git diff --check`, and `bun run check` passed. The expanded fresh static browser matrix ran 156 executions and passed `146 / 10 intentional skips / 0 failures` across desktop, short desktop, and true mobile.
- No content/sanitizer/data/security behavior, dependency, Shopify, account, checkout/payment, deployment, GitHub, Weaverse, or Production mutation occurred.

## 2026-08-22 — Phase 3 ownership and variants

- Starting SHA: `0fe37e99a38d6131b7f67b9be52bff03b9977194` (pushed Phase 2F content/system commit).
- Moved 11 real owners with no compatibility shims: the complete Header feature (public `SiteHeader`, field-index implementation, query reader, navigation mapping, cart count, country indicator, mini-cart) into `src/components/site-header/`; static/Shopify Cart views into `src/app/cart/`; address form into `src/app/account/addresses/`; and add-to-cart form into the PDP route folder. Old files were deleted and all source/test imports use the new explicit paths.
- Applied `class-variance-authority` only where multi-axis state justified it: PDP option chips (`interactive`, `selected`, `soldOut`) and mini-cart actions (`cart`, `checkout`). One-off utility strings remain inline and `cn()` remains the sole merge helper.
- Full exact stale-path search returned zero references to the deleted component/lib paths. Move-only owners remain byte-identical; modified Header files contain relative feature imports and modified interactive owners preserve their previous class output through cva.
- Verification: Biome format/lint, typecheck, `323/323` node tests, `59/59` DOM tests, GraphQL, Production build with 42 pages, compiled theme check, route contract `20 + 4`, `git diff --check`, and `bun run check` passed. Fresh static browser matrix passed `146 / 10 intentional skips / 0 failures` across 156 desktop, short-desktop, and true-mobile executions.
- No route/data/auth/cart/sanitizer/security behavior, dependency, external system, deployment, GitHub, Weaverse, or Production mutation occurred.

## 2026-08-22 — Phase 4A Header fail-soft and runtime decisions

- Starting SHA: `e5989f36d49fdece96b31fdb59f84a9e3dc9ddfa` (pushed Phase 3 ownership/variants commit).
- Removed root-shell presentation throws for missing Shop, missing About children, unexpected Shop child count/order, and unmapped Shop presentation handles. Canonical data still gets the full desktop/mobile panels; unsupported enhancement data falls back to query-preserving plain links with no false `aria-controls`, while ordinary links and the mobile dialog remain usable.
- Added seven direct DOM regressions covering canonical controls, missing Shop, About plain-link fallback, three malformed Shop shapes, query ownership, and malformed Shop mobile-dialog reachability. The lower-level adapter/verifier remains fail-closed; the UI catch emits no raw merchant data or diagnostics.
- React Compiler remains disabled. Installed Next 16.3 exposes the official `reactCompiler?: boolean | ReactCompilerOptions` config, and its runtime explicitly requires resolvable `babel-plugin-react-compiler`; the package is absent. A bounded no-save/no-lock dependency spike made no progress for more than six minutes and was stopped, then `bun install --frozen-lockfile` restored the exact 116-install graph with no package/config/lock drift. Without deterministic dependency or build-regression evidence, enablement does not meet the spec gate. No tracked repo claimed automatic compiler memoization.
- ProductCard remains a Client Component. Its one colorway selection simultaneously owns the primary image, image link, title link, native radio checked state, visible colorway name, and encoded query target; a smaller island would either duplicate state/interactive links or hydrate nearly the whole article, so a nominal server wrapper would not reduce the boundary.
- Verification: frozen install, Biome format/lint, typecheck, `323/323` node tests, expanded `66/66` DOM tests, GraphQL, Production build with 42 pages, compiled theme check, route contract `20 + 4`, `git diff --check`, and `bun run check` passed. Fresh static browser matrix passed `146 / 10 intentional skips / 0 failures` across 156 desktop, short-desktop, and true-mobile executions.
- No dependency, ProductCard behavior/presentation, adapter/data contract, external system, deployment, GitHub, Weaverse, or Production mutation occurred.

## 2026-08-22 — Phase 4B structural Shopify content parser

- Starting SHA: `23ac1e42bb4156cf9f589ba8c28c3b300a93a6fe` (pushed Phase 4A Header fail-soft commit).
- Replaced regex tag scanning/attribute parsing/structural sanitization with a parse5 `8.0.1` server-side fragment AST walk. The production dependency is pinned exactly and the Bun lock keeps parse5's `entities@8` separate from Happy DOM's existing `entities@7` requirement.
- The parser collects HTML parse errors, verifies source-span coverage against browser recovery, walks one explicit HTML-namespace tag allowlist, permits only a quoted `href` on anchors, ignores comments without permitting comment-disguised markup, decodes entities through parse5, and preserves canonical collection rewrites, internal/HTTPS link rules, nested inline runs, headings, paragraphs, pullquotes, lists, pages, and policies. Remaining regexes are limited to the pre-parse Liquid sentinel, canonical route allowlist, and whitespace normalization; none parses HTML structure or attributes.
- Added ten adversarial parser contracts covering exact nested/entity/link/list output, page/policy sections, every internal route, comments, recovered malformed nesting, empty/unreadable/Liquid input, mixed-case embedded/unknown tags, encoded event and duplicate/unquoted/missing/unsupported attributes, unsafe/protocol-relative/backslash/http/data/javascript/credential/noncanonical links, and raw merchant-secret error redaction.
- Verification: frozen install resolved 118 installs/182 packages without changes; focused content suite passed `28/28`; production audit reported no vulnerabilities; Biome/typecheck/GraphQL/build/theme/routes and full `bun run check` passed with expanded `333/333` node and `66/66` DOM tests. Production artifact scan found parser/error markers in two server chunks and zero `.next/static` client chunks.
- No normalized content/data contract, shopper-rendered rich-text structure, external system, deployment, GitHub, Weaverse, or Production mutation occurred.

## 2026-08-22 — Phase 5 legacy deletion and final release gates

- Starting SHA: `25b511dfa4060124617c142bf7e193524660ca4e` (pushed Phase 4B structural-parser commit).
- Deleted `canonical-source.css`, `site-header.css`, and `production-polish.css` and removed all three root-layout imports. `globals.css` is now the sole stylesheet: one Tailwind import, one semantic `@theme`, document-level reset/focus/cursor/reduced-motion policy, and exactly the three shell keyframes.
- Removed stale POC/source-line ownership comments and CSS-only marker classes; browser coverage now locates Home heroes/cards, loading, and route surfaces through semantic regions/headings/articles/text. Strengthened content tests to assert every normalized About standard and Privacy Policy section has visible heading/paragraph structure instead of fixed fixture counts.
- Added architecture guards proving the retired files stay absent, layout loads only `globals.css`, globals has one theme/no `@apply`/no compatibility selectors/exact keyframes, and behavior suites cannot read presentation source. Current tracked references to retired filenames are only the explicit AGENTS prohibition and architecture guard, plus historical spec/work-log evidence.
- Final non-browser gates: frozen install `118` installs/`182` packages; `337/337` node tests; `66/66` DOM tests; GraphQL; Production build with 42 pages; compiled theme; route contract `20 + 4`; 35 production HTTP smokes; static and live account-disabled/account-enabled build/smoke matrices; live read-only catalog/content/navigation/policy verification; production audit; and `git diff --check` all passed. `next start` emitted the existing five internal `NoFallbackError` stderr lines during each route-smoke run, while all 35 checks passed and the server stopped cleanly.
- Final browser aggregate passed `441 / 27 intentional skips / 0 failures`: static `146/10`, live account-disabled `146/10`, live account-enabled `149/7`. Browser matrix cleanup restored `tsconfig.json` SHA-256 `42eed74e77020627f0861ef5671814ed53b6b613283e13352f244bfc11e00a49` and `next-env.d.ts` SHA-256 `1862ac4bbbc5192d4bf562161df66ea547ed3e67173100656ab606ae9797db2b` byte-for-byte.
- No write-side Shopify/account/address/order/checkout/payment action, deployment, GitHub issue/PR mutation, Weaverse mutation, or Production mutation occurred.

## 2026-08-22 — Whole-branch review follow-up and release handoff

- Starting SHA: `258a4f166ad1b5fd6ec144cff66a8947a6c5e0ac` (pushed Phase 5 legacy-deletion commit).
- Accepted whole-branch findings and resolved them in code commit `4af164a60981b7dd9de1bd5fb28e20e8017cb66c`: centralized reusable eyebrow, heading, CTA, text-arrow link/control, empty-state, and route-local Cart presentation recipes with exact-output tests; removed the synthetic root-layout theme-consumer marker; made the compiled-theme check require real production consumers; and added recursive architecture contracts for all presentation owners, both simple and configured `cva` recipes, Tailwind important modifiers, the exact 261-class retired-selector inventory, raw storefront imports, all 11 moved owners, and every DOM suite.
- Adversarial review found and closed three false-pass classes before commit: lower-camel and `.ts` recipe owners were initially omitted; configured `cva(..., {...})` calls initially escaped extraction; and Tailwind `!` modifiers were not initially guarded. The final `cva` regression test was sabotage-proven by restoring the old extractor and observing the focused suite fail before restoring the fix. Two unnecessary Home margin `!` modifiers were removed; the full browser geometry matrix remained green.
- Static/live architecture decision: **KEEP both explicit modes and the three-mode verification matrix.** Static mode is the credential-free deterministic storefront/demo boundary; live mode is the fail-closed Shopify catalog/content/cart boundary, with account-disabled and account-enabled deployment states. Merging or slimming these paths would weaken the approved adapter boundary, hide partial-environment failures, or remove required deployment coverage; no runtime mode was added.
- Final code SHA and synced remote SHA: `4af164a60981b7dd9de1bd5fb28e20e8017cb66c`. The branch contains 14 code/spec commits after `main@8fa94b727cc7977d75dc2400bcddf8b2d492e83f`; whole-branch code state spans 93 changed files with no base divergence.
- Final current-code verification: frozen dependency graph remained 118 installs/182 packages; `349/349` node tests and `66/66` DOM tests passed (`415` total, `48` above the 367-test baseline); typecheck, Biome, GraphQL, 42-page Production build, compiled theme (`1` CSS artifact, `4` semantic utilities, `4` representative tokens), route contract `20 + 4`, static/live account-disabled/account-enabled build matrices, three sets of 35 production HTTP smokes, live read-only Shopify verification, and production audit all passed. The existing five internal `NoFallbackError` stderr lines appeared during each smoke run while every check passed and each server stopped cleanly.
- Final browser aggregate remained `441 / 27 intentional skips / 0 failures`: static `146/10`, live account-disabled `146/10`, live account-enabled `149/7`. Matrix cleanup restored `tsconfig.json` SHA-256 `42eed74e77020627f0861ef5671814ed53b6b613283e13352f244bfc11e00a49` and `next-env.d.ts` SHA-256 `1862ac4bbbc5192d4bf562161df66ea547ed3e67173100656ab606ae9797db2b` byte-for-byte.
- Independent final standards/spec/security-runtime reviews passed the exact code candidate after all findings were closed. No write-side Shopify/account/address/order/checkout/payment action, deployment, Weaverse mutation, Production mutation, merge, or force-push occurred.
- Release handoff: issue `Weaverse/forward#61`; parent Epic `Weaverse/builder#2663`; repository `Weaverse/forward`; branch `refactor/tailwind-presentation-layer`; base `main@8fa94b727cc7977d75dc2400bcddf8b2d492e83f`; implementation SHA `4af164a60981b7dd9de1bd5fb28e20e8017cb66c`; next slice is the linked pull request and hosted CI review. Do not merge or deploy without separate approval.

## 2026-09-02 — Claude review corrections

- Starting SHA: `6c4942f62cf1b4720bd241b286d29815b130241b` (pushed PR #62 head). Claude Code independently reviewed the whole branch and returned `CHANGES_REQUIRED` with four actionable findings: the static Cart primary CTA declared conflicting Tailwind shadows; the source guard truncated JSX template-literal classes after the first interpolation; parse5 rejected a recoverable missing-semicolon character reference; and repeated/raw presentation values bypassed the semantic theme.
- Removed the losing ink shadow/hover/focus utilities from the demo Cart CTA so its accepted signal hard shadow is the only declaration. Exact `cva` output and conflict-count tests now protect every CTA intent, and the real static browser flow empties the Cart and verifies the computed signal shadow plus keyboard-visible signal outline.
- Replaced the JSX `className` attribute regex with one shared TypeScript-AST extractor used by both architecture contracts and the compiled-theme checker. A nested-interpolation regression proves suffix utilities remain visible to the retired-selector, Tailwind-important, raw-colour, and utility-consumer guards.
- Kept the Shopify content parser fail-closed except for the single explicit parse5 diagnostic `missing-semicolon-after-character-reference`, which browsers recover as ordinary decoded text. Focused coverage accepts `<p>A &copy B</p>` as `A © B` while continuing to reject structural recovery, unsupported tags/attributes, unsafe links, Liquid, source-span gaps, and secret-bearing errors.
- Added seven exact-value semantic theme tokens for the card media surface, dark lede/meta text, dark borders, field border, and the repeated lede type scale. Replaced all six reviewed raw hex presentation colours and all `16` uses of `text-[clamp(17px,1.45vw,22px)]`; permanent guards now reject raw hex presentation utilities and the retired arbitrary lede scale. The only remaining six-digit hex in TSX is the intentional Next viewport metadata value, not a presentation utility.
- TDD/focused evidence: the new token guards failed against the partial candidate until the remaining consumers were migrated; final presentation/architecture/content suites passed `60/60`, followed by clean Biome lint/format and typecheck. Full `bun run check` passed `354/354` node tests, `66/66` DOM tests, GraphQL, a 42-page Production build, compiled theme proof (`1` CSS artifact, `11` semantic utilities, `11` representative tokens), and route contract `20 + 4`.
- Production matrices remained green: frozen install stayed at `118` installs/`182` packages; static, live account-disabled, and live account-enabled builds each passed `35` HTTP smokes; live read-only Shopify verification passed; and `bun audit --production` reported no vulnerabilities. Browser aggregate passed `441 / 27 intentional skips / 0 failures`: static `146/10`, live account-disabled `146/10`, live account-enabled `149/7`.
- The first browser regression attempt correctly proved the signal box shadow but used programmatic focus, which does not activate Chromium's `:focus-visible` heuristic; a one-Tab correction then exposed the extra mobile Menu control. The final test uses bounded real-keyboard traversal and passed a focused three-viewport run plus the complete matrix without weakening the expected signal outline.
- Matrix cleanup restored `tsconfig.json` SHA-256 `42eed74e77020627f0861ef5671814ed53b6b613283e13352f244bfc11e00a49` and `next-env.d.ts` SHA-256 `1862ac4bbbc5192d4bf562161df66ea547ed3e67173100656ab606ae9797db2b` byte-for-byte. No Shopify/account/address/order/checkout/payment write, GitHub mutation, deployment, merge, force-push, Weaverse mutation, or Production mutation occurred. The corrected candidate remains local for exact staged review and separate commit/push approval.

## 2026-09-03 — Exact-tree review corrections

- Independent review of staged tree `448d181448d4b2f303630dda778e0cbeb2f19e56` returned `CHANGES_REQUIRED` on two Medium architecture/spec gaps: class extraction still missed identifier/composer/computed-spread dataflow while scanning unrelated constants, and the locked repeated-arbitrary rule remained unenforced beyond the first lede literal.
- Reworked the shared TypeScript-AST extractor around class-bearing roots only: JSX `className`, JSX spread `className` including computed and shorthand properties, source-local identifiers/property access/arrays/conditions, `cn`/`clsx` maps, `cva` recipe class values, and exported recipes in dedicated `presentation.ts` owners. Ordinary copy, `cva` default selections, and compound-variant selectors are excluded; compound `class`/`className` values remain included. Synthetic regressions prove raw colours, important modifiers, and retired selectors remain visible through every reviewed composition path while unrelated `marketingCopy` stays invisible.
- Replaced the cited `text-[11px]`, `leading-[1.55]`, and `max-w-[670px]` values with `text-ui`, `leading-lede`, and `max-w-lede`, then closed the entire repeated semantic-scalar class instead of stopping at those three examples. All duplicated text sizes, display clamps, line heights, tracking, page widths, shared section spacing, hard shadows, animation declarations, responsive boundaries, and scalar geometry now use Tailwind/theme names or one reusable local recipe with identical values. The compiled-theme gate now proves `71` production-consumed semantic utilities and `81` emitted representative tokens.
- Added a general call-site-level arbitrary-value inventory. It snapshots both the exact token and occurrence count; any new repeat, added call site, removed exception, or changed count fails architecture tests, including duplicates within one source owner. The only `27` reviewed repeats left are `16` owner-local grid-template geometries and `11` CSS content/selector/transition syntaxes; no repeated typography, line-height, tracking, width, scalar spacing, animation, shadow, opacity, or other token-worthy visual value remains arbitrary.
- TDD evidence: the reviewer reproductions and repeated-scale guard failed against the prior candidate before implementation. Final `bun run check` passed `359/359` node tests, `66/66` DOM tests, GraphQL, a 42-page Production build, compiled theme proof, route contract `20 + 4`, clean typecheck/Biome/format, and `git diff --check`.
- Fresh Production matrices passed after the presentation-token migration: frozen install stayed at `118` installs/`182` packages; static and live account-disabled/account-enabled builds each passed `35` HTTP smokes; live read-only Shopify verification passed; and `bun audit --production` reported no vulnerabilities. Browser aggregate passed `441 / 27 intentional skips / 0 failures`: static `146/10`, live account-disabled `146/10`, live account-enabled `149/7`. The final post-matrix changes only tightened test-tool `cva` metadata/identifier extraction and corrected this evidence log; Production source did not change afterward.
- Matrix cleanup restored `tsconfig.json` SHA-256 `42eed74e77020627f0861ef5671814ed53b6b613283e13352f244bfc11e00a49` and `next-env.d.ts` SHA-256 `1862ac4bbbc5192d4bf562161df66ea547ed3e67173100656ab606ae9797db2b` byte-for-byte. No Shopify/account/address/order/checkout/payment write, GitHub mutation, deployment, merge, force-push, Weaverse mutation, or Production mutation occurred. The candidate remains local for a fresh exact-tree review before commit and push; merge and Production deployment still require separate approval.

## 2026-09-03 — Round 3 lexical and arbitrary-value hardening

- Final independent review of candidate tree `f99f819060a198a358dcbbf5b9bfb88b243500b3` superseded the earlier Claude PASS and returned `CHANGES_REQUIRED`: lexical shadowing and shared visited state made class extraction unsound; nested/dynamic properties, shorthand/computed maps, aliased composers, logical spreads, compound shorthand, and the production `WORDMARKS[variant].className` path escaped extraction; arbitrary values were grouped by variant-prefixed tokens; and the exception/token-value contracts were incomplete.
- Rebuilt the extractor around lexical scopes and class-bearing roots. `classNameSites` records every JSX attribute/spread, `cva`, and dedicated presentation-export use separately; `classNameLiterals` records each authored leaf with exact file/line/column identity. Adversarial regressions cover nested and dynamic member chains, object shorthand/computed keys, aliased composers, logical/nested spreads, compound `className` shorthand, lexical shadowing, shared declarations used at multiple roots, unresolved helper false positives, and the real wordmark map.
- Normalized arbitrary utility values independently of variant prefixes, replaced every exact Tailwind-standard scalar, fraction, and CSS-variable shorthand utility, moved remaining typography, tracking, line-height, gradients, shadows, and animations into named semantic tokens, and pinned all `202` theme variables to canonical values. The reviewed exception inventory now contains `90` one-off geometry or selector/content/transition syntax values at `119` exact authored locations; moving, adding, or deleting a location fails the architecture contract.
- Focused architecture and exact-recipe suites passed. Full `bun run check` passed `372/372` node tests and `66/66` DOM tests, GraphQL, a 42-page Production build, compiled theme proof (`1` CSS artifact, `71` production-consumed semantic utilities, `202` exact compiled token values), route contract `20 + 4`, clean typecheck/Biome/format, and `git diff --check`.
- Production route verification passed static and live account-disabled/account-enabled builds, all route smokes, and the read-only Shopify contract. Browser aggregate passed `441 / 27 intentional skips / 0 failures`: static `146/10`, live account-disabled `146/10`, live account-enabled `149/7`. After the final standard-utility substitutions, the affected static matrix passed again at `146/10`.
- No write-side Shopify/account/address/order/checkout/payment action, deployment, merge, force-push, Weaverse mutation, or Production mutation occurred. The corrected candidate remains local for frozen install/audit, exact staging, and fresh independent review before commit/push; merge and Production deployment still require separate approval.

## 2026-09-07 — Log reconciliation and standards-review corrections

- Starting SHA: `ec37b3586636b3b7f4f6da16b98138969d1ce7be` (pushed PR #62 head).

### Reconciliation of the previously unlogged cleanup range

The entries above stop at candidate tree `f99f819`. Eleven commits,
`307c439..ec37b35`, landed afterwards and were never logged, so the numbers
recorded above no longer describe this tree. Corrected against the current
tree:

- Test counts: `338` node + `66` DOM = **`404`** total (the entry above claims
  `372/372` node; that count predates `e1ce3d8` and `ec37b35`).
- `check:theme` verifies `1` CSS artifact, **`4`** semantic utilities, and
  **`194`** theme tokens (the entry above claims `71` production-consumed
  utilities and `202` exact token values, measured before `307c439` and
  `1014dce`).
- The arbitrary-value and retired-selector machinery described above no longer
  exists. `1014dce` deleted `scripts/classname-source.mts` (709 lines),
  `scripts/theme-tokens.mts` (262), `tests/retired-presentation-classes.ts`
  (264), and `tests/reviewed-arbitrary-values.ts` (208), trimmed
  `scripts/check-tailwind-theme.mts`, and reduced
  `tests/architecture-contracts.test.ts` by 535 lines. `984bbd5`, `fd82d7e`,
  `27ae3a9`, `1506c54`, `2be35ab`, and `ec37b35` removed further guards;
  `e1ce3d8` replaced the presentation snapshots. The suite now holds `19`
  architecture contracts.
- Statements above of the form "any new repeat, added call site, removed
  exception, or changed count fails architecture tests" and the `90`
  exception / `119` location inventory are **superseded** and no longer true
  of this tree.

**Open risk:** the spec's Phase 5 gates require proving that no production
consumer uses legacy component classes and that Tailwind utilities are present
across the presentation inventory. Both proofs were deleted with the guard
machinery. Runtime risk is low — the three legacy stylesheets no longer exist,
so a stale selector resolves to nothing — but the required evidence is absent
and was not restored in this entry.

### Standards-review corrections

An independent two-axis review of `ec37b35` returned four documented-standard
breaches plus one latent runtime trap; all five were fixed in this working
tree:

- Replaced every class-composition template literal with the existing `cn()`
  helper (`AGENTS.md`: "use `cn()` for conditions"; global coding rules: "never
  template strings"). Twenty-two call sites across `layout.tsx`, `page.tsx`,
  `not-found.tsx`, `shop/[collectionHandle]/page.tsx`, `cart/presentation.ts`,
  `cart/shopify-cart-view.tsx`, `account/orders/[orderId]/page.tsx`,
  `account/addresses/address-form.tsx`, `products/[productHandle]/add-to-cart-form.tsx`,
  `site-header/field-index-header.tsx`, `site-header/mini-cart.tsx`, and
  `lib/presentation/variants.ts`. `cn()` joins on a single space, so every
  emitted class list is unchanged.
- Renamed string constants to `UPPER_SNAKE_CASE`: the sixteen `cart/presentation.ts`
  exports, `controlTransition` → `CONTROL_TRANSITION`, and
  `indexRowTransition` → `INDEX_ROW_TRANSITION`. `cva` factories stay camelCase
  because they are functions, not constants.
- Removed the reintroduced `useMemo` in `field-index-header.tsx`. A naive
  removal would have regressed behaviour: `collections` was a dependency of the
  route-change effect, so an unmemoized array identity would have re-run that
  effect on every render and reset `activeIndex` out from under the mega
  panel's hover/focus preview. The derivation moved to a module-level pure
  `fieldIndexCollections(shopItem)` and the effect now depends on
  `[pathname, shopItem]`, which reproduces the previous trigger exactly and
  stays exhaustive under Biome's React domain. `src/` now contains no `useMemo`
  or `useCallback`.
- Corrected the `AGENTS.md` required-verification block, which omitted
  `check:theme` (part of `check` since the theme gate landed) and never named
  the credential-dependent gates. It now lists `verify:static`, `verify:live`,
  `verify:shopify`, and the `test:browser` aggregate with its fail-rather-than-skip
  contract.
- Made the Shop mega panel fail soft. `FieldIndexPanel` still contained
  `throw new Error("Header 01 requires at least one Shop collection.")` — a live
  throw inside a client component rendered from the root layout, which the spec
  forbids ("must not crash the root layout or ordinary navigation"). It now
  returns `null`. The path is unreachable through `FieldIndexHeader` today
  because the factory returns exactly four collections or throws into the
  existing fail-soft catch, so this closes a latent regression trap rather than
  an active defect; no new export or test was added to reach it.

The reviewer's duplicated-presentation findings (the repeated account block and
order-row class lists, `SUMMARY_ROW_CLASS` versus `CART_SUMMARY_ROW`, and
`ADD_TO_CART_CLASS` re-authoring `cta({ intent: "signal" })`) were judgement
calls, not standard breaches, and were left alone. `ADD_TO_CART_CLASS`
deliberately differs from the `signal` CTA in shadow, hover, and disabled
states, so consolidating it would change rendered output.

### Verification

- `bun run check` passed: typecheck, Biome lint, Biome format check, `338/338`
  node tests, `66/66` DOM tests, GraphQL, a 42-page Production build,
  `check:theme` (`1` CSS artifact, `4` semantic utilities, `194` theme tokens),
  and route contract `20 + 4`.
- `bun run test:browser:static` passed `146 / 10 intentional skips / 0 failures`
  across desktop, short-desktop, and true-mobile against a fresh production
  build on port 4991, matching the recorded static baseline exactly. Matrix
  cleanup left `tsconfig.json` SHA-256
  `42eed74e77020627f0861ef5671814ed53b6b613283e13352f244bfc11e00a49` and
  `next-env.d.ts` SHA-256
  `1862ac4bbbc5192d4bf562161df66ea547ed3e67173100656ab606ae9797db2b`
  byte-for-byte.
- The remaining pre-merge gates were then run against this same commit
  (`be30c6fadd7eb39b33ed00f91d95628c5e6fd4bd`), completing the spec's
  verification contract for the current head:
  - `bun install --frozen-lockfile` resolved `118` installs across `182`
    packages with no changes.
  - `bun audit --production` reported no vulnerabilities across `66` packages.
  - `bun run verify:static` built the credential-free storefront and passed
    route contract `20 + 4` plus `35` HTTP smokes on port 4973.
  - `bun run verify:live` passed the live read-only catalog verification and
    built and served the route contract for both the account-disabled and
    account-enabled configurations.
  - `bun run test:browser:live-account-disabled` passed `146 / 10 intentional
    skips / 0 failures` on port 4992, and
    `bun run test:browser:live-account-enabled` passed `149 / 7 intentional
    skips / 0 failures` on port 4993.
  - Browser aggregate across all three matrices: `441 / 27 intentional skips /
    0 failures`, matching the recorded baseline exactly.
  - The five internal `NoFallbackError` stderr lines appeared during each
    route-smoke run as before, while every check passed and each server stopped
    cleanly. Matrix cleanup again left `tsconfig.json` and `next-env.d.ts` at
    their recorded SHA-256 values byte-for-byte, and `git status` stayed clean.
- Committed as `68b142a`, `032b58b`, `525715e`, and `be30c6f`, and pushed to
  `origin/refactor/tailwind-presentation-layer`; PR #62 now heads at `be30c6f`.
  This work-log entry itself is a later amendment recording the completed gate
  run.
- No Shopify/account/address/order/checkout/payment write, deployment, merge,
  force-push, GitHub mutation, Weaverse mutation, or Production mutation
  occurred. Merge and Production deployment still require separate approval.

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
