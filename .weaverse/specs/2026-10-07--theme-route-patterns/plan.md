# Plan: Declare Forward's routes for Studio navigation

## Change

`src/lib/weaverse/theme-schema.ts` declares, per the `ThemeRoutes` contract (Weaverse/weaverse#519):

| Page type | Shopify convention | Forward |
| --- | --- | --- |
| `ALL_PRODUCTS` | `/products` | `/shop` |
| `COLLECTION` | `/collections/:handle` | `/shop/:handle` |
| `ARTICLE` | `/blogs/:blog/:handle` | `/journal/:handle` |

`PRODUCT` (`/products/:handle`), `PAGE` (`/pages/:handle`) and `INDEX` (`/`) already match the convention and are left out. Forward registers no `BLOG` or `COLLECTION_LIST` Weaverse page.

`@weaverse/next@0.1.0-alpha.20` (on `@weaverse/schema@0.18.0`) types `routes` as `ThemeRoutes`, and design mode sends the whole schema to Studio.

The Studio side is Weaverse/builder (`getPagePath`). Studio prefixes the market (`/de-de`) itself.

## Tests

`tests/route-contract.test.ts`, "theme routes": every declared route, with `[param]` read as `:handle`, is a pattern in `ROUTE_CONTRACT`.

## QA (after the Builder change is deployed)

- Page selector: an All products, a collection and an article page open `/shop`, `/shop/<handle>`, `/journal/<handle>`.
- The same under the `/de-de` market.
- URL picker: the collection and article lists produce the same paths.

## Files touched

| File | Change |
| --- | --- |
| `package.json`, `bun.lock` | `@weaverse/next` 0.1.0-alpha.20 |
| `src/lib/weaverse/theme-schema.ts` | `routes` |
| `tests/route-contract.test.ts` | Route test |
| `.weaverse/specs/2026-10-07--theme-route-patterns/` | This spec |
