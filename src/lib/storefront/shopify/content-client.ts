import {
  createShopifyRequestContext,
  createStorefrontClient,
} from "@shopify/hydrogen";
import { unstable_cache } from "next/cache";

import { CATALOG_REVALIDATE_SECONDS, CONTENT_CACHE_KEY } from "./cache-policy";
import type { CatalogQueryExecutorOptions } from "./client";
import type { ShopifyCatalogConfig } from "./env";
import { safeErrorLabel, ShopifyCatalogError } from "./errors";
import { mapContentResult, type MappedContentResult } from "./content-mapper";
import {
  CONTENT_ARTICLE_LIMIT,
  CONTENT_BLOG_HANDLE,
  CONTENT_QUERY,
} from "./content-query";

export interface ContentQueryResult {
  data?: unknown;
  errors?: unknown;
}

export type ContentQueryExecutor = () => Promise<MappedContentResult>;

const CONTENT_I18N = { country: "US", language: "EN" } as const;

function readGraphQLErrors(errors: unknown): readonly unknown[] {
  if (errors === undefined) {
    return [];
  }
  if (!Array.isArray(errors)) {
    throw new ShopifyCatalogError(
      "Storefront API content response contained a malformed errors container.",
    );
  }
  return errors;
}

function createStorefrontReadClient(config: ShopifyCatalogConfig) {
  const requestContext = createShopifyRequestContext({
    request: { headers: new Headers() },
    i18n: CONTENT_I18N,
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

export function createContentQueryExecutor(
  config: ShopifyCatalogConfig,
  options: CatalogQueryExecutorOptions = {},
): ContentQueryExecutor {
  const client = createStorefrontReadClient(config);

  const execute = async () => {
    try {
      const { data, errors } = await client.graphql(CONTENT_QUERY, {
        variables: {
          articleFirst: CONTENT_ARTICLE_LIMIT,
          blogHandle: CONTENT_BLOG_HANDLE,
        },
      });
      const graphQLErrors = readGraphQLErrors(errors);
      if (graphQLErrors.length > 0) {
        throw new ShopifyCatalogError(
          `Storefront API content response contained ${graphQLErrors.length} error(s).`,
        );
      }
      if (data == null) {
        throw new ShopifyCatalogError(
          "Storefront API content response did not contain data.",
        );
      }
      const result = { data };
      return mapContentResult(result);
    } catch (error) {
      if (error instanceof ShopifyCatalogError) {
        throw error;
      }
      throw new ShopifyCatalogError(
        `Storefront API content request failed (${safeErrorLabel(error)}).`,
      );
    }
  };

  if (options.useNextCache === false) {
    return execute;
  }

  return unstable_cache(execute, [CONTENT_CACHE_KEY, config.storeDomain], {
    revalidate: CATALOG_REVALIDATE_SECONDS,
  });
}
