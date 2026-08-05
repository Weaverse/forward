/**
 * Pure helpers for colorway selection, gallery composition, and deep-link
 * URLs. Shared by PLP cards, the PDP, and unit tests so selection semantics
 * stay identical everywhere.
 */

import type { Product, ProductColorway, StorefrontImage } from "./types";

export const COLORWAY_PARAM = "colorway";

/**
 * Resolves the active colorway for a product. Unknown or absent ids fall back
 * to the first (canonical) colorway so stale deep links keep rendering a real
 * product state.
 */
export function resolveColorway(
  product: Product,
  colorwayId: string | undefined,
): ProductColorway {
  const fallback = product.colorways[0];
  if (fallback === undefined) {
    throw new Error(`product ${product.handle} has no colorways`);
  }
  if (colorwayId === undefined) {
    return fallback;
  }
  return product.colorways.find((entry) => entry.id === colorwayId) ?? fallback;
}

/** True when the id names a real colorway of the product. */
export function isKnownColorway(product: Product, colorwayId: string): boolean {
  return product.colorways.some((entry) => entry.id === colorwayId);
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
 * Canonical deep link for a product colorway. The first colorway is the
 * canonical unparameterized URL so repeated navigation to the default state
 * never changes the address.
 */
export function productColorwayHref(
  product: Product,
  colorwayId: string,
): string {
  const base = `/products/${product.handle}`;
  const first = product.colorways[0];
  if (first !== undefined && colorwayId === first.id) {
    return base;
  }
  return `${base}?${COLORWAY_PARAM}=${encodeURIComponent(colorwayId)}`;
}
