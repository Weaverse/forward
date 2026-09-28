/**
 * The sort vocabulary, expressed as Shopify sort keys.
 *
 * Ordering is the store's job: each option here is a key the Storefront API
 * understands, so a sorted page is one the API returned in that order rather
 * than an array the theme re-sorted after the fact. `featured` is the
 * merchant's own order — the collection's manual order in a collection, and
 * relevance across the whole catalog, which is what Shopify defines it as.
 */

import type {
  ProductCollectionSortKeys,
  ProductSortKeys,
} from "@shopify/hydrogen/storefront-api-types";

import type { ProductSort } from "./types";

/** Each option's label and the key a collection and the whole catalog take. */
const SORTS: Record<
  ProductSort,
  {
    label: string;
    collection: ProductCollectionSortKeys;
    catalog: ProductSortKeys;
    reverse: boolean;
  }
> = {
  featured: {
    label: "Featured",
    collection: "COLLECTION_DEFAULT",
    catalog: "RELEVANCE",
    reverse: false,
  },
  "best-selling": {
    label: "Best selling",
    collection: "BEST_SELLING",
    catalog: "BEST_SELLING",
    reverse: false,
  },
  newest: {
    label: "Newest",
    collection: "CREATED",
    catalog: "CREATED_AT",
    reverse: true,
  },
  "price-asc": {
    label: "Price low–high",
    collection: "PRICE",
    catalog: "PRICE",
    reverse: false,
  },
  "price-desc": {
    label: "Price high–low",
    collection: "PRICE",
    catalog: "PRICE",
    reverse: true,
  },
  name: {
    label: "Name A–Z",
    collection: "TITLE",
    catalog: "TITLE",
    reverse: false,
  },
};

export const SORT_OPTIONS = Object.entries(SORTS).map(([value, { label }]) => ({
  value: value as ProductSort,
  label,
}));

export function parseProductSort(
  value: string | null | undefined,
): ProductSort {
  return typeof value === "string" && Object.hasOwn(SORTS, value)
    ? (value as ProductSort)
    : "featured";
}

/** The `ProductCollectionSortKeys` a collection read takes. */
export function collectionSortArguments(sort: ProductSort) {
  return { sortKey: SORTS[sort].collection, reverse: SORTS[sort].reverse };
}

/** The `ProductSortKeys` the whole-catalog read takes. */
export function catalogSortArguments(sort: ProductSort) {
  return { sortKey: SORTS[sort].catalog, reverse: SORTS[sort].reverse };
}
