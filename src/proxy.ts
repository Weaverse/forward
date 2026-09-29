/**
 * The single route gate for Forward: markets first, then the account boundary.
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
} from "@/lib/account/customer-account";
import { createCustomerAccountSessionManager } from "@/lib/account/session-manager";
import { type LocaleRoute, resolveLocaleRoute } from "@/lib/i18n/locale-route";
import {
  LOCALE_COOKIE,
  type LocaleId,
  localeFromCookieHeader,
  localeI18n,
} from "@/lib/i18n/locales";

const CUSTOMER_ACCOUNT_PROTOCOL_METHODS = new Map<string, string>([
  [CUSTOMER_ACCOUNT_LOGIN_PATH, "GET"],
  [CUSTOMER_ACCOUNT_AUTHORIZE_PATH, "GET"],
  [CUSTOMER_ACCOUNT_REFRESH_PATH, "GET"],
  [CUSTOMER_ACCOUNT_LOGOUT_PATH, "POST"],
]);
const ACCOUNT_STATUS_PATH = "/account/status";
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
 * `handleShopifyRoutes` requires its Storefront client to carry the exact same
 * request context even though the matched Customer Account handlers never call
 * Storefront API. The matcher is account-only, so this inert carrier keeps the
 * four-key account boundary independent from catalog credentials. Any future
 * package access beyond `requestContext` fails closed instead of inventing or
 * reusing a Storefront token.
 */
function createAccountRouteContextClient(
  requestContext: ShopifyRequestContext,
): StorefrontClient {
  return Object.freeze({ requestContext }) as unknown as StorefrontClient;
}

/** The response that sends a page request on to its locale's route. */
function routeResponse(
  request: NextRequest,
  route: Exclude<LocaleRoute, { kind: "redirect" }>,
): NextResponse {
  if (route.kind === "serve") {
    return NextResponse.next();
  }
  const url = request.nextUrl.clone();
  url.pathname = route.target;
  return NextResponse.rewrite(url);
}

/** Records the page's market for handlers that serve no page of their own. */
function rememberLocale(
  request: NextRequest,
  response: NextResponse,
  locale: LocaleId,
): NextResponse {
  if (request.cookies.get(LOCALE_COOKIE)?.value !== locale) {
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
    i18n: localeI18n(route.locale),
  });
  requestContext.markResponseAsPersonalized("customer-account-page");
  /* `/account/status` is a root route handler, never a localized page. */
  const response =
    route.path === ACCOUNT_STATUS_PATH && route.kind === "rewrite"
      ? NextResponse.next()
      : rememberLocale(request, routeResponse(request, route), route.locale);
  requestContext.applyResponseHeaders(response.headers);
  return response;
}

function isAccountPath(path: string): boolean {
  return path === "/account" || path.startsWith("/account/");
}

export async function proxy(request: NextRequest): Promise<Response> {
  const route = resolveLocaleRoute(request.nextUrl.pathname);
  if (route.kind === "redirect") {
    const url = request.nextUrl.clone();
    url.pathname = route.path;
    return NextResponse.redirect(url, 308);
  }
  if (!isAccountPath(route.path)) {
    return rememberLocale(request, routeResponse(request, route), route.locale);
  }

  try {
    const runtime = getCustomerAccountRuntime();
    if (runtime === null) {
      return accountDisabledResponse();
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
    const requestContext = createShopifyRequestContext({
      request: protocolRequest,
      /* The market of the page the shopper signed in from. */
      i18n: localeI18n(localeFromCookieHeader(request.headers.get("cookie"))),
    });
    const storefrontClient = createAccountRouteContextClient(requestContext);
    const sessionManager = await createCustomerAccountSessionManager({
      config: runtime.config,
      cookieHeader: request.headers.get("cookie"),
      secure: process.env.NODE_ENV === "production",
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
 * Every page path. Build assets, route handlers under `/api`, and files with an
 * extension (`robots.txt`, `sitemap.xml`, `icon.svg`, images) never pass
 * through; `/account/status` does, so the account boundary still guards it.
 */
export const config = {
  matcher: ["/((?!_next/|api/|.*\\.[^/]+$).*)"],
};
