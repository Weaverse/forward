import type { MetadataRoute } from "next";

import { CANONICAL_ROUTES } from "@/lib/routes/route-contract";
import { SITE_BASE_URL } from "@/lib/routes/site";
import { getStorefront } from "@/lib/storefront/data-source";

const INDEXABLE_CATEGORIES = new Set([
  "storefront",
  "commerce",
  "editorial",
  "content",
]);

function toUrl(path: string): string {
  return `${SITE_BASE_URL}${path === "/" ? "" : path}`;
}

/**
 * The default market only, on purpose. A non-default market's URL for a
 * product or collection is not the default handle with a prefix: Shopify
 * localizes handles and can leave a resource unpublished in a market, so
 * multiplying these entries per market would advertise pages that redirect or
 * do not exist. The pages themselves carry their canonical and, where the path
 * is market-invariant, their `hreflang` alternates.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections, articles, pages, policies] = await Promise.all([
    getStorefront().listProducts(),
    getStorefront().listCollections(),
    getStorefront().listArticles(),
    getStorefront().listPages(),
    getStorefront().listPolicies(),
  ]);

  const staticEntries = CANONICAL_ROUTES.filter(
    (route) =>
      !route.pattern.includes("[") &&
      INDEXABLE_CATEGORIES.has(route.category) &&
      route.pattern !== "/cart" &&
      route.pattern !== "/search",
  ).map((route) => ({
    url: toUrl(route.pattern),
    changeFrequency: "weekly" as const,
    priority: route.pattern === "/" ? 1 : 0.7,
  }));

  const dynamicEntries = [
    ...products.map((product) => `/products/${product.handle}`),
    ...collections.map((collection) => `/shop/${collection.handle}`),
    ...articles.map((article) => `/journal/${article.handle}`),
    ...pages.map((page) => `/pages/${page.handle}`),
    ...policies.map((policy) => `/policies/${policy.handle}`),
  ].map((path) => ({
    url: toUrl(path),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...dynamicEntries];
}
