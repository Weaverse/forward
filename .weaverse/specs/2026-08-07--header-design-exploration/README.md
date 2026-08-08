# Header design exploration

Status: accepted and canonicalized
Started: 2026-08-07
Decision: 2026-08-08

## Decision

Header 01 — Field Index Drawer is the canonical Forward site header.

The temporary comparison surface is retired:

- Option 02 — Navigation Rail: removed.
- Option 03 — Product System Preview: removed.
- `?header=1|2|3` selection and propagation: removed.
- Header data remains static until the Shopify Navigation adapter slice.

## Canonical contract

### Desktop

A light segmented header opens a shallow editorial Field Index. Three numbered collection systems occupy the left side and one owned editorial image/caption occupies the right. Focus or hover updates the image and field note.

### Mobile

The Field Index becomes a full-screen site-menu dialog with numbered collection and primary navigation. It provides:

- 44px minimum trigger/close targets;
- initial focus, forward/backward Tab containment, Escape close, focus restoration, and scroll lock;
- inert background content while open;
- direct canonical route destinations with no query rewriting.

### Accessibility and motion

- `aria-expanded` and `aria-controls` on menu triggers.
- `aria-current` on active routes.
- Desktop disclosure closes on Escape and outside click.
- Mobile sheet uses `role="dialog"` and `aria-modal="true"`.
- `prefers-reduced-motion` removes panel/image transitions.
- Header remains sticky through the `display: contents` client boundary.

## Data and branding

- `src/lib/header-navigation.ts` is the typed static presentation boundary for the three Field Index systems.
- Shopify Navigation wiring remains deferred; existing storefront navigation data still supplies top-level/utility links.
- Header uses the approved horizontal dark wordmark with moss slash.
- Footer and the dark mobile sheet use the exact reversed treatment from the approved Forward wordmark system.
- Approved source: `/Users/hta218/Documents/work/artifacts/forward-product-image-spike/logo-spike/`.

## Verification contract

- Focused unit/source contracts for static data, one-header-only cleanup, accessibility, and approved logo assets.
- Full repository `bun run check`, production audit, and route smoke.
- Desktop and true-mobile browser QA for disclosure/dialog interactions, query-bearing search/filter/sort/colorway routes, sticky behavior, images, overflow, console, and network errors.
- Independent review against the frozen candidate.
- Vercel Preview only; production remains untouched.
