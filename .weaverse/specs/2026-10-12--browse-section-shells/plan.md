# Plan: Browse shells on the shared Section

## Cause

- `AllProducts` rendered `<div className={browseShell({ spacing })}>`: full width, bottom padding, no `max-w-page` or `px-page-gutter`. The toolbar and grid size themselves, but `heading` and `paragraph`, direct children since `816eb3c` dropped `AllProductsHeader`, did not, so they sat on the left edge with no top/bottom rhythm.
- `MainCollection` had the same bare shell. Its children size themselves, so nothing showed, but neither shell let a merchant change width or padding.

## Change

- `src/components/section/inputs.ts`: `layoutInputsWith(defaults)` returns `layoutInputs` with section-specific defaults, so Studio shows what the section renders with.
- `all-products` and `main-collection` render through `Section`, defaulting to `width: "full"` and `verticalPadding: "none"`, so the current look is unchanged and the toolbar stays full-bleed. Their schemas gain the layout inputs; "Space below" (`spacing`) stays.
- New `ap--header` (`src/sections/all-products/header/`): `Section` with `width: "fixed"` and `verticalPadding: "compact"`, child types `heading` and `paragraph`. Registered in `src/lib/weaverse/components.ts` and `src/lib/weaverse/section-schemas.ts`.
- `all-products` child types become `ap--header`, `ap--toolbar`, `ap--product-grid`; the preset nests the heading and lede in `ap--header`.
- `AGENTS.md`: the `all-products` tree lists `ap--header`.
- `collection-hero`: the CTA owns its top gap (`mt-8`) and the description drops `mb-8`. The only gap before the CTA was the description's bottom margin, so a collection with no description put the button against the title (over its descenders, given the 0.98 line height). Spacing with a description is unchanged.
- Sort select (`src/components/sort-form.tsx`): still the native `<select>` in the GET form with Apply, so it works with no JavaScript. Where the browser supports `appearance: base-select` (Chromium 135+), Tailwind classes style the trigger, the dropdown (`::picker(select)`) and the options to the theme; other browsers ignore them and keep the platform select. `globals.css` gains one `@custom-variant picker` so the dropdown rules read `picker:*`. No new dependency (Radix was considered and set aside).

The layout convention (browse shells on the shared section, a header child for the heading) follows how Pilot organizes its browse sections; the implementation is Forward's own.

## Studio data

The project's existing ALL_PRODUCTS template still has `heading` and `paragraph` directly under `all-products`. Until they are moved into an `ap--header` in Studio, they keep rendering flush left.

## Verification

- Typecheck and Biome on touched files during development; full gates before push.
- Manual: `/shop` heading and lede align with the toolbar's content edge; the toolbar stays full-bleed; collection pages look unchanged, and a collection with no description keeps a gap between title and CTA.

## Files touched

| File | Change |
| --- | --- |
| `src/components/section/inputs.ts` | `layoutInputsWith` |
| `src/sections/all-products/{index.tsx,schema.ts}` | Shell on `Section`, `ap--header` child |
| `src/sections/all-products/header/{index.tsx,schema.ts}` | New `ap--header` |
| `src/sections/main-collection/{index.tsx,schema.ts}` | Shell on `Section` |
| `src/lib/weaverse/{components.ts,section-schemas.ts}` | Register `ap--header` |
| `src/sections/collection-hero/index.tsx` | CTA gap no longer depends on the description |
| `src/components/sort-form.tsx`, `src/app/globals.css` | Customizable sort select, `picker` variant |
| `AGENTS.md` | `all-products` tree |
| `.weaverse/specs/2026-10-12--browse-section-shells/` | This spec |
