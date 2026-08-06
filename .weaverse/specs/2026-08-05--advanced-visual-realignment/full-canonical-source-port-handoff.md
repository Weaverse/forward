# Full canonical source-port — Claude implementation handoff

Date: 2026-08-06
Status: Ready for Claude implementation
Scope: Shared shell and every rendered storefront route
Forward baseline: `main@cf289917091e7a1aeb54d8521402a4b58ab50717`
Canonical POC source: `Weaverse/weaverse-hydrogen-next-poc@7e416404b5c9d7d8b9fed27bed2b897c36c9b7a4`

## Original user correction and confirmed scope

> "Tại sao chú k dùng đúng source code luôn? Chính chú là người viết cái poc preview đấy mà? hay chú quên?"

> "Spec mới có mỗi home thôi à? tất cả các route chứ nhỉ?"

> "full canonical source-port -> thế này mới là đúng nhé"

The prior implementation used screenshots to approximate the owned Advanced POC. Leo rejected that result. The next pass is not another Home correction and not another visual reinterpretation. It is a **full canonical source-port** across the shared shell and every rendered route.

## Current Forward state

PR #52 is merged. Before this spec-only edit, the primary checkout was clean and synced:

```text
repo=/Users/hta218/Documents/work/workspace/forward
branch=main
HEAD=cf289917091e7a1aeb54d8521402a4b58ab50717
origin/main=cf289917091e7a1aeb54d8521402a4b58ab50717
```

Create implementation work from this exact baseline.

Recommended implementation isolation:

```text
branch=fix/full-canonical-source-port
worktree=/Users/hta218/Documents/work/worktrees/forward-full-canonical-source-port
```

Do not reuse the removed `fix/home-canonical-parity` worktree or its screenshot-reconstruction method.

## Source-of-truth hierarchy

1. **Pinned canonical POC source** owns DOM hierarchy, page composition, effective CSS, typography, responsive behavior, and visual interactions.
2. **Forward normalized substrate** owns real data, canonical routes, metadata, static generation, cart persistence, input validation, accessibility behavior, and local asset ownership.
3. **Canonical rendered screenshots** verify that the source port rendered correctly. They are not the implementation source.
4. The current Forward presentation is not a visual authority. It may be replaced while the protected substrate remains intact.

Do not translate the POC into a new design system. Translate the source directly into React/Next.js and adapt only at the explicit seams in this document.

## Canonical source pin

Local checkout:

```text
/Users/hta218/Documents/work/workspace/weaverse-hydrogen-next-poc
```

Verified state:

```text
branch=main
HEAD=7e416404b5c9d7d8b9fed27bed2b897c36c9b7a4
origin/main=7e416404b5c9d7d8b9fed27bed2b897c36c9b7a4
commit=Rename advanced Outdoor preview to Forward
```

Canonical files:

```text
public/theme-preview-advanced/index.html
public/theme-preview-advanced/app.js
public/theme-preview-advanced/styles.css
public/theme-preview-advanced/README.md
app/theme-preview-advanced/page.tsx
```

Pinned GitHub source:

- https://github.com/Weaverse/weaverse-hydrogen-next-poc/blob/7e416404b5c9d7d8b9fed27bed2b897c36c9b7a4/public/theme-preview-advanced/app.js
- https://github.com/Weaverse/weaverse-hydrogen-next-poc/blob/7e416404b5c9d7d8b9fed27bed2b897c36c9b7a4/public/theme-preview-advanced/styles.css
- https://github.com/Weaverse/weaverse-hydrogen-next-poc/blob/7e416404b5c9d7d8b9fed27bed2b897c36c9b7a4/public/theme-preview-advanced/index.html

Preflight before editing:

```bash
git -C /Users/hta218/Documents/work/workspace/weaverse-hydrogen-next-poc status --short --branch
git -C /Users/hta218/Documents/work/workspace/weaverse-hydrogen-next-poc rev-parse HEAD
git -C /Users/hta218/Documents/work/workspace/forward rev-parse HEAD
```

