# Work Logs

## 2026-08-05 — Claude (implementation agent)

Implemented the approved foundation slice in the working tree on `feat/fresh-next-theme-foundation`. No commit, push, deploy, or GitHub side effect was performed; the tree is left uncommitted for Hermes review.

### What was built

- Fresh Next.js App Router app (Next 16.3.0, React 19.2.8, strict TypeScript, Tailwind CSS v4, ESLint flat config via `eslint-config-next`'s native flat exports — the FlatCompat bridge broke against eslint-config-next 16 and was replaced). Lockfile generated; no other storefront's package configuration was copied. Pilot was not inspected.
- Central route contract at `src/lib/routes/route-contract.ts` owning required patterns, categories/labels, fixture smoke paths, expected statuses, redirect contract (order-sensitive), and the manifest-key normalization + missing-route helpers. `next.config.ts` redirects, shell UI links, checker, smoke, and tests all consume it.
- Branded responsive shell: `FOR / WARD` wordmark, header with Shop/Journal/Search plus Account/Cart utility nav (static links, fully usable without JavaScript on mobile — no JS nav needed), footer with utility links, Forward tokens (bone/pine/clay/moss palette, display type, focus treatment), skip link, branded `not-found`/`error`/`loading`, and route-specific shell content that names each surface's future live-data dependency.
- All 15 canonical routes, `/account/authorize` + `/account/logout` as honest 501 placeholders (no credential assumptions), `/robots.txt` + `/sitemap.xml` metadata routes against the placeholder origin `https://forward.example`, and the 4 permanent (308) compatibility redirects with parameter preservation.
- Shell fixtures isolated in `src/lib/shell-fixtures.ts`, limited to the approved product handles and neutral route-smoke handles, explicitly labeled and fenced off from future Shopify data clients.
- `scripts/check-routes.mts` validates `.next/app-path-routes-manifest.json` and `routes-manifest.json` (build output, not source filenames). `scripts/smoke-routes.mts` starts `next start` on port 4973, verifies 23 checks (statuses, 308 redirect targets, resource routes), and always stops the server. 12 unit tests cover normalization, missing-route failure, redirect ordering/permanence, and fixture discipline via the Node test runner.
- README rewritten with setup, commands, scope, route tables, deferral list, and the `shopify hydrogen check routes` vs `npm run check:routes` distinction.

### Files changed

- Modified: `README.md`
- Added: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`
- Added: `src/app/` (layout, globals.css, home, not-found, error, loading, shop, shop/[collectionHandle], products/[productHandle], search, cart, journal, journal/[articleHandle], pages/[pageHandle], policies/[policyHandle], account{,/orders,/orders/[orderId],/addresses,/login}, account/authorize/route.ts, account/logout/route.ts, robots.ts, sitemap.ts)
- Added: `src/components/` (wordmark, site-header, site-footer, surface-shell, product-tile), `src/lib/` (cn.ts, shell-fixtures.ts, routes/route-contract.ts, routes/site.ts)
- Added: `scripts/check-routes.mts`, `scripts/smoke-routes.mts`, `tests/route-contract.test.ts`

### Verification (commands actually run, final results)

- `npm run typecheck` — pass.
- `npm run lint` — pass (0 problems).
- `npm test` — pass: 12/12 tests.
- `npm run build` — pass; build output lists all 15 canonical routes, both account protocol handlers, `/robots.txt`, `/sitemap.xml`.
- `npm run check:routes` — pass: "19 route patterns and 4 permanent redirects verified against build output."
- `npm run smoke:routes` — pass: "23 checks passed against the production server on port 4973; server stopped." Verified afterwards that no server process remained listening.
- Additional manual check: fetched `/`, `/shop`, `/products/weatherline-shell`, `/account`, `/journal/walking-the-long-light` from a production server and confirmed every referenced `/_next/` asset returns 200 (server stopped afterwards).
- `git status` — only source/docs files; `.next/`, `node_modules/`, and env files remain untracked per `.gitignore`.

### Notes / follow-ups

- `npm test` needed `node --test "tests/**/*.test.ts"` (glob) — passing a bare directory to the Node 26 test runner failed to resolve.
- `package.json` sets `"type": "module"` so the Node scripts and route contract load as ESM without warnings.
- Next.js build tooling amended `tsconfig.json` (`jsx: react-jsx`, added `.next/dev/types` include) — kept as generated.
- Browser-based console-error and overflow audits were done only via static HTML/asset checks; a real-browser pass (desktop + mobile viewports) is a cheap follow-up once a browser harness is available.
- Follow-up slices remain: live Shopify data clients, cart mutations, Customer Account OAuth, Weaverse Studio bridge, locale/market routing, deployment.

## 2026-08-05 — Hermes (independent review and verification)

Reviewed the fixed implementation range `dd0f933..8e5a324`, reproduced the
quality-gate behavior independently, and corrected the blocking findings in a
separate review-fix change.

### Review corrections

- Hardened `smoke:routes` so an occupied port fails before any HTTP check. The
  script now validates the port, monitors early server exit, stops the whole
  POSIX process group, waits for the port to close, and escalates to `SIGKILL`
  only when required.
- Expanded production smoke from 23 to 24 checks: unknown-path 404, expected
  media types for resource/protocol routes, and compatibility-query
  preservation are now executable assertions.
- Raised the supported Node floor to `>=22.18.0`. Node 22.6.0 was tested and
  failed direct `.ts` execution without the experimental flag; Node 22.18.0
  ran the full 17-test suite successfully.
- Corrected small-text color pairs to WCAG AA contrast and added separate
  light accent tokens for dark pine surfaces.
- Added a generated Forward app icon after real-browser QA found a normal-page
  `/favicon.ico` 404.
- Centralized total route-segment display decoding and added regression tests
  for valid encoded and malformed direct-call values.

### Final evidence

- Clean local clone: `npm ci` followed by `npm run typecheck` — pass before any
  Next build generated local type artifacts.
- `npm audit --omit=dev --audit-level=high` — 0 vulnerabilities.
- `git diff --check` — pass.
- `npm run check` — pass: strict typecheck, ESLint, 17/17 unit tests, Next
  16.3.0 production build, 19 route patterns, and 4 permanent redirects.
- `npm run smoke:routes` — pass: 24/24 checks; port 4973 confirmed free after
  shutdown.
- Occupied-port negative test — smoke exited 1 before testing and preserved
  the unrelated fake server; the test process was then stopped explicitly.
- Node 22.18.0 minimum-runtime test — 17/17 tests pass.
- Contrast calculations — all normal small-text token pairs pass at 4.81:1 to
  8.11:1.
- Desktop Chrome at 1280 px — coherent branded shell, no horizontal overflow,
  no console errors.
- Mobile Chrome CDP at 390 × 844 — ten route loads across home, shop, product,
  account, journal, 404, and repeated navigation cycles; every load reported
  `scrollWidth=390`, all header links stayed within 20–370 px, and normal
  routes produced zero runtime/console issues. The intentional 404 navigation
  produced the expected single 404 network entry.
- Ports 4973, 4981, and 4982 confirmed free after QA; temporary Chrome/CDP
  artifacts removed.
