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

import { searchNormalizedProducts } from "../catalog-query";
import type { StorefrontDataSource } from "../data-source";
import { catalogSortArguments, collectionSortArguments } from "../sort";
import type {
  Collection,
  CollectionProductsPage,
  CollectionProductsQuery,
  JournalArticle,
  Policy,
  Product,
  SiteNavigation,
  StorePage,
} from "../types";
import { CATALOG_REVALIDATE_SECONDS } from "./cache-policy";
import type {
  AllProductsQueryExecutor,
  CatalogQueryExecutor,
  CollectionQueryExecutor,
  NavigationQueryExecutor,
} from "./client";
import { COLLECTION_PAGE_SIZE } from "./collection-query";
import type { ContentQueryExecutor } from "./content-client";
import type { MappedContentResult } from "./content-mapper";
import { ShopifyCatalogError } from "./errors";
import {
  mapAllProductsResult,
  mapCatalogResult,
  mapCollectionProductsResult,
} from "./mapper";
import {
  mapCollectionsResult,
  mapFooterMenuResult,
  mapMainMenuResult,
} from "./navigation-mapper";

export { CATALOG_REVALIDATE_SECONDS } from "./cache-policy";

const MILLISECONDS_PER_SECOND = 1000;

export interface ShopifyCatalogDataSourceOptions {
  execute: CatalogQueryExecutor;
  executeCollection: CollectionQueryExecutor;
  executeAllProducts: AllProductsQueryExecutor;
  executeContent: ContentQueryExecutor;
  executeNavigation: NavigationQueryExecutor;
  /** Configured store origin used to reject cross-store menu URLs. */
  storeDomain: string;
  /** Selected Shopify primary-menu handle. */
  mainMenuHandle: string;
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

interface ContentCacheEntry {
  result: MappedContentResult;
  loadedAt: number;
}

export class ShopifyCatalogDataSource implements StorefrontDataSource {
  readonly #execute: CatalogQueryExecutor;
  readonly #executeCollection: CollectionQueryExecutor;
  readonly #executeAllProducts: AllProductsQueryExecutor;
  readonly #executeContent: ContentQueryExecutor;
  readonly #executeNavigation: NavigationQueryExecutor;
  readonly #storeDomain: string;
  readonly #mainMenuHandle: string;
  readonly #useProcessCache: boolean;
  readonly #ttlMs: number;
  readonly #now: () => number;

  #cached: CatalogCacheEntry | null = null;
  #inFlight: Promise<readonly Product[]> | null = null;
  #contentCached: ContentCacheEntry | null = null;
  #contentInFlight: Promise<MappedContentResult> | null = null;

  constructor(options: ShopifyCatalogDataSourceOptions) {
    this.#execute = options.execute;
    this.#executeCollection = options.executeCollection;
    this.#executeAllProducts = options.executeAllProducts;
    this.#executeContent = options.executeContent;
    this.#executeNavigation = options.executeNavigation;
    this.#storeDomain = options.storeDomain;
    this.#mainMenuHandle = options.mainMenuHandle;
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

  async #loadCollections(): Promise<readonly Collection[]> {
    return mapCollectionsResult(await this.#executeNavigation());
  }

  async #loadContent(): Promise<MappedContentResult> {
    if (!this.#useProcessCache) {
      return this.#executeContent();
    }
    const cached = this.#contentCached;
    if (cached !== null && this.#now() - cached.loadedAt < this.#ttlMs) {
      return cached.result;
    }
    if (this.#contentInFlight !== null) {
      return this.#contentInFlight;
    }

    const request = this.#executeContent()
      .then((result) => {
        this.#contentCached = { result, loadedAt: this.#now() };
        return result;
      })
      .finally(() => {
        this.#contentInFlight = null;
      });

    this.#contentInFlight = request;
    return request;
  }

  /* ---- Shopify-owned catalog reads ------------------------------------- */

  async listProducts(): Promise<readonly Product[]> {
    return this.#loadCatalog();
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

  /**
   * One page of a collection, read live.
   *
   * The shopper's filters, order and cursor become query variables, so the
   * store does the narrowing and returns the facets it offers for the result.
   * Nothing here decides what a filter means.
   */
  async getCollectionPage(
    handle: string,
    query: CollectionProductsQuery = {},
  ): Promise<CollectionProductsPage | null> {
    const { sortKey, reverse } = collectionSortArguments(
      query.sort ?? "featured",
    );
    const pageBy = query.pageBy ?? COLLECTION_PAGE_SIZE;
    /* A start cursor reads backwards, which Shopify expresses as `last`. */
    const backwards = query.before !== undefined;
    return mapCollectionProductsResult(
      await this.#executeCollection({
        handle,
        filters: query.filters ?? [],
        sortKey,
        reverse,
        ...(backwards
          ? { last: pageBy, startCursor: query.before }
          : { first: pageBy, endCursor: query.after }),
      }),
    );
  }

  async getProductsPage(
    query: CollectionProductsQuery = {},
  ): Promise<CollectionProductsPage> {
    const { sortKey, reverse } = catalogSortArguments(query.sort ?? "featured");
    const pageBy = query.pageBy ?? COLLECTION_PAGE_SIZE;
    const backwards = query.before !== undefined;
    return mapAllProductsResult(
      await this.#executeAllProducts({
        sortKey,
        reverse,
        ...(backwards
          ? { last: pageBy, startCursor: query.before }
          : { first: pageBy, endCursor: query.after }),
      }),
    );
  }

  /** The store's own menus: the primary menu and the footer columns. */
  async getNavigation(): Promise<SiteNavigation> {
    const result = await this.#executeNavigation();
    return {
      primary: mapMainMenuResult(
        result,
        this.#storeDomain,
        this.#mainMenuHandle,
      ),
      footerColumns: mapFooterMenuResult(result, this.#storeDomain),
    };
  }

  /* ---- Shopify-owned content reads ------------------------------------- */

  async listArticles(): Promise<readonly JournalArticle[]> {
    return (await this.#loadContent()).articles;
  }

  async getArticle(handle: string): Promise<JournalArticle | null> {
    const { articles } = await this.#loadContent();
    return articles.find((article) => article.handle === handle) ?? null;
  }

  async listPages(): Promise<readonly StorePage[]> {
    return (await this.#loadContent()).pages;
  }

  async getPage(handle: string): Promise<StorePage | null> {
    const { pages } = await this.#loadContent();
    return pages.find((page) => page.handle === handle) ?? null;
  }

  async listPolicies(): Promise<readonly Policy[]> {
    return (await this.#loadContent()).policies;
  }

  async getPolicy(handle: string): Promise<Policy | null> {
    const { policies } = await this.#loadContent();
    return policies.find((policy) => policy.handle === handle) ?? null;
  }
}
