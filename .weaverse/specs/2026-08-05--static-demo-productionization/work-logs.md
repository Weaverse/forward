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
