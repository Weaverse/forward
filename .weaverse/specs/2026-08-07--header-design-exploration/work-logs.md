# Work log

## 2026-08-07 — Review-ready implementation

### Scope

- Implemented three static, query-selectable header concepts:
  - `?header=1` — Field Index Drawer;
  - `?header=2` — Navigation Rail;
  - `?header=3` — Product System Preview.
- Added dedicated desktop disclosures and mobile menus for every option.
- Kept Shopify navigation/content wiring outside this slice.
- Kept canonical storefront content and catalog boundaries unchanged.

### Runtime contracts

- Missing, invalid, or repeated `header` values resolve to option 1.
- The selected option persists through:
  - header, content, and footer links;
  - normal client navigation;
  - rendered URLs used by copied links, context menus, and modified clicks;
  - internal GET forms such as search and shop filters.
- Target-owned params such as `q` and `colorway` remain intact.
- Header remains sticky after the announcement scrolls away.
- Mobile dialog starts on Close, traps focus, makes background content inert,
  restores focus on dismiss, and supports Escape.

### Verification

- `bun install --frozen-lockfile`: pass, no dependency changes.
- `bun run check`: pass.
  - tests: 115 pass;
  - build: 33 generated pages;
  - GraphQL: pass;
  - route manifest: 19 patterns and 4 redirects pass.
- Focused post-review tests: 9 pass.
- `bun audit --production`: no vulnerabilities.
- Production route smoke: 30/30 pass.
- Local production browser QA:
  - 24 desktop/mobile route states;
  - 3 desktop interaction suites;
  - 3 mobile interaction suites;
  - sticky, rendered-href, form, focus, inert, reduced-motion, overflow,
    image, console, and network checks pass;
  - 6 visual review screenshots pass.

### Review history

Independent review found and the implementation fixed:

1. a sticky-position regression caused by a short wrapper containing the header;
2. incomplete variant persistence for rendered links and internal GET forms;
3. missing current-state semantics and weaker mobile control labels/focus.

A later fresh post-fix review then found four remaining blockers:

4. React-reused filter links could retain a stale pre-navigation target;
5. the desktop Shop disclosure lacked current-route semantics;
6. mobile focus restoration could race inert cleanup;
7. collection/product previews initially ignored the canonical route.

The final hardening tracks the latest React-owned destination separately from
the last rewritten destination, derives preview state from the pathname, exposes
Shop current-state semantics, and restores mobile focus only after inert cleanup.
The focused browser regression, full browser matrix, repository gates, and
production route smoke all pass on this candidate.

## 2026-08-08 — Header 01 selected and canonicalized

### Decision and cleanup

- Leo selected Header 01 — Field Index Drawer.
- Removed Navigation Rail and Product System Preview JSX, data, interactions,
  responsive rules, and product-preview fixtures.
- Removed `?header=1|2|3` resolution/persistence, DOM mutation observation,
  GET-form injection, and router interception.
- Renamed the implementation to production-owned files:
  - `src/components/field-index-header.tsx`;
  - `src/lib/header-navigation.ts`;
  - `src/app/site-header.css`;
  - `tests/site-header.test.ts`.
- Removed the orphaned legacy `HeaderNav` and `MobileMenu` component
  implementations so the repository has one site-header path.
- Kept the three-system presentation data static and typed; Shopify Navigation
  wiring remains deferred.

### Brand system

- Imported the approved horizontal dark/moss wordmark master for the light
  header surface.
- Derived the reversed site asset from the approved system-board palette and
  unchanged horizontal geometry: light `#f2ede3`, moss `#a6ad8b`.
- Applied the reversed mark to the dark footer and mobile menu.

### Verification

- `bun install --frozen-lockfile`: no lockfile or install changes.
- `bun run check`: pass — typecheck, Biome, `112/112` tests, GraphQL,
  production build (`33/33` pages), and route-manifest check (`19` patterns +
  `4` redirects).
- `bun audit --production`: no vulnerabilities.
- Production route smoke: `30/30` checks pass.
- Vercel Preview dry-run inventory: `185` uploaded files across `16`
  directories, with `.env`, `.vscode/`, `.vercel/`, `.next/`, `node_modules/`,
  source tests, generated metadata, and QA artifacts excluded by `.vercelignore`.
- Source dead-code search: no variant resolver, query propagation,
  `MutationObserver`, option 02/03 component, or exploration CSS remains in
  runtime source.
- Local Selenium matrix: `12` desktop/mobile route states plus `4` real query
  transitions; sticky/disclosure behavior, Escape/outside close, initial focus,
  bidirectional focus trap, inert cleanup, focus restoration, route-current
  semantics, normal query parameters, image loading, overflow, console, and
  network checks pass.
- Responsive breakpoint sweep passes at `1280`, `1101`, `1100`, `1024`, `820`,
  and `768` px with the expected desktop/mobile mode switch and zero overflow.
- Visual review caught the canonical global `img` background behind the new
  transparent marks. Regression coverage plus scoped transparent backgrounds
  fixed it. Final computed footer image background is `rgba(0, 0, 0, 0)` and
  desktop/mobile contact-sheet review has no visual blocker.
- Axe closed-state scan found one header-owned landmark issue on the announcement
  strip; it is now a labeled `aside` and covered by the header accessibility
  contract. The remaining three axe findings are pre-existing homepage activity
  tile contrast findings outside this header/logo scope.
- Independent brand review passed. Independent source review caught missing
  `aria-current` semantics on desktop Search/Account/Cart and mobile Cart.
  Destination-specific regression coverage was added and the finding fixed.
- Independent runtime accessibility review caught focus falling to `BODY` after
  mobile link/pathname navigation. All mobile navigation now uses the shared
  close-and-restore path, route changes restore only when the dialog was open,
  and post-fix Selenium verifies trigger focus plus inert/body-lock cleanup for
  direct link and browser-back transitions.
- The same review caught closed triggers retaining `aria-controls` IDs for
  unmounted panels. Both triggers now expose `aria-controls` only while their
  target is mounted, with source-contract coverage.
- Final post-fix exact-candidate review, pushed-SHA verification, and hosted
  Preview verification remain pending.
