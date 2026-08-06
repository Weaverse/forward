# Shopify Catalog Adapter — Work Log

## 2026-08-06 — Hermes preflight

### Baseline

```text
branch=feat/shopify-catalog-adapter
base=9a69d0a5d275a7c5137412f277d7991ca4a8bb01
worktree=/Users/hta218/Documents/work/workspace/forward-shopify-catalog-adapter
```

Clean isolated baseline:

```text
bun install --frozen-lockfile: pass
bun run check: pass
bun test: 56 pass, 0 fail
next build: 33 pages
check:routes: 19 patterns, 4 redirects
bun audit --production: no vulnerabilities
```

Primary checkout note: `bun run check` there was blocked only because the
untracked user-owned `.vscode/settings.json` is not Biome-formatted. The file is
unrelated, preserved, and absent from this isolated worktree.

### Credential boundary

The ignored primary `.env` was checked without printing values. Required keys
are present and non-placeholder; `PUBLIC_STOREFRONT_ID` is `0`; the file is
ignored and untracked.

Claude receives no credentials and must not inspect the primary `.env`.

### Live read-only discovery

A temporary script outside Git used the exact installed Hydrogen package and
process-only env injection. It performed no mutations and printed no headers,
tokens, or signed URLs.

Results:

```text
public client: pass
private_no_buyer_context client: pass
shop name: Forward
products: 3
variants: 26 total, 26 available
media: 24 images
required product metafields: 5/5 present on every product
colorway maps: 6 entries, 4 media IDs each
```

Live Storefront collections:

```text
forward
outerwear
packs
footwear
frontpage
```

These do not match the approved editorial route handles and have no hero/copy.
Decision: keep canonical route collection presentation static and resolve its
product handles through the live product adapter.

### Current implementation state

Specification and Claude handoff written. No application code changed yet. No
commit, push, issue, PR, preview, or production deployment performed.

## 2026-08-06 — Claude: Slice 1 implementation (non-credentialed)

Implemented the complete synthetic-testable Slice 1 in the isolated worktree.
This session had **no Shopify credentials**: no `.env` was read, no live
Storefront call was made, and every result below comes from static mode with
synthetic GraphQL-shaped fixtures. **No claim is made about live Shopify
behavior.** The live read-only gate is still outstanding (see Residual risk).

### Files changed

New:

```text
src/lib/storefront/image-source.ts            allowed product image sources
src/lib/storefront/catalog-presentation.ts    theme-owned presentation profile
src/lib/storefront/catalog-query.ts           shared filter/sort/search semantics
src/lib/storefront/shopify/errors.ts          sanitized adapter errors
src/lib/storefront/shopify/env.ts             server-only env boundary
src/lib/storefront/shopify/queries.ts         gql() documents + bounds
src/lib/storefront/shopify/client.ts          private_no_buyer_context wiring
src/lib/storefront/shopify/mapper.ts          raw -> normalized validation
src/lib/storefront/shopify/data-source.ts     Shopify-backed data source
scripts/verify-shopify.mts                    opt-in live read-only verification
tests/fixtures/shopify-catalog-response.ts    synthetic live-shaped fixtures
tests/shopify-catalog-adapter.test.ts         41 adapter tests
```

Modified:

```text
src/lib/storefront/data-source.ts             mode selection; static class exported
src/lib/demo-cart/cart-logic.ts               image-source allowlist for revive
src/app/page.tsx                              revalidate = 3600
src/app/shop/[collectionHandle]/page.tsx      revalidate = 3600
src/app/products/[productHandle]/page.tsx     revalidate = 3600
next.config.ts                                Next Image remotePattern
tsconfig.json                                 + @shopify/hydrogen/ts-plugin
package.json                                  check:graphql, verify:shopify
.gitignore                                    generated hydrogen gql artifacts
AGENTS.md                                     milestone + data-boundary wording
```

No page or component was restructured: markup, classes, CSS, metadata,
`generateStaticParams`, `dynamicParams = false`, 404 behavior, and the route /
redirect contract are unchanged. The only route-file edits are the three
`export const revalidate = 3600;` segment values.

### Architecture and mapping decisions

