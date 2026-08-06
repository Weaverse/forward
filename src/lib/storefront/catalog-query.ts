/**
 * Normalized catalog query semantics: filtering, sorting, and search.
 *
 * Both the static fixture data source and the Shopify-backed data source run
 * these exact functions over already-normalized `Product` records, so live mode
 * cannot drift from the approved deterministic behavior:
 *
 * - empty/whitespace queries return no results;
 * - search is case-insensitive and every term must match;
 * - title, subtitle, description, category, activities, and colorway display
 *   names are searchable;
 * - the raw query is never interpolated into Shopify GraphQL search syntax.
 */

import type { Product, ProductListFilter, ProductSort } from "./types";

export function sortProducts(
  products: readonly Product[],
  sort: ProductSort,
): readonly Product[] {
  if (sort === "featured") {
    return products;
  }
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
  }
  return sorted;
}

export function matchesFilter(
  product: Product,
  filter: ProductListFilter,
): boolean {
  if (filter.category !== undefined && product.category !== filter.category) {
    return false;
  }
  if (
    filter.activity !== undefined &&
    !product.activities.includes(filter.activity)
  ) {
    return false;
  }
  return true;
}

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

/** Applies the normalized filter then the normalized sort, in that order. */
export function filterAndSortProducts(
  products: readonly Product[],
  filter: ProductListFilter,
  sort: ProductSort,
): readonly Product[] {
  return sortProducts(
    products.filter((product) => matchesFilter(product, filter)),
    sort,
  );
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
