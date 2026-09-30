# Plan: Keep menus on non-default markets

## Finding

Confirmed against the live store (2026-09-30): the `main-menu` read under
`@inContext(country: GB|DE|JP)` returns `/en-gb/…`, `/de-de/…`, `/ja-jp/…`
URLs, with `type` set on every item. Under US there is no prefix.

## Approach

Strip the market subfolder in `toThemePath`, not in the menu mapper.

- `toThemePath` is the one function both menus (`navigation-mapper.ts`) and
  merchant content links (`content-html-parser.ts`) route through, so one
  change covers both.
- A path is matched as-is first. Only when that fails is a leading
  `/xx` or `/xx-yy` segment dropped and the rest matched again, so a path the
  theme already routes is never reinterpreted. `/de` alone becomes `/`, which
  is what Shopify means by it.
- The subfolder is matched by shape, not against `LOCALES`: a store may name
  its subfolders differently from the theme's URL locales (`/de` vs `/de-de`).

### Deviation from the issue checklist

The issue proposed reading the menu item `type` and rebuilding paths from
type + handle. Stripping the subfolder is a smaller change, needs no GraphQL
change, and also fixes content links, which have no `type`. The `type` items
are therefore dropped from scope; `check:graphql` is not needed.

## Test

`tests/shopify-navigation-adapter.test.ts` "routes Shopify paths onto the
theme's own routes" gains market-prefixed cases: relative and store-origin,
collection, article, `collections/all`, a language-only subfolder, and a bare
subfolder.

## Files touched

- `src/lib/storefront/shopify/theme-routes.ts`
- `tests/shopify-navigation-adapter.test.ts`
- `.weaverse/specs/2026-09-30--market-menus/`
- `.weaverse/specs/2026-09-29--locale-routing/work-logs.md`
