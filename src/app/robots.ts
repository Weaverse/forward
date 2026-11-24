import type { MetadataRoute } from "next";

import { DEFAULT_LOCALE, LOCALE_IDS } from "@/lib/i18n/locales";
import { siteBaseUrl } from "@/lib/routes/site";

/** Buyer-specific and thin pages, under every market's prefix. */
const PAGE_PATHS = ["/cart", "/account", "/search"];

/**
 * Sorted and multi-facet browse URLs duplicate the page they narrow. A single
 * facet stays crawlable as a landing page; canonicals handle the rest.
 * Forward's facets are `filter.*` params plus `price-min`/`price-max`.
 */
const BROWSE_PATTERNS = [
  "/shop*sort=",
  "/shop*filter.*filter.",
  "/shop*filter.*price-m",
  "/shop*price-m*filter.",
  "/shop*price-m*price-m",
];

/** Every market's copy of a path: unprefixed, then `/de-de/cart`… */
function inEveryMarket(paths: readonly string[]): string[] {
  const prefixes = [
    "",
    ...LOCALE_IDS.filter((id) => id !== DEFAULT_LOCALE).map((id) => `/${id}`),
  ];
  return prefixes.flatMap((prefix) => paths.map((path) => `${prefix}${path}`));
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          /* Hydrogen's handlers: the admin redirect, checkout handoffs, the
           * API and Storefront proxies. `/.well-known/` stays reachable. */
          "/admin",
          "/checkout",
          "/buy/",
          "/api/",
          "/__shopify",
          ...inEveryMarket([...PAGE_PATHS, ...BROWSE_PATTERNS]),
        ],
      },
      {
        /* AdsBot ignores the `*` group and must reach ad landing pages,
         * which can be sorted or filtered. */
        userAgent: "adsbot-google",
        disallow: ["/checkout", ...inEveryMarket(PAGE_PATHS)],
      },
    ],
    sitemap: `${siteBaseUrl()}/sitemap.xml`,
  };
}
