# Plan — Forward Weaverse contract

## Method

The registry is derived from what Forward's pages actually render today, read
from source at `main@3972c8d`. Nothing here is ported from Pilot, invented to
hit a registry count, or copied from the Next POC.

Every section below already exists as markup in a Forward route. Extracting it
into a Weaverse section must not change its rendered output.

**Status: extracted on 2026-09-08.** All 35 sections live in `src/sections/`
and every route composes them. The tables below name the shipped component
file where one exists. Extraction corrected this inventory in three places,
recorded under "What extraction corrected" — the paper model claimed reuse the
markup did not have, and missed reuse the markup did.

## Section inventory

### `INDEX` — `/` (`src/app/page.tsx`)

Seven sections, in the order the page renders them today.

| # | Section | Current heading/eyebrow | Data | Settings |
|---|---|---|---|---|
| 1 | `home-hero` | "Forward / Field equipment 2026" | `ThemeContent.homeHeroImage` | eyebrow, heading, lede, two CTAs, stat rows, featured product |
| 2 | `featured-products` | "New field rotation" | 4 products by handle | eyebrow, heading, body, link, product selectors (ordered) |
| 3 | `collection-index` | "Shop by system" | collections + `fieldCode` | eyebrow, heading, collection selectors (ordered) |
| 4 | `product-spotlight` | dynamic, from the selected product | one product | eyebrow prefix, CTA label, spec row count, product selector |
| 5 | `material-standard` | "Material standard" | `ThemeContent.standardBandImage` | eyebrow, heading, body, two CTAs, image |
| 6 | `kit-callout` | "One-day kit" / "Carry the day, not the doubt." | one product + 3 tiles | eyebrow, heading, link label, product selector |
| 7 | `repair-and-journal` | "Repair, not replace" / "Latest field note" | latest article | repair eyebrow/heading/body/link, journal eyebrow/link, article selector |

Section 4 reads `title`, `subtitle`, and `specs` from the selected product.
Section 7 reads the latest article and renders the repair card alone when no
article resolves. Both keep their existing empty-state behavior when the
selector resolves to `null`. The `hero` name in the original inventory
collided with the editorial heroes, so the shipped component is `home-hero`.

### `PRODUCT` — `/products/[productHandle]`

The buy block is **not** composable. Gallery, colorway selection, size
selection, price, availability, add-to-cart, and cart merchandise identity stay
theme-owned in `product-detail.tsx` and `add-to-cart-form.tsx`, because they own
variant identity, URL query state (`colorway`, `size`), and the checkout
handoff.

Composable around it:

| Section | Data | Settings |
|---|---|---|
| `related-products` | products by handle or category | eyebrow, heading, product selectors |

`related-products` is the only PDP surface extracted. The `detailParagraphs`,
`specs`, `care`, and `repair` panels named in the original inventory are one
disclosure stack inside the buy block, not four independent sections, so they
stay theme-owned with the rest of the block. Splitting them is a separate
decision and needs its own argument.

### `COLLECTION` — `/shop/[collectionHandle]`

The product grid, sorting, and filtering are theme-owned: they own query state,
`aria-current`, and the no-JavaScript GET contract.

Composable:

| Section | Data | Settings |
|---|---|---|
| `collection-hero` | collection title, description, hero image | eyebrow prefix, CTA label/target |
| `system-manifest` | collection products + a theme image | eyebrow, heading, body, link |
| `collection-grid` | collection products | eyebrow, heading, CTA — **grid behavior itself is theme-owned** |
| `field-practice` | none | eyebrow, heading, body, link |

Four sections, not the three originally listed: the route renders a manifest
band between the hero and the grid that the paper inventory missed, and
`collection-note` is really `field-practice`.

### `ARTICLE` — `/journal/[articleHandle]`

| Section | Data | Settings |
|---|---|---|
| `article-header` | article title, plate, date, location, reading time | breadcrumb label/target |
| `article-body` | normalized article blocks | back-link label/target — body is rendered verbatim |