- **Selection.** `createStorefrontDataSource(env)` takes the environment as a
  parameter (default `process.env`), so mode selection is injectable and tests
  never mutate `process.env`. No Shopify env -> `StaticStorefrontDataSource`.
  Both `PUBLIC_STORE_DOMAIN` and `PRIVATE_STOREFRONT_API_TOKEN` present ->
  `ShopifyCatalogDataSource`. Either one alone (or blank) ->
  `ShopifyConfigurationError` naming only the missing key. Once Shopify mode is
  selected there is no fixture fallback — transport, GraphQL, validation, and
  mapping failures propagate.
- **Composition.** `ShopifyCatalogDataSource` overrides only `listProducts`,
  `getProduct`, `searchProducts`, and `getCollectionProducts`; every other
  method delegates to an injected static base. `shopify/data-source.ts` imports
  the `StorefrontDataSource` type only (`import type`), so there is no runtime
  import cycle.
- **Client.** `private_no_buyer_context` with a static request context
  (`{ country: "US", language: "EN" }`, empty headers). Catalog routes never
  call `headers()`/`cookies()`, so they stay statically renderable. The data
  source consumes a plain `CatalogQueryExecutor` function, so tests mock GraphQL
  response objects rather than Hydrogen internals.
- **Bounds.** One bounded query: products `first: 10` filtered by the constant
  `tag:forward`, variants `first: 50`, media `first: 50`. Any `hasNextPage` is a
  hard failure, never a silent truncation. Options use the non-paginated
  `options { name optionValues { name } }` selection.
- **Ownership.** Live: identity, handle, title, description, productType, tags,
  minimum USD variant price, Color/Size values, variant ids + availability, all
  media and dimensions, and the five `forward` metafields. Presentation profile
  (`catalog-presentation.ts`): plate, category, activities, subtitle, repair
  copy, related-handle order, canonical colorway IDs, swatch colors. A test
  asserts the profile matches the static catalog on every presentation-owned
  field so the two cannot drift.
- **Order.** Canonical order is `weatherline-shell`, `ridge-30-field-pack`,
  `talus-trail-shoe`, applied regardless of Storefront ordering. An unapproved
  handle or a missing canonical product is a hard failure; an unknown handle
  *lookup* still returns `null`.
- **Money.** Minimum variant `MoneyV2`, parsed as a finite non-negative number,
  `currencyCode` must be `USD`. Empty, non-numeric, negative, and non-USD all
  fail.
- **Options / colorways.** `Color` is removed from `Product.options` and becomes
  `Product.colorways`; remaining options keep Shopify order, so
  `AddToCartForm`'s first-option-is-size assumption still holds. Live Size labels
  are preserved verbatim. Color labels map to canonical IDs through the profile
  (`Charcoal / Moss -> charcoal`, `Claystone / Charcoal -> claystone`,
  `Charcoal / Moss / Tan -> charcoal`, `Dune / Charcoal -> dune`,
  `Charcoal / Moss / Gum -> charcoal`, `Limestone / Clay / Moss -> limestone`),
  keeping `?colorway=` deep links and deferred demo cart/account references
  valid. The full Shopify label stays the display name. Duplicate normalized IDs
  within one product are rejected, and label lookup is own-key only so a label
  like `constructor` cannot resolve through the prototype chain.
- **Media.** Roles resolve exclusively through the ordered media IDs in
  `forward.colorway_media_map` (`primary`, `alternate`, `detail`, `context`);
  `product.media.nodes` order is never used — the test fixture deliberately
  emits nodes in reverse. Each Color label must have exactly four IDs, each ID
  must resolve to exactly one `MediaImage`, no ID may be reused across roles or
  colorways, and every image needs a positive integer width/height, non-empty
  alt text, and a URL on the exact owned CDN host/path
  (`https://cdn.shopify.com/s/files/**`). Unreferenced non-image media is
  tolerated; a referenced non-image ID fails. `next.config.ts` allows only that
  one remote pattern.
- **Editorial fields.** `description` = Storefront plain description paragraphs
  joined with a space. `detailParagraphs` = those paragraphs followed by
  `forward.materials`; no untrusted HTML is ever rendered. `specs` =
  deterministic rows from `forward.field_specs` with stable humanized labels
  (`volume_liters -> "Volume (L)"`, `drop_mm -> "Drop (mm)"`), arrays joined as
  readable text, unsupported value types rejected. `care` = plain text extracted
  from validated Shopify rich-text JSON. `forward.highlights` is parsed and
  validated but intentionally not exposed, because no approved surface renders
  it and adding one would change approved composition; a malformed value still
  fails.
