# Shopify Catalog Adapter — Slice 1

## Status

Approved for implementation on 2026-08-06.

This slice replaces fixture-backed **catalog reads** with a read-only Shopify
Storefront API adapter while preserving the user-approved full canonical
source-port presentation.

It does not implement cart mutations, Customer Account, Weaverse composition,
Shopify Admin writes, deployment, or production rollout.

## Repository and baseline

```text
repository=https://github.com/Weaverse/forward
base branch=main
base SHA=9a69d0a5d275a7c5137412f277d7991ca4a8bb01
task branch=feat/shopify-catalog-adapter
worktree=/Users/hta218/Documents/work/workspace/forward-shopify-catalog-adapter
runtime=Next.js 16.3.0 App Router
package manager=Bun 1.3.14
Hydrogen=0.0.0-preview-116d5d7-20260730141607
```

Clean baseline evidence at the base SHA:

```text
bun install --frozen-lockfile: pass
bun run check: pass
bun test: 56 pass, 0 fail
next build: 33 static/generated pages
check:routes: 19 patterns and 4 redirects
bun audit --production: no vulnerabilities
```

The primary checkout contains an unrelated untracked `.vscode/settings.json`.
Do not modify, stage, copy, or delete it.

## Source authority

1. Approved presentation and route composition:
   `.weaverse/specs/2026-08-05--advanced-visual-realignment/full-canonical-source-port-handoff.md`.
2. Existing normalized contract:
   `src/lib/storefront/types.ts` and `src/lib/storefront/data-source.ts`.
3. Shopify-owned catalog state:
   the dedicated `Forward` Headless publication on
   `forward-xbirmxxt.myshopify.com`.
4. Approved seed contract, for field semantics only:
   `/Users/hta218/Documents/work/artifacts/forward-shopify-seed/store-manifest.json`.
5. Installed Hydrogen guidance under `.agents/skills/`; use its Next.js recipes,
   not React Router/Oxygen conventions.

Do not inspect, copy, import, or emulate Pilot source.

## Locked scope

### Live Shopify-owned fields

The Shopify adapter must own these catalog fields:

- product identity, handle, title, description, product type, tags;
- minimum price and USD currency;
- Color and Size option values;
- variant IDs and availability data when required by the raw query/mapping,
  while cart remains deferred;
- all product media and dimensions;
- the five Storefront-readable `forward` product metafields:
  - `highlights` — `list.single_line_text_field`;
  - `materials` — `multi_line_text_field`;
  - `field_specs` — `json`;
  - `care` — `rich_text_field`;
  - `colorway_media_map` — `json`;
- current Forward product membership/order for the complete catalog;
- normalized product search, filters, and sorting over the live catalog.

### Theme-owned presentation fields

Shopify does not currently own enough data to replace these fields safely. Keep
them in a small explicit catalog-presentation profile keyed by the three
approved product handles:

- canonical plate order (`01`, `02`, `03`);
- normalized category (`shells`, `packs`, `footwear`);
- approved activity labels used by the current filters;
- canonical colorway IDs and CSS swatch colors;
- concise subtitle where the live description is not an equivalent field;
- repair-program copy;
- related-product handle order.

Do not copy the full static `Product` fixture into the Shopify adapter. The
profile may contain only fields that Shopify does not currently own.

### Canonical route collections stay presentation-owned

The approved routes are:

```text
/shop/field-gear
/shop/high-route
/shop/camp-craft
```

The live Storefront API currently exposes these collection handles:

```text
forward
outerwear
packs
footwear
frontpage (pre-existing Shopify default)
```

The live collections have no matching canonical hero image, description, or
field code. Therefore:

- `listCollections()` and `getCollection()` must keep returning the existing
  canonical route collection profiles;
- `getCollectionProducts()` must resolve those canonical profile product
  handles through the active live product adapter;
- `/shop/field-gear`, `/shop/high-route`, and `/shop/camp-craft` must not be
  renamed, removed, or replaced by Shopify category handles;
