# Plan — Store-driven catalog

## Evidence

A read-only probe of the connected store (Storefront API 2026-07) decided every
mapping below. Structure only was printed; no prices, tokens or bodies.

| Probe | Result |
| --- | --- |
| `collection.products.filters` | `filter.v.availability` (LIST), `filter.v.price` (PRICE_RANGE) — on every collection |
| `QueryRoot.products.filters` | empty — all-products has no facets, which is why Pilot's `/products` is sort-only |
| `productType` | `Outerwear`, `Packs`, `Footwear` |
| `tags` | 48 values; `alpine`/`trail`/`camp`/`travel` present, mixed with material and feature tags |
| option value swatches | none — 0 colors, 0 images |
| `forward.*` metafields | `highlights`, `materials`, `field_specs`, `care`, `colorway_media_map` only |
| `productRecommendations` | returns 8 handles |

## Field sourcing

| `Product` field | Was | Becomes |
| --- | --- | --- |
| facets | `catalog-presentation.ts` profiles | `collection.products.filters` |
| `category` | `profile.category` (3-literal union) | `productType`, typed `string` |
| `activities` | `profile.activities` | `tags` minus infrastructure tags; display only, never a filter |
| `relatedHandles` | `profile.relatedHandles` | `productRecommendations` |
| `subtitle` | `profile.subtitle` | first `forward.highlights` entry |
| `repair` | `profile.repair` | theme setting — brand policy, not per-product data |
| colorway swatch | `profile.colorways` hex | the colorway's own image; the store has no native swatches |

## Approach

Filter state keeps Pilot's contract: `?filter.<key>=<json>` collected into a
`ProductFilter[]` and passed to Shopify as a query variable, so narrowing is
server-side and the facet list is whatever the store exposes. Sort moves to
`ProductCollectionSortKeys`/`ProductSortKeys` with `reverse`. Pagination
becomes cursor-based.

The whole-catalog read is retired: a collection is its own query, so the cache
key includes handle, filters, sort and cursor rather than one blob.

`/shop` becomes sort-only and composed through the `ALL_PRODUCTS` page type,
matching Pilot. `mc--filters` renders whatever facets the response carried, so
a merchant enabling a filter in Search & Discovery gets it with no code change.

## Ordered slices

1. Break the profile dependency in `mapProduct`; widen `ProductCategory`.
2. Re-author `fixtures/products.ts` as literal data; re-source
   `collection-presentation.ts`.
3. Per-collection query with `filters`, `sortKey`, `reverse`, cursors; new
   mapper for the filter connection.
4. Route + `mc--filters`/`mc--toolbar`/`mc--product-grid` onto native facets;
   retire `catalog-facets.ts`'s invented dimensions.
5. `/shop` to `ALL_PRODUCTS` composition, sort-only.
6. Suites and scripts that import the retired module.

## Files and folders touched

**Removed**: `src/lib/storefront/catalog-presentation.ts`

**Changed**: `src/lib/storefront/shopify/{queries,mapper,client,cache-policy,data-source}.ts`,
`src/lib/storefront/{types,catalog-query,catalog-facets,collection-presentation,data-source}.ts`,
`src/lib/storefront/fixtures/products.ts`, `src/app/shop/page.tsx`,
`src/app/shop/[collectionHandle]/page.tsx`, `src/sections/main-collection/**`,
`src/lib/weaverse/{components,section-schemas,data-context}.tsx?`,
`src/lib/weaverse/settings/`, `AGENTS.md`

**New**: `src/sections/all-products/**`

**Suites**: `tests/shopify-catalog-adapter.test.ts`,
`tests/storefront-data-source.test.ts`, `tests/production-polish-home.test.ts`,
`tests/catalog-facets.test.ts`, `tests/dom/collection-browse.test.tsx`,
`tests/browser/home.pw.ts`, `scripts/verify-shopify.mts`
