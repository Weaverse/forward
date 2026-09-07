# Plan — Forward Weaverse contract

## Method

The registry is derived from what Forward's pages actually render today, read
from source at `main@3972c8d`. Nothing here is ported from Pilot, invented to
hit a registry count, or copied from the Next POC.

Every section below already exists as markup in a Forward route. Extracting it
into a Weaverse section must not change its rendered output.

## Section inventory

### `INDEX` — `/` (`src/app/page.tsx`)

Seven sections, in the order the page renders them today.

| # | Section | Current heading/eyebrow | Data | Settings |
|---|---|---|---|---|
| 1 | `hero` | "Forward / Field equipment 2026" | `ThemeContent.homeHeroImage` | eyebrow, heading, lede, CTA label/target, image |
| 2 | `featured-products` | "New field rotation" | 4 products by handle | heading, product selectors (ordered), CTA |
| 3 | `collection-index` | "Shop by system" | collections + `fieldCode` | heading, collection selectors (ordered) |
| 4 | `product-spotlight` | dynamic, from the selected product | one product | heading override, product selector, spec row count |
| 5 | `material-standard` | "Material standard" | `ThemeContent.standardBandImage` | eyebrow, heading, body, image |
| 6 | `kit-callout` | "One-day kit" / "Carry the day, not the doubt." | one product | eyebrow, heading, body, product selector, CTA |
| 7 | `repair-and-journal` | "Repair, not replace" / "Latest field note" | latest article | heading, body, CTA, article selector |

Section 4 reads `spotlight.title`, `subtitle`, and `specs` from the selected
product. Section 7 reads the latest article. Both must keep their existing
empty-state behavior when the selector resolves to `null`.

### `PRODUCT` — `/products/[productHandle]`

The buy block is **not** composable. Gallery, colorway selection, size
selection, price, availability, add-to-cart, and cart merchandise identity stay
theme-owned in `product-detail.tsx` and `add-to-cart-form.tsx`, because they own
variant identity, URL query state (`colorway`, `size`), and the checkout
handoff.

Composable around it:

| Section | Data | Settings |
|---|---|---|
| `product-detail-copy` | selected product `detailParagraphs` | heading, layout |
| `product-specs` | product `specs` | heading, visible row count |
| `product-care` | product `care` | heading |
| `product-repair` | product `repair` | heading, CTA |
| `related-products` | products by handle or category | heading, selector mode, count |

### `COLLECTION` — `/shop/[collectionHandle]`

The product grid, sorting, and filtering are theme-owned: they own query state,
`aria-current`, and the no-JavaScript GET contract.

Composable:

| Section | Data | Settings |
|---|---|---|
| `collection-hero` | collection title, description, image | heading override, image, layout |
| `collection-grid` | collection products | heading, columns, empty-state copy — **grid behavior itself is theme-owned** |
| `collection-note` | none | heading, body |

### `ARTICLE` — `/journal/[articleHandle]`

| Section | Data | Settings |
|---|---|---|
| `article-header` | article title, date, excerpt | layout |
| `article-body` | normalized article blocks | — rendered verbatim from the structural parser |
| `article-related` | articles by handle | heading, article selectors, count |

`article-body` renders the output of the parse5-based content parser. It is not
free-form rich text in Studio; the merchant edits the article in Shopify.

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
| `editorial-hero` | all three | eyebrow, heading, lede, image |
| `editorial-band` | all three | heading, body, image, side |
| `spec-table` | materials, field-testing | heading, rows |
| `product-strip` | all three | heading, product selectors |
| `article-strip` | field-testing | heading, article selectors |

### Not composable

`/shop`, `/journal`, `/search`, `/cart`, `/account/**`,
`/policies/[policyHandle]`, `/robots.txt`, `/sitemap.xml`, `/api/**`,
`/account/status`.

Rationale per surface is recorded in the README's page-role table. In short:
index routes own pagination and query state, `/search` owns ranking, `/cart`
and `/account/**` own server state and security, and policy text is legal
content that must render verbatim.

## Theme settings

Grouped by global surface, because Header and Footer are settings-owned rather
than section-owned. The full table lives in the README; the summary is:

| Group | Settings |
|---|---|
| Header | `announcement`, menu handle, wordmark, country-selector visibility |
| Footer | `footerTagline`, `footerStatus`, `demoNotice`, footer menu handle |
| Editorial imagery | `homeHeroImage`, `standardBandImage` — move to `hero` and `material-standard` section settings once `INDEX` is composed |

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

1. **Approve this contract.** No code until then.
2. **Verify the registry again at install time.** Record the exact resolved
   version. `alpha` was `0.1.0-alpha.16` on 2026-09-07; `latest` is a stale
   `0.1.0-alpha.0` and must not be installed.
3. **Add the dependency and the Weaverse environment** as its own commit, with
   no composition yet, and prove the existing gates still pass.
4. **Wire the composition seam** beside the storefront seam, not through it.
5. **Compose the three theme-owned editorial routes first**
   (`/about`, `/materials`, `/field-testing`) — no commerce state, so a
   regression there cannot damage catalog, cart, or account contracts.
6. **Compose `INDEX`**, section by section, keeping rendered output identical.
7. **Compose `PRODUCT` and `COLLECTION` chrome**, leaving the buy block and the
   grid behavior theme-owned.
8. **Compose `ARTICLE` and `PAGE`** around verbatim Shopify body content.
9. **Consume SDK-owned pageview analytics.** No transport or deduplication in
   the theme.
10. **Run the full matrix** and hand Leo the manual Studio QA checklist.

Steps 3 onward belong to follow-up specs, one per slice.

## Manual Studio QA checklist (for step 10)

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

This spec slice is documentation-only and touches exactly:

```
.weaverse/specs/2026-09-07--forward-weaverse-contract/README.md
.weaverse/specs/2026-09-07--forward-weaverse-contract/plan.md
.weaverse/specs/2026-09-07--forward-weaverse-contract/work-logs.md
```

Implementation slices will touch, and are listed here so other agents know the
eventual scope:

```
package.json                          # @weaverse/next dependency
src/app/layout.tsx                    # composition provider
src/app/page.tsx                      # INDEX composition
src/app/about/page.tsx
src/app/materials/page.tsx
src/app/field-testing/page.tsx
src/app/journal/[articleHandle]/page.tsx
src/app/pages/[pageHandle]/page.tsx
src/app/products/[productHandle]/page.tsx
src/app/shop/[collectionHandle]/page.tsx
src/lib/weaverse/                     # new: composition seam, registry
src/sections/                         # new: section components
tests/                                # section and seam contracts
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
