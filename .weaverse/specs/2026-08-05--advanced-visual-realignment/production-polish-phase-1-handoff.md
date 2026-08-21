# Production polish Phase 1 handoff

Updated: 2026-08-20 10:47 +07
Status: `COMPLETED`
Approved by Leo: 2026-08-18
Baseline: `main@29e1242263c576a0635427585873bd606c412aca`
Merged: PR [#60](https://github.com/Weaverse/forward/pull/60) → `main@8fa94b727cc7977d75dc2400bcddf8b2d492e83f`
Production: `dpl_8PBjAYooDCyicPEW9oY1Sk4R2FBY` → https://forward-sandy.vercel.app

Phase 1 is closed. Continue from [`../2026-08-20--tailwind-presentation-migration/README.md`](../2026-08-20--tailwind-presentation-migration/README.md); preserve this completed phase's behavioral contracts while replacing its legacy CSS implementation under issue #61.

## Goal

Polish the complete Forward storefront shell and commerce surfaces before deeper Home redesign. Preserve the exact live Shopify catalog/content/cart/account contracts and deterministic fallback while fixing the shopper-visible defects Leo reported after Production review.

## User-approved requirements

1. Add `Shop all` as the first child of the Shop mega-menu, linking to `/shop`.
2. Increase spacing between Search, Account, and Cart and add icons.
3. Add a truthful country control to the header/topbar.
4. Adopt one icon family site-wide.
5. Add real social accounts, truthful payment marks, and a functional newsletter form to the Footer.
6. Remove the shopper-visible placeholder `Live Shopify catalog, navigation, content, and cart`.
7. Make product-card color swatches square while retaining accessible 44×44 targets.
8. Use readable `#AEB1A7` secondary/subheading text on dark surfaces.
9. Replace inconsistent yellow/primary buttons with one square hard-shadow button system, including PDP Add to Cart.
10. After Add to Cart, show a compact top-right cart popover—not a full drawer.
11. Stop PDP `colorway`/`size` parameters leaking into unrelated Header destinations.
12. Remove the `translateY(100px)` stagger from Journal cards.
13. Shorten Home Spotlight copy and keep the desktop section within the viewport.
14. Shorten Home Kit copy.
15. Stack `Shop by system` above `Built separately. Better together.`.
16. Surface Theme-owned `/about`, `/materials`, and `/field-testing` clearly without conflating them with Shopify `/pages/*` or `/journal/*`.
17. Render truthful sold-out variant states and Shopify compare-at/sale prices on PDP.
18. Raise primary menu and option-value typography; current 10px/9px production rules are defects.
19. Keep the first three PDP gallery images in the current composition; render image four and later full-width at natural aspect ratio without cropping.

## Direction decisions

- Icon family: Phosphor. Prefer a local SVG sprite or another tree-shakeable, SSR-safe implementation. Do not copy Pilot component architecture. Pilot was inspected only for the user-requested content inventory.
- Utility icons: Search, User, ShoppingBag/Cart, Globe, Caret/Chevron, Arrow, Close/Menu where useful. Decorative icons are `aria-hidden`; icon-only controls need accessible names.
- Primary button: square geometry, signal orange/yellow surface, ink text, hard 4px offset shadow, 44px+ hit target. Hover/active/focus/disabled/loading behavior must be context-safe on light and dark surfaces. PDP ATC uses the same contract.
- Dark secondary token: `#AEB1A7`.
- Mini-cart: latest line, selected options, quantity, subtotal, View cart and checkout handoff if available; announce success, support Escape/outside dismissal, auto-dismiss without stealing focus, and preserve exact Shopify cart identity.
- Query ownership: destination-aware allowlists. PDP selection params belong only to the same product route. Search/PLP parameters must not be copied blindly into unrelated routes.
- Theme-owned custom routes are `/about`, `/materials`, `/field-testing`. Shopify regular pages remain `/pages/[pageHandle]`; articles remain `/journal/[articleHandle]`.

## Live-data and integration boundaries

- Current Store has one active market: United States; primary locale `en`; presentment currency USD. Do not create/mutate Markets or locales in this slice. A country control may truthfully expose the current US/USD selection and must be designed to accept future Storefront localization options; do not invent unavailable countries.
- Forward currently has no Klaviyo environment key. Do not create a newsletter form that pretends to succeed. Reuse a verified configured provider/runbook only if one exists; otherwise leave the provider integration explicitly blocked and report it.
- Social links must use verified real URLs; never `#`, guessed handles, or generic social homepages.
- Payment marks must reflect methods actually supported by the Forward checkout. Do not display Pilot's full list merely as decoration.
- Shopify navigation is upstream-owned. The `Shop all` item requires a reviewed `main-menu` mutation plus matching strict mapper/fixture/verifier changes. No unrelated Admin mutation.
- Compare-at price already exists in Shopify Admin per Leo. Extend Storefront GraphQL → strict mapper → normalized model → fixtures/tests → PDP; do not mutate product prices.
- Do not expose credentials, print environment values, create test orders, submit a real newsletter address, activate payments, or mutate customer/order/address data.

## Implementation slices

### Slice A — shared shell and design-system contract

- Phosphor icon primitive/assets.
- Header utility spacing/icons and readable typography.
- Route-aware Header href/query behavior with regression tests.
- Country control presentation and truthful current US/USD state.
- Footer composition, social/payment/newsletter integration seams, and removal of live-mode placeholder copy.
- Square ProductCard swatches.
- Unified hard-shadow buttons and dark secondary token.
- Compact mini-cart popover for static and Shopify carts without weakening cart ownership.
- Theme-owned custom-route discoverability.

### Slice B — PDP and bounded editorial corrections

- `compareAtPrice` data contract and sale rendering.
- Strong visible sold-out option/ATC states.
- Image four+ full-width natural-aspect gallery continuation.
- Menu/option/control typography audit.
- Journal card alignment.
- Home Spotlight/Kit concise merchandising summaries and desktop viewport bound.
- Vertical Home system intro.

### Slice C — upstream and integration closeout

- Guarded `main-menu` update: first Shop child `Shop all` → `/shop`; preserve all other branches exactly.
- Live Storefront readback and exact navigation verifier.
- Verify actual social URLs, checkout payment methods, and newsletter provider before enabling them.

## Protected contracts

- Shopify mode remains fail-closed; no partial live/fixture mixing.
- Exact 9 products / 18 colorways / 78 ordered variants / 4 collections / 7 pages / 6 articles.
- Full PDP option URL state on the PDP itself, sold-out truthfulness, and exact merchandise identity.
- Cart key/line selected options, checkout handoff, persistence, quantity/remove, and account cache/security behavior.
- Header desktop/mobile focus, Escape, outside dismissal, inert, scroll lock, active state, and query ownership.
- Native gallery dialog/top layer, arrows, Escape, focus trap/restoration, and scroll lock.
- No direct fixture/raw Shopify imports in routes or visual components.
- Static explicit-empty-env build remains deterministic and honest.

## TDD and verification

Write failing focused tests before production changes. Minimum regression coverage:

- Header drops PDP selection params across route changes while retaining approved destination params.
- Shop mega-menu exact ordered children include `Shop all` first.
- Header icons/accessibility and minimum typography contract.
- Square swatches and unified button states.
- Footer omits live placeholder and hides unverified integrations.
- Mini-cart opens after add, renders exact selected options, dismisses safely, and does not create duplicate cart lines.
- Storefront compare-at mapping accepts valid money and rejects malformed/drifted values.
- PDP renders compare-at/sale and visibly unavailable variants.
- Gallery image four+ full-width/natural-aspect rules.
- Journal/Home correction source/runtime behavior.

Final gates:

```text
bun install --frozen-lockfile
bun run verify:shopify
bun run check
explicit-empty-env fallback build
bun run smoke:routes (live and fallback)
git diff --check
credential scan
independent exact-diff review
hosted non-production desktop + true-mobile browser QA
```

## Delivery boundary

Work in the primary checkout on `main`; no worktree. Do not commit, push, open a PR, deploy, or mutate Shopify until Hermes has reviewed the local diff and the relevant slice is verified. Production remains unchanged until Leo reviews a click-ready Preview.
