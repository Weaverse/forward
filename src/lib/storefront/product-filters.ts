/**
 * Shopify product filters applied to normalized records.
 *
 * In Shopify mode the store does this work and this module is not involved:
 * the filters travel to the API and it returns the narrowed page. Without
 * credentials there is no API, so the deterministic catalog answers the same
 * questions locally — the same facet ids, the same `input` JSON, the same
 * counts — and a route cannot tell the two apart.
 *
 * Only the two facets every Shopify store exposes by default are synthesized.
 * Anything a merchant enables in Search & Discovery exists solely in the live
 * response, which is the point: the theme declares no facet of its own.
 */

import type { Product, StorefrontFilter, StorefrontFilterValue } from "./types";

export const AVAILABILITY_FILTER_ID = "filter.v.availability";
export const PRICE_FILTER_ID = "filter.v.price";

interface AvailabilityFilterInput {
  available?: boolean;
}

interface PriceFilterInput {
  price?: { min?: number; max?: number };
}

function isAvailable(product: Product): boolean {
  return product.variants.some((variant) => variant.availableForSale);
}

function matchesOne(product: Product, filter: unknown): boolean {
  if (typeof filter !== "object" || filter === null) {
    return true;
  }
  const { available } = filter as AvailabilityFilterInput;
  if (typeof available === "boolean" && isAvailable(product) !== available) {
    return false;
  }
  const { price } = filter as PriceFilterInput;
  if (price !== undefined) {
    const amount = product.price.amount;
    if (typeof price.min === "number" && amount < price.min) {
      return false;
    }
    if (typeof price.max === "number" && amount > price.max) {
      return false;
    }
  }
  return true;
}

/** Every filter must match, as Shopify's own `filters` argument behaves. */
export function applyProductFilters(
  products: readonly Product[],
  filters: readonly unknown[],
): readonly Product[] {
  if (filters.length === 0) {
    return products;
  }
  return products.filter((product) =>
    filters.every((filter) => matchesOne(product, filter)),
  );
}

function availabilityValue(
  products: readonly Product[],
  available: boolean,
): StorefrontFilterValue {
  return {
    id: `${AVAILABILITY_FILTER_ID}.${available ? 1 : 0}`,
    label: available ? "In stock" : "Out of stock",
    count: products.filter((product) => isAvailable(product) === available)
      .length,
    input: JSON.stringify({ available }),
  };
}

/**
 * The default facets, described over the collection before the shopper
 * narrowed it — so the options never vanish once one is chosen.
 */
export function synthesizeProductFilters(
  products: readonly Product[],
): readonly StorefrontFilter[] {
  if (products.length === 0) {
    return [];
  }
  const amounts = products.map((product) => product.price.amount);
  return [
    {
      id: AVAILABILITY_FILTER_ID,
      label: "Availability",
      type: "LIST",
      values: [
        availabilityValue(products, true),
        availabilityValue(products, false),
      ],
    },
    {
      id: PRICE_FILTER_ID,
      label: "Price",
      type: "PRICE_RANGE",
      values: [
        {
          id: `${PRICE_FILTER_ID}.0`,
          label: "Price",
          count: products.length,
          input: JSON.stringify({
            price: {
              min: Math.min(...amounts),
              max: Math.max(...amounts),
            },
          }),
        },
      ],
    },
  ];
}
