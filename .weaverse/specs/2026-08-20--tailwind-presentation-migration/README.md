# Tailwind presentation migration

Updated: 2026-08-21 07:07 +07
Status: `SPEC_READY`
Issue: [Weaverse/forward#61](https://github.com/Weaverse/forward/issues/61)
Branch: `refactor/tailwind-presentation-layer`
Baseline: `main@8fa94b727cc7977d75dc2400bcddf8b2d492e83f`

## Objective

Translate Forward's accepted shopper-visible presentation into Tailwind CSS v4, retire the hand-ported global component stylesheets, and replace source-shape UI assertions with behavior-level coverage before the presentation refactor begins.

This is an architecture migration, not a visual redesign. The merged Production storefront at https://forward-sandy.vercel.app is the visual and behavioral baseline unless Leo explicitly approves a change. The migration may improve maintainability, component ownership, fail-soft behavior, and test quality, but it must not casually restyle the product or weaken live commerce contracts.

## Source of truth

Use this authority order:

1. Leo's latest explicit direction in the active session.
2. GitHub issue [#61](https://github.com/Weaverse/forward/issues/61).
3. This spec and [`implementation-plan.md`](./implementation-plan.md).
4. Completed Phase 1 contracts in [`../2026-08-05--advanced-visual-realignment/production-polish-phase-1-handoff.md`](../2026-08-05--advanced-visual-realignment/production-polish-phase-1-handoff.md).
5. Current source, runtime behavior, and tests.
6. Historical visual/source-port specs as evidence only.

Do not resume the rejected screenshot-reconstruction workflow or treat the Advanced POC implementation as code to preserve. Preserve the accepted Forward Production result, not the old CSS architecture that produced it.

## Measured baseline

The spec baseline was measured on `main@8fa94b7` before implementation:

| Surface | Current baseline |
|---|---:|
| Presentation stylesheets | `globals.css`, `canonical-source.css`, `site-header.css`, `production-polish.css` |
| Combined CSS | 4,638 lines |
| `canonical-source.css` | 3,616 lines |
| `site-header.css` | 498 lines |
| `production-polish.css` | 512 lines |
| TSX files | 39 |
| `className=` assignments | 542 |
| Distinct literal class names | 241 |
| Source-reading UI-test call sites in the four named suites | 75 |
| Existing repository tests | 367 passing |

Tailwind v4.1 and `@tailwindcss/postcss` are installed, `globals.css` imports Tailwind, but current TSX presentation uses hand-written global class names rather than Tailwind utilities. `src/lib/cn.ts` exists but is used narrowly; `cva` is not installed.

## Accepted architecture

### Tailwind ownership

- `src/app/globals.css` remains the only global stylesheet imported by the root layout.
- It owns `@import "tailwindcss"`, one effective Tailwind v4 `@theme` token set, and only truly global base contracts that cannot be represented at a component call site.
- Components and routes own their presentation through Tailwind utility classes.
- Reusable visual variants use `cva`; conditional composition uses the existing `cn()` helper. `class-variance-authority` is installed as a production presentation dependency in Phase 1, before any Phase 2 slice may consume it.
- No new global component selector is introduced to hide a partial migration.
- Arbitrary values are allowed only for intentional one-off geometry that has no stable token. Repeated arbitrary values must become named tokens or variants.
- `canonical-source.css`, `site-header.css`, and `production-polish.css` must be deleted when their final consumers are migrated.

### Test ownership

- Behavior contracts are tested through rendered DOM, accessible roles/names/states, user interactions, normalized data outputs, and browser runtime evidence.
- Tests must not read production source/CSS and regex-match implementation text as a proxy for behavior.
- Layout, responsive geometry, focus/inert behavior, reduced motion, navigation reuse, and browser-console safety require browser coverage; JSDOM is not accepted as proof of CSS layout.
- The final test count may be lower than 367 if source snapshots are replaced by fewer stronger behavior cases. The work log must report old and new counts honestly.

### Component ownership

Shared components remain under `src/components/`. Single-consumer components move beside their route or owning feature. The Header receives a dedicated feature folder because its subcomponents and navigation adapter are one ownership boundary.

### Runtime decisions

- The Header must fail soft for merchant-owned navigation drift. Invalid optional mega-panel presentation data may remove/degrade that enhancement, but must not crash the root layout or ordinary navigation.
- Rich Shopify HTML must be parsed structurally with an allowlist and exact URL policy. Regex may normalize already-parsed text, but must not parse/sanitize tag structure or attributes.
- React Compiler is an explicit decision in this migration: either enable it with the supported Next.js contract and prove the build, or remove the unsupported convention and retain ordinary React code. Do not claim compiler optimization while it is disabled.
- `ProductCard` server/client ownership must be decided from a working accessible swatch interaction, not from bundle preference alone.

## Protected contracts

The migration must preserve:

- zero `any`, `as any`, `@ts-ignore`, or leaked raw Shopify shapes;
- `storefront` from `src/lib/storefront/data-source.ts` as the only route/component data seam;
- fail-closed live Shopify mode and deterministic fixture-only static mode;
- exact catalog contract: 9 products / 18 colorways / 78 ordered variants / 4 collections / 7 pages / 6 articles / 4 policies;
- canonical `Shop all → /shop` first in the four-child Shop branch;
- destination-owned query state and PDP `colorway`/`size` isolation;
- exact variant-level price, compare-at/sale, sold-out, selected media, cart merchandise identity, and checkout handoff;
- mini-cart repeated-add lifecycle and focus-aware dismissal;
- Header keyboard, Escape, focus trap/restoration, inert background, body lock, outside dismissal, active state, and readable utility controls;
- 44px swatch targets, visible focus, readable option typography, shared icon family, and hard-shadow button states;
- truthful localization/social/payment/newsletter rendering;
- natural mobile height, no horizontal overflow, short-desktop safety, reduced-motion behavior, and clean browser console;
- theme-owned and Shopify-owned route boundaries;
- account/session/token security and private/no-store personalization;
- Bun/Biome/Next/Hydrogen tooling and route/build verification.

## Scope

### Included

1. Replace the four source-coupled UI suites with behavior/DOM/browser contracts.
2. Consolidate the effective design tokens into Tailwind v4 `@theme` values.
3. Migrate the entire presentation inventory to Tailwind utilities, shell first and then every route.
4. Remove the three legacy component stylesheets and unused CSS.
5. Colocate the issue's identified single-consumer components and Header-only navigation code.
6. Adopt `cn()` and `cva` for conditional/variant styling.
7. Make Header presentation fail soft without weakening adapter verification or hiding live drift.
8. Replace structural HTML parsing/sanitization by regex with a real allowlisted parser.
9. Resolve React Compiler configuration honestly.
10. Evaluate and implement the safest `ProductCard` server/client boundary that preserves accessible swatch behavior.
11. Add durable browser verification for the highest-risk global and commerce interactions. `bun run test:browser` is the aggregate gate and must execute the explicit-empty static/account-disabled, live-catalog/account-disabled, and complete live-catalog/account-enabled matrices through named subordinate scripts.

### Excluded

- normalized storefront model or data-source rewrites;
- catalog, variant, collection, menu, cart, checkout, account, or publication contract changes;
- Shopify Admin, Markets, customer/order/address, payment, checkout, newsletter, or Weaverse mutation;
- Weaverse runtime/Studio integration;
- visual redesign beyond corrections explicitly approved by Leo;
- mapper/navigation/static-live simplification that is not required to finish presentation migration;
- unrelated dependency refreshes.

A minimal audited runtime dependency for structural HTML parsing is allowed because issue #61 explicitly requires replacing the regex parser. No other new runtime dependency is allowed without a recorded decision. DOM/browser test libraries, `cva`, and React Compiler tooling are development/presentation dependencies within this issue.

## Phase gates

### Phase 0 — unlock the refactor

- Add the DOM rendering test layer.
- Replace source-text assertions with behavior contracts.
- Add permanent browser coverage for CSS/layout interactions JSDOM cannot prove.
- Keep the legacy presentation unchanged.
- Record the honest post-migration test count.

No Tailwind component migration begins until Phase 0 focused suites and `bun run check` pass.

### Phase 1 — effective design tokens

- Derive computed winning values from the current cascade.
- Name tokens by semantic meaning.
- Add the Tailwind v4 theme contract.
- Install and classify `class-variance-authority` before component migration.
- Preserve current rendering while tokens are introduced.

### Phase 2 — section-by-section Tailwind migration

Migrate in this order:

1. document base, skip link, announcement bar;
2. Header/mega panel/mobile navigation/localization/mini-cart;
3. Footer;
4. Home;
5. Shop/collection/product cards/search;
6. PDP/add-to-cart/gallery;
7. Cart/account;
8. Journal/pages/policies/about/materials/field-testing;
9. loading/error/not-found states.

Each slice converts markup to utilities, deletes only its now-dead CSS, runs focused tests, and receives desktop/mobile browser comparison before the next broad slice.

### Phase 3 — structure

- Move single-consumer components to their owner.
- Move Header-only navigation beside the Header.
- Consolidate variants with `cva` and conditions with `cn()`.
- Update imports/tests without compatibility re-export shims.

### Phase 4 — correctness and runtime boundaries

- Header fail-soft behavior.
- Structural rich-HTML parser with strict allowlists.
- React Compiler decision and implementation.
- Product-card server/client boundary decision and implementation.

### Phase 5 — cleanup and release candidate

- Delete legacy CSS files/imports.
- Prove no production consumer uses legacy component classes.
- Prove Tailwind utilities are present across the presentation inventory.
- Remove dead tests/helpers/styles/dependencies.
- Run full automated, browser, live-read-only Shopify, security, and independent review gates.

Detailed file-level steps and acceptance criteria are in [`implementation-plan.md`](./implementation-plan.md). Execution evidence belongs in [`work-logs.md`](./work-logs.md).

## Commit plan

The intended logical history is:

1. `Document Tailwind presentation migration`
2. `Replace source-coupled UI tests with behavior coverage`
3. `Define the Forward Tailwind theme`
4. `Migrate the storefront shell to Tailwind`
5. `Migrate commerce routes to Tailwind`
6. `Migrate content and account routes to Tailwind`
7. `Colocate presentation components`
8. `Harden presentation runtime boundaries`
9. `Remove legacy presentation styles`
10. `Close out Tailwind migration verification`

Exact grouping may change to keep each commit coherent, but the spec commit remains first and implementation is split into multiple reviewable commits. Public history will not be rewritten after push.

## Verification contract

Every implementation checkpoint runs focused tests plus:

```bash
bun run typecheck
bun run lint
bun run format:check
git diff --check
```

Before the PR opens:

```bash
bun install --frozen-lockfile
bun run check
bun run verify:static
bun run verify:live
bun run test:browser
bun audit --production
git diff --check
```

Phase 0 must add these exact script contracts:

- `bun run verify:static`: remove all Shopify catalog/cart/account credentials in a script-owned child environment, then build and run the static route/smoke contract.
- `bun run verify:live`: require the complete live Shopify catalog configuration, run the live build/route/read-only Shopify gates, and exercise both account-disabled and account-enabled configuration where account credentials are available.
- `bun run test:browser`: run `test:browser:static`, `test:browser:live-account-disabled`, and `test:browser:live-account-enabled` against fresh production builds. The aggregate command must fail when a required live credential matrix cannot be established; it may not silently skip a matrix.

The browser matrix covers desktop, short desktop, and true mobile. Final acceptance also checks repeated navigation cycles and a clean console. It performs no checkout, account, address, customer, Shopify Admin, or Weaverse mutation.

## Working protocol

- Work only on `refactor/tailwind-presentation-layer` in the primary checkout.
- Re-read `git status --short --branch` before each editing phase.
- Commit/push this docs-only spec before production-code changes.
- Do not deploy or mutate Shopify/Weaverse.
- Keep generated builds, screenshots, traces, and temporary review artifacts untracked unless the spec explicitly promotes them.
- Do not stage `.env*`, `.next`, caches, browser profiles, or local credentials.
- Update [`work-logs.md`](./work-logs.md) after each accepted phase with exact commands/results and current SHA.
