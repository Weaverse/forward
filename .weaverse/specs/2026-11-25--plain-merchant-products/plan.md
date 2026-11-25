# Plan

## Contract changes

- `Product.hasColorOption` is new. Without a Color option the product has one
  colorway, id `default` and an empty name; every variant carries that id.
  Surfaces that render colour choices (card swatches, PDP variant selector,
  spotlight) skip them, `productSelectionHref` drops `?colorway=`, and the
  Hydrogen product input reports no Color option.
- An option `Title` whose only value is `Default Title` is Shopify's
  single-variant marker. It is dropped from `options` and from each variant's
  `selectedOptions`, so the PDP shows no picker. Cart lines hide the
  `Default Title` value (`cartLineOptions`).
- Variant `selectedOptions` must match the product's option order, whatever it
  is; Color no longer has to come first.
- `forward.highlights`, `materials`, `field_specs`, `care` and
  `colorway_media_map` may be unset. A set one is validated as before
  (type, JSON, non-empty). Unset means an empty subtitle, no material
  paragraphs, no specs and no care rows. PDP metadata falls back to the
  description when there is no subtitle.
- With a media map, nothing changes: it must cover every colour and claim
  every image. Without one, each colorway's four roles come from its first
  variant image (newly queried), then the product's images in Shopify order,
  repeating when there are fewer than four. `galleryImages` shows each image
  once. A product with no images at all still fails.
- Image alt falls back to the media alt, then the product title.
- `productType`, `description` and `descriptionHtml` may be empty strings.

## Out of scope

- The `forward` ownership tag still scopes the catalog.
- Product images must come from the owned CDN tenant
  (`SHOPIFY_IMAGE_PATH_PREFIX`), which ties the theme to one store.
- A product with no images still fails the read.

## Files touched

- `src/lib/storefront/shopify/mapper.ts`, `queries.ts`
- `src/lib/storefront/types.ts`, `product-state.ts`
- `src/lib/cart/shopify-cart-react.tsx`, `src/components/product-card.tsx`,
  `src/components/site-header/mini-cart.tsx`,
  `src/app/[locale]/cart/shopify-cart-view.tsx`,
  `src/app/[locale]/products/[productHandle]/page.tsx`
- `src/sections/main-product/variant-selector/index.tsx`,
  `src/sections/product-spotlight/index.tsx`
- `tests/fixtures/shopify-catalog-response.ts` (`plainProductNode`),
  `tests/fixtures/storefront/products.ts`,
  `tests/shopify-catalog-adapter.test.ts`