- **Collections.** `listCollections()`/`getCollection()` keep returning the three
  canonical presentation records unchanged; only `getCollectionProducts()`
  resolves their handles through the live catalog. No Shopify collection handle
  is queried or exposed, and `frontpage` remains invisible.
- **Search/filter/sort.** `catalog-query.ts` is now the single implementation
  used by both modes, so live mode cannot drift. The user query is applied
  locally over normalized products and never interpolated into Shopify GraphQL
  search syntax.
- **Caching.** `CATALOG_REVALIDATE_SECONDS = 3600`. Two layers: route segment
  `revalidate = 3600` on `/`, `/shop/[collectionHandle]`, and
  `/products/[productHandle]` (which bounds published staleness and keeps the
  routes static — the build output shows `1h` for exactly those routes), and an
  in-process TTL + in-flight dedupe in the adapter so one regeneration pass
  makes a single Storefront round trip. Next's data cache does not cache the
  Storefront POST, so no misleading `next: { revalidate }` option was added. The
  in-process cache uses an injectable clock and is unit-tested; a test also
  asserts the route literals never drift from the constant.
- **Demo cart.** `sanitizeLines` previously hard-coded
  `/images/products/*.webp`, which would silently drop every persisted cart line
  in Shopify mode. It now uses the shared `isAllowedProductImageSrc` allowlist
  (local catalog path **or** owned Shopify CDN URL). This is the only behavioral
  change outside the catalog adapter, and it keeps the demo cart honest and
  functional in both modes.
- **Credential safety.** Environment access is confined to
  `src/lib/storefront/shopify/env.ts` with a browser guard; errors name keys only, and
  transport errors are re-thrown carrying just the originating error class name
  (never query text, URLs, or headers). `PUBLIC_STOREFRONT_API_TOKEN` is not
  read by app code and is not serialized; it is used only inside
  `scripts/verify-shopify.mts`. A test asserts no page or component imports
  fixtures, `storefront/shopify/*`, or `@shopify/hydrogen`.

### Tests added

41 tests in `tests/shopify-catalog-adapter.test.ts`, covering all 15 required
cases: static default, complete-config selection, partial-config sanitized
failure, full three-product mapping, Color-to-colorways, ordered non-Color
sizes, four-role media order, missing/extra/duplicate/unknown/non-image media
IDs, invalid JSON / rich text / metafield types, missing dimensions and alt
text, invalid and non-USD money, unknown-handle `null`, canonical product and
route-collection order, search/filter/sort semantics, and demo cart/account
colorway resolution. Plus: fail-closed behavior, GraphQL-error and bounded-page
failures, ownership-tag enforcement, revalidation window, presentation-profile
parity with the static catalog, and the page/component import boundary. All
GraphQL fixtures are synthetic — no live response dump, header, CDN signature,
or token-like value.

### Commands and results

Run in this worktree with **no Shopify environment** (static mode):

```text
bun install --frozen-lockfile   pass (89 installs, 153 packages, no changes)
bun run typecheck               pass
bun run lint                    pass (exit 0; 4 pre-existing CSS warnings)
bun run format:check            pass
bun test                        97 pass, 0 fail (5 files) — was 56 at baseline
bunx hydrogen gql check         pass (✓ No problems found)
bun run build                   pass (33 static/generated pages)
bun run check:routes            pass (19 route patterns, 4 permanent redirects)
bun run smoke:routes            pass (30 checks against the production server)
bun run check                   pass (exit 0)
bun audit --production          pass (no vulnerabilities)
```

`hydrogen gql check` was verified to actually validate the new documents: a
deliberately corrupted field name produced
`Cannot query field "productTypeXX" on type "Product"` and exit code 1; the file
was restored and the check returned clean.

Build output confirms the route contract is unchanged and that `1h` revalidation
applies to `/`, the three `/products/*` pages, and the three `/shop/*` pages
only.

Secret scan over the full working-tree diff plus every new untracked file
(excluding the spec folder), matching without printing values: 0 hits for
Shopify token prefixes (`shpat_`, `shpca_`, `shpss_`, `shppa_`), authorization
headers, `X-Shopify-*-Token` headers, the live shop subdomain, CDN version or
signature query parameters, private-key blocks, and publication GIDs. The only
`.env` matches are `process.env` references and one AGENTS.md sentence.

