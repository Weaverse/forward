/**
 * The sort vocabulary, expressed as Shopify sort keys.
 *
 * Ordering is the store's job: each option here is a key the Storefront API
 * understands, so a sorted page is one the API returned in that order rather
 * than an array the theme re-sorted after the fact. `featured` is the
 * merchant's own order — the collection's manual order in a collection, and
 * relevance across the whole catalog, which is what Shopify defines it as.
 */

import type { ProductSort } from "./types";

export const SORT_OPTIONS: ReadonlyArray<{
  value: ProductSort;
  label: string;
}> = [
  { value: "featured", label: "Featured" },
  { value: "best-selling", label: "Best selling" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price low–high" },
  { value: "price-desc", label: "Price high–low" },
  { value: "name", label: "Name A–Z" },
];

const SORT_VALUES = new Set(SORT_OPTIONS.map((option) => option.value));

export function parseProductSort(
  value: string | null | undefined,
): ProductSort {
  return typeof value === "string" && SORT_VALUES.has(value as ProductSort)
    ? (value as ProductSort)
    : "featured";
}

/** `ProductCollectionSortKeys`, as the Storefront schema defines them. */
export type CollectionSortKey =
  | "TITLE"
  | "PRICE"
  | "BEST_SELLING"
  | "CREATED"
  | "ID"
  | "MANUAL"
  | "COLLECTION_DEFAULT"
  | "RELEVANCE";

/** `ProductSortKeys`, as the Storefront schema defines them. */
export type CatalogSortKey =
  | "TITLE"
  | "PRODUCT_TYPE"
  | "VENDOR"
  | "UPDATED_AT"
  | "CREATED_AT"
  | "BEST_SELLING"
  | "PRICE"
  | "ID"
  | "RELEVANCE";

/** `ProductCollectionSortKeys` — the keys a collection accepts. */
export function collectionSortArguments(sort: ProductSort): {
  sortKey: CollectionSortKey;
  reverse: boolean;
} {
  switch (sort) {
    case "price-asc":
      return { sortKey: "PRICE", reverse: false };
    case "price-desc":
      return { sortKey: "PRICE", reverse: true };
    case "name":
      return { sortKey: "TITLE", reverse: false };
    case "best-selling":
      return { sortKey: "BEST_SELLING", reverse: false };
    case "newest":
      return { sortKey: "CREATED", reverse: true };
    default:
      return { sortKey: "COLLECTION_DEFAULT", reverse: false };
  }
}

/** `ProductSortKeys` — the keys the whole-catalog read accepts. */
export function catalogSortArguments(sort: ProductSort): {
  sortKey: CatalogSortKey;
  reverse: boolean;
} {
  switch (sort) {
    case "price-asc":
      return { sortKey: "PRICE", reverse: false };
    case "price-desc":
      return { sortKey: "PRICE", reverse: true };
    case "name":
      return { sortKey: "TITLE", reverse: false };
    case "best-selling":
      return { sortKey: "BEST_SELLING", reverse: false };
    case "newest":
      return { sortKey: "CREATED_AT", reverse: true };
    default:
      return { sortKey: "RELEVANCE", reverse: false };
  }
}
