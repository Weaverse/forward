/**
 * StorefrontDataSource — the seam between storefront records and route
 * composition.
 *
 * Routes and visual components consume storefront data exclusively through
 * the `storefront` instance exported here; no page or component imports
 * Shopify queries or raw Shopify shapes.
 *
 * Forward always runs against a real Shopify store. An absent, partial or
 * malformed environment throws a sanitized `ShopifyConfigurationError` the
 * moment this module loads, so a build or route without credentials fails
 * closed rather than serving invented data.
 *
 * Unknown handles resolve to `null`; routes translate that into `notFound()`
 * rather than inventing content.
 */

import { DEFAULT_LOCALE, type LocaleId, localeI18n } from "../i18n/locales";
import {
  type CatalogQueryExecutorOptions,
  createAllProductsQueryExecutor,
  createCatalogQueryExecutor,
  createCollectionQueryExecutor,
  createNavigationQueryExecutor,
} from "./shopify/client";
import { createContentQueryExecutor } from "./shopify/content-client";
import { ShopifyCatalogDataSource } from "./shopify/data-source";
import { type EnvSource, readShopifyCatalogConfig } from "./shopify/env";
import type {
  Collection,
  CollectionProductsPage,
  CollectionProductsQuery,
  JournalArticle,
  Policy,
  Product,
  SiteNavigation,
  StorePage,
} from "./types";

export interface StorefrontDataSource {
  listProducts(): Promise<readonly Product[]>;
  getProduct(handle: string): Promise<Product | null>;
  listCollections(): Promise<readonly Collection[]>;
  getCollection(handle: string): Promise<Collection | null>;
  getCollectionProducts(handle: string): Promise<readonly Product[] | null>;
  /**
   * One page of a collection, with the facets the store offers for it.
   *
   * This is the read a browsing route makes: the shopper's filters, order and
   * cursor go in, and the products plus the store's own facet list come back.
   * `null` means no such collection.
   */
  getCollectionPage(
    handle: string,
    query?: CollectionProductsQuery,
  ): Promise<CollectionProductsPage | null>;
  /**
   * One page of the whole catalog, in the same shape a collection page has.
   *
   * Most stores expose no facets at the catalog level, so this is ordinarily
   * sort and paging only — but whatever the store does return is carried.
   */
  getProductsPage(
    query?: CollectionProductsQuery,
  ): Promise<CollectionProductsPage>;
  searchProducts(query: string): Promise<readonly Product[]>;
  listArticles(): Promise<readonly JournalArticle[]>;
  getArticle(handle: string): Promise<JournalArticle | null>;
  listPages(): Promise<readonly StorePage[]>;
  getPage(handle: string): Promise<StorePage | null>;
  listPolicies(): Promise<readonly Policy[]>;
  getPolicy(handle: string): Promise<Policy | null>;
  getNavigation(): Promise<SiteNavigation>;
}

export type StorefrontDataSourceOptions = CatalogQueryExecutorOptions;

/**
 * Builds the data source for an environment.
 *
 * The environment source is a parameter so configuration stays injectable and
 * tests never mutate `process.env`.
 */
export function createStorefrontDataSource(
  env: EnvSource = process.env,
  options: StorefrontDataSourceOptions = {},
): StorefrontDataSource {
  const config = readShopifyCatalogConfig(env);
  const useNextCache = options.useNextCache ?? true;
  return new ShopifyCatalogDataSource({
    execute: createCatalogQueryExecutor(config, options),
    executeCollection: createCollectionQueryExecutor(config, options),
    executeAllProducts: createAllProductsQueryExecutor(config, options),
    executeContent: createContentQueryExecutor(config, options),
    executeNavigation: createNavigationQueryExecutor(config, options),
    storeDomain: config.storeDomain,
    mainMenuHandle: config.mainMenuHandle,
    useProcessCache: !useNextCache,
  });
}

const SOURCES = new Map<LocaleId, StorefrontDataSource>();

/**
 * The data source for one market. Each is built once and reads only in its
 * own `@inContext`, with its own cache entries, so a locale never sees another
 * market's prices or copy.
 */
export function getStorefront(
  locale: LocaleId = DEFAULT_LOCALE,
): StorefrontDataSource {
  let source = SOURCES.get(locale);
  if (source === undefined) {
    source = createStorefrontDataSource(process.env, {
      i18n: localeI18n(locale),
    });
    SOURCES.set(locale, source);
  }
  return source;
}

/* Built as the module loads, so a missing Shopify environment fails the build
 * and every route at once rather than on the first read. */
getStorefront(DEFAULT_LOCALE);
