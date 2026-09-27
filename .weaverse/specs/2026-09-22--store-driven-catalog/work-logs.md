# Work Logs

## 2026-09-27 — @hta218

- Removed every fallback that substituted content for what the store or the
  Weaverse page did not provide:
  - Routes no longer render their own copy of a section a template omits
    (`/shop`, PDP); a missing Weaverse page is `notFound()`, an empty one
    renders empty; a childless `main-product` renders only its shell, and an
    `mp--*` child outside it renders nothing.
  - Studio revalidation without a route context is an error, not a bare client.
  - Shopify mode no longer falls back to static navigation, footer or
    collection structure. Menus map whatever the merchant arranged
    (`navigation-mapper.ts`): Shopify paths route onto theme routes, a missing
    menu is empty, and off-store or unroutable links are left out.
  - The header Shop panel is built from the merchant's Shop links, dressed with
    each collection's own description, image and field code. The
    `FIELD_INDEX_PRESENTATION` and `COLLECTION_PRESENTATION_PROFILES` tables
    are gone; the static profiles now live only in `fixtures/collections.ts`.
- Collection images: the CDN allowlist is scoped to the store tenant, so
  `collections/` images pass alongside `files/`.
- Files: `src/lib/weaverse/server.ts`, `src/app/{shop,products}/**`,
  `src/sections/main-product/{index,context}.tsx`,
  `src/app/api/weaverse/revalidate/route.ts`,
  `src/lib/storefront/shopify/{navigation-mapper,data-source}.ts`,
  `src/lib/storefront/{data-source,image-source}.ts`,
  `src/lib/storefront/fixtures/collections.ts`,
  `src/components/site-header/**`, `scripts/verify-shopify.mts`, and their tests.
