/**
 * StorefrontDataSource — the replaceable seam between storefront records and
 * route composition.
 *
 * Routes and visual components must consume storefront data exclusively
 * through the `storefront` instance exported here. No page or component may
 * import fixture records, Shopify queries, or raw Shopify shapes.
 *
 * Mode selection is explicit and fails closed:
 *
 * - no Shopify environment -> `StaticStorefrontDataSource` (the deterministic
 *   default used by tests and any environment without credentials);
 * - complete Shopify environment -> `ShopifyCatalogDataSource`, which owns
 *   products, canonical collections, search, and main/Footer navigation, and
 *   delegates every later domain to the static implementation;
 * - partial Shopify environment -> sanitized `ShopifyConfigurationError`.
 *
 * Unknown handles resolve to `null`; routes translate that into `notFound()`
 * rather than inventing content.
 */

import {
  filterAndSortProducts,
  searchNormalizedProducts,
} from "./catalog-query";
import { DEMO_CART_SEED } from "./fixtures/account";
import { COLLECTION_FIXTURES } from "./fixtures/collections";
import { JOURNAL_FIXTURES } from "./fixtures/journal";
import {
  NAVIGATION_FIXTURE,
  THEME_CONTENT_FIXTURE,
} from "./fixtures/navigation";
import { PAGE_FIXTURES } from "./fixtures/pages";
import { POLICY_FIXTURES } from "./fixtures/policies";
import { PRODUCT_FIXTURES } from "./fixtures/products";
import {
  applyProductFilters,
  synthesizeProductFilters,
} from "./product-filters";
import {
  type CatalogQueryExecutorOptions,
  createCatalogQueryExecutor,
  createCollectionQueryExecutor,
  createNavigationQueryExecutor,
} from "./shopify/client";
import { createContentQueryExecutor } from "./shopify/content-client";
import { ShopifyCatalogDataSource } from "./shopify/data-source";
import { type EnvSource, readShopifyCatalogConfig } from "./shopify/env";
import type { ShopifyCatalogError } from "./shopify/errors";
import { sortProductsLocally } from "./sort-local";
import type {
  Collection,
  CollectionProductsPage,
  CollectionProductsQuery,
  DemoCartSeedLine,
  JournalArticle,
  Policy,
  Product,
  ProductListFilter,
  ProductSort,
  SiteNavigation,
  StorePage,
  ThemeContent,
} from "./types";

export interface StorefrontDataSource {
  listProducts(
    filter?: ProductListFilter,
    sort?: ProductSort,
  ): Promise<readonly Product[]>;
  getProduct(handle: string): Promise<Product | null>;
  listCollections(): Promise<readonly Collection[]>;
  getCollection(handle: string): Promise<Collection | null>;
  getCollectionProducts(
    handle: string,
    filter?: ProductListFilter,
    sort?: ProductSort,
  ): Promise<readonly Product[] | null>;
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
  searchProducts(query: string): Promise<readonly Product[]>;
  listArticles(): Promise<readonly JournalArticle[]>;
  getArticle(handle: string): Promise<JournalArticle | null>;
  listPages(): Promise<readonly StorePage[]>;
  getPage(handle: string): Promise<StorePage | null>;
  listPolicies(): Promise<readonly Policy[]>;
  getPolicy(handle: string): Promise<Policy | null>;
  getNavigation(): Promise<SiteNavigation>;
  getThemeContent(): Promise<ThemeContent>;
  getDemoCartSeed(): Promise<readonly DemoCartSeedLine[]>;
}

export interface StorefrontDataSourceOptions
  extends CatalogQueryExecutorOptions {
  onNavigationFallback?: (error: ShopifyCatalogError) => void;
  onFooterFallback?: (error: ShopifyCatalogError) => void;
  onCollectionFallback?: (error: ShopifyCatalogError) => void;
}

const DEFAULT_PAGE_BY = 12;

function decodeCursor(cursor: string | undefined): number | null {
  if (cursor === undefined) {
    return null;
  }
  const index = Number.parseInt(cursor, 10);
  return Number.isInteger(index) && index >= 0 ? index : null;
}

/**
 * One page of an already-resolved product list, shaped like a live response.
 *
 * Shared by the static data source and by any collection the Shopify adapter
 * could not read live, so both answer a route identically.
 */
export function localCollectionPage(
  all: readonly Product[],
  query: CollectionProductsQuery,
): CollectionProductsPage {
  const filters = synthesizeProductFilters(all);
  const narrowed = sortProductsLocally(
    applyProductFilters(all, query.filters ?? []),
    query.sort ?? "featured",
  );
  const pageBy = query.pageBy ?? DEFAULT_PAGE_BY;
  const after = decodeCursor(query.endCursor);
  const before = decodeCursor(query.startCursor);
  const start =
    after !== null
      ? after + 1
      : before !== null
        ? Math.max(0, before - pageBy)
        : 0;
  const products = narrowed.slice(start, start + pageBy);

  return {
    products,
    filters,
    pageInfo: {
      hasPreviousPage: start > 0,
      hasNextPage: start + products.length < narrowed.length,
      startCursor: products.length > 0 ? String(start) : null,
      endCursor:
        products.length > 0 ? String(start + products.length - 1) : null,
    },
  };
}