Stop if either SHA differs from the pins above.

## Exact source map

### Shared functions

| Source range | Contract |
| --- | --- |
| `app.js:87–107` | Canonical product-card hierarchy |
| `app.js:109–139` | Filter hierarchy |
| `app.js:141–160` | Announcement, header, navigation, utilities, coordinate spine |
| `app.js:162–176` | Footer hierarchy |
| `app.js:178–200` | Cart drawer/mobile menu visual grammar; behavior must remain Forward-owned |
| `app.js:202–210` | Prototype switcher — explicitly excluded |

### Route render functions

| Source range/function | Canonical surface | Forward route |
| --- | --- | --- |
| `212–250 homePage()` | Home | `/` |
| `252–263 shopPage()` | Shop/PLP | `/shop` |
| `265–273 activityPage()` | Activity/collection landing | `/shop/[collectionHandle]` |
| `275–291 productPage()` | PDP | `/products/[productHandle]` |
| `293–300 searchPage()` | Search empty/results | `/search` |
| `302–309 cartPage()` | Cart empty/filled | `/cart` |
| `311–313 signInPage()` | Account sign-in | `/account/login` |
| `315–317 accountPage()` | Account shell/overview/history | `/account`, `/account/orders`, `/account/addresses` |
| `319–321 orderDetailPage()` | Order detail | `/account/orders/[orderId]` |
| `323–325 policyPage()` | Policy/legal article | `/policies/[policyHandle]` |
| `327–329 journalPage()` | Journal index | `/journal` |
| `331–333 articlePage()` | Journal article | `/journal/[articleHandle]` |
| `335–337 aboutPage()` | Brand/content page | `/pages/[pageHandle]` |
| `339–341 notFoundPage()` | 404 | root/dynamic not-found surfaces |
| `343–359 pageForRoute()` | Canonical route mapping reference only | Next App Router owns routing |

### CSS source

The canonical render depends on both layers in the same file:

- `styles.css:1–579` — base component/layout definitions;
- `styles.css:580–839` — effective Advanced overrides for tokens, shell, Home, commerce, account, editorial, content, footer, drawers;
- `styles.css:840–948` — 1100/820/560 breakpoints and reduced motion.

Do not copy only the Advanced override block and silently lose base declarations. Port the effective cascade for every used class. Exclude prototype-only selectors.

Important Advanced ranges:

| CSS range | Surface |
| --- | --- |
| `580–619` | exact tokens, fonts, global type/control treatment |
| `620–633` | announcement/header/navigation/coordinate spine |
| `635–718` | Home |
| `720–736` | page hero, PLP tools/grid/filters |
| `738–747` | activity/collection landing |
| `749–765` | PDP/gallery/options |
| `767–775` | search/cart |
| `777–791` | sign-in/account/order |
| `793–808` | journal/article |
| `810–820` | About/content/404 |
| `822–838` | footer/drawer/overlay/mobile menu; prototype selectors excluded |
| `840–948` | all responsive and reduced-motion rules |

## Meaning of “source-port”

The repository rule against wholesale POC copying means:

- do not ship `app.js` or use `innerHTML`;
- do not port hash routing, prototype state, fake authentication, switcher, toast, or fictional data arrays;
- do not inspect, import, emulate, or copy Pilot;
- do port the canonical markup hierarchy for every route into semantic React components;
- do port the relevant CSS declarations and breakpoints directly instead of approximating them with different utility values;
- do replace static values only at normalized Forward data, route, interaction, metadata, and asset seams;
- do preserve existing accessibility and operational behavior where the static POC was only illustrative.

The target is a source-faithful Next.js translation of the entire Advanced POC, not “the same art direction.”

## Effective canonical design contract

Use the Advanced values at `styles.css:580–600`:

