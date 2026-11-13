import type { MetadataRoute } from "next";

import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { CANONICAL_ROUTES } from "@/lib/routes/route-contract";
import { siteBaseUrl } from "@/lib/routes/site";
import { getStorefront } from "@/lib/storefront/data-source";
import { fetchWeaverseCustomPages } from "@/lib/weaverse/server";

const INDEXABLE_CATEGORIES = new Set([
  "storefront",
  "commerce",
  "editorial",
  "content",
]);

function toUrl(path: string): string {
  return `${siteBaseUrl()}${path === "/" ? "" : path}`;
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
  const [products, collections, blogs, articles, pages, policies, customPages] =
    await Promise.all([
      getStorefront().listProducts(),
      getStorefront().listCollections(),
      getStorefront().listBlogs(),
      getStorefront().listArticles(),
      getStorefront().listPages(),
      getStorefront().listPolicies(),
      fetchWeaverseCustomPages(),
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
    /* `/journal` is a composed custom page the theme ships, so the static
     * routes above no longer list it. */
    "/journal",
    ...blogs.map((blog) => `/archive/${blog.handle}`),
    ...articles.map((article) => `/journal/${article.handle}`),
    ...pages.map((page) => `/pages/${page.handle}`),
    ...policies.map((policy) => `/policies/${policy.handle}`),
  ].map((path) => ({
    url: toUrl(path),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  /* Weaverse custom pages for the default market: unassigned (`null`) or
   * assigned to it. The default market is unprefixed, so the path is the bare
   * handle. A page a route above already lists (`/journal`) is not repeated.
   * The endpoint does not guarantee publication state yet (pending API
   * contract, Weaverse/docs#151), so a draft assignment can appear here. */
  const listed = new Set(
    [...staticEntries, ...dynamicEntries].map((entry) => entry.url),
  );
  const customEntries = customPages
    .filter(
      (page) =>
        page.locale === null || page.locale.toLowerCase() === DEFAULT_LOCALE,
    )
    .map((page) => ({
      url: toUrl(`/${page.handle}`),
      lastModified: page.lastModified,
      changeFrequency: page.changeFrequency ?? ("weekly" as const),
      priority: page.priority ?? 0.7,
    }))
    .filter((entry) => {
      if (listed.has(entry.url)) {
        return false;
      }
      listed.add(entry.url);
      return true;
    });

  return [...staticEntries, ...dynamicEntries, ...customEntries];
}
