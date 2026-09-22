/**
 * The browse URL: which facet values are applied, in what order, on which page.
 *
 * A facet value's `input` is Shopify's own `ProductFilter` JSON. It travels
 * into the URL under the facet's id and back into the query untouched, so the
 * theme supports a facet it has never heard of — the shape is the store's
 * business, not the theme's.
 *
 * Everything here is a plain href, which is what keeps browsing working with
 * no JavaScript.
 */

import type { StorefrontFilter, StorefrontFilterValue } from "./types";

/** Facet params are namespaced so nothing else on the URL is mistaken for one. */
export const FILTER_PARAM_PREFIX = "filter.";
export const SORT_PARAM = "sort";
export const AFTER_PARAM = "after";
export const BEFORE_PARAM = "before";

/**
 * A price range cannot be a link — the shopper types it — so it travels as two
 * plain numbers rather than as a facet's JSON. Every other facet type round
 * trips its own `input` untouched.
 */
export const PRICE_MIN_PARAM = "price-min";
export const PRICE_MAX_PARAM = "price-max";

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

/**
 * The `ProductFilter` objects the URL is asking for.
 *
 * A param that is not valid JSON is dropped rather than failing the page: the
 * URL is shopper-editable, and a mangled one should widen the view, not break
 * it.
 */
export function parseFilterParams(params: URLSearchParams): readonly unknown[] {
  const filters: unknown[] = [];
  for (const [key, value] of params.entries()) {
    if (!key.startsWith(FILTER_PARAM_PREFIX)) {
      continue;
    }
    try {
      const parsed: unknown = JSON.parse(value);
      if (typeof parsed === "object" && parsed !== null) {
        filters.push(parsed);
      }
    } catch {
      /* Not a filter this page can honour; ignore it. */
    }
  }
  const price = parsePriceRange(params);
  if (price !== null) {
    filters.push({ price });
  }
  return filters;
}

function readNumber(params: URLSearchParams, key: string): number | undefined {
  const raw = params.get(key);
  if (raw === null || raw.trim() === "") {
    return undefined;
  }
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

/** The typed range, or `null` when the shopper set neither bound. */
export function parsePriceRange(
  params: URLSearchParams,
): { min?: number; max?: number } | null {
  const min = readNumber(params, PRICE_MIN_PARAM);
  const max = readNumber(params, PRICE_MAX_PARAM);
  if (min === undefined && max === undefined) {
    return null;
  }
  /* A reversed range is a typo, not an empty shelf. */
  if (min !== undefined && max !== undefined && min > max) {
    return { min: max, max: min };
  }
  return {
    ...(min === undefined ? {} : { min }),
    ...(max === undefined ? {} : { max }),
  };
}

/** Rewrites the query, keeping every param the caller did not name. */
export function browseHref(
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

/**
 * The param a facet occupies.
 *
 * Shopify's own facet ids already begin with `filter.` — `filter.v.availability`
 * — so the id is the param, and the prefix is what tells a facet param apart
 * from everything else on the URL. A store that ever returned an unprefixed id
 * still gets a namespaced param.
 */
function paramFor(filter: StorefrontFilter): string {
  return filter.id.startsWith(FILTER_PARAM_PREFIX)
    ? filter.id
    : `${FILTER_PARAM_PREFIX}${filter.id}`;
}

export function isValueApplied(
  params: URLSearchParams,
  filter: StorefrontFilter,
  value: StorefrontFilterValue,
): boolean {
  return params.get(paramFor(filter)) === value.input;
}

/**
 * Toggling a value on or off.
 *
 * Narrowing returns to the first page: a cursor into the old result rarely
 * points anywhere in the new one.
 */
export function toggleValueHref(
  pathname: string,
  params: URLSearchParams,
  filter: StorefrontFilter,
  value: StorefrontFilterValue,
): string {
  return browseHref(pathname, params, {
    [paramFor(filter)]: isValueApplied(params, filter, value)
      ? undefined
      : value.input,
    [AFTER_PARAM]: undefined,
    [BEFORE_PARAM]: undefined,
  });
}

/** Drops every facet param, keeping sort and anything unrelated. */
export function clearFiltersHref(
  pathname: string,
  params: URLSearchParams,
): string {
  const next = new URLSearchParams(params);
  for (const key of [...next.keys()]) {
    if (key.startsWith(FILTER_PARAM_PREFIX)) {
      next.delete(key);
    }
  }
  next.delete(PRICE_MIN_PARAM);
  next.delete(PRICE_MAX_PARAM);
  next.delete(AFTER_PARAM);
  next.delete(BEFORE_PARAM);
  const query = next.toString();
  return query.length > 0 ? `${pathname}?${query}` : pathname;
}

export function hasAppliedFilters(params: URLSearchParams): boolean {
  return [...params.keys()].some(
    (key) =>
      key.startsWith(FILTER_PARAM_PREFIX) ||
      key === PRICE_MIN_PARAM ||
      key === PRICE_MAX_PARAM,
  );
}

export function pageHref(
  pathname: string,
  params: URLSearchParams,
  cursor: string,
  direction: "next" | "previous",
): string {
  return browseHref(pathname, params, {
    [AFTER_PARAM]: direction === "next" ? cursor : undefined,
    [BEFORE_PARAM]: direction === "previous" ? cursor : undefined,
  });
}
