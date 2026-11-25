/**
 * Pure helpers for product selection, gallery composition, and deep-link URLs.
 * Shared by PLP cards, PDP controls, cart integration, and unit tests so every
 * option resolves to one exact purchasable variant.
 */

import type { CSSProperties } from "react";

import { isShopifyProductImageUrl } from "./image-source";
import type {
  Money,
  Product,
  ProductColorway,
  ProductVariant,
  StorefrontImage,
} from "./types";

export const COLORWAY_PARAM = "colorway";
/** Shopify's name for the option Forward presents as colorways. */
const COLOR_OPTION_NAME = "Color";

export interface ProductSelection {
  colorway: ProductColorway;
  selectedOptions: Readonly<Record<string, string>>;
  variant: ProductVariant;
}

/** Stable URL key for a normalized non-Color product option. */
export function optionParamKey(optionName: string): string {
  return optionName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export interface RequestedSelection {
  colorwayId: string | undefined;
  options: Readonly<Record<string, string | undefined>>;
}

/**
 * The selection a product URL asks for. Forward writes `colorway` and one
 * kebab-case param per option; Shopify's `?variant=` redirect writes every
 * option under its own name (`?Color=Red&Size=M`), which is read whenever
 * Forward's own param is absent.
 */
export function requestedSelection(
  product: Product,
  params: URLSearchParams,
): RequestedSelection {
  const color = params.get(COLOR_OPTION_NAME);
  return {
    colorwayId:
      params.get(COLORWAY_PARAM) ??
      product.colorways.find((entry) => entry.name === color)?.id,
    options: Object.fromEntries(
      product.options.map((option) => [
        option.name,
        params.get(optionParamKey(option.name)) ??
          params.get(option.name) ??
          undefined,
      ]),
    ),
  };
}

/**
 * Resolves the active colorway. Unknown or absent ids fall back to the first
 * canonical colorway so stale links continue to render a real product state.
 */
export function resolveColorway(
  product: Product,
  colorwayId: string | undefined,
): ProductColorway {
  const fallback = product.colorways[0];
  if (fallback === undefined) {
    throw new Error(`product ${product.handle} has no colorways`);
  }
  if (colorwayId === undefined) return fallback;
  return product.colorways.find((entry) => entry.id === colorwayId) ?? fallback;
}

/** True when the id names a real colorway of the product. */
export function isKnownColorway(product: Product, colorwayId: string): boolean {
  return product.colorways.some((entry) => entry.id === colorwayId);
}

function variantOptionMap(
  variant: ProductVariant,
): Readonly<Record<string, string>> {
  return Object.fromEntries(
    variant.selectedOptions.map(({ name, value }) => [name, value]),
  );
}

/**
 * Resolves one complete selection. A complete requested variant is honored
 * even when sold out so deep links remain truthful and ATC can be disabled.
 * Missing or impossible state falls back to an available variant first.
 */
export function resolveProductSelection(
  product: Product,
  colorwayId: string | undefined,
  requestedOptions: Readonly<Record<string, string | undefined>> = {},
): ProductSelection {
  const colorway = resolveColorway(product, colorwayId);
  const variants = product.variants.filter(
    (variant) => variant.colorwayId === colorway.id,
  );
  const available = variants.filter((variant) => variant.availableForSale);
  const candidates = available.length > 0 ? available : variants;
  const fallback = candidates[0];
  if (fallback === undefined) {
    throw new Error(`product ${product.handle} has no variants for colorway`);
  }

  const matchesRequested = (variant: ProductVariant) => {
    const values = variantOptionMap(variant);
    return product.options.every((option) => {
      const requested = requestedOptions[option.name];
      return requested === undefined || values[option.name] === requested;
    });
  };
  const requestIsComplete = product.options.every(
    (option) => requestedOptions[option.name] !== undefined,
  );
  const exact = (requestIsComplete ? variants : candidates).find(
    matchesRequested,
  );
  const variant = exact ?? fallback;
  return {
    colorway,
    selectedOptions: variantOptionMap(variant),
    variant,
  };
}

/** Finds the exact variant represented by a complete option state. */
export function findExactVariant(
  product: Product,
  colorwayId: string,
  selectedOptions: Readonly<Record<string, string>>,
): ProductVariant | undefined {
  return product.variants.find((variant) => {
    if (variant.colorwayId !== colorwayId) return false;
    const values = variantOptionMap(variant);
    return product.options.every(
      (option) => values[option.name] === selectedOptions[option.name],
    );
  });
}

/**
 * The compare-at price to strike through, or `null` when there is no honest
 * sale to show. Merchants leave compare-at set to — or below — the price all
 * the time, and a foreign currency cannot be compared at all.
 */
export function saleCompareAtPrice(variant: ProductVariant): Money | null {
  const compareAt = variant.compareAtPrice;
  if (compareAt === null) return null;
  if (compareAt.currencyCode !== variant.price.currencyCode) return null;
  if (compareAt.amount <= variant.price.amount) return null;
  return compareAt;
}

/** True when no variant of the colorway can be purchased right now. */
export function colorwayIsSoldOut(
  product: Product,
  colorwayId: string,
): boolean {
  return !product.variants.some(
    (variant) => variant.colorwayId === colorwayId && variant.availableForSale,
  );
}

/**
 * The PDP gallery for a colorway, in display order, each image once. A product
 * with fewer than four images repeats them across the roles.
 */
export function galleryImages(
  colorway: ProductColorway,
): readonly StorefrontImage[] {
  const { primary, alternate, detail, context } = colorway.images;
  return [
    ...new Map(
      [primary, alternate, detail, context].map((image) => [image.src, image]),
    ).values(),
  ];
}

/**
 * Canonical product URL for one complete selection. Selection-owned params are
 * replaced while unrelated query state (for example attribution) is retained.
 */
export function productSelectionHref(
  product: Product,
  colorwayId: string,
  selectedOptions: Readonly<Record<string, string>> = {},
  currentParams?: URLSearchParams,
): string {
  const params = new URLSearchParams(currentParams?.toString());
  /* A product without Color has one implicit colorway: nothing to name. */
  if (product.hasColorOption) params.set(COLORWAY_PARAM, colorwayId);
  else params.delete(COLORWAY_PARAM);
  params.delete(COLOR_OPTION_NAME);
  for (const option of product.options) {
    params.delete(option.name);
    const key = optionParamKey(option.name);
    const value = selectedOptions[option.name];
    if (value === undefined) params.delete(key);
    else params.set(key, value);
  }
  const query = params.toString();
  return `/products/${product.handle}${query === "" ? "" : `?${query}`}`;
}

/** Backwards-compatible card helper; PDP state uses productSelectionHref. */
export function productColorwayHref(
  product: Product,
  colorwayId: string,
): string {
  const base = `/products/${product.handle}`;
  const first = product.colorways[0];
  if (first !== undefined && colorwayId === first.id) return base;
  return `${base}?${COLORWAY_PARAM}=${encodeURIComponent(colorwayId)}`;
}

/**
 * How a colorway swatch is painted.
 *
 * A store that set a native Shopify swatch gets that colour. Most stores set
 * none, so the colorway's own product image stands in — which is what the
 * shopper is choosing anyway, and needs nothing configured to look right.
 */
export function colorwaySwatchStyle(colorway: ProductColorway): CSSProperties {
  return colorway.swatchColor === null
    ? {
        backgroundImage: `url(${swatchImageUrl(colorway.images.primary.src)})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { backgroundColor: colorway.swatchColor };
}

/* Every swatch dot renders at 12px (`size-3`); twice that covers 2x screens. */
const SWATCH_IMAGE_SIZE = "24";

/**
 * A swatch-sized rendition of a colorway image, cropped square by Shopify's
 * CDN, instead of the full original. Its other query params (the `v` cache
 * key) are kept. A non-Shopify source, such as the placeholder, is unchanged.
 */
export function swatchImageUrl(src: string): string {
  if (!isShopifyProductImageUrl(src)) return src;
  const url = new URL(src);
  url.searchParams.set("width", SWATCH_IMAGE_SIZE);
  url.searchParams.set("height", SWATCH_IMAGE_SIZE);
  url.searchParams.set("crop", "center");
  return url.toString();
}
