import {
  createCartServerHandlers,
  createShopifyRequestContext,
  createStorefrontClient,
  getCartId,
  gql,
} from "@shopify/hydrogen";
import {
  type LocaleId,
  localeFromCookieHeader,
  localeFromReferer,
  localeI18n,
} from "@/lib/i18n/locales";
import { SHOPIFY_I18N } from "@/lib/i18n/shopify-i18n";

import {
  type EnvSource,
  readShopifyCatalogConfig,
} from "@/lib/storefront/shopify/env";

import {
  hardenCartResponseHeaders,
  type RuntimeEnvironment,
  readTrustedBuyerIp,
  sanitizeCartHandlerResult,
} from "./shopify-cart-server";

export const shopifyCartHandlers = createCartServerHandlers();
export type ShopifyCartData = Awaited<
  ReturnType<typeof shopifyCartHandlers.get>
>["data"];

export function runtimeEnvironment(
  value: string | undefined,
): RuntimeEnvironment {
  if (value === "production" || value === "test") return value;
  return "development";
}

const CART_COUNTRY_QUERY = gql(`
  query ForwardCartCountry($id: ID!) {
    cart(id: $id) {
      buyerIdentity {
        countryCode
      }
    }
  }
`);

const CART_COUNTRY_UPDATE_MUTATION = gql(`
  mutation ForwardCartCountryUpdate($cartId: ID!, $countryCode: CountryCode!) {
    cartBuyerIdentityUpdate(
      cartId: $cartId
      buyerIdentity: { countryCode: $countryCode }
    ) {
      userErrors {
        message
      }
    }
  }
`);

/**
 * The market a cart request runs in: the route's locale when the caller knows
 * it, else the page that sent the request, else the locale cookie (requests
 * with no same-origin `Referer`, such as a return from Shopify's login).
 */
function cartMarket(request: Request, locale: LocaleId | undefined): LocaleId {
  return (
    locale ??
    localeFromReferer(request) ??
    localeFromCookieHeader(request.headers.get("cookie"))
  );
}

function createCartRequestContext(
  request: Request,
  source: EnvSource,
  locale?: LocaleId,
) {
  const config = readShopifyCatalogConfig(source);
  const environment = runtimeEnvironment(source.NODE_ENV);
  const buyerIp = readTrustedBuyerIp(request.headers, environment);
  const requestContext = createShopifyRequestContext({
    request,
    i18n: SHOPIFY_I18N,
    locale: localeI18n(cartMarket(request, locale)),
    buyerIp,
  });
  const storefrontClient = createStorefrontClient({
    type: "private",
    requestContext,
    config: {
      storeDomain: config.storeDomain,
      privateStorefrontToken: config.privateStorefrontToken,
    },
  });
  return { config, environment, requestContext, storefrontClient };
}

// ponytail: one extra cart read per request; cache the synced country in a cookie if it shows up in latency.
/**
 * Moves an existing cart into the shopper's current market.
 *
 * Shopify prices a cart in its buyer identity's country and never re-prices it
 * from `@inContext`, so a cart created on `/` stays in USD on `/de-de` until
 * its country changes.
 */
async function syncCartCountry(
  request: Request,
  context: ReturnType<typeof createCartRequestContext>,
): Promise<void> {
  const cartId = getCartId(request);
  if (cartId === null) {
    return;
  }
  const { data } = await context.storefrontClient.graphql(CART_COUNTRY_QUERY, {
    variables: { id: cartId },
  });
  const current = data?.cart?.buyerIdentity?.countryCode;
  const { country } = context.requestContext.locale;
  if (current === undefined || current === country) {
    return;
  }
  await context.storefrontClient.graphql(CART_COUNTRY_UPDATE_MUTATION, {
    variables: { cartId, countryCode: country },
  });
}

function cartResultResponse(
  result: Awaited<ReturnType<typeof shopifyCartHandlers.post>>,
  context: ReturnType<typeof createCartRequestContext>,
): Response {
  const sanitized = sanitizeCartHandlerResult(
    result,
    context.config.storeDomain,
  );
  const responseHeaders = new Headers(sanitized.headers);
  context.requestContext.applyResponseHeaders(responseHeaders);
  const headers = hardenCartResponseHeaders(
    responseHeaders,
    context.environment,
  );

  if (sanitized.type === "json") {
    return Response.json(sanitized.data, { status: 200, headers });
  }
  if (sanitized.type === "redirect") {
    headers.set("location", sanitized.location);
    return new Response(null, { status: 303, headers });
  }
  return Response.json(
    { error: sanitized.error },
    { status: sanitized.status ?? 400, headers },
  );
}

/** Reads the cart for a page render; `locale` is the page's route locale. */
export async function readShopifyCart(
  request: Request,
  locale: LocaleId,
  source: EnvSource = process.env,
): Promise<ShopifyCartData> {
  const context = createCartRequestContext(request, source, locale);
  await syncCartCountry(request, context);
  const result = await shopifyCartHandlers.get({
    request,
    storefrontClient: context.storefrontClient,
  });
  const sanitized = sanitizeCartHandlerResult(
    result,
    context.config.storeDomain,
  );
  return sanitized.data;
}

export async function handleShopifyCartRequest(
  request: Request,
  source: EnvSource = process.env,
): Promise<Response> {
  try {
    const context = createCartRequestContext(request, source);
    if (request.method === "GET" || request.method === "POST") {
      await syncCartCountry(request, context);
    }
    if (request.method === "GET") {
      const result = await shopifyCartHandlers.get({
        request,
        storefrontClient: context.storefrontClient,
      });
      return cartResultResponse(result, context);
    }
    if (request.method === "POST") {
      const result = await shopifyCartHandlers.post({
        request,
        storefrontClient: context.storefrontClient,
      });
      return cartResultResponse(result, context);
    }
    return new Response(null, {
      status: 405,
      headers: {
        allow: "GET, POST",
        "cache-control": "private, no-store, max-age=0",
      },
    });
  } catch {
    return Response.json(
      {
        error: {
          code: "cart_unavailable",
          message: "Cart is temporarily unavailable.",
        },
      },
      {
        status: 502,
        headers: hardenCartResponseHeaders(
          new Headers(),
          runtimeEnvironment(source.NODE_ENV),
        ),
      },
    );
  }
}
