# Work log

## 2026-08-05 — kickoff

- Leo rejected the merged static demo visual direction as completely different from the approved Advanced POC.
- Canonical reference pinned: `https://weaverse-hydrogen-next-poc.vercel.app/theme-preview-advanced/index.html#/home`.
- Initial side-by-side review confirmed structural divergence in shell, typography, palette, grid, hero, product cards, editorial sequencing, PLP, PDP, and footer.
- Created isolated branch/worktree `feat/advanced-visual-realignment` at `main@962a008`; primary checkout/server `3333` remains untouched.
- Technical substrate to preserve: normalized storefront source, route/static-generation contracts, demo-cart persistence/sanitization, tests, and approved local media.
- Implementation, verification, and review-preview deployment are pending.

## 2026-08-06 — @claude (phases 0–5)

Implemented phases 0–5 of `plan.md` in the isolated worktree. Reference
screenshots under
`~/Documents/work/artifacts/forward-advanced-realignment-reference-2026-08-05/`
were reviewed before each route (home, shop, PDP — desktop + mobile).

### Phase 0 — Token foundation
- `src/app/globals.css`: `@theme` reworked to the advanced palette — new
  tokens `--color-cream` (#efece1), `--color-carbon` (#12130f),
  `--color-carbon-deep` (#0a0b08), `--color-acid` retuned to neon (#d8f636),
  `--color-hairline` (#d8d4c5). Legacy names (`bone`, `parchment`, `mist`,
  `ink`, `slate`, `pine`, `pine-deep`, `moss`, `moss-light`, `clay`,
  `clay-deep`, `clay-light`) remapped onto the new values for
  backward-compatible migration (cleanup deferred to Phase 8). New utilities:
  `display-huge`, `display-large`, `plate-number`; `field-label` kept.
  Selection/focus retuned (acid selection, carbon focus ring with an acid
  override on `[data-surface="dark"]` surfaces). `prefers-reduced-motion`
  reset unchanged.
- `src/components/wordmark.tsx`: added the oversized `stacked` variant for
  the footer; header variant preserved.
- Exit gate before any page edits: `bun run typecheck && bun run lint &&
  bun run build` — all green (tokens proven backward compatible).

### Phase 1 — Shared shell
- `src/components/site-header.tsx`: acid report strip (report code +
  `themeContent.announcement` + coordinates), segmented technical header,
  utility cluster; still fed by `getNavigation()`/`getThemeContent()`.
- New `src/components/header-nav.tsx` (client): numbered segmented cells
  (`01 / Shop` …) with active route as dark cell via `usePathname`;
  `/products/*` maps to the Shop cell.
- New `src/components/mobile-menu.tsx` (client): ≥44px disclosure trigger,
  carbon overlay listing all primary + utility destinations, focus trap,
  Escape-to-close, focus restore to trigger, body scroll lock.
- `src/components/cart-count.tsx`: circular acid badge; `useDemoCartLines`
  + aria-live announcement preserved.
- `src/components/site-footer.tsx`: carbon-deep footer, oversized stacked
  wordmark, three nav columns from `navigation.footerColumns`, coordinates
  row, `footerTagline` + `demoNotice` retained in the mono bottom bar.
- `src/app/layout.tsx`: skip link restyled to carbon/acid; theme color
  updated to carbon. Structure unchanged.

### Phase 3 — Product card (built before home, which consumes it)
- `src/components/product-card.tsx`: numbered editorial treatment —
  oversized serif plate number over the image, acid activity tag chip, mono
  category/activity tag row, round color dots. Behavior contract intact:
  client component, radio swatches with accessible names + selected
  semantics, swatch swaps primary image and retargets the link via
  `resolveColorway`/`productColorwayHref`, `priority` prop kept. New
  `stagger` prop pushes cards down on `lg:` for the staggered grid.

### Phase 2 — Home
- `src/app/page.tsx` recomposed into the POC sequence as local server
  subcomponents (same data calls — `listProducts`, `listCollections`,
  `listArticles`, `getThemeContent`): hero dossier (stepped oversized
  headline, telemetry metrics, conditions strip on the hero image, acid +
  outline CTAs), operating premise (ghost plate number, two-tone headline,
  field-standard link), overlapping image dossier (editorial media via
  themeContent + collection heroes; absolute overlap on `lg:` only, stacked
  below), equipment index (staggered numbered cards), dark dispatch split
  (lead `listArticles()[0]`), movement systems (three staggered dark
  collection cards).

### Phase 4 — Shop PLP + collections
- `src/app/shop/page.tsx`: dark editorial masthead, acid product-count/sort
  rail (same no-JS GET form, `?sort=`), desktop filter sidebar + mobile
  `<details>` disclosure with Activity/Category links. Additive `?activity=`
  param (validated against catalog activities, server-filtered through
  `listProducts(filter, sort)`); `?category=` links unchanged. Staggered
  card grid; styled empty state.
- `src/app/shop/[collectionHandle]/page.tsx`: same masthead/rail/grid system
  fed by `getCollection` + `getCollectionProducts`; collection index links on
  the acid rail; `dynamicParams`, static params, metadata, `notFound()`
  untouched.

### Phase 5 — PDP
- `src/app/products/[productHandle]/page.tsx`: near-black product stage
  wrapping gallery + panel; `ProductFieldRecord` accordions restyled dark and
  kept inside the panel; related products in a cream "Completes the kit."
  section with numbered cards. Static params/metadata/`notFound()` unchanged.
- `src/app/products/[productHandle]/product-detail.tsx`: new gallery —
  mobile renders the full four-image stacked sequence (`galleryImages` order
  preserved), desktop gets a large selected view with acid "Selected view"
  chip + selectable tiles (`aria-pressed`), keyed by colorway so selection
  resets on colorway change. Sticky dark purchase panel: breadcrumb
  (Shop / category), plate badge + spec label, oversized title, price,
  description, colorway name-chips (same `?colorway=` deep links via
  `productColorwayHref`), `Suspense` fallback renders the identical view.
- `src/components/add-to-cart-form.tsx`: restyle only for the carbon panel
  (acid CTA, dark size cells/stepper); `addCartLine`/`lineKey`/
  `MAX_LINE_QUANTITY`/aria-live status/demo notice all preserved.

### Command results
- `bun install --frozen-lockfile` — 88 packages, clean.
- `bun run typecheck` — green.
- `bun run lint` — green (67 files, no diagnostics).
- `bun run format` — applied (Biome).
- `bun run test` — 56 pass / 0 fail (4 files).
- `bun run build` — green, all routes prerendered as before.
- `bun run check:routes` — 19 route patterns + 4 permanent redirects
  verified.
- Production smoke on port 4973 (never 3333): `/`, `/shop`,
  `/shop/field-gear`, `/products/weatherline-shell`,
  `/products/weatherline-shell?colorway=claystone`,
  `/shop?category=packs&activity=hiking&sort=price-asc` all 200;
  `/products/unknown-thing` → 404. PDP markers (Selected view / Add to cart /
  Completes the kit) and filtered PLP results verified in served HTML.
  Server stopped after smoke.
- `grep -r "storefront/fixtures" src/app src/components` — empty (no fixture
  imports).

### Untouched boundaries confirmed
`src/lib/storefront/**`, `src/lib/routes/**`, `src/lib/demo-cart/**`,
`src/lib/cn.ts`, account 501 route handlers, robots/sitemap, `tests/**`,
`scripts/**`, `public/images/**`, `package.json`, `biome.json`, port 3333,
primary checkout. No commit/push/deploy; no credentials; no Shopify/Weaverse
runtime changes; no Pilot/POC source inspected (rendered screenshots only).

### Known gaps for the supporting-route pass (phases 6–8)
- Phase 6 routes still on the old visual system: search, cart, account
  family (`account-shell`/`surface-shell`), journal + article, pages,
  policies, error/loading/not-found. They render fine on the new tokens
  (legacy names remapped) but lack masthead/plate/mono treatment.
- Legacy token names (`bone`, `pine`, `moss*`, `clay*`, `mist`, `parchment`)
  still referenced by those Phase 6 files — cleanup gated on Phase 8 grep.
- Browser-based responsive/a11y sweep at 390/768/1440/1920 (Phase 7),
  side-by-side screenshot capture, `bun run smoke:routes`, `bun audit
  --production`, `bunx biome check .`, and full `bun run check` (Phase 8)
  not yet run as the full-suite gate.
- Home hero uses `themeContent.homeHeroImage` (climber) rather than a
  trail-walker image as in the POC — approved media boundary keeps current
  assets; flag for Leo's visual review.
- Vercel preview deployment intentionally out of scope per handoff.

## 2026-08-06 — @claude (phase 6 + responsive hardening)

Implemented the supporting routes on the advanced system. Reference
screenshots (`reference-{search-results,cart,account-login,account,order,
journal,article,about,policy,missing}-{desktop,mobile}.png`) were read before
each corresponding route.

### Search — `src/app/search/page.tsx`
- Cream masthead: mono "Search the field catalog" eyebrow + `display-huge`
  "What are you looking for?"; oversized serif query input on a heavy
  bottom rule with a mono "Search →" submit. Same no-JS GET form, `?q=`.
- Results: `display-large` "Results for “q”" + mono "N found" count
  (aria-live), Phase 3 numbered card grid. No-query state keeps the common
  search term pills; empty state mirrors it ("0 found", pills, catalog CTA).

### Cart — `src/app/cart/page.tsx` + `src/components/cart-view.tsx`
- `CartView` now owns the heading so the live count joins the title
  ("Cart · N items", `display-huge`; falls back to "Cart" pre-hydration).
- Lines as hairline-ruled manifest rows (serif title, colorway/size line,
  carbon-bordered stepper, underlined remove, line total right).
- Acid order-summary panel per the POC (Subtotal / Ground delivery ·
  Complimentary / serif Total) with the honest disabled
  "Checkout — not connected" bar and the demo-cart notice retained.
- Hydration gate, `seedCartOnce`, stepper/remove handlers, live region,
  `MAX_LINE_QUANTITY`, free-shipping threshold all untouched. Empty state
  restyled ("The pack is empty.", carbon CTA).

### Account family
- `src/components/account-shell.tsx`: carbon masthead (acid eyebrow —
  default "Field account", `display-huge` title, lede on the right), mono
  prototype-account notice strip on the masthead's bottom rule, and a mono
  nav rail (Overview / Orders / Addresses / Sign in (demo)) as
  hairline-ruled rows with acid dot markers. `activePath` contract kept;
  new optional `eyebrow` prop.
- `src/app/account/page.tsx`: "Order history / Recent orders"
  (`display-large`) mono-headed table (Order / Date / Status / Total, status
  in pine), plus bordered "Repair desk" and "Default trailhead" cards.
- `src/app/account/orders/page.tsx`: same field-log table at full width.
- `src/app/account/orders/[orderId]/page.tsx`: order number as the masthead
  title ("Field account / Order" eyebrow), status + "Back to orders" rail,
  manifest line rows, and bordered "Delivery address" / "Order total"
  blocks (order total pulls the default demo address for display only).
  Static params, metadata, `notFound()`, colorway deep links unchanged.
- `src/app/account/addresses/page.tsx`: bordered address cards with mono
  labels and an acid "Default" chip.
- `src/app/account/login/page.tsx`: rebuilt to match the POC sign-in
  composition — editorial image (via `getThemeContent().standardBandImage`)
  beside a bordered "Field account / Welcome back." panel. The email/
  password fields live in a `disabled` fieldset, the "Sign in — not
  connected" bar is a non-interactive `aria-disabled` element, and the
  copy states nothing is submitted or stored. No form element, no action,
  no client JS — honestly non-submitting.
- `src/components/surface-shell.tsx` **deleted**: its only consumer was the
  old login page; after the rebuild it was dead code. (Flagging since
  plan.md listed it as "edited"; restore trivially if a future
  foundation-slice route wants the generic frame.)

### Journal — `src/app/journal/page.tsx`, `[articleHandle]/page.tsx`
- Index: carbon masthead ("The Forward journal" acid eyebrow,
  `display-huge` "Notes from farther out."), lead dispatch band inside the
  dark surface (mono Field notes/read-time, `display-large` title, excerpt,
  plate/location/date line, "Read field note →"), then cream "Latest
  dispatches / Read, learn, head out." staggered three-column grid with
  mono plate/read-time, serif titles, and "Read story →" links.
- Article: carbon dispatch masthead (Journal / plate, `display-huge` title,
  excerpt, Filed/From/Read mono rail on the bottom rule), full-bleed hero,
  then a sticky mono "Route notes" side rail beside the measure. Body
  blocks restyled: serif paragraphs, italic pine pullquotes between rules,
  acid-edged field notes, hairline-framed figures.

### Pages + policies
- `src/app/pages/[pageHandle]/page.tsx`: split masthead (hero image beside
  a carbon `display-huge` title panel; full-width panel when a page has no
  hero), "Brief" band with the intro at `display-large`, and numbered
  bordered field-standard cards staggered on `lg`. Applies to
  `/pages/about-forward` and `/pages/repairs` unchanged handles.
- `src/app/policies/[policyHandle]/page.tsx`: carbon masthead
  ("Support / Policy", `display-huge` title, summary + mono updated date),
  sticky mono "On this page" policy index rail with acid dot markers,
  numbered sections with serif body copy; placeholder-support footer kept.

### System states
- `src/app/not-found.tsx`: now async, acid/image split panel — mono
  "404 / Off route", `display-huge` "This trail ends here.", Return home /
  Explore gear CTAs, editorial image from `listCollections()[0]` hero (data
  source only). Reached by unknown dynamic handles as before.
- `src/app/error.tsx`: carbon report surface ("Field report / Error",
  `display-huge` "Weather moved in.", mono digest reference, acid Try again
  button). Client component, no data-source calls.
- `src/app/loading.tsx`: mono "Forward field report / Loading…" status line
  between hairline rules.

### Responsive + a11y hardening (Phase 6 routes)
- Playwright (temp env in `/tmp/pw-check`, repo untouched) swept all 15
  supporting routes at 390×844, 768×1024, 1440×900, 1920×1080 against the
  production build on port 4981: **zero horizontal overflow findings**; the
  only console error is the expected 404 resource on `/definitely-missing`.
  Note: the POC's own cart-mobile reference shows its summary panel
  overflowing; our cart intentionally stacks it full-width instead.
- Grid tables collapse to stacked rows below `sm`; masthead grids stack
  below `lg`; sticky rails are `lg:`-only. Focus states inherit the global
  carbon/acid ring (`data-surface="dark"` set on every carbon surface).
  No new animation; reduced-motion reset untouched.
- Full-page captures of all supporting routes (desktop + mobile) stored
  durably as `current-{route}-{desktop,mobile}.png` in
  `~/Documents/work/artifacts/forward-advanced-realignment-reference-2026-08-05/`
  and eyeballed side-by-side against the matching reference screenshots.

### Command results (full gate, this session)
- `bun install --frozen-lockfile` — no changes.
- `bun run check` (typecheck → lint → format:check → test → build →
  check:routes) — green; 56/56 tests; 33/33 pages prerendered; 19 route
  patterns + 4 redirects verified.
- `bun run smoke:routes` — 30 checks passed on port 4973; server stopped.
- `bun audit --production` — no vulnerabilities.
- `bunx biome check .` — clean. `git diff --check` — clean.
- `grep -r "storefront/fixtures" src/app src/components` — empty.
- QA servers on 4981/4973 stopped; port 3333 and the primary checkout never
  touched.

### Untouched boundaries reconfirmed
`src/lib/storefront/**`, `src/lib/routes/**`, `src/lib/demo-cart/**`,
account 501 route handlers, robots/sitemap, `tests/**`, `scripts/**`,
`public/images/**`, `package.json`, `biome.json`, config files. No commit/
push/deploy; no credentials; no live auth/checkout/Shopify/Weaverse.

### Remaining gaps (Phase 8 / follow-up)
- Legacy token cleanup: `parchment`, `slate`, `pine`, `clay` are still used
  (intentionally, as remapped advanced values) across phase 2–6 files;
  `bone`/`mist`/`moss*`/`clay-deep|light`/`pine-deep` are now mostly or
  fully unreferenced — the globals.css legacy alias block still awaits the
  Phase 8 grep-gated prune.
- Interactive browser QA of cart mutations/back-forward cycles on the
  supporting routes was smoke-level only (automated sweep + earlier
  phase 0–5 QA); Hermes' final verification pass still applies.
- Vercel preview deployment remains out of scope per handoff.

## 2026-08-06 — Hermes final verification and review preview

- Independently re-ran `bun run check`: typecheck, Biome lint/format check,
  56/56 tests, Next production build with 33 generated pages, and route
  contract verification for 19 patterns + 4 permanent redirects all passed.
- Independently ran `bun run smoke:routes`: 30/30 HTTP checks passed. Next
  logs `NoFallbackError` internally for six intentionally unknown dynamic
  handles while still returning the required 404 responses; no unexpected
  browser runtime error was observed.
- `bun audit --production`: no vulnerabilities. `git diff --check`: clean.
  No changed path under `src/lib`, `tests`, `scripts`, `public`, package,
  lockfile, or config; no direct fixture import exists in `src/app` or
  `src/components`.
- Local production-build Selenium QA covered 13 routes at desktop and true
  `390×844` mobile (26 route/viewport cases), full-page image loading,
  horizontal overflow, browser console, expected 404, PDP size/quantity/add
  flow, persisted cart line, product-card colorway deep link, repeated
  home/shop/PDP navigation, and mobile-menu open/Escape/focus restore. Result:
  zero failures. Evidence:
  `/Users/hta218/Documents/work/artifacts/forward-advanced-realignment-final-qa-2026-08-06/`.
- Full-page visual review of home, Shop, PDP, account, article, and About at
  desktop/mobile found no blocker-level Advanced POC alignment defect. The
  implementation now consistently uses the acid report rail, segmented shell,
  carbon/cream/acid system, oversized serif hierarchy, mono field labels,
  dossier/editorial composition, numbered cards, dark PLP/PDP staging, and
  route-specific supporting compositions. Leo's design approval is still the
  authoritative acceptance gate.
- Deployed Vercel deployment `dpl_9jS6Z3tzu7osW7LfWu8vhY9MeR57` at raw host
  `https://forward-9f9goc6i5-hta218.vercel.app`; provider readback reports
  `target=preview`, `status=Ready`. The project still has no production
  deployment/alias. No promotion or production mutation occurred.
- Vercel Authentication remains enabled. A deployment-scoped Shareable Link
  with `scope=shareable-link` and seven-day TTL was generated and will be
  delivered directly; its secret is not stored in the repository or notes.
  Expiry: 2026-08-13 07:25 +07.
- Fresh-session verification followed the share flow to clean HTTP 200,
  received `_vercel_jwt`, confirmed the expected title/H1, and loaded
  representative CSS/JS/image assets at HTTP 200. Full hosted Selenium QA then
  repeated the desktop/mobile route and interaction suite with zero failures.
  Evidence:
  `/Users/hta218/Documents/work/artifacts/forward-advanced-realignment-hosted-preview-2026-08-06/`.
- Branch remains `feat/advanced-visual-realignment` at base
  `962a0083639e9952de65fe0e3640c759845a7f24` with the reviewed visual diff
  uncommitted. Nothing was committed, pushed, merged, or opened as a PR pending
  Leo's visual review. Canonical primary `main` was left clean and its local
  server was restored on port 3333.
