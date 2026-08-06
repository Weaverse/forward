# Implementation plan — Advanced POC visual realignment

Plan-only document. Canonical visual reference:
`https://weaverse-hydrogen-next-poc.vercel.app/theme-preview-advanced/index.html#/home`
(rendered behavior only; no POC code copying, no Pilot inspection).

## 1. Ground rules (non-negotiable contracts)

Everything below is presentation-layer work. The following are **preserved verbatim**
and every phase must leave them passing:

- **Data seam**: all reads stay on `storefront` from `src/lib/storefront/data-source.ts`
  (`listProducts`, `getProduct`, `searchProducts`, `listCollections`, `getCollection`,
  `getCollectionProducts`, `listArticles`, `getArticle`, `listPages`, `getPage`,
  `listPolicies`, `getPolicy`, `getNavigation`, `getThemeContent`, `listDemoOrders`,
  `getDemoOrder`, `listDemoAddresses`, `getDemoCartSeed`). No new fixture imports under
  `src/app` or `src/components`. Fixture data (`src/lib/storefront/fixtures/**`) is not
  edited; presentation-only strings (section labels, plate framing, rail captions) are
  authored in components, not fixtures.
- **Route contract**: URL patterns, `dynamicParams = false`, `generateStaticParams`,
  `generateMetadata`, `notFound()` on null handles, the 4 permanent 308 redirects, 501
  `text/plain` on `/account/authorize` + `/account/logout`, robots/sitemap. Owned by
  `src/lib/routes/route-contract.ts` — **do not edit** it or `scripts/*.mts`.
- **Cart contract**: `src/lib/demo-cart/**` untouched. Keep `lineKey`, `sanitizeLines`
  invariants (canonical `productColorwayHref` hrefs, `/images/products/*.webp` image
  srcs, USD), `seedCartOnce` on `/cart`, `useDemoCartLines` in the header count,
  `MAX_LINE_QUANTITY`, free-shipping threshold. Honest demo labeling stays (restyled).
- **Colorway/state contract**: `product-state.ts` untouched — `COLORWAY_PARAM`,
  `resolveColorway`, `galleryImages` order (primary/alternate/detail/context),
  `productColorwayHref` (bare URL for first colorway, `?colorway=` otherwise).
- **Media boundary**: only existing `public/images/products/*` (24 WebP + manifest) and
  `public/images/editorial/*` (6 WebP). No POC media, no new downloads.
- **Tests/scripts**: `tests/**`, `scripts/**`, `biome.json`, `package.json`, port 3333
  unchanged. Tests are pure-unit (no DOM), so component markup is free to change.
- Server Components by default. Existing client files stay the only client files unless
  a phase below explicitly says otherwise (mobile menu, gallery selection).

## 2. Design-system delta (current → Advanced POC)

Current direction: restrained heritage/catalog (parchment bands, pine buttons, quiet
serif). Target direction: high-contrast editorial field system:

| Axis | Current | Target (POC) |
| --- | --- | --- |
| Canvas | bone/parchment, pine accents | cream + near-black surfaces, hard contrast |
| Accent | clay/moss | acid/neon rail + controls, used as status color |
| Display type | serif, moderate scale | oversized high-contrast serif, stepped/stacked headlines |
| Labels | mono `field-label`, sparse | dense mono field labels, coordinates, report codes, plate numbers everywhere |
| Grid | symmetric-ish 7/5 splits | asymmetric dossiers, overlapping planes, staggered numbered cards |
| Chrome | quiet announcement bar + inline nav | acid report strip + segmented technical header with numbered cells, active dark cell |
| Footer | 4-column pine-deep | oversized stacked wordmark + three nav columns |
| Dark surfaces | one "standard band" | dark PLP masthead, dark PDP stage + purchase panel, dark dispatch/movement modules |

## 3. Phase 0 — Token foundation

**Files: `src/app/globals.css`, `src/lib/cn.ts` (read-only), `src/components/wordmark.tsx`**

1. Rework the `@theme` block into the POC palette while keeping token *names* additive
   so untouched files keep compiling during the migration:
   - New surface tokens: `--color-cream` (page canvas), `--color-carbon` /
     `--color-carbon-deep` (near-black surfaces), `--color-acid` retuned to the POC's
     neon value (current `#b5c04a` is too muted), plus a hairline/rule token.
   - Keep legacy names (`bone`, `parchment`, `pine`, `clay`, `mist`, `moss`, `slate`,
     `ink`) mapped onto the new values during migration; delete unused ones in Phase 8
     cleanup once no `src/**` reference remains (`grep` gate).
