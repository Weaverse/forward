/**
 * The local stand-in for Shopify's sort keys.
 *
 * Only the deterministic catalog uses this: in Shopify mode ordering is a
 * sort key on the query and the API returns the page already ordered. The
 * orders that depend on store state a fixture cannot know — best selling,
 * newest — fall back to the catalog's own order rather than inventing one.
 */

import type { Product, ProductSort } from "./types";

export function sortProductsLocally(
  products: readonly Product[],
  sort: ProductSort,
): readonly Product[] {
  const sorted = [...products];
  switch (sort) {
    case "price-asc":
      sorted.sort((a, b) => a.price.amount - b.price.amount);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price.amount - a.price.amount);
      break;
    case "name":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      return products;
  }
  return sorted;
}
