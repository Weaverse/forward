/**
 * Hydrogen Storefront client wiring for the server-owned catalog adapter.
 *
 * The catalog is identical for every visitor, so this uses a request-independent
 * `private_no_buyer_context` client with a static request context. Catalog
 * routes therefore never call `headers()`/`cookies()` and stay statically
 * renderable with `generateStaticParams()` and `dynamicParams = false`.
 *
 * The data source consumes a plain `CatalogQueryExecutor` function so unit
 * tests can inject mocked GraphQL response objects instead of reaching into
 * Hydrogen client internals.
 */

import {
  createShopifyRequestContext,
  createStorefrontClient,
} from "@shopify/hydrogen";
import type { ProductFilter } from "@shopify/hydrogen/storefront-api-types";
import { unstable_cache } from "next/cache";
import type { CatalogSortKey, CollectionSortKey } from "../sort";
import {
  ALL_PRODUCTS_CACHE_KEY,
  CATALOG_CACHE_KEY,
  CATALOG_REVALIDATE_SECONDS,
  COLLECTION_CACHE_KEY,
  NAVIGATION_CACHE_KEY,
} from "./cache-policy";
import {
  ALL_PRODUCTS_QUERY,
  COLLECTION_PRODUCTS_QUERY,
} from "./collection-query";
import type { ShopifyCatalogConfig } from "./env";
import { ShopifyCatalogError, safeErrorLabel } from "./errors";
import {
  mapAllProductsResult,
  mapCatalogResult,
  mapCollectionProductsResult,
} from "./mapper";
import {
  FOOTER_MENU_HANDLE,
  NAVIGATION_COLLECTION_LIMIT,
  NAVIGATION_COLLECTION_PRODUCT_LIMIT,
  NAVIGATION_QUERY,
} from "./navigation-query";
import {
  CATALOG_MEDIA_LIMIT,
  CATALOG_PRODUCT_FILTER,
  CATALOG_PRODUCT_LIMIT,
  CATALOG_QUERY,
  CATALOG_VARIANT_LIMIT,
} from "./queries";

/**
 * The shape the mapper validates: `data` is deliberately `unknown` because the
 * adapter re-validates every field it depends on at runtime.
 */
export interface CatalogQueryResult {
  data?: unknown;
  errors?: unknown;
}

export type CatalogQueryExecutor = () => Promise<CatalogQueryResult>;

/** What a route asked Shopify for: facets, order, and a cursor. */
export interface CollectionQueryVariables {
  handle: string;
  /** Shopify's own `ProductFilter` objects, round-tripped through the URL. */
  filters: readonly unknown[];
  sortKey: CollectionSortKey;
  reverse: boolean;
  first?: number;
  last?: number;
  startCursor?: string;
  endCursor?: string;
}

export type CollectionQueryExecutor = (
  variables: CollectionQueryVariables,
) => Promise<CatalogQueryResult>;

export type AllProductsQueryExecutor = (
  variables: Omit<
    CollectionQueryVariables,
    "handle" | "sortKey" | "filters"
  > & {
    sortKey: CatalogSortKey;
  },
) => Promise<CatalogQueryResult>;

export interface NavigationQueryResult {
  data?: unknown;
  errors?: unknown;
}

export type NavigationQueryExecutor = () => Promise<NavigationQueryResult>;

/**
 * Carries a partial navigation response through `unstable_cache` as a rejected
 * execution, so transient GraphQL errors are never persisted. The public
 * executor recovers the envelope immediately for independently scoped field
 * mapping; the error message never contains raw Storefront data.
 */
class ShopifyNavigationPartialError extends ShopifyCatalogError {
  readonly result: NavigationQueryResult;

  constructor(result: NavigationQueryResult) {
    super("Storefront API navigation response contained partial errors.");
    this.name = "ShopifyNavigationPartialError";
    this.result = result;
  }
}

async function recoverPartialNavigationResult(
  execute: () => Promise<NavigationQueryResult>,
): Promise<NavigationQueryResult> {
  try {
    return await execute();
  } catch (error) {
    if (error instanceof ShopifyNavigationPartialError) {
      return error.result;
    }
    throw error;
  }
}

export interface CatalogQueryExecutorOptions {
  /** Disable only the Next Data Cache wrapper for isolated transport tests. */
  useNextCache?: boolean;
}

/**
 * The single market this storefront serves. Locale/market routing is a
 * separate deferred slice; until then every surface uses this one, so it is
 * exported rather than redeclared per consumer.
 */
export const CATALOG_I18N = { country: "US", language: "EN" } as const;

