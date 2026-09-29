# Plan: Remove static mode

## Decisions

| Question | Decision |
| --- | --- |
| Where fixtures live | Move to `tests/fixtures/storefront/`; `src/` can no longer reach them. |
| Search / Account / Cart links | Constants in the header code. They are theme routes, not merchant content. |
| `demoNotice`, `footerStatus` | Delete from `ThemeContent`, theme settings, and the footer. |
| Previews | Vercel previews already carry the Shopify env; nothing to add. |
| Missing env | `createStorefrontDataSource` throws a sanitized configuration error; the build and every route fail closed. |

## Current state (what static mode touches)

- `src/lib/storefront/data-source.ts` holds `StaticStorefrontDataSource`,
  `localCollectionPage`, `storefrontRuntimeMode`, and selects the static
  adapter when `readShopifyCatalogConfig` returns `null`.
- `ShopifyCatalogDataSource` still takes a static `base` for three reads:
  Search/utility navigation, `getThemeContent`, and `getDemoCartSeed`.
- `src/lib/storefront/product-filters.ts` synthesizes Availability/Price facets
  for the static catalog; `catalog-query.ts#sortProducts` only serves it.
- Theme settings already declare `announcement`, `footerTagline`,
  `homeHeroImage`, `standardBandImage`, `footerStatus`, `demoNotice`, but the
  header, footer and not-found page read them from fixtures through
  `storefront.getThemeContent()`.
- The cart has a real Shopify path (`src/lib/cart/shopify-cart-*`). The
  browser-local demo cart (`src/lib/demo-cart/`) runs only when
  `storefrontRuntimeMode === "static"`, switched by `useShopifyCartMode()`.
- `public/images/products/` serves the static catalog's images;
  `image-source.ts#isLocalProductImagePath` allows them.
- `verify:static`, `test:browser:static`, the `static` env/browser matrix, and
  `SHOPIFY_MODE` branches in `tests/browser/` exercise the static build.
- 13 test files import `src/lib/storefront/fixtures/`.

## Target shape

```
env incomplete ──► createStorefrontDataSource throws (sanitized) ──► build/route fails

storefront (ShopifyCatalogDataSource, no `base`)
  catalog, collections, pages, articles, policies, menus  ← Shopify only
theme settings (loadWeaverseThemeSettings)
  announcement, footerTagline, homeHeroImage              ← Weaverse only
header code
  SEARCH_LINK, UTILITY_LINKS (/search, /account, /cart)   ← theme routes
cart
  Shopify Cart API only
tests/fixtures/storefront/                                 ← test data only
```

## Steps

### 1. Fail closed without Shopify

- `src/lib/storefront/shopify/env.ts`: `readShopifyCatalogConfig` returns a
  config or throws. An absent environment becomes the same sanitized
  configuration error a partial one already raises. Keep the message free of
  values.
- `src/lib/storefront/data-source.ts`:
  - Delete `StaticStorefrontDataSource`, `localCollectionPage`, `decodeCursor`,
    `storefrontRuntimeMode`, and the static branch of
    `createStorefrontDataSource`.
  - Drop `getThemeContent` and `getDemoCartSeed` from `StorefrontDataSource`.
  - Keep the interface and `storefront` export; `createStorefrontDataSource`
    now always builds `ShopifyCatalogDataSource`.
- `src/lib/storefront/shopify/data-source.ts`:
  - Remove the `base` option and every `#base` read.
  - `getNavigation()` returns `{ primary, footerColumns }` from the store only.
  - Delete `getThemeContent` and `getDemoCartSeed`.
- `src/lib/storefront/types.ts`: drop `ThemeContent`, `DemoCartSeedLine`, and
  `SiteNavigation.utility`. Fix the fixture reference in the file comment.
- Delete `src/lib/storefront/product-filters.ts`, and `sortProducts` from
  `catalog-query.ts` (its only caller was `localCollectionPage`).

### 2. Theme-owned links as header constants

- `src/components/site-header/header-navigation.ts`: add
  `SEARCH_LINK = { href: "/search", label: "Search" }` and
  `UTILITY_LINKS = [{ href: "/account", label: "Account" }, { href: "/cart", label: "Cart" }]`.
  Take the hrefs from `src/lib/routes/route-contract.ts` if it already exports
  them, so path strings are not duplicated.
