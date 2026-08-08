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
import { unstable_cache } from "next/cache";

import {
  CATALOG_CACHE_KEY,
  CATALOG_REVALIDATE_SECONDS,
  NAVIGATION_CACHE_KEY,
} from "./cache-policy";
import { safeErrorLabel, ShopifyCatalogError } from "./errors";
import { mapCatalogResult } from "./mapper";

import {
  MAIN_MENU_HANDLE,
  NAVIGATION_COLLECTION_LIMIT,
  NAVIGATION_COLLECTION_PRODUCT_LIMIT,
  NAVIGATION_QUERY,
} from "./navigation-query";
import type { ShopifyCatalogConfig } from "./env";
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

export interface NavigationQueryResult {
  data?: unknown;
  errors?: unknown;
}

export type NavigationQueryExecutor = () => Promise<NavigationQueryResult>;

export interface CatalogQueryExecutorOptions {
  /** Disable only the Next Data Cache wrapper for isolated transport tests. */
  useNextCache?: boolean;
}

const CATALOG_I18N = { country: "US", language: "EN" } as const;

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
      // Reject failures inside the cached callback. `unstable_cache` does not
      // persist thrown executions, but it would cache a successful
      // `{data, errors}` return and turn a transient Storefront error into a
      // one-hour outage.
      if (errors !== undefined && errors.length > 0) {
        throw new ShopifyCatalogError(
          `Storefront API catalog response contained ${errors.length} error(s).`,
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
          menuHandle: MAIN_MENU_HANDLE,
          collectionFirst: NAVIGATION_COLLECTION_LIMIT,
          collectionProductFirst: NAVIGATION_COLLECTION_PRODUCT_LIMIT,
        },
      });
      if (errors !== undefined && errors.length > 0) {
        throw new ShopifyCatalogError(
          `Storefront API navigation response contained ${errors.length} error(s).`,
        );
      }
      if (data == null) {
        throw new ShopifyCatalogError(
          "Storefront API navigation response did not contain data.",
        );
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
    return execute;
  }

  return unstable_cache(execute, [NAVIGATION_CACHE_KEY, config.storeDomain], {
    revalidate: CATALOG_REVALIDATE_SECONDS,
  });
}