`article-body` renders the output of the parse5-based content parser. It is not
free-form rich text in Studio; the merchant edits the article in Shopify.
`article-related` was in the original inventory but the route does not render
it today, so it was not invented during extraction. Add it as a real section
when the design calls for one.

### `PAGE` — `/pages/[pageHandle]` and the theme-owned routes

`/pages/[pageHandle]` is Shopify-owned body content and behaves like
`article-body`: composable chrome around verbatim page blocks.

`/about`, `/materials`, `/field-testing` each render four sections today.
**Decided 2026-09-08 (Leo): Studio owns their content, not just their layout.**
Their copy and imagery are section settings, so the routes stay in the repo as
thin `PAGE` shells and no route is converted into a Shopify page. They are also
the first composition target because they carry no commerce state.

| Section | Used by | Settings |
|---|---|---|
| `page-hero` | `/pages/[pageHandle]` | eyebrow, heading, image |
| `page-premise` | `/pages/[pageHandle]` | eyebrow, intro, premise section |
| `page-values` | `/pages/[pageHandle]` | eyebrow suffix, sections |
| `page-origin` | `/pages/[pageHandle]` | eyebrow, heading, body, link, image |
| `editorial-hero` | about, materials | eyebrow, heading, lede, image, image side |
| `editorial-overlay-hero` | field-testing | eyebrow, heading, lede, image |
| `editorial-callout` | materials, field-testing | eyebrow, heading, body, CTA |
| `standard-statement` | about | eyebrow, statement, columns |
| `stat-band` | about | stats |
| `product-strip` | about | eyebrow, heading, link, product selectors |
| `principle-grid` | materials | principles |
| `product-tiles` | materials | product/image tiles |
| `numbered-sequence` | field-testing | eyebrow, heading, steps |
| `product-case-study` | field-testing | eyebrow, CTA label, product selector |

### Theme-owned routes, still extracted

`/shop`, `/journal`, `/search`, and `/policies/[policyHandle]` are not
Weaverse-composable — index routes own pagination and query state, `/search`
owns ranking, and policy text is legal content rendered verbatim — but their
markup was still extracted, because the duplication was real:

| Section | Used by |
|---|---|
| `index-header` | shop, journal, policies |
| `journal-lead`, `journal-grid` | journal |
| `product-results` | shop |
| `search-results`, `search-empty-state` | search |
| `policy-document` | policies |

Extraction here is code organization, not an ownership change. These sections
get no Weaverse schema.

### Not extracted

`/cart` already delegates entirely to `CartView`/`ShopifyCartView`, and
`/account/**` has no page-level sections — only cards inside `AccountShell`.
Both own server state and security and are never composed. `/robots.txt`,
`/sitemap.xml`, `/api/**`, and `/account/status` are resource routes.

The PDP buy block and its `colorway`/`size` query state, and the collection and
Shop grid behavior, stay theme-owned inside the sections that surround them.

## What extraction corrected

1. **`editorial-hero` was not shared by all three editorial routes.** About and
   Materials do share it, differing only in image side. Field Testing's hero is
   a full-bleed overlay with an absolutely positioned image and an `after:`
   scrim — a different section, now `editorial-overlay-hero`.
2. **Reuse the paper inventory missed.** `editorial-callout` (Materials and
   Field Testing closed with identical markup), `index-header` (Shop, Journal
   and the policy routes each repeated the same dark masthead),
   `search-empty-state` (the no-query and no-match states were one block
   twice), and `rich-text-paragraph` (the policy route had reimplemented the
   normalized run renderer inline).
3. **Section counts were wrong per role.** `COLLECTION` renders four sections,
   not three; `PRODUCT` has one composable section, not five; `ARTICLE` has two,
   not three.

The lesson holds for the connection slice: derive from the markup, not from the
table.

## Theme settings