function readGraphQLErrors(
  errors: unknown,
  operation: "catalog" | "navigation",
): readonly unknown[] {
  if (errors === undefined) {
    return [];
  }
  if (!Array.isArray(errors)) {
    throw new ShopifyCatalogError(
      `Storefront API ${operation} response contained a malformed errors container.`,
    );
  }
  return errors;
}

function createStorefrontReadClient(config: ShopifyCatalogConfig) {
  const requestContext = createShopifyRequestContext({
    request: { headers: new Headers() },
    i18n: CATALOG_I18N,
  });

  return createStorefrontClient({
    type: "private_no_buyer_context",
    requestContext,
    config: {
      storeDomain: config.storeDomain,
      privateStorefrontToken: config.privateStorefrontToken,
    },
  });
}

/**
 * Builds the bounded catalog query executor.
 *
 * Transport exceptions are re-thrown as sanitized adapter errors carrying only
 * the originating error class name — never a URL, header, query text, or token.
 * Returned GraphQL `errors` are passed through untouched for the mapper to
 * reject, so partial data can never be mistaken for a successful read.
 */
export function createCatalogQueryExecutor(
  config: ShopifyCatalogConfig,
  options: CatalogQueryExecutorOptions = {},
): CatalogQueryExecutor {
  const client = createStorefrontReadClient(config);

  const execute = async () => {
    try {
      const { data, errors } = await client.graphql(CATALOG_QUERY, {
        variables: {
          first: CATALOG_PRODUCT_LIMIT,
          variantFirst: CATALOG_VARIANT_LIMIT,
          mediaFirst: CATALOG_MEDIA_LIMIT,
          query: CATALOG_PRODUCT_FILTER,
        },
      });
      const graphQLErrors = readGraphQLErrors(errors, "catalog");
      // Reject failures inside the cached callback. `unstable_cache` does not
      // persist thrown executions, but it would cache a successful
      // `{data, errors}` return and turn a transient Storefront error into a
      // one-hour outage.
      if (graphQLErrors.length > 0) {
        throw new ShopifyCatalogError(
          `Storefront API catalog response contained ${graphQLErrors.length} error(s).`,
        );
      }
      if (data == null) {
        throw new ShopifyCatalogError(
          "Storefront API catalog response did not contain data.",
        );
      }
      const result = { data };
      // Validate the complete raw-to-normalized contract before this callback
      // can resolve into Next's persistent cache. A malformed-but-present data
      // payload must be a thrown execution, not a cached success.
      mapCatalogResult(result);
      return result;
    } catch (error) {
      if (error instanceof ShopifyCatalogError) {
        throw error;
      }
      throw new ShopifyCatalogError(
        `Storefront API catalog request failed (${safeErrorLabel(error)}).`,
      );
    }
  };

  if (options.useNextCache === false) {
    return execute;
  }

  return unstable_cache(execute, [CATALOG_CACHE_KEY, config.storeDomain], {
    revalidate: CATALOG_REVALIDATE_SECONDS,
  });
}

/** Builds the bounded main-menu and collection query executor. */
export function createNavigationQueryExecutor(
  config: ShopifyCatalogConfig,
  options: CatalogQueryExecutorOptions = {},
): NavigationQueryExecutor {
  const client = createStorefrontReadClient(config);

  const execute = async () => {
    try {
      const { data, errors } = await client.graphql(NAVIGATION_QUERY, {
        variables: {
          menuHandle: config.mainMenuHandle,
          footerMenuHandle: FOOTER_MENU_HANDLE,
          collectionFirst: NAVIGATION_COLLECTION_LIMIT,
          collectionProductFirst: NAVIGATION_COLLECTION_PRODUCT_LIMIT,
        },
      });
      const graphQLErrors = readGraphQLErrors(errors, "navigation");
      if (data == null) {
        throw new ShopifyCatalogError(
          "Storefront API navigation response did not contain data.",
        );
      }
      if (graphQLErrors.length > 0) {
        throw new ShopifyNavigationPartialError({
          data,
          errors: graphQLErrors,
        });
      }
      const result = { data };
      return result;
    } catch (error) {
      if (error instanceof ShopifyCatalogError) {
        throw error;
      }
      throw new ShopifyCatalogError(
        `Storefront API navigation request failed (${safeErrorLabel(error)}).`,
      );
    }
  };

  if (options.useNextCache === false) {
    return () => recoverPartialNavigationResult(execute);
  }

  const cachedExecute = unstable_cache(
    execute,
    [
      NAVIGATION_CACHE_KEY,
      config.storeDomain,
      config.mainMenuHandle,
      FOOTER_MENU_HANDLE,
    ],
    { revalidate: CATALOG_REVALIDATE_SECONDS },
  );
  return () => recoverPartialNavigationResult(cachedExecute);
}

