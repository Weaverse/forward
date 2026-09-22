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
  /** Products left after this link is applied. Rendering it is the view's call. */
  count: number;
}

export interface FilterGroup {
  heading: string;
  links: readonly FilterLink[];
}

/**
 * The category axis: declared order, display label, and the set of valid
 * values, in one place. Key order is the order shoppers see — outerwear, then
 * carry, then footwear — and `CATEGORIES` is what an unknown param is checked
 * against, so the three cannot drift apart.
 */
const CATEGORY_LABELS: Readonly<Record<ProductCategory, string>> = {
  shells: "Shells",
  packs: "Packs",
  footwear: "Footwear",
};

const CATEGORIES = Object.keys(CATEGORY_LABELS) as readonly ProductCategory[];

export const SORT_OPTIONS: ReadonlyArray<{
  value: ProductSort;
  label: string;
}> = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price low–high" },
  { value: "price-desc", label: "Price high–low" },
  { value: "name", label: "Name A–Z" },
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

function parseProductCategory(
  value: string | null | undefined,
): ProductCategory | undefined {
  return CATEGORIES.find((category) => category === value);
}

function parseProductSort(value: string | null | undefined): ProductSort {
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
function parseProductActivity(
  value: string | null | undefined,
  available: readonly string[],
): string | undefined {
  return typeof value === "string" && available.includes(value)
    ? value
    : undefined;
}

function productActivities(products: readonly Product[]): readonly string[] {
  return [...new Set(products.flatMap((product) => product.activities))];
}

/** Resolves validated filter and sort state from a page's query string. */
export function parseCatalogQuery(
  params: URLSearchParams,
  products: readonly Product[],
): { filter: ProductListFilter; sort: ProductSort } {
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
}

/** One narrowable axis, so both are built by the same code path. */
interface FacetDimension {
  param: "activity" | "category";
  heading: string;
  resetKey: string;
  resetLabel: string;
  values: readonly string[];
  label: (value: string) => string;
}

/**
 * Builds the facet groups for a page.
 *
 * A dimension with fewer than two distinct values is left out: a "Category"
 * group listing the one category every product in a collection shares is a row
 * of controls that cannot change the result.
 *
 * A count keeps the *other* axis and replaces its own, so it answers "how many
 * are left if I click this" rather than "how many exist".
 */
export function deriveFilterGroups({
  pathname,
  params,
  products,
  filter,
}: FilterGroupOptions): readonly FilterGroup[] {
  const present = new Set(products.map((product) => product.category));
  const dimensions: readonly FacetDimension[] = [
    {
      param: "activity",
      heading: "Activity",
      resetKey: "all-activities",
      resetLabel: "All activities",
      values: productActivities(products),
      label: (value) => value,
    },
    {
      param: "category",
      heading: "Category",
      resetKey: "all-categories",
      resetLabel: "All categories",
      values: CATEGORIES.filter((category) => present.has(category)),
      label: (value) => CATEGORY_LABELS[value as ProductCategory],
    },
  ];

  /* Page 1 again: a narrower result rarely still has the page you were on. */
  const link = (dimension: FacetDimension, value: string | undefined) => ({
    key: value ?? dimension.resetKey,
    label: value === undefined ? dimension.resetLabel : dimension.label(value),
    href: catalogHref(pathname, params, {
      [dimension.param]: value,
      page: undefined,
    }),
    selected: filter[dimension.param] === value,
    count: products.filter((product) =>
      matchesFilter(product, { ...filter, [dimension.param]: value }),
    ).length,
  });

  return dimensions
    .filter((dimension) => dimension.values.length > 1)
    .map((dimension) => ({
      heading: dimension.heading,
      links: [
        link(dimension, undefined),
        ...dimension.values.map((value) => link(dimension, value)),
      ],
    }));
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
