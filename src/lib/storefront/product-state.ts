/**
 * Pure helpers for product selection, gallery composition, and deep-link URLs.
 * Shared by PLP cards, PDP controls, cart integration, and unit tests so every
 * option resolves to one exact purchasable variant.
 */

import type {
  Product,
  ProductColorway,
  ProductVariant,
  StorefrontImage,
} from "./types";

export const COLORWAY_PARAM = "colorway";

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

/** The complete four-image PDP gallery for a colorway, in display order. */
export function galleryImages(
  colorway: ProductColorway,
): readonly StorefrontImage[] {
  return [
    colorway.images.primary,
    colorway.images.alternate,
    colorway.images.detail,
    colorway.images.context,
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
  params.set(COLORWAY_PARAM, colorwayId);
  for (const option of product.options) {
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