/** Fixture-backed implementation; the no-credential default. */
export class StaticStorefrontDataSource implements StorefrontDataSource {
  async listProducts(
    filter: ProductListFilter = {},
    sort: ProductSort = "featured",
  ): Promise<readonly Product[]> {
    return filterAndSortProducts(PRODUCT_FIXTURES, filter, sort);
  }

  async getProduct(handle: string): Promise<Product | null> {
    return (
      PRODUCT_FIXTURES.find((product) => product.handle === handle) ?? null
    );
  }

  async listCollections(): Promise<readonly Collection[]> {
    return COLLECTION_FIXTURES;
  }

  async getCollection(handle: string): Promise<Collection | null> {
    return (
      COLLECTION_FIXTURES.find((collection) => collection.handle === handle) ??
      null
    );
  }

  async getCollectionProducts(
    handle: string,
    filter: ProductListFilter = {},
    sort: ProductSort = "featured",
  ): Promise<readonly Product[] | null> {
    const collection = await this.getCollection(handle);
    if (collection === null) {
      return null;
    }
    const products = await Promise.all(
      collection.productHandles.map((productHandle) =>
        this.getProduct(productHandle),
      ),
    );
    return filterAndSortProducts(
      products.filter((product): product is Product => product !== null),
      filter,
      sort,
    );
  }

  /**
   * The same page a live collection read would return, computed locally.
   *
   * Cursors are the index of the last item on the page, which is opaque to
   * callers exactly as a Shopify cursor is.
   */
  async getCollectionPage(
    handle: string,
    query: CollectionProductsQuery = {},
  ): Promise<CollectionProductsPage | null> {
    const all = await this.getCollectionProducts(handle);
    if (all === null) {
      return null;
    }
    return localCollectionPage(all, query);
  }

  async searchProducts(query: string): Promise<readonly Product[]> {
    return searchNormalizedProducts(PRODUCT_FIXTURES, query);
  }

  async listArticles(): Promise<readonly JournalArticle[]> {
    return JOURNAL_FIXTURES;
  }

  async getArticle(handle: string): Promise<JournalArticle | null> {
    return (
      JOURNAL_FIXTURES.find((article) => article.handle === handle) ?? null
    );
  }

  async listPages(): Promise<readonly StorePage[]> {
    return PAGE_FIXTURES;
  }

  async getPage(handle: string): Promise<StorePage | null> {
    return PAGE_FIXTURES.find((page) => page.handle === handle) ?? null;
  }

  async listPolicies(): Promise<readonly Policy[]> {
    return POLICY_FIXTURES;
  }

  async getPolicy(handle: string): Promise<Policy | null> {
    return POLICY_FIXTURES.find((policy) => policy.handle === handle) ?? null;
  }

  async getNavigation(): Promise<SiteNavigation> {
    return NAVIGATION_FIXTURE;
  }

  async getThemeContent(): Promise<ThemeContent> {
    return THEME_CONTENT_FIXTURE;
  }

  async getDemoCartSeed(): Promise<readonly DemoCartSeedLine[]> {
    return DEMO_CART_SEED;
  }
}

/**
 * Resolves the data source for an environment.
 *
 * The environment source is a parameter so mode selection stays injectable and
 * tests never mutate `process.env`.
 */
export function createStorefrontDataSource(
  env: EnvSource = process.env,
  options: StorefrontDataSourceOptions = {},
): StorefrontDataSource {
  const base = new StaticStorefrontDataSource();
  const config = readShopifyCatalogConfig(env);
  if (config === null) {
    return base;
  }
  const useNextCache = options.useNextCache ?? true;
  return new ShopifyCatalogDataSource({
    base,
    execute: createCatalogQueryExecutor(config, options),
    executeCollection: createCollectionQueryExecutor(config, options),
    executeContent: createContentQueryExecutor(config, options),
    executeNavigation: createNavigationQueryExecutor(config, options),
    storeDomain: config.storeDomain,
    mainMenuHandle: config.mainMenuHandle,
    onCollectionFallback: options.onCollectionFallback,
    onFooterFallback: options.onFooterFallback,
    onNavigationFallback: options.onNavigationFallback,
    useProcessCache: !useNextCache,
  });
}

/** The storefront data source used by all routes. */
export const storefrontRuntimeMode =
  readShopifyCatalogConfig(process.env) === null ? "static" : "shopify";
export const storefront: StorefrontDataSource = createStorefrontDataSource();
