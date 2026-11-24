/**
 * Shopify-owned routing: the routes Hydrogen answers before Next routes a
 * request (`/.well-known/ucp`, `/checkout`, `/cart.js`, the Storefront API
 * proxy, `?variant=` product links…) and the redirects it answers after Next
 * found nothing (`/admin`, Shopify's default resource paths, the store's URL
 * redirects).
 */

import {
  createShopifyRequestContext,
  createShopifyRouteTemplates,
  createStorefrontClient,
  handleShopifyRedirects,
} from "@shopify/hydrogen";

import { runtimeEnvironment } from "@/lib/cart/shopify-cart";
import { readTrustedBuyerIp } from "@/lib/cart/shopify-cart-server";
import { SHOPIFY_I18N } from "@/lib/i18n/shopify-i18n";
import {
  type EnvSource,
  readShopifyCatalogConfig,
} from "@/lib/storefront/shopify/env";
import { ShopifyConfigurationError } from "@/lib/storefront/shopify/errors";

/**
 * Forward's paths for Shopify's standard routes, wherever they differ from
 * Shopify's own. Products, pages, policies, search and cart keep Shopify's
 * paths. An article lives at `/journal/:articleHandle`, which a template
 * cannot express (it must name the blog), so `/blogs/:blog/:article` keeps
 * its `next.config.ts` redirect.
 */
export const ROUTE_TEMPLATES = createShopifyRouteTemplates({
  collection: "/shop/:collectionHandle",
  collectionList: "/categories",
  blog: "/archive/:blogHandle",
});

/**
 * Carries the URL the shopper asked for to `not-found`, which Next renders
 * under the proxy's rewritten path. The name is Hydrogen's.
 */
export const STOREFRONT_URL_HEADER = "x-storefront-url";

function trustedBuyerIp(headers: Headers, source: EnvSource): string | null {
  try {
    return readTrustedBuyerIp(headers, runtimeEnvironment(source.NODE_ENV));
  } catch {
    return null;
  }
}

/**
 * The request context and Storefront client `handleShopifyRoutes` runs with,
 * or `null` when Shopify is not configured: the proxy is not the
 * configuration gate, and the page the request reaches fails closed itself.
 *
 * A request with no trusted buyer IP gets a client without buyer context, so
 * one missing header degrades the Storefront API proxy instead of the page.
 */
export function createShopifyRouteContext(
  request: Request,
  source: EnvSource = process.env,
) {
  let config: ReturnType<typeof readShopifyCatalogConfig>;
  try {
    config = readShopifyCatalogConfig(source);
  } catch (error) {
    if (error instanceof ShopifyConfigurationError) return null;
    throw error;
  }
  const clientConfig = {
    storeDomain: config.storeDomain,
    privateStorefrontToken: config.privateStorefrontToken,
  };
  const buyerIp = trustedBuyerIp(request.headers, source);
  if (buyerIp === null) {
    const requestContext = createShopifyRequestContext({
      request,
      i18n: SHOPIFY_I18N,
    });
    const storefrontClient = createStorefrontClient({
      type: "private_no_buyer_context",
      requestContext,
      config: clientConfig,
    });
    return { requestContext, storefrontClient };
  }
  const requestContext = createShopifyRequestContext({
    request,
    i18n: SHOPIFY_I18N,
    buyerIp,
  });
  const storefrontClient = createStorefrontClient({
    type: "private",
    requestContext,
    config: clientConfig,
  });
  return { requestContext, storefrontClient };
}

/**
 * Where Shopify would send a URL Forward has no page for, or `null`. A
 * permanent redirect stays permanent.
 */
export async function findShopifyRedirect(
  url: string,
  source: EnvSource = process.env,
): Promise<{ location: string; permanent: boolean } | null> {
  const request = new Request(url);
  const context = createShopifyRouteContext(request, source);
  if (context === null) return null;
  const response = await handleShopifyRedirects({
    request,
    storefrontClient: context.storefrontClient,
    routeTemplates: ROUTE_TEMPLATES,
  });
  const location = response?.headers.get("location");
  if (response == null || location == null) return null;
  return {
    location,
    permanent: response.status === 301 || response.status === 308,
  };
}
