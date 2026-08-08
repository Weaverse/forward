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
 *   products, canonical collections, search, and main navigation, and
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
import {
  DEMO_ADDRESS_FIXTURES,
  DEMO_CART_SEED,
  DEMO_ORDER_FIXTURES,
} from "./fixtures/account";
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
  type CatalogQueryExecutorOptions,
  createCatalogQueryExecutor,
  createNavigationQueryExecutor,
} from "./shopify/client";
import { ShopifyCatalogDataSource } from "./shopify/data-source";
import { type EnvSource, readShopifyCatalogConfig } from "./shopify/env";
import type { ShopifyCatalogError } from "./shopify/errors";
import type {
  Collection,
  DemoAddress,
  DemoCartSeedLine,
  DemoOrder,
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
  getCollectionProducts(handle: string): Promise<readonly Product[] | null>;
  searchProducts(query: string): Promise<readonly Product[]>;
  listArticles(): Promise<readonly JournalArticle[]>;
  getArticle(handle: string): Promise<JournalArticle | null>;
  listPages(): Promise<readonly StorePage[]>;
  getPage(handle: string): Promise<StorePage | null>;
  listPolicies(): Promise<readonly Policy[]>;
  getPolicy(handle: string): Promise<Policy | null>;
  getNavigation(): Promise<SiteNavigation>;
  getThemeContent(): Promise<ThemeContent>;
  listDemoOrders(): Promise<readonly DemoOrder[]>;
  getDemoOrder(id: string): Promise<DemoOrder | null>;
  listDemoAddresses(): Promise<readonly DemoAddress[]>;
  getDemoCartSeed(): Promise<readonly DemoCartSeedLine[]>;
}

export interface StorefrontDataSourceOptions
  extends CatalogQueryExecutorOptions {
  onNavigationFallback?: (error: ShopifyCatalogError) => void;
  onCollectionFallback?: (error: ShopifyCatalogError) => void;
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
    return products.filter((product): product is Product => product !== null);
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

  async listDemoOrders(): Promise<readonly DemoOrder[]> {
    return DEMO_ORDER_FIXTURES;
  }

  async getDemoOrder(id: string): Promise<DemoOrder | null> {
    return DEMO_ORDER_FIXTURES.find((order) => order.id === id) ?? null;
  }

  async listDemoAddresses(): Promise<readonly DemoAddress[]> {
    return DEMO_ADDRESS_FIXTURES;
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
    executeNavigation: createNavigationQueryExecutor(config, options),
    storeDomain: config.storeDomain,
    onCollectionFallback: options.onCollectionFallback,
    onNavigationFallback: options.onNavigationFallback,
    useProcessCache: !useNextCache,
  });
}

/** The storefront data source used by all routes. */
export const storefront: StorefrontDataSource = createStorefrontDataSource();
