# Advanced POC Visual Realignment

## Status

The screenshot-reconstructed correction merged through PR #52 on 2026-08-06 but Leo rejected the result as still not matching the owned canonical POC. The prior rendered-evidence approach is superseded across the full storefront. The next implementation must port the canonical source directly for the shared shell and every rendered route using [`full-canonical-source-port-handoff.md`](./full-canonical-source-port-handoff.md). Leo visual approval remains pending.

## Original request

> "Đúng r làm đi, nó là cái này nhé: https://weaverse-hydrogen-next-poc.vercel.app/theme-preview-advanced/index.html#/home — gửi lại cho chú khỏi nhầm"

Context: Leo rejected the merged static storefront's visual direction because it is completely different from the previously approved Advanced POC. Technical completeness did not constitute design acceptance.

## Canonical visual reference

`https://weaverse-hydrogen-next-poc.vercel.app/theme-preview-advanced/index.html#/home`

Reference routes exposed by the POC page picker:

- `#/home`
- `#/shop`
- `#/activity`
- `#/product/weatherline-shell`
- `#/search`
- `#/search?q=trail`
- `#/cart`
- `#/account/sign-in`
- `#/account`
- `#/account/orders/fw-10482`
- `#/journal`
- `#/journal/walking-the-long-light`
- `#/about`
- `#/policies/repairs`
- `#/missing`

The Advanced POC is canonical for visual language, page composition, density, hierarchy, and responsive behavior. Its prototype route picker and throwaway-store notices are not product UI and must not be reproduced.

## Problem

`main@962a008` is technically complete but visually follows a restrained heritage/catalog direction. The approved Advanced POC instead uses a high-contrast editorial field-system direction:

- acid/neon status rail and controls;
- segmented technical header;
- cream and near-black surfaces;
- oversized high-contrast serif display type;
- dense monospaced field labels, coordinates, report codes, and plate numbers;
- asymmetric image dossiers and overlapping editorial composition;
- numbered, staggered product cards;
- dark PLP masthead with acid inventory/sort rail;
- dark PDP gallery and sticky purchase panel;
- large editorial dispatch and movement-system modules;
- oversized stacked footer wordmark.

Automated route, accessibility, and rendering QA did not test visual parity and therefore did not catch this mismatch.

## Goal

Realign the complete fixture-backed Next.js storefront to the Advanced POC's visual system and route-level composition while preserving the working technical substrate.

## Preserve unchanged unless required for presentation

- `src/lib/storefront/**` normalized models and fixture boundary.
- `src/lib/routes/**` route contract and unknown-handle behavior.
- `src/lib/demo-cart/**` persistence and sanitization logic.
- Dynamic static params and server-side `notFound()` validation.
- Existing page metadata/SEO routes.
- Existing local approved product/editorial media in `public/images/**`.
- Bun/Biome/Next tooling and canonical dev port `3333`.
- Existing functional tests and production smoke infrastructure.
- No direct fixture imports from pages/components.

## Visual implementation scope

### Shared shell

Rebuild visual tokens and shared chrome to match the POC:

- acid report strip;
- segmented desktop navigation with numbered labels and active dark cell;
- compact utility actions and circular cart count;
- responsive mobile menu preserving all destinations;
- cream/black/acid palette and thin technical rules;
- oversized stacked footer wordmark and three navigation columns;
- global serif/sans/mono hierarchy and consistent focus states.

### Home

Recompose into the Advanced POC sequence:

1. asymmetric hero dossier with oversized stepped headline, image, side telemetry, CTAs, and field condition panel;
2. operating premise with oversized plate number, two-tone headline, prose, metrics, and field-standard link;
3. overlapping image dossier using approved editorial media;
4. equipment index with staggered numbered product cards driven by current products;
5. dark dispatch split using the lead journal article;
6. movement systems with three staggered dark image cards driven by current collections;
7. advanced footer.

### Shop and collections

- dark editorial masthead;
- acid product-count/sort rail;
- desktop filter sidebar and responsive mobile filter treatment;
- staggered editorial product grid with large plate numbers, tags, price, and color dots;
- collection pages use the same system without changing handles or route behavior.

### PDP