- the adapter may read/validate Shopify collection membership internally, but
  must not expose `frontpage` or create new public routes in this slice.

A later content/navigation slice can create an explicit Shopify ownership model
for editorial collection landing data.

## Live read-only discovery evidence

A secret-safe probe ran against the actual store on 2026-08-06 using both
Hydrogen client types:

```text
public client: pass
private_no_buyer_context client: pass
shop identity: Forward
products: 3
variants: 26 total, 26 available
product media: 24 MediaImage records
five required forward metafields: present on all three products
colorway_media_map: 6 entries, exactly 4 media IDs each
collections returned: forward, outerwear, packs, footwear, frontpage
```

Live option facts:

```text
weatherline-shell: Color × 2, Size × 5, 10 variants, USD 248
ridge-30-field-pack: Color × 2, 2 variants, USD 198
talus-trail-shoe: Color × 2, Size × 7, 14 variants, USD 168
```

No Storefront write or Admin API call is allowed in this slice.

## Credential and runtime boundary

Existing local environment names:

```text
PUBLIC_STORE_DOMAIN
PUBLIC_STOREFRONT_API_TOKEN
PRIVATE_STOREFRONT_API_TOKEN
PUBLIC_STOREFRONT_ID
```

Rules:

- server catalog reads use `PRIVATE_STOREFRONT_API_TOKEN` with
  `type: "private_no_buyer_context"`;
- `PUBLIC_STOREFRONT_API_TOKEN` is not serialized in this slice; it remains
  reserved for deliberate future client/Studio/ShopifyScripts use;
- `PRIVATE_STOREFRONT_API_TOKEN` must never enter browser code, React props,
  Studio/theme data, analytics config, generated output, logs, errors, tests,
  fixtures, snapshots, specs, or Git;
- `PUBLIC_STOREFRONT_ID=0` is valid for this custom Headless app and is not used
  by catalog queries;
- environment access stays in a server-only module;
- no token value may be sent to Claude or embedded in a command argument;
- errors may name a missing environment key but must not include values or
  request authorization headers.

Selection behavior must be explicit and fail closed:

- tests and environments with no Shopify credential set use the static adapter;
- when `PRIVATE_STOREFRONT_API_TOKEN` is present, the Shopify catalog adapter is
  selected;
- a partial Shopify configuration throws a sanitized configuration error;
- once Shopify mode is selected, network, GraphQL, validation, and mapping
  failures throw; they must not silently serve fixtures.

Keep selection logic injectable/testable; avoid mutating `process.env` in tests.

## Proposed implementation structure

```text
src/lib/storefront/
  data-source.ts
  types.ts
  catalog-presentation.ts
  shopify/
    env.ts
    client.ts
    queries.ts
    mapper.ts
    data-source.ts
    errors.ts
```

Exact filenames may vary if the same boundaries remain obvious.

### Data-source composition

Preserve `StorefrontDataSource`. Export the static implementation for contract
tests and compose a Shopify-backed implementation that overrides only:

```text
listProducts
getProduct
searchProducts
getCollectionProducts
```

Keep these static in Slice 1:

```text
listCollections/getCollection presentation records
articles/pages/policies/navigation/theme content
account orders/addresses
demo cart seed
```

Pages and visual components must continue importing only the exported
`storefront` instance. No page/component may import Shopify queries, raw Shopify
shapes, or fixture records.

## Product mapping contract

### Identity and order

The only approved live handles in this slice are:

```text
weatherline-shell
ridge-30-field-pack
talus-trail-shoe
```

Require the `forward` ownership tag and reject unsupported managed product
shapes with a sanitized adapter error. Keep the canonical order above regardless
of Storefront API title ordering. Unknown handle lookup returns `null` rather
than inventing a product.

### Money

- Parse Storefront `MoneyV2.amount` as a finite number.
- Require `currencyCode === "USD"` because the current normalized model is USD.
- Use the minimum variant price.
- Reject missing, non-finite, negative, or non-USD values.

### Product options

