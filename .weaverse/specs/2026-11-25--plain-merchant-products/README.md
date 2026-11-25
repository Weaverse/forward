# Feature: Plain merchant products

| Field            | Value                                                  |
| ---------------- | ------------------------------------------------------ |
| **Status**       | in-review                                              |
| **Owner**        | @hta218                                                |
| **Issue**        | [#142](https://github.com/Weaverse/forward/issues/142) |
| **Branch**       | `fix/142-plain-products`, `fix/forward-142-any-store-catalog` |
| **Created**      | 2026-11-25                                             |
| **Last Updated** | 2026-11-25                                             |

## Original Prompt

> #142 remaining part: the product mapper still requires an exact `Color`
> option, the `forward.*` editorial metafields, a full `colorway_media_map` and
> image alt text. A plain merchant product (`Title / Default Title`, or
> Size-only, no metafields, images without alt) must map and render on the PDP,
> product cards, `/shop`, search, cart and JSON-LD.
>
> Follow-up (same issue): accept product images from any store's Shopify CDN,
> drop the `forward` tag filter from the catalog, and show a placeholder for a
> product with no images instead of failing the page.

## Summary

The editorial metafields are optional, a product without a Color option has
one implicit colorway that no surface renders as a choice, Shopify's
`Title / Default Title` option is dropped, media without a colorway map comes
from the product's own images, and an image without alt text takes the product
title. Variant ids, prices and currencies keep their strict validation.

The follow-up lists every product the Storefront API returns (no ownership
tag), accepts any shop's `cdn.shopify.com/s/files/` images, and maps a product
with no images onto a local placeholder, which structured data and OpenGraph
leave out.