2. Typography: keep the three stacks (`--font-display` serif, `--font-sans`,
   `--font-field` mono) but add POC-scale display utilities (clamp-based oversized
   sizes, tight leading, optional stacked/stepped headline helpers) and a denser
   tracked mono treatment. Extend the `field-label` utility rather than replacing it.
3. Global base: cream body, carbon selection/focus treatment consistent with acid
   accent, keep the `prefers-reduced-motion` reset exactly as-is.
4. `Wordmark`: add the oversized stacked variant needed by the footer (new `size`
   variant) while keeping header usage.

Exit gate: `bun run typecheck && bun run lint && bun run build` green with zero page
edits — proves tokens are backward compatible.

## 4. Phase 1 — Shared shell (highest leverage: visible on every route)

**Files: `src/components/site-header.tsx`, `src/components/cart-count.tsx`,
`src/components/site-footer.tsx`, `src/components/wordmark.tsx`,
`src/app/layout.tsx`, new `src/components/mobile-menu.tsx` (client)**

- **Acid report strip**: replace the pine announcement bar with the POC acid strip
  (mono report code + `themeContent.announcement`), still sourced from
  `getNavigation()` / `getThemeContent()`.
- **Segmented technical header**: `navigation.primary` rendered as bordered segmented
  cells with mono numbered labels (`01 / Shop` …), active route as dark cell. Active
  detection needs the current pathname → keep `SiteHeader` a server component and put
  active-cell logic in a small client child (`usePathname`) or use CSS-only per-route
  targeting via a client nav subcomponent; decision: client subcomponent
  `header-nav.tsx` (nav is inherently interactive on mobile anyway).
- **Utility cluster**: compact mono utility actions from `navigation.utility`,
  circular cart count (restyle `CartCount`, keep `useDemoCartLines` + aria-live).
- **Mobile menu**: new client `mobile-menu.tsx` — disclosure button ≥44px, full
  destination list (primary + utility), focus trap/Escape/restore, keyboard
  accessible, respects reduced motion. All destinations reachable at 390px.
- **Footer**: oversized stacked wordmark, three nav columns from
  `navigation.footerColumns`, mono coordinates row, `footerTagline` + `demoNotice`
  retained. Thin technical rules throughout.
- `layout.tsx`: skip-link restyled to acid/carbon; structure unchanged.

Exit gate: shell renders on all routes; keyboard pass on desktop nav + mobile menu;
no horizontal overflow at 390px.

## 5. Phase 2 — Home (`src/app/page.tsx`)

Recompose to the POC sequence, same data calls (`listProducts`, `listCollections`,
`listArticles`, `getThemeContent`), local editorial media only:

1. **Hero dossier**: asymmetric grid, oversized stepped serif headline, hero image
   (`homeHeroImage`), side telemetry column (mono coordinates/conditions), two CTAs,
   field-condition panel.
2. **Operating premise**: oversized plate number, two-tone headline, prose, metric
   row, field-standard link → `/pages/about-forward`.
3. **Overlapping image dossier**: 2–3 editorial WebPs in overlapping planes
   (absolute/negative-margin on `lg:` only; stacked flow on mobile).
4. **Equipment index**: staggered numbered product cards from `listProducts()` using
   the new shared `ProductCard` treatment (Phase 3 component, consumed here).
5. **Dark dispatch split**: carbon module from lead `listArticles()[0]` → `/journal/…`.
6. **Movement systems**: three staggered dark image cards from `listCollections()`
   → `/shop/[handle]`.

Structure sections as small local server subcomponents inside `page.tsx` (or extract
`src/components/home/*.tsx` server files if `page.tsx` exceeds ~400 lines).

## 6. Phase 3 — Product card system (shared across Home/PLP/collection/search/PDP-related)

**Files: `src/components/product-card.tsx`**

Rebuild visual treatment: large mono plate number, staggered/numbered variant (accept
`index`/`stagger` props), tag row (category/activities), price, color dots. Keep the
existing behavior contract intact: client component, swatch radios with accessible
names + selected semantics, swatch swaps primary image and retargets the link via
`resolveColorway`/`productColorwayHref`, `priority` prop for LCP images. Number/plate
comes from `product.plate` + rendered position.

## 7. Phase 4 — Shop PLP + collection pages

**Files: `src/app/shop/page.tsx`, `src/app/shop/[collectionHandle]/page.tsx`,
new `src/components/plp/filter-rail.tsx` (client, mobile disclosure only if needed)**