- `site-header.tsx` / `field-index-header.tsx` / `mobile-menu.tsx`: read Search
  and the utility links from these constants rather than from
  `navigation.primary` / `navigation.utility`. The account filter
  (`getCustomerAccountRuntime() === null` → no Account) stays in `SiteHeader`.

### 3. Theme content from theme settings

- `site-header.tsx`: announcement comes from
  `loadWeaverseThemeSettings()` (`headerSettings.announcement`). If it is empty,
  no announcement bar is rendered.
- `site-footer.tsx`: `footerTagline` comes from the footer settings. Delete the
  `footerStatus` rail span.
- `src/app/not-found.tsx`: the panel image is `collections[0]?.heroImage`,
  otherwise the `homeHeroImage` setting through `weaverseImage`, otherwise no
  image.
- `src/lib/weaverse/settings/footer.ts`: delete `footerStatus` and
  `demoNotice`.
- `src/lib/weaverse/settings/editorial-imagery.ts`: delete `standardBandImage`
  (no consumer outside fixtures). `settings/types.ts` follows by derivation.
- Read settings through the `ThemeSettings` type (as `layout.tsx#pageWidthStyle`
  does), so renaming an input breaks at compile time.

### 4. One cart: Shopify

- Delete `src/lib/demo-cart/` (`cart-logic.ts`, `store.ts`,
  `use-demo-cart.ts`). Move `MAX_LINE_QUANTITY` (and `lineKey` if the Shopify
  path still needs it) into `src/lib/cart/` next to its only remaining users.
- `src/app/cart/page.tsx`: drop `buildSeedLines` and the static branch; always
  render `ShopifyCartView`. Delete `src/app/cart/cart-view.tsx` if it has no
  other user after this.
- `src/components/add-to-cart-form.tsx`, `site-header/cart-count.tsx`,
  `site-header/mini-cart.tsx`: remove the demo branches and
  `useShopifyCartMode()`.
- `src/lib/cart/shopify-cart-react.tsx`: delete `useShopifyCartMode` and the
  `enabled` prop of `ShopifyCartRuntime`. `src/app/layout.tsx` always loads
  `standard-actions.js` and mounts the runtime.

### 5. Images

- `src/lib/storefront/image-source.ts`: keep `isShopifyProductImageUrl`; delete
  `isLocalProductImagePath`, `isAllowedProductImageSrc`, and the demo-cart
  wording.
- Delete `public/images/products/` if no remaining runtime path references it.
  Fixture image paths stay as strings in test data; tests never fetch them.
  Keep `public/images/editorial/` and `public/images/brand/`, which Weaverse
  schema defaults and the theme use.

### 6. Fixtures become test data

- `git mv src/lib/storefront/fixtures tests/fixtures/storefront`. Rewrite the
  fixtures' own imports of `../types` to `../../../src/lib/storefront/types`
  (or the `@/` alias where the test runner resolves it).
- Update the 13 importing test files. DOM tests keep using fixtures as
  rendered data. Tests that built `StaticStorefrontDataSource`:
  - `tests/storefront-data-source.test.ts`, `tests/collection-page.test.ts`:
    delete static-adapter coverage (unknown handles, local paging, synthesized
    facets). Keep anything that asserts live mapping by moving it to the
    Shopify adapter tests.
  - `tests/shopify-*-adapter.test.ts`: drop the `base:` argument and the
    "static mode unaffected" / "matches static" assertions.
- Add one guard to `bun run check`: a test asserting that no file under `src/`
  imports `tests/fixtures`. Plain `grep` in a node test is enough.

### 7. Scripts and verification matrix

- `package.json`: delete `verify:static` and `test:browser:static`;
  `test:browser` runs the two live matrices.
- `scripts/env-matrix.mts`, `scripts/verify-matrix.mts`,
  `scripts/browser-matrix.mts`: drop the `static` matrix. `verify-matrix` keeps
  only `live`.
- `tests/browser/playwright.config.ts`, `tests/browser/fixtures.ts`: default
  matrix becomes `live-account-disabled`; delete `SHOPIFY_MODE` and every
  static-only branch or test in `tests/browser/*.pw.ts`.
- `scripts/smoke-routes.mts`: no change beyond requiring the env it already
  loads. Confirm it fails with the sanitized error, not a stack trace, when
  the env is absent.

### 8. Docs and specs

- `AGENTS.md`:
  - Mode selection: a complete environment is required; anything less throws a
    sanitized configuration error. Delete the static-adapter wording.
  - Delete the demo-cart bullet and the `verify:static` /
    `test:browser:static` lines under "Required verification".
  - Fixtures bullet: fixtures live in `tests/fixtures/storefront/`, and runtime
    code never imports them.
