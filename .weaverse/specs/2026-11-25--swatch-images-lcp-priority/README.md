# Feature: Small swatch images and a high-priority hero LCP image

| Field            | Value                                                         |
| ---------------- | ------------------------------------------------------------- |
| **Status**       | in-review                                                     |
| **Owner**        | @hta218                                                       |
| **Issue**        | [#144](https://github.com/Weaverse/forward/issues/144) (part) |
| **Branch**       | `perf/swatch-images-lcp-priority`                             |
| **Created**      | 2026-11-25                                                    |
| **Last Updated** | 2026-11-25                                                    |

## Original Prompt

> Fix two performance issues from the 2026-11-25 baseline on #144. (1) Colorway swatches download full-size product images: request a small rendition from Shopify's CDN image transform, sized to about 2× the swatch's rendered size, keeping `?v=` and the image allowlist, and leaving the placeholder and native-swatch-colour paths unchanged. (2) The home LCP image, the first hero slideshow slide, has no `fetchpriority=high`: give the first slide high priority the way Next 16 expects, and keep the other slides loading one ahead.

## Summary

- `colorwaySwatchStyle()` paints an image swatch with `swatchImageUrl(src)`: the same Shopify CDN URL with `width=24&height=24&crop=center` added through `URL.searchParams`, so `?v=` stays. Every swatch dot is `size-3` (12px), so 24px covers 2× screens. A source outside `isShopifyProductImageUrl`, such as the placeholder, is returned unchanged; a native swatch colour still paints `backgroundColor`. On production home the 10 swatches go from 3,243,298 to 10,530 bytes (WebP).
- The first hero slide's image passes `preload` and `fetchPriority="high"` instead of `priority`. In Next 16.4 `priority` only aliases `preload` (eager loading plus a `ReactDOM.preload` link) and never sets `fetchPriority`; the preload link takes its `fetchPriority` from the image's own prop, so both the `<img>` and the preload link now carry `fetchpriority="high"`. Later slides keep `loading="lazy"` and mount one slide ahead.
