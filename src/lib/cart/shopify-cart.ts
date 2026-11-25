import {
  createCartServerHandlers,
  createShopifyRequestContext,
  createStorefrontClient,
  getCartId,
  gql,
} from "@shopify/hydrogen";
import { getCustomerAccountRuntime } from "@/lib/account/customer-account";
import { createCustomerAccountSessionManager } from "@/lib/account/session-manager";
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
  withCookieCartIdentity,
} from "./shopify-cart-server";

/** The cart handlers without a customer, for a store without Customer Accounts. */
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
  mutation ForwardCartCountryUpdate(
    $cartId: ID!
    $buyerIdentity: CartBuyerIdentityInput!
  ) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
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

/** The customer session a cart request reads, or `null` without Customer Accounts. */
async function cartCustomer(request: Request, source: EnvSource) {
  const account = getCustomerAccountRuntime(source);
  if (account === null) {
    return null;
  }
  return {
    account,
    sessionManager: await createCustomerAccountSessionManager({
      config: account.config,
      cookieHeader: request.headers.get("cookie"),
    }),
  };
}
type CartCustomer = Awaited<ReturnType<typeof cartCustomer>>;

/**
 * The customer token for the cart's buyer identity: the signed-in customer's,
 * `null` once the session has ended (signed out, or a refresh Shopify
 * rejected) so the customer is detached, and `undefined` while that can't be
 * told (no Customer Accounts, or a token that is expired but may still
 * refresh) so the customer is left alone.
 *
 * `refresh` may write refreshed tokens to the session; only a caller that
 * commits the session to its response passes it.
 */
async function cartCustomerAccessToken(
  customer: CartCustomer,
  context: ReturnType<typeof createCartRequestContext>,
  refresh: boolean,
): Promise<string | null | undefined> {
  if (customer === null) {
    return undefined;
  }
  const { customerSession } = customer.account;
  const { sessionManager } = customer;
  const { requestContext } = context;
  const accessToken = await (
    refresh
      ? customerSession.getOrRefreshAccessToken(sessionManager, requestContext)
      : customerSession.getAccessToken(sessionManager, requestContext)
  ).catch(() => undefined);
  if (accessToken) {
    return accessToken;
  }
  // A session that can still refresh counts as signed in.
  return (await customerSession.isLoggedIn(sessionManager, requestContext))
    ? undefined
    : null;
}

/**
 * Hydrogen's cart handlers and the context to call them with. With Customer
 * Accounts they read the customer session, so a first cart is created with
 * the signed-in customer and a cart read marks the checkout URL
 * `logged_in=true`.
 */
function cartHandlers(
  request: Request,
  customer: CartCustomer,
  context: ReturnType<typeof createCartRequestContext>,
) {
  const handlerContext = {
    request,
    requestContext: context.requestContext,
    storefrontClient: context.storefrontClient,
  };
  if (customer === null) {
    return {
      get: () => shopifyCartHandlers.get(handlerContext),
      post: () => shopifyCartHandlers.post(handlerContext),
    };
  }
  const sessionContext = {
    ...handlerContext,
    sessionManager: customer.sessionManager,
  };
  return {
    get: () => customer.account.cartHandlers.get(sessionContext),
    post: () => customer.account.cartHandlers.post(sessionContext),
  };
}

/** The `Set-Cookie` lines of a session a cart request may have refreshed. */
async function committedSessionCookies(
  customer: CartCustomer,
): Promise<string[]> {
  if (customer === null) {
    return [];
  }
  return new Headers(await customer.sessionManager.commit()).getSetCookie();
}

// ponytail: one extra cart read per request; cache the synced country in a cookie if it shows up in latency.
/**
 * Moves an existing cart into the shopper's current market.
 *
 * Shopify prices a cart in its buyer identity's country and never re-prices it
 * from `@inContext`, so a cart created on `/` stays in USD on `/de-de` until
 * its country changes. The update names the customer too (see
 * `cartCustomerAccessToken`) rather than rely on Shopify keeping it across a
 * country-only buyer identity update.
 */
async function syncCartCountry(
  request: Request,
  customer: CartCustomer,
  context: ReturnType<typeof createCartRequestContext>,
  refresh: boolean,
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
  const customerAccessToken = await cartCustomerAccessToken(
    customer,
    context,
    refresh,
  );
  await context.storefrontClient.graphql(CART_COUNTRY_UPDATE_MUTATION, {
    variables: {
      cartId,
      buyerIdentity:
        customerAccessToken === undefined
          ? { countryCode: country }
          : { countryCode: country, customerAccessToken },
    },
  });
}

function cartResultResponse(
  result: Awaited<ReturnType<typeof shopifyCartHandlers.post>>,
  context: ReturnType<typeof createCartRequestContext>,
  sessionCookies: string[],
): Response {
  const sanitized = sanitizeCartHandlerResult(
    result,
    context.config.storeDomain,
  );
  const responseHeaders = new Headers(sanitized.headers);
  for (const cookie of sessionCookies) {
    responseHeaders.append("set-cookie", cookie);
  }
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

/**
 * Reads the cart for a page render; `locale` is the page's route locale. A
 * page render can't set cookies, so it never refreshes the customer's token.
 */
export async function readShopifyCart(
  request: Request,
  locale: LocaleId,
  source: EnvSource = process.env,
): Promise<ShopifyCartData> {
  const context = createCartRequestContext(request, source, locale);
  const customer = await cartCustomer(request, source);
  await syncCartCountry(request, customer, context, false);
  const result = await cartHandlers(request, customer, context).get();
  const sanitized = sanitizeCartHandlerResult(
    result,
    context.config.storeDomain,
  );
  return sanitized.data;
}

export async function handleShopifyCartRequest(
  incoming: Request,
  source: EnvSource = process.env,
): Promise<Response> {
  if (incoming.method !== "GET" && incoming.method !== "POST") {
    return new Response(null, {
      status: 405,
      headers: {
        allow: "GET, POST",
        "cache-control": "private, no-store, max-age=0",
      },
    });
  }
  let customer: CartCustomer = null;
  let sessionCookies: string[] | undefined;
  try {
    const request = await withCookieCartIdentity(incoming);
    const context = createCartRequestContext(request, source);
    customer = await cartCustomer(request, source);
    // The response commits the session, so a token refreshed here (or by
    // Hydrogen's handler for a first cart) reaches the browser.
    await syncCartCountry(request, customer, context, true);
    const cart = cartHandlers(request, customer, context);
    const result = await (request.method === "GET" ? cart.get() : cart.post());
    sessionCookies = await committedSessionCookies(customer);
    return cartResultResponse(result, context, sessionCookies);
  } catch {
    const headers = new Headers();
    sessionCookies ??= await committedSessionCookies(customer).catch(() => []);
    for (const cookie of sessionCookies) {
      headers.append("set-cookie", cookie);
    }
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
          headers,
          runtimeEnvironment(source.NODE_ENV),
        ),
      },
    );
  }
}
