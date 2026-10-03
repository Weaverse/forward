import type { Metadata } from "next";

import {
  DEFAULT_LOCALE,
  LOCALE_IDS,
  type LocaleId,
  localeTag,
  localizePath,
} from "./locales";

/**
 * Paths that are the same page in every market: route-contract paths with no
 * handle, so nothing about them is per-market data.
 *
 * Everything else gets a canonical and no `hreflang`. A product, collection,
 * article, page, policy or Weaverse custom page is addressed by a handle, and
 * Shopify localizes handles and can leave a resource unpublished in a
 * market, so swapping the prefix onto one handle may name a page that
 * redirects or does not exist. A wrong `hreflang` tells a search engine a page
 * exists where it does not, which is worse than none.
 */
const MARKET_INVARIANT_PATHS = new Set(["/", "/shop", "/journal"]);

/**
 * Next `alternates` for an unprefixed route path in the current market: a
 * self-canonical always, and every market plus `x-default` only on the
 * market-invariant allowlist. The query string is never part of it, so facet
 * and sort permutations share their page's canonical.
 *
 * URLs are root-relative; Next resolves them against the deployment's own
 * origin, so no domain is hardcoded here.
 */
export function marketAlternates(
  path: string,
  locale: LocaleId,
): NonNullable<Metadata["alternates"]> {
  const canonical = localizePath(path, locale);
  if (!MARKET_INVARIANT_PATHS.has(path)) {
    return { canonical };
  }
  return {
    canonical,
    languages: {
      ...Object.fromEntries(
        LOCALE_IDS.map((id) => [localeTag(id), localizePath(path, id)]),
      ),
      "x-default": localizePath(path, DEFAULT_LOCALE),
    },
  };
}
