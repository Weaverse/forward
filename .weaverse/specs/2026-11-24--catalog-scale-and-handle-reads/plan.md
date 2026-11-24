# Plan

## Contract changes

- `CatalogQueryExecutor` takes a cursor. `ShopifyCatalogDataSource` reads every
  page (`mapCatalogPage`), then `assembleCatalog` rejects duplicate handles and
  applies the related-products rule over the complete catalog. A page with
  `hasNextPage` and no `endCursor` is a broken read. Variants and media keep
  their per-product bounds and still fail on truncation.
- `getProduct(handle)` reads `product(handle:)` through a new
  `ProductQueryExecutor`, cached per handle. The same execution reads up to 12
  related candidates with `tag:forward AND product_type:"<type>"` (the type is
  store data, quoted and escaped) and keeps exact type matches, at most four.
  A product without the `forward` tag resolves to `null`, as it did when it was
  absent from the catalog.
- The navigation query reads up to 250 collections (Shopify's page maximum).
  More still fails closed on `hasNextPage`.
- Product, collection, article, blog, page and policy routes drop
  `dynamicParams = false` and `generateStaticParams()`. Each renders on request
  and refreshes on the one-hour catalog window, so new and renamed handles
  resolve, and deleted ones answer 404 once their cache entry expires.

## Out of scope (follow-up)

- Products with only `Title / Default Title`, products without the `forward`
  metafields and colorway media map, and collections containing products
  without the `forward` tag. These need a decision on how the PDP gallery and
  copy render without Forward's editorial data.
- Whether the `forward` ownership tag stays.

## Files

- `src/lib/storefront/shopify/queries.ts`
- `src/lib/storefront/shopify/client.ts`
- `src/lib/storefront/shopify/mapper.ts`
- `src/lib/storefront/shopify/data-source.ts`
- `src/lib/storefront/shopify/cache-policy.ts`
- `src/lib/storefront/shopify/navigation-query.ts`
- `src/lib/storefront/data-source.ts`
- `src/app/[locale]/{products,shop,journal,archive,pages,policies}/**/page.tsx`
- `src/app/[locale]/[...slug]/page.tsx` (comment)
- `tests/shopify-catalog-adapter.test.ts`, `tests/production-polish-pdp.test.ts`,
  `tests/shopify-navigation-adapter.test.ts`,
  `tests/fixtures/shopify-catalog-response.ts`
