/** Shared catalog cache policy for Next-aware and process-local reuse. */

/** One-hour freshness window for shared, request-independent catalog reads. */
export const CATALOG_REVALIDATE_SECONDS = 3600;

/** Stable cache namespace; the non-secret store domain is added by the client. */
export const CATALOG_CACHE_KEY = "forward-shopify-catalog-v1";

/** Navigation/collection reads share the catalog freshness window. */
export const NAVIGATION_CACHE_KEY = "forward-shopify-navigation-v1";
