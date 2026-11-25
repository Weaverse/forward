/**
 * The single route gate for Forward: Shopify's own routes first, then markets,
 * then the account boundary.
 *
 * `handleShopifyRoutes` answers the routes Hydrogen owns (`/.well-known/ucp`,
 * `/checkout`, `/cart.js`, the Storefront API proxy under `/api`, `?variant=`
 * product links…) before Next routes anything, and passes every other request
 * through. Route handlers under `/api` and files are never localized.
 *
 * Next runs `proxy.ts` before App Router routing. Every rendered route lives in
 * `app/[locale]/`, and the default locale never appears in a URL:
 * `/en-us/*` redirects to the unprefixed path, a known non-default prefix is
 * served as it is, and everything else is rewritten under `/en-us`. The locale
 * of the page is recorded in a cookie for request handlers that serve no page
 * of their own, like the cart endpoint.
 *
 * The account boundary is unchanged and matches on the locale-free path. When
 * the account tuple is absent every account request receives the same generic
 * no-store 404 and exposes no auth affordance. When configured, only the four
 * unprefixed protocol paths enter Hydrogen's handler group; ordinary account
 * pages continue to their route with personalized response headers.
 */

import {
  createShopifyRequestContext,
  handleShopifyRoutes,
  type ShopifyRequestContext,
  type StorefrontClient,
} from "@shopify/hydrogen";
import { type NextRequest, NextResponse } from "next/server";
import {
  CUSTOMER_ACCOUNT_AUTHORIZE_PATH,
  CUSTOMER_ACCOUNT_LOGIN_PATH,
  CUSTOMER_ACCOUNT_LOGOUT_PATH,
  CUSTOMER_ACCOUNT_REFRESH_PATH,
  getCustomerAccountRuntime,
  POST_LOGOUT_REDIRECT_URI,
} from "@/lib/account/customer-account";
import { createCustomerAccountSessionManager } from "@/lib/account/session-manager";
import { type LocaleRoute, resolveLocaleRoute } from "@/lib/i18n/locale-route";
import {
  LOCALE_COOKIE,
  type LocaleI18n,
  type LocaleId,
  localeFromCookieHeader,
  localeI18n,
  localizePath,
  splitLocale,
} from "@/lib/i18n/locales";
import { SHOPIFY_I18N } from "@/lib/i18n/shopify-i18n";
import {
  createShopifyRouteContext,
  ROUTE_TEMPLATES,
  STOREFRONT_URL_HEADER,
} from "@/lib/routes/shopify-routes";
import { applyContentSecurityPolicy } from "@/lib/security/content-security-policy";

const CUSTOMER_ACCOUNT_PROTOCOL_METHODS = new Map<string, string>([
  [CUSTOMER_ACCOUNT_LOGIN_PATH, "GET"],
  [CUSTOMER_ACCOUNT_AUTHORIZE_PATH, "GET"],
  [CUSTOMER_ACCOUNT_REFRESH_PATH, "GET"],
  [CUSTOMER_ACCOUNT_LOGOUT_PATH, "POST"],
]);
const LOCALE_REWRITE_HEADER = "x-forward-locale-rewrite";
const ACCOUNT_PRIVATE_NO_STORE =
  "private, no-store, max-age=0, must-revalidate";

/** Generic failure. Never carries provider, GraphQL, or session detail. */
function accountUnavailableResponse(): Response {
  return new Response("Account service is temporarily unavailable.", {
    status: 500,
    headers: {
      "cache-control": "no-store",
      "content-type": "text/plain; charset=utf-8",
    },
  });
}

function accountDisabledResponse(): Response {
  return new Response(
    "<!doctype html><title>Not Found</title><h1>Not Found</h1>",
    {
      status: 404,
      headers: {
        "cache-control": "no-store",
        "content-type": "text/html; charset=utf-8",
      },
    },
  );
}

function accountMethodNotAllowedResponse(allowedMethod: string): Response {
  return new Response("Method Not Allowed", {
    status: 405,
    headers: {
      allow: allowedMethod,
      "cache-control": ACCOUNT_PRIVATE_NO_STORE,
      "content-type": "text/plain; charset=utf-8",
    },
  });
}

function canonicalAccountProtocolRequest(
  request: NextRequest,
  storefrontOrigin: string,
): Request {
  const incoming = new URL(request.url);
  const canonicalUrl = new URL(
    `${incoming.pathname}${incoming.search}`,
    storefrontOrigin,
  );
  return new Request(canonicalUrl, request);
}