```text
sand=#e8e2d4
paper=#f2eee4
stone=#c8c0b0
stone-dark=#817d73
forest=#2f3a2f
forest-deep=#11130f
moss=#737c5f
ink=#11130f
muted=#66695f
signal=#d9ff57
signal-dark=#485c00
white=#f5f1e8
line=rgba(17,19,15,.22)
display=Literata
ui=Manrope
mono=IBM Plex Mono
max=1540px
pad=clamp(22px,4.2vw,72px)
header-height=84px
```

The current fallback stack (`Iowan Old Style`, `Avenir Next`, `SF Mono`) is not equivalent. Load Literata, Manrope, and IBM Plex Mono through `next/font/google` or a Next-owned local font path; do not hotlink Google Fonts in production HTML.

A dedicated presentation stylesheet such as `src/app/canonical-source.css` is allowed and preferred when it makes source traceability clearer. Import it after Tailwind/global foundations and scope intentionally enough to avoid accidental collisions with non-storefront/system markup. Do not convert exact source values into approximate Tailwind classes merely for consistency.

## Full Forward route matrix

### Shared shell — all HTML routes

Port:

- announcement strip;
- segmented 84px header;
- FOR/WARD brand treatment;
- numbered navigation cells and active dark cell;
- utility/cart cluster;
- fixed coordinate spine and its 1100px removal;
- mobile menu surface;
- source footer grid, stacked wordmark, columns, and bottom rail.

Preserve:

- Next route links;
- `usePathname` active state;
- normalized navigation/theme content;
- cart count and aria-live behavior;
- mobile menu focus trap, Escape, focus restore, and scroll lock;
- skip link and reduced-motion behavior.

Likely files:

```text
src/app/layout.tsx
src/app/globals.css
src/app/canonical-source.css                 # optional new presentation file
src/components/site-header.tsx
src/components/header-nav.tsx
src/components/mobile-menu.tsx
src/components/site-footer.tsx
src/components/wordmark.tsx
src/components/cart-count.tsx
```

### Home — `/`

Port `homePage()` one-to-one:

1. `.hero.hero-advanced`;
2. `.manifesto.section.shell`;
3. `.image-dossier.shell`;
4. `.equipment-runway.section.shell`;
5. `.field-notes.dispatch-feature`;
6. `.ground-index.section.shell`;
7. canonical footer close.

Stable normalized role mapping:

| POC role | Forward role |
| --- | --- |
| `IMG.climbing` | `themeContent.homeHeroImage` |
| `IMG.hike` | `heroImage` for collection handle `high-route` |
| `IMG.tent` | `heroImage` for collection handle `camp-craft` |
| `IMG.ridge` | `themeContent.standardBandImage` |
| first retained product role | `ridge-30-field-pack` |
| second retained product role | `weatherline-shell` |
| third retained product role | `talus-trail-shoe` |
| activity tiles | `field-gear`, `high-route`, `camp-craft` in that order |
| dispatch | first normalized journal article |

Resolve roles by stable handle after calling `storefront`; never import fixtures or rely on array indexes.

The POC has four fictional runway products and Forward has three approved real products. Do not invent or duplicate a fourth product. This product-count difference is allowed; the surrounding source geometry is not optional.

Retain `HomeEquipmentPlate` behavior: native radios, 44×44 targets, visible selected ring/name, keyboard/pointer selection, primary/context image swap, and `?colorway=` deep links. Port its outer presentation to the source product-card/runway hierarchy.

### Shop — `/shop`

Port `shopPage()`:

- dark source page hero;
- signal product-count/sort rail;
- source filter-sidebar/details hierarchy;
- 12-column asymmetric PLP grid and nth-child cadence;
- canonical product-card hierarchy.

Preserve Forward's no-JS query contract, validated `activity/category/sort` values, normalized products, semantic links, and empty state.

### Collection — `/shop/[collectionHandle]`

Use `activityPage()` as the primary collection composition:

- split image/dark-copy activity hero;
- source activity guide and shifted image/signal shadow;
- field-system product section;
- closing field-practice section.