- near-black product stage;
- multi-column gallery using each selected colorway's four approved images;
- clear selected-view treatment;
- sticky dark purchase panel with breadcrumb, badge/spec label, title, price, description, color, size, quantity, add-to-cart, and accordions;
- preserve query-driven colorway selection, size selection, cart persistence, and invalid-handle behavior;
- cream related-products section using advanced numbered cards.

### Supporting routes

Bring search, cart, account, order, journal, article, content, policy, loading, error, empty, and 404 routes into the same Advanced POC system. Preserve all existing route/data behavior.

## Route mapping

| Advanced POC | Next.js route |
| --- | --- |
| Home | `/` |
| Shop / PLP | `/shop` |
| Activity landing | `/shop/[collectionHandle]` |
| Product / PDP | `/products/[productHandle]` |
| Search | `/search` |
| Cart | `/cart` |
| Account sign-in | `/account/login` |
| Account overview | `/account` |
| Order detail | `/account/orders/[orderId]` |
| Journal index | `/journal` |
| Journal article | `/journal/[articleHandle]` |
| About | `/pages/about-forward` |
| Policy | `/policies/[policyHandle]` |
| 404 | `not-found.tsx` and unknown dynamic handles |

## Content and asset boundary

- Use the current Forward products, prices, copy, collections, journal entries, and approved local media.
- Match POC composition and treatment; do not import the POC's throwaway products or unrelated third-party product media.
- Do not inspect or copy Pilot.
- Do not embed the POC's static `app.js`, hash router, prototype state, or fictional data wholesale. Port its pinned canonical DOM/CSS source directly into Next components for the shared shell and every rendered route at the normalized data/route seams defined in `full-canonical-source-port-handoff.md`; screenshots are verification evidence, not the implementation source.

## Responsive requirements

- No horizontal overflow at 390×844, 768×1024, 1440×900, and 1920×1080.
- Preserve image/headline hierarchy without desktop absolute-position artifacts on mobile.
- Mobile nav remains keyboard accessible and all destinations remain reachable.
- PLP filters/sort remain usable on mobile.
- PDP gallery becomes a readable stacked sequence; purchase controls remain visible and usable.
- Repeated client navigation, colorway changes, cart updates, and back/forward cycles preserve layout continuity.
- Respect `prefers-reduced-motion`.

## Acceptance criteria

1. Leo can recognize the Advanced POC art direction immediately on home, PLP, PDP, and supporting routes.
2. Side-by-side review shows parity in typography, palette, grid, hierarchy, editorial density, card treatment, shell, and page sequencing—not merely absence of rendering defects.
3. Home, PLP, PDP, journal/article, cart, account/order, content/policy, search, and 404 share one coherent advanced design system.
4. Existing data-source, route, static-generation, cart, and unknown-handle contracts still pass.
5. Product colorway, size, quantity, add/update/remove cart, search query, order deep links, and repeated navigation work in production browser QA.
6. No direct fixture imports appear under `src/app` or `src/components`.
7. No secret, live Shopify, Customer Account, or Weaverse credential/runtime change is introduced.
8. Updated work is deployed to a non-production Vercel preview and held for Leo visual approval before merge.

## Required verification

```bash
bun install --frozen-lockfile
bun run check
bun run smoke:routes
bun audit --production
bunx biome check .
git diff --check
```

Browser QA must cover desktop and true mobile emulation for:

- `/`
- `/shop`
- `/shop/field-gear`
- `/products/weatherline-shell?colorway=claystone`
- `/search?q=trail`
- `/cart`
- `/account`
- `/account/orders/1001`
- `/journal`
- `/journal/walking-the-long-light`
- `/pages/about-forward`
- `/policies/shipping-policy`
- unknown dynamic handles and the global 404.

Capture durable screenshots and compare home/PLP/PDP desktop + mobile against the canonical Advanced POC before claiming completion.

## Delivery boundary

- Work on `feat/advanced-visual-realignment` in the isolated worktree.
- Do not change the primary checkout or its server on port `3333`.
- Use another port for implementation QA.
- Do not commit, push, open/merge a PR, or deploy production without explicit scope. A non-production review preview is part of this approved implementation.
