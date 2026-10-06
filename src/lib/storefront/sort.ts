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
import type { TranslationKey } from "@/lib/i18n/static-content";
import type { ProductSort } from "./types";

/** Each option's label and the key a collection and the whole catalog take. */
const SORTS: Record<
  ProductSort,
  {
    labelKey: TranslationKey;
    collection: ProductCollectionSortKeys;
    catalog: ProductSortKeys;
    reverse: boolean;
  }
> = {
  featured: {
    labelKey: "catalog.sortOptions.featured",
    collection: "COLLECTION_DEFAULT",
    catalog: "RELEVANCE",
    reverse: false,
  },
  "best-selling": {
    labelKey: "catalog.sortOptions.bestSelling",
    collection: "BEST_SELLING",
    catalog: "BEST_SELLING",
    reverse: false,
  },
  newest: {
    labelKey: "catalog.sortOptions.newest",
    collection: "CREATED",
    catalog: "CREATED_AT",
    reverse: true,
  },
  "price-asc": {
    labelKey: "catalog.sortOptions.priceAsc",
    collection: "PRICE",
    catalog: "PRICE",
    reverse: false,
  },
  "price-desc": {
    labelKey: "catalog.sortOptions.priceDesc",
    collection: "PRICE",
    catalog: "PRICE",
    reverse: true,
  },
  name: {
    labelKey: "catalog.sortOptions.name",
    collection: "TITLE",
    catalog: "TITLE",
    reverse: false,
  },
};

export const SORT_OPTIONS = Object.entries(SORTS).map(
  ([value, { labelKey }]) => ({ value: value as ProductSort, labelKey }),
);

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
