/**
 * StaticStorefrontDataSource — the replaceable seam between static fixture
 * records and route composition.
 *
 * Routes and visual components must consume storefront data exclusively
 * through the `storefront` instance exported here. A later Shopify adapter
 * implements `StorefrontDataSource` one domain at a time (products first,
 * then collections, and so on) without touching page composition. Methods are
 * async for exactly that reason, even though the static implementation
 * resolves synchronously.
 *
 * Unknown handles resolve to `null`; routes translate that into `notFound()`
 * rather than inventing content.
 */

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

function sortProducts(
  products: readonly Product[],
  sort: ProductSort,
): readonly Product[] {
  if (sort === "featured") {
    return products;
  }
  const sorted = [...products];
  switch (sort) {
    case "price-asc":
      sorted.sort((a, b) => a.price.amount - b.price.amount);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.price.amount - a.price.amount);
      break;
    case "name":
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;
  }
  return sorted;
}

function matchesFilter(product: Product, filter: ProductListFilter): boolean {
  if (filter.category !== undefined && product.category !== filter.category) {
    return false;
  }
  if (
    filter.activity !== undefined &&
    !product.activities.includes(filter.activity)
  ) {
    return false;
  }
  return true;
}

function searchableText(product: Product): string {
  return [
    product.title,
    product.subtitle,
    product.description,
    product.category,
    ...product.activities,
    ...product.colorways.map((entry) => entry.name),
  ]
    .join(" ")
    .toLowerCase();
}

class StaticStorefrontDataSource implements StorefrontDataSource {
  async listProducts(
    filter: ProductListFilter = {},
    sort: ProductSort = "featured",
  ): Promise<readonly Product[]> {
    const filtered = PRODUCT_FIXTURES.filter((product) =>
      matchesFilter(product, filter),
    );
    return sortProducts(filtered, sort);
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
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) {
      return [];
    }
    return PRODUCT_FIXTURES.filter((product) => {
      const haystack = searchableText(product);
      return terms.every((term) => haystack.includes(term));
    });
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

/** The storefront data source used by all routes in the static demo. */
export const storefront: StorefrontDataSource =
  new StaticStorefrontDataSource();