Grouped by global surface, because Header and Footer are settings-owned rather
than section-owned. The full table lives in the README; the summary is:

| Group | Settings |
|---|---|
| Header | `announcement`, menu handle, wordmark, country-selector visibility |
| Footer | `footerTagline`, `footerStatus`, `demoNotice`, footer menu handle |
| Editorial imagery | `homeHeroImage`, `standardBandImage` — move to `home-hero` and `material-standard` section settings once `INDEX` is composed |

Header and Footer structure, geometry, ordering, and accessibility behavior stay
theme-owned code. Only the settings above are editable.

## Selector contract

A resource selector stores a **handle only**. Resolution goes through the
normalized data source:

| Selector | Method | Unknown handle |
|---|---|---|
| product | `getProduct(handle)` | `null` → section empty state |
| collection | `getCollection(handle)` / `getCollectionProducts(handle)` | `null` → section empty state |
| article | `getArticle(handle)` | `null` → section empty state |
| page | `getPage(handle)` | `null` → section empty state |

A selector never triggers `notFound()`. A page 404s only when its own route
parameter is unknown, which is the existing behavior.

## Cache plan

| Route | Published | Design mode |
|---|---|---|
| `/` | `revalidate = 3600` | `no-store` |
| `/products/[productHandle]` | `revalidate = 3600`, `dynamicParams = false` | `no-store` |
| `/shop/[collectionHandle]` | `revalidate = 3600`, `dynamicParams = false` | `no-store` |
| `/journal/[articleHandle]`, `/policies/[policyHandle]` | `dynamicParams = false` | `no-store` |
| `/about`, `/materials`, `/field-testing`, `/pages/[pageHandle]` | static | `no-store` |
| `/cart`, `/account/**`, `/api/cart`, `/account/status` | `force-dynamic` + `force-no-store` | unchanged, never composed |

