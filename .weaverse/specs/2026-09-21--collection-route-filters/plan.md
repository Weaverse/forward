# Plan — Collection route filters

## Problem

`/shop` (`src/app/shop/page.tsx`) is a hand-written theme-owned page that parses
`category`, `activity` and `sort`, derives filter groups from the catalog, and
renders `FilterSidebar` + `ProductResults`.

`/shop/[collectionHandle]/page.tsx` renders nothing of its own: it forwards
`searchParams` to `loadWeaversePage()` only and returns `<WeaversePage>`. The
composed page is `collection-hero` + `system-manifest` + `collection-grid` +
`field-practice`, and `collection-grid` maps the whole product array. No query
state is parsed anywhere on the route, and `getCollectionProducts(handle)` has
no parameter to carry a filter through.

## Approach

Adopt Pilot's *organization* — a composable section tree whose filter state
lives in the URL and is resolved by the route — implemented against Forward's
normalized `Product` model. No Pilot source is translated.

```
collection-hero          (unchanged — already the page header)
main-collection          shell: layout + MainCollectionContext
├─ mc--toolbar           count, sort control, mobile filter disclosure
└─ mc--content           two-column wrapper
   ├─ mc--filters        facet sidebar
   └─ mc--product-grid   grid, pagination, empty state
```

`collection-grid` is retired; `mc--product-grid` supersedes it and nothing in
the repository references it outside the two registries.

### Query contract

The collection route reuses `/shop`'s param names rather than inventing a
second convention: `?category=&activity=&sort=`, plus `?page=` for the grid.
One module owns parsing, facet derivation and href building for both routes.

### Data boundary

`getCollectionProducts(handle, filter?, sort?)` gains the same optional
parameters `listProducts` already has, and both adapters run the existing
`filterAndSortProducts` over normalized records, so live mode cannot drift from
static mode. Facets are derived from the collection's *unfiltered* products so
options never disappear mid-filter; counts are computed against the filter.

### Pagination

Page-number pagination held in the URL and applied by `mc--product-grid`, whose
`pageSize` is a merchant setting. Slicing is client-side over the collection's
product list, which is already fully loaded in memory by both adapters. Marked
with a `ponytail:` comment naming the ceiling.

## Files and folders touched

**New**

- `src/lib/storefront/catalog-facets.ts` — filter/sort parsing, facet
  derivation, href building; shared by `/shop` and the collection route
- `src/sections/main-collection/index.tsx`, `schema.ts`, `context.ts`
- `src/sections/main-collection/toolbar/index.tsx`, `schema.ts`
- `src/sections/main-collection/content/index.tsx`, `schema.ts`
- `src/sections/main-collection/filters/index.tsx`, `schema.ts`
- `src/sections/main-collection/product-grid/index.tsx`, `schema.ts`
- `.weaverse/specs/2026-09-21--collection-route-filters/`

**Changed**

- `src/lib/storefront/data-source.ts` — `getCollectionProducts` signature,
  static implementation
- `src/lib/storefront/shopify/data-source.ts` — same signature, live path
- `src/lib/weaverse/data-context.tsx` — collection facets, filter, sort, total
- `src/lib/weaverse/components.ts`, `src/lib/weaverse/section-schemas.ts`
- `src/app/shop/[collectionHandle]/page.tsx` — parse query, resolve products
- `src/app/shop/page.tsx` — consume the shared facet module
- `src/components/filter-sidebar.tsx` — types move to the facet module
- `src/sections/product-results.tsx` — follow the type move
- `tests/storefront-data-source.test.ts`, `tests/dom/composed-sections.test.tsx`
- `AGENTS.md` — amend the theme-owned-grid clause

**Removed**

- `src/sections/collection-grid/`

## Verification

`bun run check` (typecheck, lint, format:check, test, check:graphql, build,
check:theme, check:routes), then `bun run smoke:routes`.
