# Tailwind presentation migration — implementation plan

Issue: [Weaverse/forward#61](https://github.com/Weaverse/forward/issues/61)
Baseline: `main@8fa94b727cc7977d75dc2400bcddf8b2d492e83f`

## 0. Preflight and invariants

Before each phase:

1. Confirm branch `refactor/tailwind-presentation-layer`.
2. Inspect tracked/untracked/staged state and preserve concurrent edits.
3. Confirm the previous phase has a focused green gate.
4. Keep source changes inside the phase allowlist.
5. Update the work log before the phase commit.

Repository-wide invariants:

- no secrets, environment values, build artifacts, screenshots, traces, or browser profiles;
- no Shopify/Weaverse/customer/payment mutation;
- no visual redesign without Leo's explicit approval;
- no removal of a behavior contract merely because its source-regex assertion blocks refactoring;
- no temporary compatibility re-export after component moves unless an actual public import contract requires it;
- no final legacy selector or stylesheet retained “just in case.”

## Phase 0 — behavior-first UI tests

### Goal

Remove source-shape coupling before presentation code changes while preserving the intent behind each useful contract.

### Current source-coupled suites

- `tests/production-polish-home.test.ts`
- `tests/production-polish-shell.test.ts`
- `tests/production-polish-pdp.test.ts`
- `tests/site-header.test.ts`

The baseline contains 75 `readFile`/`readSource` call sites across these suites. Inventory every assertion into one of four buckets:

1. **DOM behavior** — render and assert roles, names, states, links, accessible attributes, content order, and emitted props.
2. **Interaction behavior** — render with user events and assert open/close/focus/selection/timer/navigation outcomes.
3. **Browser-only behavior** — layout geometry, overflow, media crop, reduced motion, inert, focus restoration, responsive visibility, and console/network health.
4. **Static architecture contract** — only retain text/AST checks when the requirement is genuinely source architecture, such as “no raw fixture import” or “no legacy stylesheet import.” These must move to a clearly named architecture test rather than masquerading as UI behavior.

### Test infrastructure

- Add a deterministic DOM renderer compatible with React 19 and `bun test`.
- Prefer Testing Library queries by role/name/state over CSS selectors.
- Add fake-timer support only where the real lifecycle is time-based; restore timers after every test.
- Add a permanent browser harness under `tests/browser/` with exact package scripts: `test:browser:static`, `test:browser:live-account-disabled`, `test:browser:live-account-enabled`, and aggregate `test:browser`.
- The static subordinate script must strip every Shopify catalog/cart/account credential in a script-owned child environment. The live-account-disabled script must require live catalog/cart credentials while stripping account credentials. The live-account-enabled script must require the complete live catalog/cart/account environment. Missing required live configuration is a hard failure, never a skip.
- Each subordinate script must start/consume its own fresh production build, use an isolated browser profile, and shut down cleanly.
- Browser coverage may use an audited project dependency or a dependency-free Chrome DevTools Protocol harness. The command must fail non-zero on assertion, console, network, startup, or cleanup failure.

### Contract mapping

#### Home

Preserve:

- exact accepted section/content hierarchy until Phase 2 deliberately migrates it;
- concise presentation-owned product summaries;
- accessible product/collection/article links and image alternatives;
- short-desktop Spotlight/Kit bounds;
- mobile natural-height stacking;
- no Journal card stagger;
- reduced-motion behavior.

#### Shell

Preserve:

- shared icon semantics;
- Header desktop/mobile labels, open state, Escape, outside dismissal, focus trap/restoration, inert/body lock, route-active state, and query ownership;
- country/localization truthful submission contract;
- mini-cart repeated-add lifecycle, exact live cart state, focus pause/resume, dismissal, and accessible announcement;
- Footer truthful integration gating and external-link semantics;
- button/swatch target, focus, disabled/sold-out states.

#### PDP

Preserve:

- exact selected variant and URL ownership;
- variant-level price/compare-at/sold-out truth;
- option readability and focus;
- selected media and natural fourth-plus gallery behavior;
- ATC exact merchandise identity and stale-selection protection.

#### Site Header

Preserve:

- logo/wordmark contract;
- canonical menu semantics;
- runtime status/accessibility text;
- query-preserving wrapper behavior where meaningful;
- Header fail-soft cases added in Phase 4.

### Phase 0 acceptance

- No test in the four migrated suites reads `src/app/*.css` or TSX source to assert shopper-visible behavior.
- Behavior tests fail when the corresponding DOM/interaction behavior is deliberately broken.
- Browser tests prove representative desktop and `390x844` behavior.
- Legacy source and styles remain functionally unchanged.
- Focused suites, full `bun run check`, `bun run test:browser`, and `git diff --check` pass.

## Phase 1 — Tailwind v4 theme

### Goal

Create one semantically named effective token contract without changing rendered output.

### Extraction

Derive the winning computed values from the current import order:

1. `globals.css`
2. `canonical-source.css`
3. `site-header.css`
4. `production-polish.css`

Record at least:

- surfaces/backgrounds/ink/muted/borders;
- signal/accent/danger/sale/focus colors;
- body/display/mono font families and weights;
- text scales/line heights/letter spacing;
- shell/page max widths and gutters;
- Header/announcement dimensions;
- spacing/radius/border/shadow primitives;
- breakpoints and motion timings.

### Target

`src/app/globals.css` owns:

- `@import "tailwindcss"`;
- `@theme` values with semantic names;
- minimal global base for document defaults, focus policy, selection, and reduced motion when utilities cannot own it cleanly.

Install `class-variance-authority` as a production presentation dependency in this phase. DOM/browser harness and React Compiler packages remain development dependencies; the structural HTML parser is the separately documented minimal runtime exception.

Token names describe values/roles. Forbidden examples include `orange` for acid lime or `display` for a family that changes by cascade accident.

### Phase 1 acceptance

- Token table documented in this spec/work log.
- Tailwind emits representative custom utilities used by a small non-visual probe.
- Existing UI remains visually unchanged.
- No duplicate effective token definitions across legacy files.
- Focused tests and `bun run check` pass.

## Phase 2 — presentation migration

### General slice loop

For every slice:

1. Freeze a desktop/mobile baseline screenshot outside Git.
2. Convert markup to semantic Tailwind utility strings.
3. Use `cn()`/`cva` for actual conditions/variants.
4. Delete only selectors proven unreferenced by a full-tree search.
5. Run focused DOM tests.
6. Run browser comparison at desktop, short desktop if height-sensitive, and `390x844`.
7. Repeat navigation cycles when the slice participates in shared runtime reuse.
8. Commit a coherent slice only after focused green evidence.

### 2A — document and shell

Files/owners:

- `src/app/layout.tsx`
- `src/components/site-header.tsx`
- current Header implementation/subcomponents
- `src/components/country-control.tsx`
- `src/components/mini-cart.tsx`
- `src/components/site-footer.tsx`
- `src/components/icon.tsx`
- `src/components/wordmark.tsx`

Acceptance:

- announcement, desktop Header, mega panel, mobile dialog, localization, cart utility, mini-cart, skip link, and Footer match accepted Production behavior;
- active/query state survives repeated navigation;
- full keyboard/focus/inert/body-lock contract passes;
- no shell selector remains in legacy CSS.

### 2B — Home

Files:

- `src/app/page.tsx`
- `src/components/product-card.tsx`

Acceptance:

- current accepted section order/content/data handles remain unless Leo explicitly changes them;
- short desktop and true mobile pass geometry/overflow;
- media uses optimized `next/image` and existing source/alt contracts;
- no Home selector remains in legacy CSS.

### 2C — catalog/search

Files:

- `src/app/shop/page.tsx`
- `src/app/shop/[collectionHandle]/page.tsx`
- `src/app/search/page.tsx`
- product-card owner/variants

Acceptance:

- filters/sort/search/query state and product-card colorway interaction remain correct;
- desktop/mobile product grids and empty states match baseline;
- no PLP/search/product-card selector remains in legacy CSS.

### 2D — PDP

Files:

- `src/app/products/[productHandle]/page.tsx`
- `src/app/products/[productHandle]/product-detail.tsx`
- ATC owner after colocation

Acceptance:

- exact variant query/price/sale/sold-out/media/cart identity;
- 44px options, readable labels, focus/disabled states;
- natural fourth-plus media and full-screen zoom behavior if present;
- no PDP selector remains in legacy CSS.

### 2E — Cart and Account

Files:

- `src/app/cart/**`
- `src/app/account/**`
- cart/account components moved in Phase 3

Acceptance:

- static/live cart modes render equivalent accessible UI while preserving different runtime ownership;
- checkout and account links remain raw/full-page where required;
- authenticated pages retain private/no-store behavior;
- address/order states and disabled/error/loading states remain truthful;
- no cart/account selector remains in legacy CSS.

### 2F — content and system states

Files:

- `src/app/journal/**`
- `src/app/pages/**`
- `src/app/policies/**`
- `src/app/about/**`
- `src/app/materials/**`
- `src/app/field-testing/**`
- `src/app/loading.tsx`
- `src/app/error.tsx`
- `src/app/not-found.tsx`

Acceptance:

- rich-text runs and canonical links remain structured;
- editorial grids/motion/mobile layouts match accepted baseline;
- loading/error/404 remain accessible and visually coherent;
- no content/system selector remains in legacy CSS.

## Phase 3 — ownership and variants

### Header feature folder

Create a cohesive Header feature boundary under `src/components/site-header/` (or equivalent agreed folder) for:

- field-index Header;
- query-preserving wrapper;
- cart count;
- country control;
- mini-cart;
- Header-only navigation/presentation mapping.

Keep public `SiteHeader` ownership obvious; do not use a barrel export merely to preserve stale paths.

### Route colocation

Move:

- cart view implementations → `src/app/cart/`;
- address form → `src/app/account/addresses/`;
- ATC form → `src/app/products/[productHandle]/`.

### Variants

- Apply the Phase 1 `class-variance-authority` dependency to reusable button, link, badge, option, surface, and state variants where it reduces duplicated conditional strings.
- Keep one-off static utility strings inline.
- Use `cn()` for conditions; do not create a second class merge helper.

### Phase 3 acceptance

- Full stale-import search returns no old paths.
- No compatibility shim or duplicate component remains.
- Component ownership matches actual consumer count.
- Typecheck, focused tests, full check, and browser shell/cart/PDP smoke pass.

## Phase 4 — correctness and runtime boundaries

### Header fail soft

Separate two responsibilities:

- live data adapters/verifiers may fail closed when the canonical Store contract is incomplete;
- root-layout presentation must not throw because optional mega-panel presentation metadata is absent or malformed.

Behavior:

- ordinary valid links still render;
- unsupported Shop/About enhancements degrade to plain navigation or hide the panel;
- accessible controls do not advertise a panel that cannot open;
- no render-time exception takes down unrelated routes;
- sanitized diagnostics may be server-side only; no raw merchant data/secrets in shopper errors.

Add direct behavior tests for missing Shop, missing About children, unexpected Shop child count, and unmapped presentation handles.

### Structural HTML parser

- Select a maintained parser that supports server/Node execution and does not rely on browser globals.
- Parse into a tree; never sanitize structure/attributes with regex.
- Walk an explicit allowed-tag set.
- Allow only `href` on anchors.
- Preserve exact external/internal URL rules, credential rejection, canonical collection rewrites, entity handling, block extraction, heading/paragraph/pullquote/list semantics, and fail-closed malformed/empty behavior.
- Add adversarial parser tests: malformed nesting, comments, encoded payloads, mixed-case tags/attributes, duplicate attributes, unquoted values, event handlers, protocols, credentials, protocol-relative/backslash targets, disallowed embedded content, and Liquid.
- Audit the dependency and production bundle.

### React Compiler

Spike supported Next 16 configuration. Accept enablement only if:

- official config path is used;
- package/lockfile are deterministic;
- typecheck/build/tests remain green;
- no unsupported Babel mode or measurable build regression is introduced.

Otherwise record the decision to keep it disabled and remove any repo convention claiming automatic compiler memoization. Ordinary `useMemo` remains allowed only where semantically useful.

### ProductCard boundary

Try a server-owned card with the smallest client island for swatch/media state. A CSS-only approach is acceptable only if it preserves:

- keyboard-operable native controls;
- selected state/name;
- image/link target update semantics;
- query state;
- touch behavior;
- no duplicate full-card interactive nesting.

Keep the existing client component if the alternative weakens behavior or creates a more complex hydration boundary; record measured rationale rather than forcing a nominal server component.

### Phase 4 acceptance

- Focused adversarial tests pass.
- Full `bun run check` and browser shell/product-card tests pass.
- No new security warning or shopper-visible fail-open behavior.

## Phase 5 — cleanup and release candidate

### Required deletions

- `src/app/canonical-source.css`
- `src/app/site-header.css`
- `src/app/production-polish.css`
- their root-layout imports
- source-regex UI helpers/assertions
- dead global classes, tokens, and unused dependencies

### Static proof

Add architecture checks that assert outcomes, not old source shape:

- root layout imports only `globals.css` globally;
- legacy stylesheet paths do not exist;
- no production class uses a known legacy semantic selector namespace;
- Tailwind utilities exist across every presentation owner;
- no CSS `!important` remains unless a documented platform override is unavoidable;
- no raw fixture or Shopify shape crosses the data boundary;
- no stale moved imports/filenames remain.

### Full verification

```bash
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run format:check
bun test
bun run check:graphql
bun run build
bun run check:routes
bun run smoke:routes
bun run check
bun run verify:static
bun run verify:live
bun run test:browser
bun audit --production
git diff --check
```

Also run:

- `bun run test:browser` on fresh production builds for explicit-empty static/account-disabled, live-catalog/account-disabled, and complete live-catalog/account-enabled matrices;
- desktop standard viewport;
- short desktop `1280x400`;
- true mobile `390x844`;
- repeated Home/Shop/PDP/Cart/navigation cycles;
- mini-cart repeated add and focus lifecycle;
- account enabled/disabled smoke without mutation in the named browser matrix;
- content/journal/policy rich-text routes;
- unknown route/404;
- browser console/network asset audit;
- full-tree secret/debug/generated-artifact scan;
- independent exact-candidate review and one post-fix review if needed.

## Release handoff

Before opening the PR, record:

```text
Base SHA:
Candidate SHA:
Logical commits:
Changed files:
Deleted legacy files:
Old/new test count:
Automated verification:
Browser verification:
Live Shopify read-only verification:
Dependency audit:
Independent review:
Residual/manual risks:
PR URL:
```