Populate title, copy, hero image, products, and links from `getCollection()`/`getCollectionProducts()`. Preserve static params, metadata, `notFound()`, and unknown-handle behavior.

If a collection requires PLP controls, compose those controls using the canonical `shopPage()` rail/grid without replacing the activity hero. Do not fall back to the current approximate collection page.

### Product — `/products/[productHandle]`

Port `productPage()`:

- dark PDP grid ratio;
- source gallery hierarchy, lead-image span, thumbnails, active marker;
- sticky dark product panel;
- breadcrumb/kicker/title/price/description;
- color, size, quantity, CTA, status, accordions;
- related-products close.

Preserve normalized colorway images, query-driven colorway selection, gallery selection, accessible names/pressed states, add-to-cart contract, persisted cart validation, size/quantity limits, metadata/static params, and `notFound()`.

### Search — `/search`

Port `searchPage()` for all states:

- source oversized search heading/input;
- empty/start state;
- result heading/count;
- canonical product grid;
- no-match state.

Preserve GET `?q=`, server-side normalized search, escaped/render-safe query output, accessible label, and canonical product links.

### Cart — `/cart`

Port `cartPage()` and use source drawer visual grammar where the current app has equivalent UI:

- heading/count;
- manifest line hierarchy;
- image/product/meta/quantity/remove/price geometry;
- signal order-summary panel;
- empty state.

Preserve `src/lib/demo-cart/**`, hydration/seed behavior, line-key validation, quantity limits, remove/update semantics, totals, live regions, honest demo notice, and disabled checkout. Do not port the POC's fake checkout toast.

### Account sign-in — `/account/login`

Port the visual hierarchy from `signInPage()`:

- source 1.2fr/.8fr image/dark-panel layout;
- inset bordered auth panel;
- canonical typography/form geometry.

Preserve Forward's honest static/demo behavior. Do not port prefilled credentials, fake sign-in success, delayed navigation, data submission, or storage.

### Account family

Use `accountPage()` and `orderDetailPage()` as canonical visual sources:

| Forward route | Canonical source |
| --- | --- |
| `/account` | `accountPage()` overview |
| `/account/orders` | `accountPage()` order-history table |
| `/account/orders/[orderId]` | `orderDetailPage()` |
| `/account/addresses` | `accountPage()` account-grid/block grammar |

Port the source page hero, 190px account rail, mono navigation, tables, status treatment, bordered account blocks, and responsive table behavior. Preserve normalized demo-account/order/address data, canonical links, static params, metadata, and unknown-order `notFound()`.

### Journal — `/journal`

Port `journalPage()`:

- dark page hero;
- reversed lead-feature composition;
- source 12-column staggered article grid;
- canonical type/image/card spacing.

Preserve normalized journal data, article handles, metadata, and local images.

### Journal article — `/journal/[articleHandle]`

Port `articlePage()`:

- source split article hero;
- metadata rail;
- side route notes;
- editorial measure;
- oversized rule-bound pullquote;
- wide images and body rhythm.

Render normalized article block types safely and preserve static params, metadata, and unknown-handle `notFound()`.

### Store pages — `/pages/[pageHandle]`

Use `aboutPage()` as the canonical rich-content surface:

- split image/dark-copy hero;
- premise intro grid;
- 12-column staggered values/content blocks.

`about-forward` should map most directly to the source About composition. Other normalized pages may use the same source grammar with their own sections/content. Preserve page handles, metadata, local images, and `notFound()`.

### Policies — `/policies/[policyHandle]`

Port `policyPage()`:

- dark page hero;
- route-note aside;
- editorial article measure;
- headings, blockquote, and CTA grammar.

Preserve normalized policy content, metadata, static params, and unknown-handle `notFound()`.

### 404, loading, and error

Port `notFoundPage()` exactly for root and dynamic not-found surfaces.