- Shopify `Color` becomes `Product.colorways`, not a `Product.options` entry.
- All non-Color options become normalized `Product.options` in Shopify order.
- This is required because `AddToCartForm` treats the first normalized option as
  the selectable size option.
- Preserve exact live Size labels (`XS…XL`, `US 7…US 13`).
- Do not convert the demo cart to Shopify cart behavior in this slice.

### Colorways

Map exact Shopify Color labels through the presentation profile:

```text
Charcoal / Moss -> charcoal
Claystone / Charcoal -> claystone
Charcoal / Moss / Tan -> charcoal
Dune / Charcoal -> dune
Charcoal / Moss / Gum -> charcoal
Limestone / Clay / Moss -> limestone
```

The ID mapping deliberately preserves current deep links and deferred demo
cart/account references. Keep the full Shopify Color label as the display name
unless visual QA proves a concise approved label is required. Swatch colors are
presentation-owned until Shopify option swatches are configured.

Reject duplicate normalized colorway IDs within one product.

### Media

- Parse `forward.colorway_media_map` as JSON.
- Every Shopify Color label must have exactly four IDs.
- Resolve IDs against the product's queried `MediaImage` nodes.
- Preserve metafield ID order as:
  `primary`, `alternate`, `detail`, `context`.
- Require every referenced ID to exist exactly once and be an image.
- Require every queried `MediaImage` to be referenced exactly once; silently
  discarding valid Shopify product media is a contract failure.
- Require non-empty URL, positive integer width/height, and meaningful alt text.
- Never assume `product.media.nodes` list order represents colorway/role order.
- Configure the mapper, Next Image, and persisted demo-cart sanitizer only for
  HTTPS/default-port URLs on `cdn.shopify.com` under the exact owned tenant
  prefix `/s/files/1/0978/4757/4828/files/`.
- No remote editorial hotlinks are introduced.

### Editorial fields

- `description`: safe plain text derived from `descriptionHtml` while preserving
  paragraph boundaries.
- `detailParagraphs`: deterministic safe text parsed from Storefront
  `descriptionHtml` paragraphs plus `forward.materials`; never render untrusted
  HTML directly or concatenate adjacent blocks.
- `specs`: deterministic label/value rows from `forward.field_specs`; arrays are
  joined as readable text and keys are converted to stable human labels.
- `care`: plain text extracted from valid Shopify rich-text JSON while
  preserving paragraph and list-item boundaries.
- `subtitle`, `plate`, `category`, `activities`, `repair`, `relatedHandles`:
  presentation profile fields as defined above.
- `highlights` must be parsed and validated even if the current approved UI does
  not expose a direct normalized field; use it only if it maps without changing
  approved composition. Do not silently ignore malformed required metafields.

## Search, filters, and sorting

For the current three-product catalog, `searchProducts()` may fetch/map the live
catalog and apply the existing deterministic normalized search locally. This
preserves:

- empty/whitespace query returns `[]`;
- case-insensitive search;
- every term must match;
- title, subtitle, description, category, activities, and colorway display names
  are searchable;
- no raw user query is interpolated into Shopify GraphQL search syntax.

Preserve current category/activity filters and featured/price/name sorting over
live normalized products.

## Static generation and caching

Preserve:

```text
generateStaticParams()
dynamicParams=false
unknown-handle notFound()
metadata generation
current route contract and permanent redirects
```

Catalog reads must use a request-independent Hydrogen
`private_no_buyer_context` client. Do not call `headers()`, `cookies()`, or other
request-time APIs from catalog routes. Add bounded Next-aware catalog caching or
revalidation without turning product/collection routes dynamic. Document the
chosen revalidation value and test it. Slice 1 uses a shared Next Data Cache
window of `3600` seconds. Production reads always reach that wrapper so every
prerender registers the dependency; process-local TTL/in-flight reuse is only a
fallback for the standalone live verifier and deterministic unit tests, which
run outside Next.

## GraphQL contract

