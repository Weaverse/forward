/**
 * Normalized catalog search.
 *
 * Search runs over already-normalized `Product` records:
 *
 * - empty/whitespace queries return no results;
 * - search is case-insensitive and every term must match;
 * - title, subtitle, description, category, activities, and colorway display
 *   names are searchable;
 * - the raw query is never interpolated into Shopify GraphQL search syntax.
 */

import type { Product } from "./types";

function searchableText(product: Product): string {
  return [
    product.title,
    product.subtitle,
    product.description,
    product.category,
    ...product.activities,
    ...product.colorways.map((entry) => entry.name),
  ]
    .join(" ")
    .toLowerCase();
}

/** Deterministic local product search over normalized records. */
export function searchNormalizedProducts(
  products: readonly Product[],
  query: string,
): readonly Product[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) {
    return [];
  }
  return products.filter((product) => {
    const haystack = searchableText(product);
    return terms.every((term) => haystack.includes(term));
  });
}