The POC has no standalone loading/error render functions. Align `loading.tsx` and `error.tsx` with canonical source tokens, shell, type, controls, and 404/system-state geometry without inventing a new art direction. Preserve error reset behavior and semantic status messaging.

### Routes without visual scope

Do not visually rewrite or change behavior for:

```text
/account/authorize       # 501 text protocol placeholder
/account/logout          # 501 text protocol placeholder
/robots.txt
/sitemap.xml
/icon.svg
```

Preserve all four Shopify compatibility redirects and their query propagation. These routes must still pass contract/smoke tests, but they do not receive HTML presentation work.

## Normalized data and behavior boundary

Pages/components continue consuming data only through `storefront` and normalized models. Do not import from `src/lib/storefront/fixtures/**`.

Map POC concepts as follows:

| POC concept | Forward owner |
| --- | --- |
| `products` | normalized product APIs/models |
| `journal` | normalized journal APIs/models |
| POC activity | normalized collection APIs/models |
| static product gallery | colorway `primary/alternate/detail/context` images |
| hash routes | Next canonical route contract |
| POC cart state | `src/lib/demo-cart/**` |
| fake account state | existing normalized demo-account/order/address surfaces |
| static metadata/title | route-level Next metadata |
| Unsplash URLs | approved local `StorefrontImage` assets |

No live Shopify, Customer Account, checkout, Weaverse runtime, or credentials in this pass.

## Prototype exclusions

Do not port:

- `prototypeRoutes`, `prototypeSwitcher()`, `.prototype-switcher`, or `.prototype-tag`;
- hash parser/router, `location.hash`, global `render()`, or `innerHTML`;
- POC global mutable state;
- fake sign-in submission/navigation;
- fake checkout/repair/address toasts;
- fictional products, journal entries, order values, addresses, or user data;
- Unsplash URLs or remote image hotlinks;
- prototype-only notices;
- Pilot source, architecture, sections, or conventions.

Prototype interactions are visual/behavior references only. Existing Forward contracts remain authoritative where the POC was intentionally fake.

## Allowed implementation scope

Presentation files across the complete app may change, including:

```text
src/app/**/*.tsx
src/app/globals.css
src/app/canonical-source.css              # optional
src/components/**/*.tsx
```

Protected unless a real blocker is proven and reported before scope expansion:

```text
src/lib/storefront/**
src/lib/routes/**
src/lib/demo-cart/**
tests/**
scripts/**
public/**
package.json
bun.lock
biome.json
next.config.ts
tsconfig.json
```

Do not weaken tests, route contracts, sanitization, static-generation behavior, or accessibility to fit the source.

Do not start Shopify adapters or Weaverse sections/schemas in this pass.

## Implementation sequence

1. Create `fix/full-canonical-source-port` from `main@cf289917…` in an isolated worktree.
2. Verify both pinned SHAs and read the complete canonical files.
3. Add a source-to-target checklist to `work-logs.md` covering every function/range above.
4. Port exact fonts, effective tokens, base classes, Advanced overrides, breakpoints, and reduced-motion rules.
5. Port shared shell/header/footer/mobile surfaces.
6. Port Home.
7. Port Shop, Collection, PDP, Search, and Cart.
8. Port Account sign-in, overview, orders, order detail, and addresses.
9. Port Journal, Article, Store Pages, Policies, 404, loading, and error.
10. Run focused checks after each route group.
11. Run full repository, production-route, interaction, accessibility, and visual gates.
12. Stop at a local non-production handoff unless Leo explicitly requests commit, push, PR, or Preview deployment.

Do not mark a phase complete merely because the route renders or tests pass. Each route group needs source-trace evidence and visual evidence.

## Canonical visual evidence

Rendered canonical:

```text
https://weaverse-hydrogen-next-poc.vercel.app/theme-preview-advanced/index.html#/home
```

Durable reference folder:

```text
/Users/hta218/Documents/work/artifacts/forward-advanced-realignment-reference-2026-08-05/
```

It contains desktop/mobile references for:

