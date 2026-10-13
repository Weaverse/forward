# Plan: Collection list at /categories

## Route

| Page | Route | Weaverse page |
| --- | --- | --- |
| Collection list | `/categories` | `COLLECTION_LIST`, declared as `routes.COLLECTION_LIST: "/categories"` |

- `/collections` → 308 `/categories`; menu link `/collections` → `/categories` (`theme-routes.ts`). `/collections/all` and `/collections/:handle` keep redirecting to `/shop`.
- The route reads every collection (`listCollections()`), loads the `COLLECTION_LIST` page and passes the collections through the data context, as `/shop` does with its products. No Weaverse page → `notFound()`.

## Naming

"Category" already means a product's `productType` in Forward, and Shopify has its own product category taxonomy. Only the URL says `categories`; code, schema types and Studio titles say collection list. AGENTS.md records it as an approved change.

## Sections

Same shape as the browse and article-feed trees:

- `main-collection-list` (`COLLECTION_LIST` only, `limit: 1`): shell on the shared `Section` with layout inputs (full width, no padding by default). Renders nothing without collections in the data context.
- `cl--header`: the page heading and lede as `heading` / `paragraph` children on the page measure (like `ap--header`).
- `cl--grid`: every collection as a card linking to `/shop/<handle>`; columns (2/3/4) and content width.
- The card markup moves out of `collection-index` into a shared `CollectionCard`, which both sections render; `collection-index` keeps its look and its merchant-picked collections.

## Data

`StorefrontDataContext.collections` (all collections, store order). No new query: `listCollections()` already exists.

## Other

- Route contract (`/categories`, redirect), smoke, sitemap (`/categories`).
- Seed `template-collection-list.json` with `main-collection-list`; the template is created in Studio or seeded before release, or `/categories` answers 404.

## Verification

- Full gates and `smoke:routes` before push.
- Manual: page selector opens `/categories`; every collection shows and links to its `/shop/<handle>`; `/collections` redirects; `collection-index` on Home unchanged.

## Files touched

| File | Change |
| --- | --- |
| `src/app/[locale]/categories/page.tsx` | New `COLLECTION_LIST` route |
| `src/lib/weaverse/{request-info,theme-schema,data-context,components,section-schemas}.ts(x)` | Page type, route, context, registry |
| `src/sections/{main-collection-list/,collection-card.tsx,collection-index/index.tsx}` | Shell, `cl--*` children, shared card |
| `src/lib/routes/route-contract.ts`, `src/lib/storefront/shopify/theme-routes.ts`, `src/app/sitemap.ts` | Route, redirect, menu mapping, sitemap |
| `scripts/weaverse-seed/template-collection-list.json` | Seed |
| `AGENTS.md` | Approved change |
| `tests/**` | Expectations |
| `.weaverse/specs/2026-10-13--categories-collection-list/` | This spec |
