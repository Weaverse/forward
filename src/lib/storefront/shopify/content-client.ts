import { unstable_cache } from "next/cache";

import { CATALOG_REVALIDATE_SECONDS, CONTENT_CACHE_KEY } from "./cache-policy";
import {
  type CatalogQueryExecutorOptions,
  createStorefrontReadClient,
  executorMarket,
} from "./client";
import { type MappedContentResult, mapContentResult } from "./content-mapper";
import {
  CONTENT_ARTICLE_LIMIT,
  CONTENT_PAGE_LIMIT,
  CONTENT_QUERY,
} from "./content-query";
import type { ShopifyCatalogConfig } from "./env";
import { ShopifyCatalogError, safeErrorLabel } from "./errors";

export interface ContentQueryResult {
  data?: unknown;
  errors?: unknown;
}

export type ContentQueryExecutor = () => Promise<MappedContentResult>;

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

export function createContentQueryExecutor(
  config: ShopifyCatalogConfig,
  options: CatalogQueryExecutorOptions = {},
): ContentQueryExecutor {
  const market = executorMarket(options);
  const client = createStorefrontReadClient(config, market.i18n);

  const execute = async () => {
    try {
      const { data, errors } = await client.graphql(CONTENT_QUERY, {
        variables: {
          pageFirst: CONTENT_PAGE_LIMIT,
          articleFirst: CONTENT_ARTICLE_LIMIT,
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

  return unstable_cache(
    execute,
    [CONTENT_CACHE_KEY, config.storeDomain, market.key],
    { revalidate: CATALOG_REVALIDATE_SECONDS },
  );
}