function hardenAccountProtocolResponse(response: Response): Response {
  const mutable = new Response(response.body, response);
  if (!mutable.headers.has("cache-control")) {
    mutable.headers.set("cache-control", ACCOUNT_PRIVATE_NO_STORE);
  }
  for (const header of [
    "cdn-cache-control",
    "cloudflare-cdn-cache-control",
    "surrogate-control",
    "vercel-cdn-cache-control",
  ]) {
    mutable.headers.delete(header);
  }
  return mutable;
}

/**
 * The protocol routes' Storefront client, carrying the exact request context
 * `handleShopifyRoutes` runs with. Sign-in, refresh and sign-out update the
 * cart's buyer identity through it. Without catalog credentials there is no
 * cart to sync: an inert carrier keeps the four-key account boundary working
 * on its own, and any package access beyond `requestContext` fails (the cart
 * sync logs it) instead of inventing or reusing a Storefront token.
 */
function createAccountStorefrontContext(
  request: Request,
  locale: LocaleI18n,
): {
  requestContext: ShopifyRequestContext;
  storefrontClient: StorefrontClient;
} {
  const shopify = createShopifyRouteContext(request, process.env, locale);
  if (shopify !== null) {
    return shopify;
  }
  const requestContext = createShopifyRequestContext({
    request,
    i18n: SHOPIFY_I18N,
    locale,
  });
  return {
    requestContext,
    storefrontClient: Object.freeze({
      requestContext,
    }) as unknown as StorefrontClient,
  };
}

/** The response that sends a page request on to its locale's route. */
function routeResponse(
  request: NextRequest,
  route: Exclude<LocaleRoute, { kind: "redirect" }>,
): NextResponse {
  const headers = new Headers(request.headers);
  /* A policy the shopper sends must never supply the nonce Next renders with. */
  headers.delete("content-security-policy");
  headers.delete("content-security-policy-report-only");
  /* The URL the shopper asked for, for `not-found`'s Shopify redirects. A
   * request this proxy rewrote comes back without its `/en-us` prefix. */
  const storefrontUrl = request.nextUrl.clone();
  if (request.headers.has(LOCALE_REWRITE_HEADER)) {
    storefrontUrl.pathname = route.path;
  }
  headers.set(STOREFRONT_URL_HEADER, storefrontUrl.toString());
  if (route.kind === "serve") {
    return NextResponse.next({ request: { headers } });
  }
  const url = request.nextUrl.clone();
  url.pathname = route.target;
  /* Next can hand the rewritten request back through the proxy. The marker
   * tells that pass the `/en-us` prefix is ours, not the shopper's. */
  headers.set(LOCALE_REWRITE_HEADER, route.locale);
  return NextResponse.rewrite(url, { request: { headers } });
}

/**
 * A request for a page the shopper has not opened: Next prefetching a link
 * (the country selector prefetches every market), or a browser prefetch.
 */
function isPrefetch(request: NextRequest): boolean {
  return (
    request.headers.has("next-router-prefetch") ||
    request.headers.get("sec-purpose")?.includes("prefetch") === true ||
    request.headers.get("purpose") === "prefetch"
  );
}

