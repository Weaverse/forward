# Work Logs

## 2026-08-05 — @hta218 (Claude)

Static demo productionization pass on `feat/static-demo` (worktree
`forward-static-demo`), continuing the existing uncommitted implementation.

### Done

- Ran `bun install --frozen-lockfile` and Biome 2.5.7 format/check across the
  repository (`biome format --write`, `biome check --write` for safe fixes).
- Fixed the three Biome `lint/a11y/useSemanticElements` errors with native
  semantics instead of rule suppression:
  - `add-to-cart-form.tsx`: size selector is now a real radio group —
    visually-hidden `<input type="radio">` inside styled 44px labels within
    the existing `<fieldset>`/`<legend>`; native arrow-key behavior replaces
    manual `role="radio"`/`aria-checked` buttons.
  - `product-card.tsx`: colorway swatches converted the same way, grouped by
    a `<fieldset>` with an sr-only `<legend>` (was `role="radiogroup"` +
    `role="radio"` buttons); swatch labels stay accessible via sr-only text.
  - `cart-view.tsx`: per-line quantity control grouped by `<fieldset>` with an
    sr-only `<legend>` (was `div role="group"` + `aria-labelledby`).
  - Focus visibility on the hidden radios is restored on the labels via
    `has-focus-visible:outline-*` so keyboard focus stays visible.
- Kept the `prefers-reduced-motion` global reset intact; the three
  `!important` declarations carry a narrow, justified
  `biome-ignore-start/end lint/complexity/noImportantStyles` range (the reset
  must beat inline styles and utility-layer specificity, so `!important` is
  genuinely required there). No Biome rules were weakened.
- Added focused Bun tests (49 new assertions across three files, 53 total
  passing with the existing route-contract suite):
  - `tests/storefront-data-source.test.ts` — unknown handles resolve to
    `null` for products/collections/articles/pages/policies/demo orders;
    known-handle round-trips; search empty/whitespace/no-match/multi-term/
    case-insensitive/colorway-name behavior.
  - `tests/product-state.test.ts` — `resolveColorway` fallbacks,
    `isKnownColorway`, four-image `galleryImages` order, canonical vs.
    parameterized `productColorwayHref` deep links and URL encoding.
  - `tests/demo-cart-logic.test.ts` — `lineKey` identity, add/merge/clamp,
    set-quantity/remove semantics, subtotal/shipping/total thresholds, and
    `sanitizeLines` revival hardening.
- Verified all routes consume data exclusively through the `storefront`
  data-source seam (no direct fixture imports from pages/components) and all
  dynamic routes call `notFound()` for unknown handles. Removed the dead
  foundation-slice scaffold (`src/components/product-tile.tsx`,
  `src/lib/shell-fixtures.ts`) that was no longer referenced.
- Updated `AGENTS.md` and `README.md` to Bun/Biome truth (commands, port
  3333, static data boundary, static-vs-live deferred list).

### Verification

- `bun install --frozen-lockfile` — no changes.
- `bun run check` (typecheck → lint → format:check → test → build →
  check:routes) — pass.
- `bun run smoke:routes` — pass (all contract paths + 308 redirects over
  HTTP against the production build).
- `git diff --check` — clean.

### Boundaries confirmed

- No push, deploy, PR, Shopify store connection, credentials, or `.env`.
- Pilot and POC source were not inspected.

## 2026-08-05 — @hta218 (Hermes review closeout)

Independent source review requested changes for two medium and four low findings.
All six were resolved or closed with concrete evidence:

- `check:routes` now requires `.next/BUILD_ID`, so stale development manifests
  cannot satisfy the standalone production-build gate. A negative probe with
  `BUILD_ID` temporarily absent exited `1` and named `bun run build`.
- Bun is pinned as `packageManager: bun@1.3.14`; active route-gate comments and
  diagnostics no longer instruct maintainers to use npm, and the route-contract
  comment references Shared Contract `0.5-draft`.
