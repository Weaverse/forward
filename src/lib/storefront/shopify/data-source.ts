/**
 * Shopify-backed catalog data source.
 *
 * Overrides exactly the four catalog reads Shopify owns in Slice 1:
 * `listProducts`, `getProduct`, `searchProducts`, and `getCollectionProducts`.
 * Every other domain — canonical route collection presentation, content,
 * navigation, theme text, demo cart seed, demo account records — delegates to
 * the injected static base and stays unchanged.
 *
 * Fail-closed: once Shopify mode is selected there is no fixture fallback.
 * Network, GraphQL, validation, and mapping failures propagate.
 */

import {
  filterAndSortProducts,
  searchNormalizedProducts,
} from "../catalog-query";
import type { StorefrontDataSource } from "../data-source";
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
} from "../types";
import { CATALOG_REVALIDATE_SECONDS } from "./cache-policy";
import type { CatalogQueryExecutor } from "./client";
import { ShopifyCatalogError } from "./errors";
import { mapCatalogResult } from "./mapper";

/**
 * Bounded catalog freshness window.
 *
 * Catalog routes stay statically renderable; this is the in-process reuse
 * window so one ISR regeneration pass makes a single Storefront round trip
 * instead of one per page and per product. The same number is the route
 * segment `revalidate` value on the static catalog routes, which is what
 * actually bounds published staleness.
 */
export { CATALOG_REVALIDATE_SECONDS } from "./cache-policy";

const MILLISECONDS_PER_SECOND = 1000;

export interface ShopifyCatalogDataSourceOptions {
  /** Static implementation backing every non-catalog domain. */
  base: StorefrontDataSource;
  execute: CatalogQueryExecutor;
  /**
   * Standalone verifier/test fallback only. Production routes leave this false
   * so every read reaches the Next Data Cache and registers its dependency.
   */
  useProcessCache?: boolean;
  /** Catalog reuse window; defaults to `CATALOG_REVALIDATE_SECONDS`. */
  ttlMs?: number;
  /** Injectable clock so cache behavior is deterministically testable. */
  now?: () => number;
}

interface CatalogCacheEntry {
  products: readonly Product[];
  loadedAt: number;
}

export class ShopifyCatalogDataSource implements StorefrontDataSource {
  readonly #base: StorefrontDataSource;
  readonly #execute: CatalogQueryExecutor;
  readonly #useProcessCache: boolean;
  readonly #ttlMs: number;
  readonly #now: () => number;

  #cached: CatalogCacheEntry | null = null;
  #inFlight: Promise<readonly Product[]> | null = null;

  constructor(options: ShopifyCatalogDataSourceOptions) {
    this.#base = options.base;
    this.#execute = options.execute;
    this.#useProcessCache = options.useProcessCache ?? true;
    this.#ttlMs =
      options.ttlMs ?? CATALOG_REVALIDATE_SECONDS * MILLISECONDS_PER_SECOND;
    this.#now = options.now ?? Date.now;
  }

  async #loadCatalog(): Promise<readonly Product[]> {
    if (!this.#useProcessCache) {
      return mapCatalogResult(await this.#execute());
    }
    const cached = this.#cached;
    if (cached !== null && this.#now() - cached.loadedAt < this.#ttlMs) {
      return cached.products;
    }
    if (this.#inFlight !== null) {
      return this.#inFlight;
    }

    const request = this.#execute()
      .then((result) => {
        const products = mapCatalogResult(result);
        this.#cached = { products, loadedAt: this.#now() };
        return products;
      })
      .finally(() => {
        this.#inFlight = null;
      });

    this.#inFlight = request;
    return request;
  }

  /* ---- Shopify-owned catalog reads ------------------------------------- */

  async listProducts(
    filter: ProductListFilter = {},
    sort: ProductSort = "featured",
  ): Promise<readonly Product[]> {
    return filterAndSortProducts(await this.#loadCatalog(), filter, sort);
  }

  async getProduct(handle: string): Promise<Product | null> {
    const catalog = await this.#loadCatalog();
    return catalog.find((product) => product.handle === handle) ?? null;
  }

  async searchProducts(query: string): Promise<readonly Product[]> {
    return searchNormalizedProducts(await this.#loadCatalog(), query);
  }

  /**
   * Canonical route collections stay presentation-owned; only their product
   * handles resolve through the live catalog.
   */
  async getCollectionProducts(
    handle: string,
  ): Promise<readonly Product[] | null> {
    const collection = await this.#base.getCollection(handle);
    if (collection === null) {
      return null;
    }
    const catalog = await this.#loadCatalog();
    return collection.productHandles.map((productHandle) => {
      const product = catalog.find((entry) => entry.handle === productHandle);
      if (product === undefined) {
        throw new ShopifyCatalogError(
          `Collection "${handle}" references product "${productHandle}", which the live catalog did not return.`,
        );
      }
      return product;
    });
  }

  /* ---- Domains deferred to a later slice -------------------------------- */

  async listCollections(): Promise<readonly Collection[]> {
    return this.#base.listCollections();
  }

  async getCollection(handle: string): Promise<Collection | null> {
    return this.#base.getCollection(handle);
  }

  async listArticles(): Promise<readonly JournalArticle[]> {
    return this.#base.listArticles();
  }

  async getArticle(handle: string): Promise<JournalArticle | null> {
    return this.#base.getArticle(handle);
  }

  async listPages(): Promise<readonly StorePage[]> {
    return this.#base.listPages();
  }

  async getPage(handle: string): Promise<StorePage | null> {
    return this.#base.getPage(handle);
  }

  async listPolicies(): Promise<readonly Policy[]> {
    return this.#base.listPolicies();
  }

  async getPolicy(handle: string): Promise<Policy | null> {
    return this.#base.getPolicy(handle);
  }

  async getNavigation(): Promise<SiteNavigation> {
    return this.#base.getNavigation();
  }

  async getThemeContent(): Promise<ThemeContent> {
    return this.#base.getThemeContent();
  }

  async listDemoOrders(): Promise<readonly DemoOrder[]> {
    return this.#base.listDemoOrders();
  }

  async getDemoOrder(id: string): Promise<DemoOrder | null> {
    return this.#base.getDemoOrder(id);
  }

  async listDemoAddresses(): Promise<readonly DemoAddress[]> {
    return this.#base.listDemoAddresses();
  }

  async getDemoCartSeed(): Promise<readonly DemoCartSeedLine[]> {
    return this.#base.getDemoCartSeed();
  }
}