Per-item revalidation must preserve route context (builder#2737).

## Implementation steps

1. ~~**Approve this contract.**~~ ✅ All three open questions closed by Leo on
   2026-09-08.
2. ~~**Extract every page section into `src/sections/`.**~~ ✅ Done as a pure
   refactor with no dependency and no Weaverse project, so the remaining steps
   are not blocked on credentials. Moved ahead of the install deliberately:
   every gate stayed green, and the extraction corrected the inventory before
   any schema was written against it.
3. **Verify the registry again at install time.** Record the exact resolved
   version. `alpha` was `0.1.0-alpha.16` on 2026-09-07 and again on 2026-09-08;
   `latest` is a stale `0.1.0-alpha.0` and must not be installed.
4. **Add the dependency and the Weaverse environment** as its own commit, with
   no composition yet, and prove the existing gates still pass.

   Install `@weaverse/next` alone. At `0.1.0-alpha.16` it already depends on
   `@weaverse/react@5.16.4` and `@weaverse/schema@0.10.0`, so those arrive
   transitively and must not be added by hand. Its peers are `next >=14`,
   `react >=19`, `react-dom >=19`; Forward runs Next `16.3.0` and React
   `19.2.8`. The Next POC additionally lists `@weaverse/core` and pins the
   other two, but that is POC convenience, not an install requirement.

   Environment: `WEAVERSE_PROJECT_ID` is required. `WEAVERSE_HOST` is optional
   and defaults to `https://studio.weaverse.io`, but setting it to anything
   else also moves the SDK's API base off the production edge proxy, so it is a
   staging/self-hosted switch rather than a cosmetic URL. `WEAVERSE_API_KEY` is
   not part of the storefront runtime at all — it belongs to a local
   admin-data seeding script — so it stays out of the theme's environment
   template.

5. **Wire the composition seam** beside the storefront seam, not through it.

   **Narrow the env handed to the SDK.** The Next POC passes `env: process.env`
   into `createWeaverseNextServerClient`, and the SDK builds its browser-visible
   `publicEnv` payload from `PUBLIC_STORE_DOMAIN` and
   `PUBLIC_STOREFRONT_API_TOKEN`. Forward must pass an explicit allowlisted
   object instead, so no key reaches a Studio payload by default and
   `PRIVATE_STOREFRONT_API_TOKEN` can never be exposed by a future SDK change.
   This is the concrete form of the seam separation this contract requires.

   Fail closed on a missing project id, and treat a placeholder value as
   missing.

   Cache: the POC configures the SDK client with `{ revalidate: 60 }` plus
   invalidation tags while design and revision-preview reads are forced
   `no-store` by the SDK. Forward's route-level exports stay as the contract
   records them (`revalidate = 3600` on `/`, PDP, and collection); the SDK
   cache config is a separate knob and must not silently override them.
6. **Add `schema` to the sections, role by role**, starting with the three
   editorial routes (`/about`, `/materials`, `/field-testing`) — no commerce
   state, so a regression there cannot damage catalog, cart, or account
   contracts. Then `INDEX`, then `PRODUCT` and `COLLECTION` chrome, then
   `ARTICLE` and `PAGE`. Section settings map onto the props the components
   already take; a section whose schema needs a prop it does not have is a
   signal to check the markup, not to reshape the component blindly.
7. **Consume SDK-owned pageview analytics.** No transport or deduplication in
   the theme.
8. **Run the full matrix** and hand Leo the manual Studio QA checklist.

Steps 3 onward stay in this spec (decided 2026-09-08) rather than moving to a
follow-up folder, so the contract and its first connection slice share one
history.

## Manual Studio QA checklist (for step 8)

Automated coverage cannot prove authenticated Studio behavior. Leo runs:

- draft persistence per route and per locale;
- section add, reorder, remove, and setting edits on `INDEX`;
- product, collection, and article selector changes;
- per-item revalidation keeping route context;
- save and publish, then a published-mode reload;
- preview sizing and repeated navigation with a clean browser console.

## Open questions

1. ~~**Header/Footer as global sections.**~~ **Resolved 2026-09-08 (Leo):**
   never global sections. Theme-owned components configured by theme settings,
   permanently — not a deferral. See the README's Global surfaces section.
2. ~~**`/pages/[pageHandle]` versus theme-owned editorial routes.**~~
   **Resolved 2026-09-08 (Leo):** Studio owns the editorial routes' content as
   sections. The routes stay in the repo; none becomes a Shopify page.
3. ~~**Shared Contract version.**~~ **Waived 2026-09-08 (Leo):** the
   `0.12-draft` reference in builder#2660 versus `0.14-accepted` in epic #2663
   is a stale citation in #2660, not a scope difference. This registry is not
   re-derived against the document. If a later Shared Contract revision does
   change ownership or registry scope, that is a new slice.

## Files and folders touched

Landed under this spec:

```
AGENTS.md                             # section rule, Weaverse approval, Bun pin
.weaverse/specs/2026-09-07--forward-weaverse-contract/*
src/sections/                         # 35 section components
src/components/filter-sidebar.tsx     # extracted from the Shop route
src/components/rich-text-paragraph.tsx # was duplicated across two routes
src/lib/presentation/variants.ts      # shared section shell classes
src/app/**/page.tsx                   # 12 routes now compose sections
tests/shopify-content-adapter.test.ts # source assertion repointed
```

The connection slice will touch, listed here so other agents know the scope:

```
package.json                          # @weaverse/next dependency, exact version
src/app/layout.tsx                    # composition provider
src/sections/*.tsx                    # schema exports added to existing files
src/lib/weaverse/                     # new: composition seam, registry
tests/                                # section schema and seam contracts
```

Explicitly **not** touched by any slice under this spec:

```
src/lib/storefront/**                 # the Shopify seam stays as-is
src/lib/cart/**, src/lib/demo-cart/**
src/lib/account/**, src/proxy.ts
src/app/cart/**, src/app/account/**, src/app/api/**
src/lib/routes/route-contract.ts
src/app/globals.css
```