- Browser-owned cart lines now reject non-finite/negative prices, non-USD money,
  unsafe product links, external product images, invalid image dimensions,
  non-canonical keys, and malformed handles. Focused revival tests cover the
  rejected states.
- Production HTTP smoke now covers unknown collection, product, article, page,
  policy, and order handles. Fixture-backed dynamic routes use
  `generateStaticParams` with `dynamicParams = false`; the PDP moved only its
  query-driven colorway state into a scoped Client Component so it remains SSG
  while preserving `?colorway=` deep links and browser history.
- Demo order lines carry `colorwayId`, validate against normalized products,
  and link back to the exact ordered colorway. Tests and production-browser DOM
  assertions cover the Limestone and Dune non-default links.
- Required browser acceptance evidence is recorded below rather than inferred
  from unit/build success.

### Final verification

- `bun install --frozen-lockfile --ignore-scripts` — no changes.
- TypeScript, Biome lint, Biome format, Bun tests, Next production build, and
  `check:routes` — pass.
- `bun run smoke:routes` — 30 production HTTP checks passed: 19 canonical
  route/resource surfaces, six unknown-handle 404s, the root 404, and four 308
  compatibility redirects.
- Real Chrome production acceptance at desktop `1440×1000` and true mobile
  `390×844` — 20 route/viewport sweeps, zero console errors, zero horizontal
  overflow, and zero broken or pending images.
- Commerce flow — removed both seeded lines, added two Claystone/M Weatherline
  Shells, verified navigation persistence, increased quantity to three, then
  removed the line back to the explicit empty state.
- Colorway/navigation — canonical default → Claystone query → browser Back
  restored Charcoal; three real Shop ↔ Weatherline PDP client-navigation cycles
  preserved the canonical page state.
- Order links — order `1001` exposes the Limestone Talus deep link and order
  `1002` exposes the Dune Ridge deep link.
- Lighthouse accessibility — `1.00` on home and the post-refactor Claystone PDP;
  no failed binary accessibility audits on the PDP.
- Post-refactor desktop/mobile PDP and mobile order screenshots were visually
  reviewed with no blocking overlap, clipping, duplicated Suspense content, or
  selected-state regression.
- `git diff --check` — clean.

Durable evidence:

```text
/Users/hta218/Documents/work/artifacts/forward-static-demo-qa-2026-08-05/
  results.json
  forward-final-qa.py
  lighthouse-home.json
  lighthouse-pdp.json
  desktop-pdp-1440x1000.png
  mobile-home-390x844.png
  mobile-shop-390x844.png
  mobile-products-weatherline-shell-390x844.png
  mobile-cart-390x844.png
  mobile-account-orders-1001-390x844.png
```

### Observed framework caveat

Next.js 16.3.0 logs `Internal: NoFallbackError` when `next start` receives the
six expected misses rejected by `dynamicParams = false`. The HTTP contract is
still correct and verified (`404` for every miss), but the noisy framework log
should be rechecked when the Next baseline changes or when each static domain is
replaced by a live Shopify adapter.

### Boundaries reconfirmed

- No live Shopify/Hydrogen data request, checkout, Customer Account mutation,
  Weaverse runtime connection, credential, `.env`, push, deploy, or PR action.
- Cart and account remain explicitly labeled browser-local/static demo states.

## 2026-08-05 — @hta218 (GitHub handoff)

- Split the verified review closeout into logical production, regression-test,
  and QA-evidence commits.
- Pushed `feat/static-demo` without rewriting history or modifying the earlier
  `feat/fresh-next-theme-foundation` branch.
- Opened PR [#50](https://github.com/Weaverse/forward/pull/50),
  `feat/static-demo` → `main`.
- The foundation branch is a complete ancestor of `feat/static-demo`; it is
  retained until PR review/merge and can be removed during post-merge cleanup.
- No merge, deployment, live integration, credential, or primary-checkout
  mutation was performed.
