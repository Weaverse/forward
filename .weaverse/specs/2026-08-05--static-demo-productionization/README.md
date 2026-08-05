# Forward static-demo productionization

Date: 2026-08-05
Status: approved for implementation
Shared contract: `0.4-draft`

## Goal

Turn the existing Next.js App Router foundation into a polished, complete, static Forward commerce demo while the Shopify store is still being prepared. Keep `@shopify/hydrogen@preview` installed but do not connect a store, create runtime clients, or require credentials yet.

The visual reference is the rendered Advanced POC at:

```text
https://weaverse-hydrogen-next-poc.vercel.app/theme-preview-advanced
```

Use it only for art direction and page-surface expectations. Do not inspect, copy, or port its implementation. Do not inspect or derive from Pilot.

## Tooling contract

- Bun is the only package manager and script runner.
- Commit `bun.lock`; remove `package-lock.json`.
- Biome `2.5.7` replaces ESLint and formatting duties.
- Remove ESLint packages/config after reproducing the intended checks in `biome.json`.
- Keep strict `tsc --noEmit`, Next production build, route-contract checks, unit tests, and production HTTP smoke.
- Keep the application Node-compatible; Bun is not a production-runtime decision.
- `bun dev` serves on port `3333`.
- Repository documentation and `AGENTS.md` must name Bun/Biome commands accurately.

## Static data boundary

Pages and visual components must not import raw fixture objects directly. Use a replaceable data-source seam:

```text
static fixture records
  -> StaticStorefrontDataSource
  -> normalized storefront view models
  -> route loaders/page composition
  -> visual components
```

A later Shopify adapter must be able to replace one domain at a time without rewriting page composition. Centralize product, collection, search, cart-demo, account-demo, journal, page, policy, navigation, and theme-content contracts. Unknown dynamic handles must return `notFound()` rather than invent content.

No Storefront API calls, Hydrogen request handlers, credentials, `.env` files, analytics, checkout, or external writes belong in this milestone.

## Product catalog

Use only the approved branded WebP catalog from:

```text
/Users/hta218/Documents/work/artifacts/forward-product-image-spike/branded-variant-gallery
```

Copy the 24 role/colorway WebP files plus a repository-owned normalized manifest into `public/images/products/`. Do not copy review boards or PNG duplicates. Preserve the approved model:

```text
Product -> Colorway -> Primary / Alternate / Detail / Context
```

Products:

- Weatherline Shell: Charcoal, Claystone.
- Ridge 30 Field Pack: Charcoal, Dune.
- Talus Trail Shoe: Charcoal, Limestone.

PLP swatches must change the card primary and deep link. PDP swatches must change the complete four-image group, update visible/accessible selection, remain deep-linkable, and preserve layout/scroll continuity.

## Editorial imagery

Use fixed, local, optimized Unsplash assets for non-product imagery. Do not production-hotlink. Record the original rendered source URLs, photo IDs, intended route/role, and Unsplash license/source note in a repository-owned Markdown or JSON record.

Approved source set from the rendered POC includes:

- `photo-1522163182402-834f871fd851` — climbing/open-sky hero.
- `photo-1551632811-561732d1e306` — alpine traverse.
- `photo-1504280390367-361c6d9f38f4` — camp/tent.
- `photo-1464822759023-fed622ff2c3b` — mountain ridges.
- `photo-1551698618-1dfe5d97d256` — trail movement.
- `photo-1475483768296-6163e08872a1` — campfire/camp.

Download only the useful bounded set, optimize to local WebP, and avoid reusing unbranded stock product photography where approved branded product assets exist.

## Art direction

Direction: expedition field journal × refined outdoor editorial.

Preserve these recognizable gestures without copying POC code:

- Warm cream canvas, near-black pine panels, moss/acid field-note accents, restrained coral where useful.
- Large readable editorial serif display type paired with disciplined condensed/monospace field labels.
- Coordinate/field-report framing, thin rules, plate numbers, asymmetric image planes, and generous vertical pacing.
- Product surfaces remain precise and usable; editorial surfaces may be cinematic.
- Do not place important copy over busy imagery. Use negative space or separate solid copy panels.
- Mobile stacks image/copy intentionally rather than relying on desktop crops.
- Avoid generic rounded SaaS cards, glass effects, decorative metrics, and repetitive hero-card layouts.

## Required route and state coverage

### Decide / learn

- `/` — full editorial home.
- `/journal` and `/journal/[articleHandle]` — index and complete article.
- `/pages/[pageHandle]` — at least field standard/about and repairs.
- `/policies/[policyHandle]` — readable policy/legal surface.

### Explore

- `/shop` — complete PLP with usable filtering/sorting.
- `/shop/[collectionHandle]` — activity/collection landing.
- `/search` — initial, results, and no-results behavior.

### Inspect / command

- `/products/[productHandle]` — gallery, colorways, size/options where applicable, quantity, detail/spec/care/repair content, related products.

### Act / confirm

- `/cart` — interactive demo cart with quantity/remove/summary; clearly static and no real checkout.
- `/account/login`, `/account`, `/account/orders`, `/account/orders/[orderId]`, `/account/addresses` — polished prototype-only states and explicit non-live labeling.

### System states

- Global loading/error/not-found surfaces.
- Unknown fixture handles produce real 404 behavior.
- Existing `/robots.txt`, `/sitemap.xml`, account protocol handlers, and compatibility redirects remain correct.

## Interaction and accessibility contract

- Semantic landmarks and one useful page-level heading.
- Visible focus, keyboard operability, minimum 44px touch targets.
- Swatches use accessible names and selected-state semantics.
- Search/filter/sort controls have labels and useful empty states.
- Cart status updates use an appropriate live region.
- Drawers/menus, if used, implement focus, Escape, close, and restoration correctly.
- Respect `prefers-reduced-motion`.
- Preserve layout/animation continuity across repeated navigation and canonical unchanged state.
- No horizontal overflow or broken images at desktop and true 390px mobile viewport.

## Verification

At minimum:

```bash
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run format:check
bun test
bun run build
bun run check:routes
bun run smoke:routes
bun run check
```

Also run a real-browser route sweep, repeated-navigation cycles, a complete commerce interaction flow, console/error checks, image natural-dimension checks, desktop/mobile overflow checks, and visual screenshots.

## Delivery boundaries

- Do not push, deploy, open a PR, or alter external systems.
- Commit logical local changes only after verification.
- Preserve the user's primary checkout/server during implementation; work in the isolated worktree.
- Final handoff must include branch, SHA, clean status, check results, browser route/state coverage, screenshots, remaining static-vs-live boundaries, and confirmation that no Shopify credentials/store connection were added.