- **Dark editorial masthead** (carbon) with oversized title + mono index labels.
- **Acid rail**: product count + sort control on an acid strip. Keep the no-JS GET
  form semantics for sort (`?sort=`) and category filter links (`?category=`) —
  same query params, same server filtering via `listProducts(filter, sort)`.
- **Desktop filter sidebar** (categories, activities as links preserving the GET
  contract) + **mobile filter treatment**: `<details>`-based disclosure first (no JS);
  promote to a small client component only if focus management demands it.
- **Staggered editorial grid** using Phase 3 cards with plate numbers.
- Collection page: same masthead/rail/grid system fed by `getCollection` +
  `getCollectionProducts`; `notFound()`, static params, metadata untouched.

## 8. Phase 5 — PDP

**Files: `src/app/products/[productHandle]/page.tsx`,
`src/app/products/[productHandle]/product-detail.tsx`,
`src/components/add-to-cart-form.tsx`**

- **Near-black product stage**: page section wrapping gallery + panel in carbon.
- **Gallery**: multi-column layout of the selected colorway's four images
  (`galleryImages` order preserved), clear selected-view treatment (client state in
  `product-detail.tsx`; selection resets naturally on colorway change). Mobile:
  readable stacked sequence, no thumb-rail dependence.
- **Sticky purchase panel** (dark): breadcrumb, badge/spec mono label, title, price,
  description, colorway swatches (same `?colorway=` deep links via
  `productColorwayHref`), size radios, quantity stepper, add-to-cart, accordions
  (Details/Specs/Care/Repair `<details>`, restyled, moved into the panel per POC).
  `AddToCartForm` keeps `addCartLine`/`lineKey`/aria-live/demo notice — restyle only
  (acid CTA on carbon).