/** Records the page's market for handlers that serve no page of their own. */
function rememberLocale(
  request: NextRequest,
  response: NextResponse,
  locale: LocaleId,
): NextResponse {
  if (
    !isPrefetch(request) &&
    request.cookies.get(LOCALE_COOKIE)?.value !== locale
  ) {
    response.cookies.set(LOCALE_COOKIE, locale, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
  return response;
}

function personalizedAccountPageResponse(
  request: NextRequest,
  route: Exclude<LocaleRoute, { kind: "redirect" }>,
): Response {
  const requestContext = createShopifyRequestContext({
    request,
    i18n: SHOPIFY_I18N,
    locale: localeI18n(route.locale),
  });
  requestContext.markResponseAsPersonalized("customer-account-page");
  const response = rememberLocale(
    request,
    routeResponse(request, route),
    route.locale,
  );
  requestContext.applyResponseHeaders(response.headers);
  applyContentSecurityPolicy(request, response.headers);
  return response;
}

/**
 * Where Shopify lands every sign-out: on to the home page of the market the
 * shopper last browsed. Answered here, so the shopper never sees this page.
 */
function signedOutResponse(
  request: NextRequest,
  storefrontOrigin: string,
): Response {
  const home = localizePath(
    "/",
    localeFromCookieHeader(request.headers.get("cookie")),
  );
  return new Response(null, {
    status: 303,
    headers: {
      location: new URL(home, storefrontOrigin).toString(),
      "cache-control": ACCOUNT_PRIVATE_NO_STORE,
    },
  });
}

function isAccountPath(path: string): boolean {
  return path === "/account" || path.startsWith("/account/");
}

/** The route for this request; a request this proxy rewrote is served as is. */
function requestRoute(request: NextRequest): LocaleRoute {
  const { pathname } = request.nextUrl;
  if (request.headers.has(LOCALE_REWRITE_HEADER)) {
    const { locale, path } = splitLocale(pathname);
    if (locale !== null) {
      return { kind: "serve", locale, path };
    }
  }
  return resolveLocaleRoute(pathname);
}

/** A page, as opposed to a build asset, a route handler or a file. */
function isPagePath(pathname: string): boolean {
  return !/^\/(?:_next|api)\/|\.[^/]+$/.test(pathname);
}

/**
 * Shopify's response for a route Hydrogen owns, or `null`. A request this
 * proxy already rewrote has been through here once, and the account paths
 * belong to the account boundary below.
 */
function shopifyRoute(request: NextRequest): Promise<Response> | null {
  if (
    request.headers.has(LOCALE_REWRITE_HEADER) ||
    isAccountPath(splitLocale(request.nextUrl.pathname).path)
  ) {
    return null;
  }
  const context = createShopifyRouteContext(request);
  if (context === null) {
    return null;
  }
  return handleShopifyRoutes({
    request,
    requestContext: context.requestContext,
    storefrontClient: context.storefrontClient,
    routeTemplates: ROUTE_TEMPLATES,
  });
}

export async function proxy(request: NextRequest): Promise<Response> {
  const shopify = shopifyRoute(request);
  if (shopify !== null) {
    return shopify;
  }
  if (!isPagePath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  const route = requestRoute(request);
  if (route.kind === "redirect") {
    const url = request.nextUrl.clone();
    url.pathname = route.path;
    return NextResponse.redirect(url, 308);
  }
  if (!isAccountPath(route.path)) {
    const response = rememberLocale(
      request,
      routeResponse(request, route),
      route.locale,
    );
    applyContentSecurityPolicy(request, response.headers);
    return response;
  }

  try {
    const runtime = getCustomerAccountRuntime();
    if (runtime === null) {
      return accountDisabledResponse();
    }
    if (route.kind === "rewrite" && route.path === POST_LOGOUT_REDIRECT_URI) {
      return signedOutResponse(request, runtime.config.storefrontOrigin);
    }
    /* Protocol paths are answered only where Shopify redirects to them:
     * unprefixed. A prefixed copy is an ordinary (missing) account page. */
    const expectedMethod =
      route.kind === "rewrite"
        ? CUSTOMER_ACCOUNT_PROTOCOL_METHODS.get(route.path)
        : undefined;
    if (expectedMethod === undefined) {
      return personalizedAccountPageResponse(request, route);
    }
    if (request.method !== expectedMethod) {
      return accountMethodNotAllowedResponse(expectedMethod);
    }

    const protocolRequest = canonicalAccountProtocolRequest(
      request,
      runtime.config.storefrontOrigin,
    );
    const { requestContext, storefrontClient } = createAccountStorefrontContext(
      protocolRequest,
      /* The market of the page the shopper signed in from. */
      localeI18n(localeFromCookieHeader(request.headers.get("cookie"))),
    );
    const sessionManager = await createCustomerAccountSessionManager({
      config: runtime.config,
      cookieHeader: request.headers.get("cookie"),
    });

    const shopifyRoute = await handleShopifyRoutes({
      request: protocolRequest,
      requestContext,
      sessionManager,
      storefrontClient,
      handlers: [runtime.handlers],
    });
    return hardenAccountProtocolResponse(
      shopifyRoute ?? accountUnavailableResponse(),
    );
  } catch {
    return accountUnavailableResponse();
  }
}

/**
 * Every request but Next's own build output, as Shopify's Next.js guide asks:
 * Hydrogen's routes include `/api/{version}/graphql.json` and `/cart.js`.
 * Only page paths are localized.
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|_next/data).*)"],
};
