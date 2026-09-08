/**
 * The single Hydrogen route gate for Forward.
 *
 * Next runs `proxy.ts` before App Router routing, which is the only place the
 * Customer Account protocol paths can be owned without a second OAuth
 * implementation. Exactly one request context, one storefront client, and one
 * writable session manager are created per request, and the pinned handlers
 * commit that session on every successful 303.
 *
 * The proxy matches the complete `/account` boundary so disabled deployments
 * fail closed before App Router rendering. When configured, only the four
 * protocol paths enter Hydrogen's handler group; ordinary account pages fall
 * through directly, so unrelated SFAPI/cart/checkout interceptors stay out of
 * scope.
 *
 * When the account tuple is absent every account request receives the same
 * generic no-store 404 and exposes no auth affordance.
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
import { isWeaverseCustomPage } from "@/lib/weaverse/custom-pages";

const ACCOUNT_I18N = { country: "US", language: "EN" } as const;
const CUSTOMER_ACCOUNT_PROTOCOL_METHODS = new Map<string, string>([
  [CUSTOMER_ACCOUNT_LOGIN_PATH, "GET"],
  [CUSTOMER_ACCOUNT_AUTHORIZE_PATH, "GET"],
  [CUSTOMER_ACCOUNT_REFRESH_PATH, "GET"],
  [CUSTOMER_ACCOUNT_LOGOUT_PATH, "POST"],
]);
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

function personalizedAccountPageResponse(request: NextRequest): Response {
  const requestContext = createShopifyRequestContext({
    request,
    i18n: ACCOUNT_I18N,
  });
  requestContext.markResponseAsPersonalized("customer-account-page");
  const response = NextResponse.next();
  requestContext.applyResponseHeaders(response.headers);
  return response;
}

/** Where the Weaverse custom-page route lives. Never a public URL. */
const WEAVERSE_CUSTOM_PREFIX = "/weaverse-page";
/**
 * Marks a request this proxy rewrote.
 *
 * The proxy runs again on its own rewrite, so the prefix guard below cannot
 * tell an internal rewrite from a visitor typing the internal URL by pathname
 * alone. This header is the difference: only a rewrite carries it.
 */
const REWRITE_MARKER = "x-forward-weaverse-rewrite";

/**
 * Routes a Weaverse custom page to its renderer, before anything streams.
 *
 * Only paths Weaverse actually publishes are rewritten. Everything else is
 * left to ordinary Next routing, which is what keeps unknown handles answering
 * a real 404 instead of the soft 404 a root-level catch-all would produce.
 */
async function weaverseCustomPageResponse(
  request: NextRequest,
): Promise<Response> {
  const projectId = process.env.WEAVERSE_PROJECT_ID?.trim();
  if (!projectId || projectId === "REPLACE_ME") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  /* The renderer's prefix is internal. A visitor addressing it directly gets
   * the same 404 as any other unknown path, so a custom page has exactly one
   * public URL and the internal one cannot be linked or indexed. Middleware
   * does not re-run on a rewrite it issued, so this never blocks the real
   * request. */
  if (pathname.startsWith(`${WEAVERSE_CUSTOM_PREFIX}/`)) {
    if (request.headers.get(REWRITE_MARKER) !== null) {
      return NextResponse.next();
    }
    const blocked = request.nextUrl.clone();
    blocked.pathname = "/weaverse-page-not-addressable";
    return NextResponse.rewrite(blocked);
  }

  if (!(await isWeaverseCustomPage(pathname, projectId))) {
    return NextResponse.next();
  }

  const target = request.nextUrl.clone();
  target.pathname = `${WEAVERSE_CUSTOM_PREFIX}${pathname}`;
  const headers = new Headers(request.headers);
  headers.set(REWRITE_MARKER, "1");
  return NextResponse.rewrite(target, { request: { headers } });
}

export async function proxy(request: NextRequest): Promise<Response> {
  if (!request.nextUrl.pathname.startsWith("/account")) {
    return weaverseCustomPageResponse(request);
  }

  try {
    const runtime = getCustomerAccountRuntime();
    if (runtime === null) {
      return accountDisabledResponse();
    }
    const expectedMethod = CUSTOMER_ACCOUNT_PROTOCOL_METHODS.get(
      request.nextUrl.pathname,
    );
    if (expectedMethod === undefined) {
      return personalizedAccountPageResponse(request);
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
      i18n: ACCOUNT_I18N,
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
 * Match the complete account boundary so disabled configuration can fail closed
 * before App Router rendering. Configured non-protocol account pages fall
 * through without invoking Hydrogen's route interceptors.
 */
export const config = {
  matcher: [
    "/account/:path*",
    /*
     * Every other storefront path, so a Weaverse custom page can be routed
     * before rendering starts. Framework assets, API handlers, and root
     * metadata files are excluded: they are never custom pages, and running
     * this on them would add a listing lookup to every asset request.
     */
    "/((?!_next/|api/|favicon\\.ico$|icon\\.svg$|robots\\.txt$|sitemap\\.xml$|images/).*)",
  ],
};