```text
home
shop
activity
pdp
search-results
cart
account-login
account
order
journal
article
about
policy
missing
```

Authoritative 2560px Home screenshot:

```text
/Users/hta218/Documents/work/artifacts/forward-home-canonical-parity-user-evidence-2026-08-06/screencapture-weaverse-hydrogen-next-poc-vercel-app-theme-preview-advanced-index-html-2026-08-06-09_38_30.png
```

Screenshots verify source fidelity; they must not replace source inspection.

## Visual verification gate — every route

Required viewports:

```text
2560×1440     Home exact-width gate
1440×900      desktop route suite
768×1024      tablet route suite
390×844       mobile route suite
```

For each canonical route surface:

1. capture canonical and Forward at identical viewport/device scale;
2. align captures by shell/top origin;
3. produce a 50% opacity overlay;
4. produce a pixel-difference heatmap;
5. capture top/middle/bottom crops for long pages;
6. measure major bounding boxes and section heights;
7. list intentional data-driven differences;
8. rerun after the final code change.

A side-by-side image or visual-model `APPROVE` is not sufficient. Do not instruct reviewers to ignore media, content, geometry, density, or cadence. Only explicit normalized-data differences may remain.

Verify at minimum:

- exact font families and effective tokens;
- shell/header/footer geometry;
- headline line breaks and scales;
- image-plane dimensions, crop, and object position;
- section ordering, min-heights, canvas width, spacing, overlap, and asymmetry;
- dark/light/signal cadence;
- card/grid nth-child rhythm;
- mobile stacking at the source 1100/820/560 breakpoints;
- no horizontal overflow.

User visual approval is the final visual gate. Automated checks must never claim user approval.

## Functional/browser verification

Preserve and test:

- mobile menu open/close, Escape, focus trap/restore, body lock, destinations;
- cart count, add/update/remove/quantity limits, persistence, sanitization, live regions;
- product gallery, colorway query links, image/alt updates, size, quantity, add-to-cart;
- 44×44 swatch targets and visible selected state/name;
- Shop sort/filter query behavior and collection links;
- Search empty/results/no-match states with GET `?q=`;
- account navigation, order/address links, unknown-order 404;
- journal/page/policy unknown-handle 404;
- repeated route cycles and browser back/forward continuity;
- requested-image health, zero-sized images, console errors, and overflow;
- reduced motion;
- resources, protocol routes, redirects, metadata, robots, and sitemap.

Browser route suite:

```text
/
/shop
/shop/field-gear
/products/weatherline-shell?colorway=claystone
/search
/search?q=trail
/cart
/account/login
/account
/account/orders
/account/orders/1001
/account/addresses
/journal
/journal/walking-the-long-light
/pages/about-forward
/policies/shipping-policy
/__forward-route-smoke-missing__
```

Also test unknown dynamic product, collection, article, page, policy, and order handles.

## Technical verification

Focused iteration:

```bash
bun run typecheck
bun run lint
bun run format:check
```

Final gate:

```bash
bun install --frozen-lockfile
bun run check
bun run smoke:routes
bun audit --production
bunx biome check .
git diff --check
```

Confirm separately:

```text
fixture imports under src/app/src/components = 0
broken requested images = 0
horizontal overflow failures = 0
severe app console errors = 0
canonical route smoke = all expected statuses/content types
redirect contract = all expected locations/query propagation
```

## Completion handoff

Claude must report:

```text
Canonical source SHA:
Forward base SHA:
Branch/worktree:
Source function/range checklist:
Routes completed:
Shared files changed:
Route files changed:
Intentional normalized-data adaptations:
Focused checks by route group:
Full checks:
Interaction/browser QA:
Overlay/diff artifacts by route:
Known differences:
Uncommitted/committed state:
```

Do not say `full canonical source-port complete`, `parity achieved`, or `approved` unless every rendered route is covered by the source checklist, final overlays/diffs exist, all technical/interaction gates pass, and Leo has explicitly approved the visual result.