### Not done / not claimed

- No live Storefront call, no credential read, no `.env` inspection, no
  credentialed test. Nothing here demonstrates that the live store responds as
  expected.
- No commit, push, branch, PR, issue, deploy, or external-system change. The
  working tree is left dirty and uncommitted.
- No cart mutation, Customer Account, Weaverse, analytics, public-token, or
  Admin API work; no route rename; no redesign.

### Residual risk and remaining gates

1. **Live read-only verification (blocking, Hermes).** Run
   `bun run verify:shopify` with the ignored primary `.env` injected into the
   process only. It probes both clients, exercises the real adapter, and prints
   only counts/handles/currencies/shape/PASS-FAIL. Two assumptions can only be
   confirmed there: (a) `products(query: "tag:forward")` returns exactly the
   three approved products; (b) live `colorway_media_map` values are Shopify
   `MediaImage` GIDs that match the queried `media.nodes` ids exactly. The seed
   `apply.py` writes resolved media IDs, so (b) is expected — but it is
   unverified in this session, and a mismatch fails closed at build time rather
   than degrading silently.
2. **Live-mode full gate (blocking).** The whole gate list has been run in
   static mode only. It must be re-run with credentials injected, since in
   Shopify mode `bun run build` performs the real catalog read.
3. **Visual/route lock (blocking).** Desktop and mobile QA of the 11 listed
   routes after a live-mode build has not been performed. Specific things to
   watch: live prices differ from the static fixtures (pack 198 vs 168, shoe 168
   vs 142); colorway chips now show full Shopify labels
   (e.g. "Limestone / Clay / Moss" instead of "Limestone"), which is the longest
   new string in the approved geometry; live shoe sizes are `US 7`–`US 13`
   instead of the fixture's EU numbers; and the PDP spec badge is now the first
   `field_specs` row.
4. **Known cosmetic inconsistency (non-blocking).** The static demo order
   fixtures still show fixture prices and an `EU 43` size. Those surfaces are
   explicitly labeled demo and are out of Slice 1 scope, but in live mode they
   will not match live catalog prices or size labels.
5. **CDN host assumption.** The mapper and `next.config.ts` allow only
   `https://cdn.shopify.com/s/files/**`. If the store ever serves media from a
   different owned host, mapping fails loudly rather than rendering a broken
   image — intentional, but it is a hard-coded assumption to revisit.
6. **`hydrogen gql check` scope.** It validates documents against the bundled
   schema only; store-specific and API-version drift are live-only failures.

## 2026-08-06 — Hermes review and live closeout

Hermes reviewed the full working-tree diff independently and reran every gate.
Claude's self-report was treated as unverified until reproduced.

### Blocking findings fixed

1. **Live verifier runtime.** `verify:shopify` used `node` to execute a `.mts`
   file that imports extensionless TypeScript application modules. Node failed
   before the network call with `ERR_MODULE_NOT_FOUND`. The script now runs with
   Bun, the repository's pinned runtime/package manager. The same process-only
   env command then passed end to end.
2. **Static-to-live build cache.** Running the static gate followed by the live
   gate without removing `.next` reused fixture-backed prerender artifacts. The
   false-positive build still reported success, but artifact inspection showed
   static descriptions, prices, and local media. A clean live build produced
   Shopify copy, current prices, and `cdn.shopify.com` media. `bun run build` now
   runs `clean:next` first so a data-source mode transition cannot publish stale
   fixture prerenders from the prior build output.

### Independently reproduced gates

```text
static mode:
  bun install --frozen-lockfile     pass
  bun run check                     pass
  tests                             97 pass, 0 fail
  build                             33 pages
  smoke                             30/30 pass
  bun audit --production            no vulnerabilities

live Shopify mode (ignored primary .env, process-only):
  bun run verify:shopify            pass
  public identity probe             pass
  private catalog adapter           pass
  products/colorways/media          3 / 6 / 24
  currency                          USD
  route collection handles          field-gear, high-route, camp-craft
  clean bun run check               pass
  tests                             97 pass, 0 fail
  live build                        33 pages
  smoke                             30/30 pass
```

Clean live build artifact assertions:

