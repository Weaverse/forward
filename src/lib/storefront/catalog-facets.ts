/**
 * Catalog facet semantics: what the shopper can narrow by, and the URL that
 * says so.
 *
 * `/shop` and every `/shop/<collectionHandle>` narrow the same normalized
 * `Product` records by the same two dimensions, so they resolve query state
 * through this one module rather than each spelling its own params. A facet
 * link is an ordinary href, which is what keeps filtering working with no
 * JavaScript on either route.
 *
 * Facets are derived from the *unfiltered* set a page is about. Deriving them
 * from the filtered result would delete the options a shopper needs to widen
 * the view again as soon as they picked one.
 */

import { matchesFilter } from "./catalog-query";
import type {
  Product,
  ProductCategory,
  ProductListFilter,
  ProductSort,
} from "./types";

export interface FilterLink {
  key: string;
  label: string;
  href: string;
  selected: boolean;
  /** Matches after this link is applied; omitted when counts are off. */
  count?: number;
}

export interface FilterGroup {
  heading: string;
  links: readonly FilterLink[];
}

export const CATEGORY_LABELS: Readonly<Record<ProductCategory, string>> = {
  shells: "Shells",
  packs: "Packs",
  footwear: "Footwear",
};

export const SORT_OPTIONS: ReadonlyArray<{
  value: ProductSort;
  label: string;
}> = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price low–high" },
  { value: "price-desc", label: "Price high–low" },
  { value: "name", label: "Name A–Z" },
];

const CATEGORY_ORDER: readonly ProductCategory[] = [
  "shells",
  "packs",
  "footwear",
];

const DEFAULT_SORT: ProductSort = "featured";

/** Route `searchParams` as a params object, dropping repeated keys. */
export function toSearchParams(
  record: Readonly<Record<string, string | string[] | undefined>>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(record)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (typeof first === "string") {
      params.set(key, first);
    }
  }
  return params;
}

export function parseProductCategory(
  value: string | null | undefined,
): ProductCategory | undefined {
  return value === "shells" || value === "packs" || value === "footwear"
    ? value
    : undefined;
}

export function parseProductSort(
  value: string | null | undefined,
): ProductSort {
  return value === "price-asc" || value === "price-desc" || value === "name"
    ? value
    : DEFAULT_SORT;
}

/**
 * Parses an activity only when the page actually offers it.
 *
 * An unknown activity would otherwise filter every product away and leave the
 * shopper on an empty grid with no way to tell why.
 */
export function parseProductActivity(
  value: string | null | undefined,
  available: readonly string[],
): string | undefined {
  return typeof value === "string" && available.includes(value)
    ? value
    : undefined;
}

export function productActivities(
  products: readonly Product[],
): readonly string[] {
  return [...new Set(products.flatMap((product) => product.activities))];
}

export interface CatalogQuery {
  filter: ProductListFilter;
  sort: ProductSort;
}

/** Resolves validated filter and sort state from a page's query string. */
export function parseCatalogQuery(
  params: URLSearchParams,
  products: readonly Product[],
): CatalogQuery {
  return {
    filter: {
      category: parseProductCategory(params.get("category")),
      activity: parseProductActivity(
        params.get("activity"),
        productActivities(products),
      ),
    },
    sort: parseProductSort(params.get("sort")),
  };
}

/**
 * Rewrites the current query, keeping every param the page did not name.
 *
 * Unrelated params — campaign tags, the Studio design-mode query — belong to
 * whoever put them there and must survive a filter click.
 */
export function catalogHref(
  pathname: string,
  params: URLSearchParams,
  updates: Readonly<Record<string, string | undefined>>,
): string {
  const next = new URLSearchParams(params);
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  }
  const query = next.toString();
  return query.length > 0 ? `${pathname}?${query}` : pathname;
}

export interface FilterGroupOptions {
  pathname: string;
  params: URLSearchParams;
  /** The unfiltered set these facets describe. */
  products: readonly Product[];
  filter: ProductListFilter;
  showCounts?: boolean;
}

function countMatching(
  products: readonly Product[],
  filter: ProductListFilter,
): number {
  return products.filter((product) => matchesFilter(product, filter)).length;
}

/**
 * Builds the facet groups for a page.
 *
 * A dimension with fewer than two distinct values is left out: a "Category"
 * group listing the one category every product in a collection shares is a row
 * of controls that cannot change the result.
 */
export function deriveFilterGroups({
  pathname,
  params,
  products,
  filter,
  showCounts = false,
}: FilterGroupOptions): readonly FilterGroup[] {
  const activities = productActivities(products);
  /* Declared order, not alphabetical: the category axis reads
   * outerwear -> carry -> footwear, and that is the order shoppers see. */
  const present = new Set(products.map((product) => product.category));
  const categories = CATEGORY_ORDER.filter((category) => present.has(category));

  /* Page 1 again: a narrower result rarely still has the page you were on. */
  const href = (updates: Readonly<Record<string, string | undefined>>) =>
    catalogHref(pathname, params, { ...updates, page: undefined });
  const count = (next: ProductListFilter) =>
    showCounts ? countMatching(products, next) : undefined;

  const groups: FilterGroup[] = [];

  if (activities.length > 1) {
    groups.push({
      heading: "Activity",
      links: [
        {
          key: "all-activities",
          label: "All activities",
          href: href({ activity: undefined }),
          selected: filter.activity === undefined,
          count: count({ category: filter.category }),
        },
        ...activities.map((activity) => ({
          key: activity,
          label: activity,
          href: href({ activity }),
          selected: activity === filter.activity,
          count: count({ category: filter.category, activity }),
        })),
      ],
    });
  }

  if (categories.length > 1) {
    groups.push({
      heading: "Category",
      links: [
        {
          key: "all-categories",
          label: "All categories",
          href: href({ category: undefined }),
          selected: filter.category === undefined,
          count: count({ activity: filter.activity }),
        },
        ...categories.map((category) => ({
          key: category,
          label: CATEGORY_LABELS[category],
          href: href({ category }),
          selected: category === filter.category,
          count: count({ activity: filter.activity, category }),
        })),
      ],
    });
  }

  return groups;
}

/** Human summary of the active narrowing, for a results count line. */
export function describeFilter(filter: ProductListFilter): string {
  return [
    filter.category === undefined ? null : CATEGORY_LABELS[filter.category],
    filter.activity ?? null,
  ]
    .filter((entry): entry is string => entry !== null)
    .map((entry) => ` · ${entry}`)
    .join("");
}
