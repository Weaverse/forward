# Work Logs

## 2026-09-28 — @hta218

- Reordered the plan's commits: the fixture move could not come first, since
  `StaticStorefrontDataSource` in `src/` imported the fixtures. It landed with
  the fail-closed data source instead.
- Header/footer copy now reads Weaverse theme settings (`readThemeSettings`);
  Search and Account are `SEARCH_LINK` / `ACCOUNT_LINK` in
  `header-navigation.ts`. `demoNotice`, `footerStatus` and the unused
  `standardBandImage` setting are gone.
- One cart: `src/lib/demo-cart/` and `src/app/cart/cart-view.tsx` deleted,
  `MAX_LINE_QUANTITY` moved to `shopify-cart-react.tsx`. DOM tests render
  inside a `ShopifyCartProvider` (`renderWithCart` in `tests/dom/harness.tsx`);
  the mini-cart suite drives the add signal directly, and the PDP asserts the
  exact `merchandiseId` / `quantity` the form submits.
- `readShopifyCatalogConfig` never returns `null`; `createStorefrontDataSource`
  always builds the Shopify adapter. Because `storefront` is created when
  `data-source.ts` loads, no test imports that module.
- Fixtures moved to `tests/fixtures/storefront/`; a test now asserts no file
  under `src/` imports fixtures. Static-only tests were deleted; search tests
  moved to `tests/catalog-search.test.ts`, sort tests to `tests/sort.test.ts`,
  and DOM facets use `tests/fixtures/storefront/filters.ts`.
- `public/images/products/` and the local-path image allowlist are deleted.
- `verify:static`, `test:browser:static` and the `static` matrix are gone;
  browser tests keep only their live branches.