- `README.md`, `scripts/README.md`: remove static-mode setup and commands.
- `.weaverse/specs/2026-08-05--static-demo-productionization/README.md`: set
  Status to `deprecated`, add one line pointing to this spec.
- This spec's README: keep **Last Updated** current; add `work-logs.md` as work
  proceeds.

## Order and commits

1. Fixtures move and test import rewrite (no behavior change).
2. Header constants and theme settings (content leaves `getThemeContent`).
3. Cart consolidation (demo cart deleted).
4. Fail-closed data source (static adapter, `base`, `product-filters` deleted).
5. Images cleanup.
6. Scripts, browser matrix.
7. Docs and specs.

Each step leaves `bun run check` green.

## Verification

- `bun install --frozen-lockfile && bun run check`.
- `bun run check:graphql` if any query changes (none expected).
- `bun run smoke:routes` and `bun run verify:live` against the live store.
- `bun run test:browser` (both live matrices).
- `bun run verify:shopify`.
- Negative check: build with the Shopify env removed fails with the sanitized
  configuration error and prints no credential value.
- `rg "fixtures" src` returns nothing that imports test data;
  `rg -i "static mode|verify:static|demo cart" AGENTS.md README.md scripts`
  returns nothing.

## Risks

| Risk | Mitigation |
| --- | --- |
| A theme setting left empty in Weaverse (announcement, tagline, hero image) renders nothing where fixtures used to fill it | Intended: empty renders empty. Confirm the live project has these settings filled before merge. |
| Browser tests relied on the static build for deterministic data | Assertions move to live data the demo store guarantees (`SMOKE_FIXTURES` handles); anything static-only is deleted. |
| `next build` locally or in CI without env now fails | Documented in README and AGENTS; Vercel already has the env. |
| Cart helpers shared with the demo cart | Move the two shared helpers into `src/lib/cart/` before deleting `demo-cart/`. |

## Files and folders touched

**Delete**
- `src/lib/demo-cart/` (`cart-logic.ts`, `store.ts`, `use-demo-cart.ts`)
- `src/lib/storefront/product-filters.ts`
- `src/app/cart/cart-view.tsx` (if unused after step 4)
- `public/images/products/` (if unused at runtime)

**Move**
- `src/lib/storefront/fixtures/` → `tests/fixtures/storefront/`

**Modify: source**
- `src/lib/storefront/data-source.ts`
- `src/lib/storefront/shopify/data-source.ts`
- `src/lib/storefront/shopify/env.ts`
- `src/lib/storefront/types.ts`
- `src/lib/storefront/catalog-query.ts`
- `src/lib/storefront/image-source.ts`
- `src/lib/cart/shopify-cart-react.tsx` (+ helpers moved in from demo-cart)
- `src/lib/weaverse/settings/footer.ts`, `editorial-imagery.ts`
- `src/app/layout.tsx`, `src/app/not-found.tsx`, `src/app/cart/page.tsx`
- `src/components/site-footer.tsx`, `src/components/add-to-cart-form.tsx`
- `src/components/site-header/` (`site-header.tsx`, `field-index-header.tsx`,
  `mobile-menu.tsx`, `header-navigation.ts`, `cart-count.tsx`, `mini-cart.tsx`)

**Modify: tests**
- The 13 fixture importers under `tests/` and `tests/dom/`
- `tests/storefront-data-source.test.ts`, `tests/collection-page.test.ts`
- `tests/shopify-catalog-adapter.test.ts`, `tests/shopify-content-adapter.test.ts`,
  `tests/shopify-navigation-adapter.test.ts`
- `tests/fixtures/shopify-catalog-response.ts` (drop `base` usage in helpers)
- `tests/browser/` (`playwright.config.ts`, `fixtures.ts`, `*.pw.ts`)
- New guard test: no `src/` import of `tests/fixtures`

**Modify: scripts and docs**
- `package.json`
- `scripts/env-matrix.mts`, `scripts/verify-matrix.mts`, `scripts/browser-matrix.mts`, `scripts/README.md`
- `AGENTS.md`, `README.md`
- `.weaverse/specs/2026-08-05--static-demo-productionization/README.md`
- `.weaverse/specs/2026-09-28--remove-static-mode/` (README, work-logs)
