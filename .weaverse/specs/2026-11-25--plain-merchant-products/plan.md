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

## Follow-up: any store's catalog

- **Images:** `isShopifyProductImageUrl` and the Next `remotePatterns` accept
  `https://cdn.shopify.com/s/files/**` from any shop, still with no port, no
  credentials and no traversal segments. No other host is allowed. The
  `<shop>/cdn/shop/...` form is not accepted: the Storefront API returns
  `cdn.shopify.com` URLs.
- **No ownership tag:** the catalog and `/shop` queries send no search filter,
  and related products search `product_type:"<type>"` only (skipped for an
  untyped product). `mapProduct` and `mapProductResult` no longer require the
  tag, so an untagged product in a collection or by handle maps too. The old
  `forward` tag stays hidden from `activities`, like `namespace:value` tags,
  so the demo store's products don't show it as a badge.
- **No images:** every role takes `PRODUCT_PLACEHOLDER_IMAGE`
  (`public/images/placeholder/product.svg`, 4:5) with the product title as
  alt. JSON-LD lists only real images and omits `image` when there are none;
  the PDP OpenGraph image skips the placeholder. Cart and mini-cart lines
  with no merchandise image show the placeholder too.
- Accepted ceiling: the sitemap and search still read the whole catalog in
  sequence.

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

Follow-up:

- `src/lib/storefront/image-source.ts`, `next.config.ts`,
  `public/images/placeholder/product.svg`
- `src/lib/storefront/shopify/queries.ts`, `client.ts`, `mapper.ts`
- `src/lib/seo/structured-data.ts`,
  `src/app/[locale]/products/[productHandle]/page.tsx`
- `src/components/site-header/mini-cart.tsx`,
  `src/app/[locale]/cart/shopify-cart-view.tsx`
- `scripts/verify-shopify.mts`, `.guides/cookbooks/customer-account-local-mock.md`
- `tests/fixtures/shopify-catalog-response.ts` (`imagelessProductNode`),
  `tests/shopify-catalog-adapter.test.ts`, `tests/structured-data.test.ts`