- **Related products**: cream section with numbered Phase 3 cards ("Completes the
  kit" data flow unchanged).
- Suspense fallback (`ProductDetailFallback`) restyled to match so colorway URL
  changes keep layout continuity. `generateStaticParams`/metadata/`notFound()` and
  unknown-`colorway` fallback behavior unchanged.

## 9. Phase 6 — Supporting routes (one system, lower individual leverage)

Apply shell tokens + masthead/plate/mono-label system:

- **Search** `src/app/search/page.tsx`: dark or acid-railed masthead, oversized input
  in the GET form (keep `?q=`), mono result count, Phase 3 grid, styled empty/no-query
  states with term pills.
- **Cart** `src/app/cart/page.tsx` + `src/components/cart-view.tsx`: manifest-style
  line table (mono plate/qty columns), carbon summary panel, acid disabled-checkout
  bar keeping the honest "not connected" label; hydration gate + seed + stepper +
  remove + live region logic untouched.
- **Account family** `src/components/account-shell.tsx`,
  `src/components/surface-shell.tsx`, `src/app/account/{page,login/page,
  addresses/page,orders/page,orders/[orderId]/page}.tsx`: technical dossier framing —
  mono nav rail, report-code headers, order rows as field-log entries, order detail as
  a manifest with totals block. Prototype/demo notices kept, restyled. 501 route
  handlers untouched.
- **Journal** `src/app/journal/page.tsx` + `[articleHandle]/page.tsx`: editorial
  masthead with oversized serif, lead dispatch treatment, dense mono metadata
  (Filed/From/Read, coordinates), restyled `ArticleBlockView` (pullquote/note in the
  new palette).
- **Pages/Policies** `src/app/pages/[pageHandle]/page.tsx`,
  `src/app/policies/[policyHandle]/page.tsx`: numbered-section field-standard
  treatment; policy sidebar as mono index rail.
- **System states** `src/app/{error,loading,not-found}.tsx`: 404/error as oversized
  report-code surfaces ("404" plate treatment), loading state in mono; all reachable
  via unknown handles (`notFound()` paths already wired).

## 10. Phase 7 — Responsive + accessibility hardening pass

Sweep every route at 390×844, 768×1024, 1440×900, 1920×1080:

- No horizontal overflow; overlapping/absolute desktop compositions (home dossier,
  staggered cards) must collapse to intentional stacked flow ≤ `lg`.
- PLP filters/sort usable on mobile; PDP purchase controls visible/usable while
  gallery stacks.
- Focus visible on dark and acid surfaces (per-surface focus color if needed).
- `prefers-reduced-motion` respected (no new always-on animation; reuse global reset).
- Layout continuity across client nav, colorway changes, cart updates, back/forward.

## 11. Phase 8 — Cleanup + repository verification

1. Remove now-unused legacy tokens/utilities from `globals.css`; grep-verify no dead
   class references; confirm no fixture imports under `src/app`/`src/components`
   (`grep -r "storefront/fixtures" src/app src/components` → empty).
2. Full verification (must all pass):

```bash
bun install --frozen-lockfile
bun run check          # typecheck → lint → format:check → test → build → check:routes
bun run smoke:routes   # needs the production build; port 4973
bun audit --production
bunx biome check .
git diff --check
```

3. Browser QA (desktop + true mobile emulation, port ≠ 3333) over the spec's route
   list: `/`, `/shop`, `/shop/field-gear`,
   `/products/weatherline-shell?colorway=claystone`, `/search?q=trail`, `/cart`,
   `/account`, `/account/orders/1001` (fixture order id; the spec's `FWD-10482` is the
   POC's fixture — ours is `1001` per `SMOKE_FIXTURES`), `/journal`,
   `/journal/walking-the-long-light`, `/pages/about-forward`,
   `/policies/refund-policy` (verify handle exists via `listPolicies`; fall back to
   `shipping-policy` from `SMOKE_FIXTURES`), unknown handles → 404.
   Interaction flow: colorway + size + quantity → add to cart → cart update/remove →
   repeated navigation → back/forward. Console clean; images natural-dimension check.
4. Capture durable screenshots (home/PLP/PDP, desktop + mobile) side-by-side against
   the POC; store under the spec folder.
5. Update `work-logs.md` (files changed, design mapping, commands/results, gaps,
   manual QA remaining). Leave commit/push/deploy for explicit instruction; final
   verification handoff goes to Hermes per the handoff doc.

## 12. Work order & leverage rationale

Phase 0 tokens → Phase 1 shell (every route) → Phase 3 card + Phase 2 home (first
acceptance surface) → Phase 4 PLP → Phase 5 PDP → Phase 6 supporting → Phase 7
responsive/a11y → Phase 8 cleanup/verification. Phase 3 lands before or with Phase 2
since home's equipment index consumes the new card. Focused checks
(`typecheck`/`lint`/targeted `bun test`) run after each phase.

## 13. Files touched (complete scope)

**Edited**
- `src/app/globals.css`
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/error.tsx`,
  `src/app/loading.tsx`, `src/app/not-found.tsx`
- `src/app/shop/page.tsx`, `src/app/shop/[collectionHandle]/page.tsx`
- `src/app/products/[productHandle]/page.tsx`,
  `src/app/products/[productHandle]/product-detail.tsx`
- `src/app/search/page.tsx`, `src/app/cart/page.tsx`
- `src/app/journal/page.tsx`, `src/app/journal/[articleHandle]/page.tsx`
- `src/app/pages/[pageHandle]/page.tsx`, `src/app/policies/[policyHandle]/page.tsx`
- `src/app/account/page.tsx`, `src/app/account/login/page.tsx`,
  `src/app/account/addresses/page.tsx`, `src/app/account/orders/page.tsx`,
  `src/app/account/orders/[orderId]/page.tsx`
- `src/components/{site-header,site-footer,wordmark,cart-count,product-card,cart-view,add-to-cart-form,account-shell,surface-shell}.tsx`
- `.weaverse/specs/2026-08-05--advanced-visual-realignment/work-logs.md`

**New**
- `src/components/mobile-menu.tsx`, `src/components/header-nav.tsx` (client)
- Optional: `src/components/home/*.tsx`, `src/components/plp/filter-rail.tsx`
  (extract only if page files grow past ~400 lines)

**Explicitly untouched**
- `src/lib/storefront/**`, `src/lib/routes/**`, `src/lib/demo-cart/**`,
  `src/lib/cn.ts`, `src/app/account/{authorize,logout}/route.ts`,
  `src/app/{robots,sitemap}.ts`, `tests/**`, `scripts/**`, `public/images/**`,
  `package.json`, `biome.json`, config files.

## 14. Risks / open points

- **Acid contrast**: neon-on-cream and neon-on-carbon must keep WCAG AA for text;
  use acid as surface/status with ink/carbon text, not as small text color.
- **Active-nav cell** needs `usePathname` → one new client boundary in the header;
  keep it leaf-sized so the header stays a server component.
- **Spec route list vs fixtures**: order `FWD-10482` and `refund-policy` are POC-side
  identifiers; QA maps them to real fixture handles (see Phase 8.3) — no fixture
  edits for presentation.
- **Overlap compositions** are the main mobile-overflow risk; every absolute overlap
  gets an explicit `max-lg` stacked fallback (Phase 7 gate).
- Preview deployment (acceptance criterion 8) is out of this plan's scope per the
  handoff constraints ("do not deploy"); it is Hermes/Leo-side after verification.
