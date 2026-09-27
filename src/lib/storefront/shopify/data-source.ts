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
import { catalogSortArguments, collectionSortArguments } from "../sort";
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
  /** Static implementation backing every not-yet-live domain. */
  base: StorefrontDataSource;
  execute: CatalogQueryExecutor;
  /** Absent in unit tests that only exercise the whole-catalog read. */
  executeCollection?: CollectionQueryExecutor;
  executeAllProducts?: AllProductsQueryExecutor;
  executeContent?: ContentQueryExecutor;
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
  readonly #base: StorefrontDataSource;
  readonly #execute: CatalogQueryExecutor;
  readonly #executeCollection: CollectionQueryExecutor | null;
  readonly #executeAllProducts: AllProductsQueryExecutor | null;
  readonly #executeContent: ContentQueryExecutor | null;
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
    this.#base = options.base;
    this.#execute = options.execute;
    this.#executeCollection = options.executeCollection ?? null;
    this.#executeAllProducts = options.executeAllProducts ?? null;
    this.#executeContent = options.executeContent ?? null;
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

  async #loadContent(): Promise<MappedContentResult | null> {
    if (this.#executeContent === null) {
      return null;
    }
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
    filter: ProductListFilter = {},
    sort: ProductSort = "featured",
  ): Promise<readonly Product[] | null> {
    const collection = await this.getCollection(handle);
    if (collection === null) {
      return null;
    }
    const catalog = await this.#loadCatalog();
    const products = collection.productHandles.map((productHandle) => {
      const product = catalog.find((entry) => entry.handle === productHandle);
      if (product === undefined) {
        throw new ShopifyCatalogError(
          `Collection "${handle}" references product "${productHandle}", which the live catalog did not return.`,
        );
      }
      return product;
    });
    /* The same normalized narrowing `/shop` runs, so a collection filtered
     * live cannot drift from one filtered against fixtures. */
    return filterAndSortProducts(products, filter, sort);
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
    if (this.#executeCollection === null) {
      return this.#base.getCollectionPage(handle, query);
    }
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
    if (this.#executeAllProducts === null) {
      return this.#base.getProductsPage(query);
    }
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

  /**
   * The store's own menus. Search and the utility links are the theme's own
   * destinations rather than menu entries, so they come from the theme.
   */
  async getNavigation(): Promise<SiteNavigation> {
    const [theme, result] = await Promise.all([
      this.#base.getNavigation(),
      this.#executeNavigation(),
    ]);
    return {
      primary: [
        ...mapMainMenuResult(result, this.#storeDomain, this.#mainMenuHandle),
        ...theme.primary.filter((item) => item.href === "/search"),
      ],
      utility: theme.utility,
      footerColumns: mapFooterMenuResult(result, this.#storeDomain),
    };
  }

  /* ---- Shopify-owned content reads ------------------------------------- */

  async listArticles(): Promise<readonly JournalArticle[]> {
    const content = await this.#loadContent();
    return content === null ? this.#base.listArticles() : content.articles;
  }

  async getArticle(handle: string): Promise<JournalArticle | null> {
    const content = await this.#loadContent();
    return (
      (content === null
        ? null
        : content.articles.find((article) => article.handle === handle)) ??
      (content === null ? this.#base.getArticle(handle) : null)
    );
  }

  async listPages(): Promise<readonly StorePage[]> {
    const content = await this.#loadContent();
    return content === null ? this.#base.listPages() : content.pages;
  }

  async getPage(handle: string): Promise<StorePage | null> {
    const content = await this.#loadContent();
    return (
      (content === null
        ? null
        : content.pages.find((page) => page.handle === handle)) ??
      (content === null ? this.#base.getPage(handle) : null)
    );
  }

  async listPolicies(): Promise<readonly Policy[]> {
    const content = await this.#loadContent();
    return content === null ? this.#base.listPolicies() : content.policies;
  }

  async getPolicy(handle: string): Promise<Policy | null> {
    const content = await this.#loadContent();
    return (
      (content === null
        ? null
        : content.policies.find((policy) => policy.handle === handle)) ??
      (content === null ? this.#base.getPolicy(handle) : null)
    );
  }

  async getThemeContent(): Promise<ThemeContent> {
    return {
      ...(await this.#base.getThemeContent()),
      demoNotice:
        "Forward uses a live Shopify catalog, navigation, content, and a secure Shopify cart. Checkout is handed off to Shopify.",
      /* Live mode has no shopper-facing status to report; the empty string
       * removes the build-state placeholder from the footer rail entirely. */
      footerStatus: "",
    };
  }

  async getDemoCartSeed(): Promise<readonly DemoCartSeedLine[]> {
    return this.#base.getDemoCartSeed();
  }
}