```text
live Shopify description present    yes
fixture description absent          yes
live pack price present              yes
live shoe price present              yes
Shopify CDN media present            yes
```

### Browser and visual QA

Production server: task-owned isolated build on port `3334`; the existing
primary Forward process on `3333` and unrelated port `5555` were not touched.

```text
routes: 11 desktop + 11 mobile = 22
HTTP/navigation status: 22/22 pass
horizontal overflow: 0
broken/pending images: 0
console severe errors: 0
non-cancelled network failures: 0
live catalog prices: pass
live Shopify CDN images: pass
live Talus US 7–US 13 options: pass
PDP -> demo cart persistence: pass
colorway query/back history: pass
Shop -> PDP repeated navigation: 3 cycles pass
```

Evidence:

```text
/Users/hta218/Documents/work/artifacts/forward-shopify-catalog-adapter-qa-2026-08-06/result.json
/Users/hta218/Documents/work/artifacts/forward-shopify-catalog-adapter-qa-2026-08-06/*.png
```

Desktop and mobile screenshots show the live media roles in the approved card
and gallery geometry. Long Shopify colorway labels and live size values fit
without collision. An apparent mobile shop clipping/two-column concern was
compared against a fresh exact `origin/main` capture on port `3333`; its
structure is identical and therefore not introduced by this adapter.

No store mutation, commit, push, PR, preview deployment, or production
operation was performed during this closeout.

## 2026-08-06 — Post-review hardening and final verification

The first independent review batch found concrete adapter-boundary gaps. Hermes
reproduced each accepted finding before changing source.

### Findings closed

1. Every queried `MediaImage` must be referenced exactly once by
   `forward.colorway_media_map`; unreferenced images now fail closed.
2. Adjacent `descriptionHtml` paragraphs and Shopify rich-text list items are
   converted to separate plain-text lines without rendering untrusted HTML.
3. Caught error labels use fixed trusted classifications; arbitrary
   `Error.name` values cannot reach verifier/build output.
4. Dynamic `/shop` and `/search` reads now use the Next Data Cache with the same
   one-hour freshness window as static/ISR catalog routes. Production reads
   always reach the Next wrapper; process-local TTL/in-flight reuse is reserved
   for the standalone verifier/test path that explicitly disables Next cache.
5. Shopify product media is restricted consistently across the mapper, Next
   Image, and persisted demo cart to HTTPS, default port, exact
   `cdn.shopify.com` host, and the owned Forward tenant path
   `/s/files/1/0978/4757/4828/files/`.
6. Tests now cross the production Hydrogen transport seam, asserting private
   client headers, bounded variables, API path, and sanitized transport errors.
   Static data-source tests instantiate the static adapter explicitly and no
   longer change behavior when a live environment is injected.
7. GraphQL `errors`, null data, and raw-to-normalized mapping failures now throw
   inside the Next-cached callback, so transient Storefront failures are not
   persisted as successful one-hour cache entries and a later execution can
   retry.
8. `/cart` and `/account/orders/[orderId]` now declare the same literal
   one-hour route revalidation as the other static catalog consumers; prerender
   freshness no longer depends on worker or route generation order.

### Final executable evidence

```text
focused adapter/cart/static tests   79 pass, 0 fail
static mode:
  bun install --frozen-lockfile     pass, no changes
  bun run check                     pass
  tests                             106 pass, 0 fail
  build                             33 pages
  smoke                             30/30 pass
  bun audit --production            no vulnerabilities

live Shopify mode (ignored primary .env, process-only):
  bun run verify:shopify            pass
  products/colorways/media          3 / 6 / 24
  bun run check                     pass
  tests                             106 pass, 0 fail
  clean live build                  33 pages
  smoke                             30/30 pass
  bun audit --production            no vulnerabilities

live prerender manifest:
  /, /cart                          3600 seconds
  /account/orders/1001, /1002       3600 seconds
  product and collection routes     3600 seconds

final browser QA on exact live build:
  routes                            22/22 pass
  live markers / CDN images         pass
  PDP -> demo cart                  pass
  colorway history                  pass
  repeated navigation              3 cycles pass
  console/network failures          0 / 0
```

The four Biome descending-specificity warnings are unchanged canonical CSS
warnings and do not fail lint. No production deployment or Shopify mutation was
performed.
