/**
 * Shopify-backed catalog and navigation data source.
 *
 * Products plus canonical collections and main/Footer navigation are live.
 * Content, theme text, utility presentation, cart, and account records remain
 * delegated to the injected static base until their own bounded slices.
 *
 * Product failures remain fail-closed. Main navigation, the whole Footer tree,
 * and canonical collection structure use independently scoped exact static
 * contracts when malformed remote data would otherwise take down routes.
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
import type { CatalogQueryExecutor, NavigationQueryExecutor } from "./client";
import { safeErrorLabel, ShopifyCatalogError } from "./errors";
import { mapCatalogResult } from "./mapper";
import {
  mapCollectionsResult,
  mapFooterMenuResult,
  mapMainMenuResult,
} from "./navigation-mapper";

export { CATALOG_REVALIDATE_SECONDS } from "./cache-policy";

const MILLISECONDS_PER_SECOND = 1000;

export interface ShopifyCatalogDataSourceOptions {
  /** Static implementation backing every not-yet-live domain. */
  base: StorefrontDataSource;
  execute: CatalogQueryExecutor;
  executeNavigation: NavigationQueryExecutor;
  /** Configured store origin used to reject cross-store menu URLs. */
  storeDomain: string;
  /** Selected Shopify primary-menu handle. */
  mainMenuHandle: string;
  /** Injectable sanitized observer for navigation fallback events. */
  onNavigationFallback?: (error: ShopifyCatalogError) => void;
  /** Injectable sanitized observer for Footer-menu fallback events. */
  onFooterFallback?: (error: ShopifyCatalogError) => void;
  /** Injectable sanitized observer for collection-structure fallback events. */
  onCollectionFallback?: (error: ShopifyCatalogError) => void;
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
  readonly #executeNavigation: NavigationQueryExecutor;
  readonly #storeDomain: string;
  readonly #mainMenuHandle: string;
  readonly #onNavigationFallback: (error: ShopifyCatalogError) => void;
  readonly #onFooterFallback: (error: ShopifyCatalogError) => void;
  readonly #onCollectionFallback: (error: ShopifyCatalogError) => void;
  readonly #useProcessCache: boolean;
  readonly #ttlMs: number;
  readonly #now: () => number;

  #cached: CatalogCacheEntry | null = null;
  #inFlight: Promise<readonly Product[]> | null = null;
  #navigationFallbackReported = false;
  #footerFallbackReported = false;
  #collectionFallbackReported = false;

  constructor(options: ShopifyCatalogDataSourceOptions) {
    this.#base = options.base;
    this.#execute = options.execute;
    this.#executeNavigation = options.executeNavigation;
    this.#storeDomain = options.storeDomain;
    this.#mainMenuHandle = options.mainMenuHandle;
    this.#onCollectionFallback =
      options.onCollectionFallback ??
      ((error) => {
        console.warn(
          `[storefront] using static collection-structure fallback (${safeErrorLabel(error)}).`,
        );
      });
    this.#onNavigationFallback =
      options.onNavigationFallback ??
      ((error) => {
        console.warn(
          `[storefront] using static main-navigation fallback (${safeErrorLabel(error)}).`,
        );
      });
    this.#onFooterFallback =
      options.onFooterFallback ??
      ((error) => {
        console.warn(
          `[storefront] using static footer-navigation fallback (${safeErrorLabel(error)}).`,
        );
      });
    this.#useProcessCache = options.useProcessCache ?? true;
    this.#ttlMs =
      options.ttlMs ?? CATALOG_REVALIDATE_SECONDS * MILLISECONDS_PER_SECOND;
    this.#now = options.now ?? Date.now;
  }

  #reportNavigationFallback(error: ShopifyCatalogError): void {
    if (!this.#navigationFallbackReported) {
      this.#onNavigationFallback(error);
      this.#navigationFallbackReported = true;
    }
  }

  #reportFooterFallback(error: ShopifyCatalogError): void {
    if (!this.#footerFallbackReported) {
      this.#onFooterFallback(error);
      this.#footerFallbackReported = true;
    }
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

  async #loadCollections(): Promise<readonly Collection[]> {
    try {
      return mapCollectionsResult(await this.#executeNavigation());
    } catch (error) {
      if (!(error instanceof ShopifyCatalogError)) {
        throw error;
      }
      if (!this.#collectionFallbackReported) {
        this.#onCollectionFallback(error);
        this.#collectionFallbackReported = true;
      }
      return this.#base.listCollections();
    }
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

  async listCollections(): Promise<readonly Collection[]> {
    return this.#loadCollections();
  }

  async getCollection(handle: string): Promise<Collection | null> {
    return (
      (await this.#loadCollections()).find(
        (collection) => collection.handle === handle,
      ) ?? null
    );
  }

  async getCollectionProducts(
    handle: string,
  ): Promise<readonly Product[] | null> {
    const collection = await this.getCollection(handle);
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

  async getNavigation(): Promise<SiteNavigation> {
    const base = await this.#base.getNavigation();
    let result: Awaited<ReturnType<NavigationQueryExecutor>>;
    try {
      result = await this.#executeNavigation();
    } catch (error) {
      if (!(error instanceof ShopifyCatalogError)) {
        throw error;
      }
      this.#reportNavigationFallback(error);
      this.#reportFooterFallback(error);
      return base;
    }

    let primary: SiteNavigation["primary"];
    try {
      const mappedPrimary = mapMainMenuResult(
        result,
        this.#storeDomain,
        this.#mainMenuHandle,
      );
      const search = base.primary.filter((item) => item.href === "/search");
      if (search.length !== 1) {
        throw new ShopifyCatalogError(
          "Theme navigation must define exactly one Search destination.",
        );
      }
      primary = [...mappedPrimary, ...search];
    } catch (error) {
      if (!(error instanceof ShopifyCatalogError)) {
        throw error;
      }
      this.#reportNavigationFallback(error);
      primary = base.primary;
    }

    let footerColumns: SiteNavigation["footerColumns"];
    try {
      footerColumns = mapFooterMenuResult(result, this.#storeDomain);
    } catch (error) {
      if (!(error instanceof ShopifyCatalogError)) {
        throw error;
      }
      this.#reportFooterFallback(error);
      footerColumns = base.footerColumns;
    }

    return {
      primary,
      utility: base.utility,
      footerColumns,
    };
  }

  /* ---- Domains deferred to later slices -------------------------------- */

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

  async getThemeContent(): Promise<ThemeContent> {
    return {
      ...(await this.#base.getThemeContent()),
      demoNotice:
        "Forward uses a live Shopify catalog and navigation. Cart and account remain local demonstrations: checkout and customer account writes are not connected.",
      footerStatus: "Live Shopify catalog · Demo cart and account",
    };
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