/**
 * Builds the per-collection query executor.
 *
 * Unlike the catalog read, the response depends on the shopper's own state, so
 * the cache key carries the variables. A page of a filtered, sorted collection
 * is still shared by every visitor who asked for that exact page.
 */
export function createCollectionQueryExecutor(
  config: ShopifyCatalogConfig,
  options: CatalogQueryExecutorOptions = {},
): CollectionQueryExecutor {
  const client = createStorefrontReadClient(config);

  const execute = async (variables: CollectionQueryVariables) => {
    try {
      const { data, errors } = await client.graphql(COLLECTION_PRODUCTS_QUERY, {
        variables: {
          handle: variables.handle,
          /* Opaque by design: these came from Shopify's own `input` and go
           * back unchanged, so the theme never has to know a filter's
           * shape to support it. */
          filters: [...variables.filters] as ProductFilter[],
          sortKey: variables.sortKey,
          reverse: variables.reverse,
          first: variables.first ?? null,
          last: variables.last ?? null,
          startCursor: variables.startCursor ?? null,
          endCursor: variables.endCursor ?? null,
          variantFirst: CATALOG_VARIANT_LIMIT,
          mediaFirst: CATALOG_MEDIA_LIMIT,
        },
      });
      const graphQLErrors = readGraphQLErrors(errors, "catalog");
      if (graphQLErrors.length > 0) {
        throw new ShopifyCatalogError(
          `Storefront API collection response contained ${graphQLErrors.length} error(s).`,
        );
      }
      if (data == null) {
        throw new ShopifyCatalogError(
          "Storefront API collection response did not contain data.",
        );
      }
      const result = { data };
      /* Same discipline as the catalog read: validate before the value can
       * resolve into a persistent cache entry. */
      mapCollectionProductsResult(result);
      return result;
    } catch (error) {
      if (error instanceof ShopifyCatalogError) {
        throw error;
      }
      throw new ShopifyCatalogError(
        `Storefront API collection request failed (${safeErrorLabel(error)}).`,
      );
    }
  };

  if (options.useNextCache === false) {
    return execute;
  }

  return async (variables: CollectionQueryVariables) =>
    unstable_cache(
      () => execute(variables),
      [
        COLLECTION_CACHE_KEY,
        config.storeDomain,
        variables.handle,
        JSON.stringify(variables.filters),
        variables.sortKey,
        String(variables.reverse),
        String(variables.first ?? ""),
        String(variables.last ?? ""),
        variables.startCursor ?? "",
        variables.endCursor ?? "",
      ],
      { revalidate: CATALOG_REVALIDATE_SECONDS },
    )();
}

/** Builds the all-products page executor; the catalog read, but paged. */
export function createAllProductsQueryExecutor(
  config: ShopifyCatalogConfig,
  options: CatalogQueryExecutorOptions = {},
): AllProductsQueryExecutor {
  const client = createStorefrontReadClient(config);

  const execute: AllProductsQueryExecutor = async (variables) => {
    try {
      const { data, errors } = await client.graphql(ALL_PRODUCTS_QUERY, {
        variables: {
          query: CATALOG_PRODUCT_FILTER,
          sortKey: variables.sortKey,
          reverse: variables.reverse,
          first: variables.first ?? null,
          last: variables.last ?? null,
          startCursor: variables.startCursor ?? null,
          endCursor: variables.endCursor ?? null,
          variantFirst: CATALOG_VARIANT_LIMIT,
          mediaFirst: CATALOG_MEDIA_LIMIT,
        },
      });
      const graphQLErrors = readGraphQLErrors(errors, "catalog");
      if (graphQLErrors.length > 0) {
        throw new ShopifyCatalogError(
          `Storefront API products response contained ${graphQLErrors.length} error(s).`,
        );
      }
      if (data == null) {
        throw new ShopifyCatalogError(
          "Storefront API products response did not contain data.",
        );
      }
      const result = { data };
      mapAllProductsResult(result);
      return result;
    } catch (error) {
      if (error instanceof ShopifyCatalogError) {
        throw error;
      }
      throw new ShopifyCatalogError(
        `Storefront API products request failed (${safeErrorLabel(error)}).`,
      );
    }
  };

  if (options.useNextCache === false) {
    return execute;
  }

  return async (variables) =>
    unstable_cache(
      () => execute(variables),
      [
        ALL_PRODUCTS_CACHE_KEY,
        config.storeDomain,
        variables.sortKey,
        String(variables.reverse),
        String(variables.first ?? ""),
        String(variables.last ?? ""),
        variables.startCursor ?? "",
        variables.endCursor ?? "",
      ],
      { revalidate: CATALOG_REVALIDATE_SECONDS },
    )();
}