- Use `gql()` from the installed `@shopify/hydrogen` package.
- Add the Hydrogen TypeScript plugin without removing the existing Next plugin.
- Add a repository script for `hydrogen gql check` and include it in final
  verification.
- Keep GraphQL documents in server-only modules.
- Handle both transport exceptions and returned GraphQL `errors`.
- Partial GraphQL data with required-field errors is a failure, not a fixture
  fallback.
- Query only bounded counts appropriate to this catalog and fail loudly if a
  configured bound would truncate required products, variants, media, or
  collection membership.

## Testing requirements

### Unit and contract tests

Add deterministic tests for:

1. static adapter remains the default without Shopify configuration;
2. complete Shopify config selects Shopify mode;
3. partial config fails with no secret value in the error;
4. the live-shaped three-product fixture maps to the normalized contract;
5. Color is removed from `Product.options` and becomes colorways;
6. non-Color Size values remain ordered;
7. `colorway_media_map` preserves exact four-role order;
8. missing/extra/duplicate/unknown media IDs fail;
9. invalid JSON/rich text/metafield types fail;
10. missing dimensions/alt text and non-image media fail;
11. invalid/non-USD money fails;
12. unknown handle returns `null`;
13. canonical product and route collection order remains stable;
14. search/filter/sort semantics remain stable;
15. deferred demo cart/account colorway IDs still resolve.

Mock GraphQL response objects, not the Hydrogen client internals. Do not commit
live API response dumps, CDN query signatures, headers, or tokens.

### Live read-only verification

Provide a bounded opt-in script that:

- requires the existing environment;
- uses both public and private clients only to prove credential validity;
- probes private catalog mapping through the real adapter;
- prints only safe summary counts, handles, currencies, media/metafield shape,
  and PASS/FAIL;
- performs no mutations;
- never prints headers, URLs with signed parameters, or token values.

## Visual and route lock

The user approved the merged full canonical source-port before this slice.
Shopify wiring is not permission to redesign it.

After live-mode build, verify at desktop and mobile:

```text
/
/shop
/shop/field-gear
/shop/high-route
/shop/camp-craft
/products/weatherline-shell
/products/ridge-30-field-pack
/products/talus-trail-shoe
/search?q=trail
/cart
/account/orders/1001
```

Check:

- no structural/class/CSS changes except required remote image support;
- canonical product order and colorway deep links remain stable;
- owned Shopify images render with the expected crops;
- live price/option text does not overflow approved geometry;
- cart/account demo surfaces remain honest and functional;
- zero browser console errors, failed image requests, hydration errors, or
  horizontal overflow.

## Required final gates

```bash
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run format:check
bun test
bunx hydrogen gql check
bun run build
bun run check:routes
bun run smoke:routes
bun run check
bun audit --production
```

Run the full gate twice:

1. static mode with no Shopify env in the isolated worktree;
2. live Shopify mode with credentials injected only into the verification
   process from the ignored primary `.env`.

Inspect the final diff and run a secret scan without printing credential values.

## Explicit non-goals

- no Storefront cart mutations or checkout wiring;
- no Customer Account API/OAuth/session changes;
- no live account/order/address data;
- no Shopify Admin API or store mutation;
- no navigation/pages/articles/policies migration;
- no Weaverse schema, section, Studio, or public-env wiring;
- no analytics/ShopifyScripts integration;
- no public token serialization;
- no Vercel or production deployment;
- no route rename and no redesign/refactor of approved canonical markup/CSS;
- no commit, push, issue, PR, merge, or branch deletion by Claude.

## Completion definition

Slice 1 is complete only when:

1. live catalog routes use Shopify data through the normalized adapter;
2. static mode remains deterministic and testable;
3. all mapper/error/media boundaries pass adversarial tests;
4. static and live full gates pass;
5. route contracts and deferred demo domains remain intact;
6. hosted/production remains untouched;
7. independent Hermes review has no blocking finding;
8. the user receives a branch/commit/PR handoff with exact evidence, without
   exposing credentials.
