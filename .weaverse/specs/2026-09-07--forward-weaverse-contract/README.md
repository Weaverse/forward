# Forward Weaverse contract

Updated: 2026-09-07
Status: `draft`
Owner: @hta218
Issue: [Weaverse/forward#65](https://github.com/Weaverse/forward/issues/65)
Tracked by: [Weaverse/builder#2660](https://github.com/Weaverse/builder/issues/2660), epic [Weaverse/builder#2663](https://github.com/Weaverse/builder/issues/2663)
Branch: `feat/forward-weaverse-contract`
Baseline: `main@3972c8d`

## Objective

Define the bounded contract that lets Forward connect to `@weaverse/next`: theme
settings, the section registry, page-role ownership, editable Shopify-resource
selectors, global surface ownership, cache boundaries, and the seam between
Shopify data loading and Weaverse composition.

This slice produces a reviewed contract. No connection code, no dependency
install, no Weaverse project, and no Studio composition land under this spec.
Implementation begins only after the contract is approved.

## Initiating requirement

> The Forward Weaverse connection gate is open. Before any connection work,
> produce a bounded Forward Weaverse contract and section inventory covering
> theme settings; a component/section registry driven by Forward's real page
> roles; INDEX, PRODUCT, COLLECTION, custom page/article and global ownership;
> editable Shopify-resource selectors; Header/Footer/global-content ownership;
> design-mode versus published-mode cache boundaries; and the Shopify-loader
> versus Weaverse-composition seam. Integrate only an exact registry-verified
> `@weaverse/next` version. Forward currently has no `@weaverse/next`
> dependency, project connection, or Studio composition.

## Source of truth

1. Leo's latest explicit direction in the active session.
2. Issue [#65](https://github.com/Weaverse/forward/issues/65) and
   [builder#2660](https://github.com/Weaverse/builder/issues/2660).
3. This spec and [`plan.md`](./plan.md).
4. Current Forward source, runtime behavior, and route contract.
5. The Weaverse Next POC (`weaverse-hydrogen-next-poc`) as reference evidence
   only, never as code to copy.

## Measured baseline

Measured on `main@3972c8d` before any contract work:

| Surface | Current state |
|---|---:|
| `@weaverse/next` dependency | none |
| Weaverse project / Studio composition | none |
| Route patterns / permanent redirects | 20 / 4 |
| App Router page files | 21 |
| Shared components | 12 |
| Storefront data-source methods | 14 |
| Theme-owned content fields (`ThemeContent`) | 6 |
| Node + DOM tests | 338 + 66 |
| Browser matrix | 441 passed / 27 intentional skips |

`@weaverse/next` dist-tag `alpha` resolves to `0.1.0-alpha.16`, verified against
the live registry on 2026-09-07. npm `latest` is a stale `0.1.0-alpha.0` and
must never be installed.

## Accepted contract

### Page-role ownership

Forward's real page roles decide the registry. Weaverse composes the editorial
surfaces; functional, stateful, and security-owned surfaces stay theme-owned.

| Route | Weaverse page role | Composition |
|---|---|---|
| `/` | `INDEX` | Weaverse-composed |
| `/products/[productHandle]` | `PRODUCT` | Weaverse-composed around a theme-owned buy block |
| `/shop/[collectionHandle]` | `COLLECTION` | Weaverse-composed around a theme-owned product grid |
| `/journal/[articleHandle]` | `ARTICLE` | Weaverse-composed |
| `/pages/[pageHandle]` | `PAGE` | Weaverse-composed |
| `/about`, `/materials`, `/field-testing` | `PAGE` | Weaverse-composed, theme-owned routes |
| `/shop`, `/journal` | — | theme-owned index routes |
| `/search` | — | theme-owned; query state and result ranking are not editable |
| `/cart` | — | theme-owned; server cart identity and checkout handoff |
| `/account/**` | — | theme-owned; authenticated, `no-store` |
| `/policies/[policyHandle]` | — | theme-owned; Shopify policy text is legal content and is rendered verbatim |
| `/robots.txt`, `/sitemap.xml`, `/api/**`, `/account/status` | — | theme-owned resource routes |

### Global surfaces

Header, Footer, announcement bar, and mini-cart stay **theme-owned components
reading Shopify navigation through the existing data source**. They are not
Weaverse global sections in this slice.

The Header already carries keyboard, focus-trap, inert-background, body-lock,
active-state, and fail-soft contracts, plus a Shopify `main-menu` adapter with
its own deterministic safeguards. Moving that into Studio composition would put
those contracts behind merchant-editable data before there is any coverage for
the failure modes. Global-section ownership is a candidate for a later slice
and must be argued on its own.

Editable global copy is exposed as **theme settings**, not sections.

### Theme settings

The six `ThemeContent` fields are the initial theme-setting surface, because
they are already the theme's own editable copy and imagery:

`announcement`, `footerTagline`, `demoNotice`, `footerStatus`, `homeHeroImage`,
`standardBandImage`.

`demoNotice` and `footerStatus` must remain honest about the deployment's real
integration state; they are not free marketing copy.

### Editable Shopify-resource selectors

Sections may select Shopify resources by handle through the normalized data
source only: product, collection, article, and page. A selector stores a handle
and nothing else. Unknown handles resolve to `null` and the section renders its
empty state — a selector never invents content and never causes `notFound()` on
a page that has other valid content.

### Cache boundaries

- Design mode (Studio): `no-store` for Weaverse data on every composed route.
- Published mode: the existing route contract is preserved exactly —
  `revalidate = 3600` on `/`, `/products/[productHandle]`,
  `/shop/[collectionHandle]`; `dynamicParams = false` where it is already set.
- `/cart`, `/account/**`, `/api/cart`, and `/account/status` keep
  `force-dynamic` + `force-no-store` and are never Weaverse-composed.
- Per-item Studio revalidation must preserve route context, per
  [builder#2737](https://github.com/Weaverse/builder/issues/2737).

### The seam

Two seams stay separate and explicit:

- **Shopify data** enters only through the `storefront` instance in
  `src/lib/storefront/data-source.ts`.
- **Weaverse composition** enters through its own loader boundary.

A section receives normalized view models, never raw Shopify shapes. No Shopify
credential, private token, or raw API payload may reach a Studio payload, the
browser bundle, props, logs, or errors.

### Analytics

`@weaverse/next` owns the published-pageview protocol and its deduplication
([builder#2738](https://github.com/Weaverse/builder/issues/2738)). Forward must
consume it and must not implement its own transport or deduplication.

## Protected contracts

The connection must preserve, unchanged:

- the `storefront` data source as the only Shopify seam, and zero `any`,
  `as any`, `@ts-ignore`, or leaked raw Shopify shapes;
- fail-closed live Shopify mode and deterministic fixture-only static mode;
- the exact catalog contract: 9 products / 18 colorways / 78 ordered variants /
  4 collections / 7 pages / 6 articles / 4 policies;
- route contract `20 + 4`, including canonical `Shop all → /shop` first in the
  four-child Shop branch and the permanent redirects;
- destination-owned query state and PDP `colorway`/`size` isolation;
- exact variant-level price, compare-at/sale, sold-out, selected media, cart
  merchandise identity, and checkout handoff;
- Header keyboard/focus/inert/active contracts and the mini-cart lifecycle;
- 44px swatch targets, visible focus, and reduced-motion behavior;
- account/session/token security and `private, no-store` personalization;
- `src/app/globals.css` as the only stylesheet, with presentation owned by
  Tailwind utilities in components and routes
  (issue [#61](https://github.com/Weaverse/forward/issues/61));
- Bun/Biome/Next/Hydrogen tooling and the full verification matrix.

## Scope

### Included

1. The page-role, global-surface, theme-setting, selector, cache, and seam
   decisions above, reviewed and approved.
2. A section inventory derived from Forward's real page composition.
3. The named `@weaverse/next` version to install, verified against the live
   registry at implementation time.
4. The manual Studio QA checklist that Leo will run after the first connection
   slice.

### Excluded

- installing `@weaverse/next`, creating a Weaverse project, or any Studio
  composition;
- Markets/localization, which is a separate bounded slice after the first
  connection;
- normalized storefront model, adapter, or route-contract changes;
- catalog, variant, collection, menu, cart, checkout, or account contract
  changes;
- Shopify Admin, payment, or Weaverse mutation of any kind;
- visual redesign;
- `src/components/site-header/field-index-header.tsx` size reduction, which is
  deferred follow-up from issue #61.

## Phase gates

- **Phase 0 — contract (this spec).** Decisions recorded and reviewed. No code.
- **Phase 1 — section inventory.** Enumerate every composable section per page
  role with its settings and its normalized data contract.
- **Phase 2 — review.** Ownership, cache, and security boundaries approved by
  Leo, plus the manual Studio QA scope.
- **Phase 3 — first connection slice.** Only after approval, and specified in
  its own follow-up spec.

## Verification

This slice is documentation-only, so the repository gates must stay green
unchanged:

```bash
bun install --frozen-lockfile
bun run check
git diff --check
```

No production code, dependency, or configuration change belongs to this spec.
When implementation begins, the full contract from `AGENTS.md` applies,
including `verify:static`, `verify:live`, and the three-matrix `test:browser`
aggregate.

## Working protocol

- Work on `feat/forward-weaverse-contract`; the same branch carries the first
  implementation slice after approval.
- Do not install `@weaverse/next` or connect a Weaverse project under this
  spec.
- Never commit `.env` or credentials.
- Record execution evidence in [`work-logs.md`](./work-logs.md).
