# Plan

1. `src/lib/storefront/product-state.ts`: `swatchImageUrl(src)` adds `width`, `height` (24) and `crop=center` to a Shopify CDN URL; `colorwaySwatchStyle()` uses it for the image swatch.
2. `src/sections/hero-slideshow/slide/index.tsx`: slide 0 passes `{ preload: true, fetchPriority: "high" }`; other slides keep `{ loading: "lazy" }`.
3. Tests: `tests/product-state.test.ts` covers the swatch URL (params added, `v` kept, placeholder unchanged). `tests/dom/hero-slideshow.test.tsx` checks only the first slide image is preloaded, eager and `fetchpriority="high"`; the `next/image` mock in `tests/dom/preload.ts` learns `preload`.

## Files

- `src/lib/storefront/product-state.ts`
- `src/sections/hero-slideshow/slide/index.tsx`
- `tests/product-state.test.ts`
- `tests/dom/hero-slideshow.test.tsx`
- `tests/dom/preload.ts`
- `.weaverse/specs/2026-11-25--swatch-images-lcp-priority/`

## Out of scope

- Other `priority` images (PDP gallery, page heroes) have the same missing `fetchpriority`; they are left for a follow-up.
- Oversized `next/image` renditions and the sections that pass `unoptimized` (other #144 findings).
