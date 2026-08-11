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
  type ShopifyRequestContext,
  type StorefrontClient,
  createShopifyRequestContext,
  handleShopifyRoutes,
} from "@shopify/hydrogen";
import { type NextRequest, NextResponse } from "next/server";

import {
  CUSTOMER_ACCOUNT_AUTHORIZE_PATH,
  CUSTOMER_ACCOUNT_LOGIN_PATH,
  CUSTOMER_ACCOUNT_LOGOUT_PATH,
  CUSTOMER_ACCOUNT_PROTOCOL_PATHS,
  CUSTOMER_ACCOUNT_REFRESH_PATH,
  getCustomerAccountRuntime,
} from "@/lib/account/customer-account";
import { createCustomerAccountSessionManager } from "@/lib/account/session-manager";

const ACCOUNT_I18N = { country: "US", language: "EN" } as const;
const CUSTOMER_ACCOUNT_PROTOCOL_PATH_SET = new Set<string>(
  CUSTOMER_ACCOUNT_PROTOCOL_PATHS,
);
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

export async function proxy(request: NextRequest): Promise<Response> {
  try {
    const runtime = getCustomerAccountRuntime();
    if (runtime === null) {
      return accountDisabledResponse();
    }
    if (!CUSTOMER_ACCOUNT_PROTOCOL_PATH_SET.has(request.nextUrl.pathname)) {
      return personalizedAccountPageResponse(request);
    }
    const expectedMethod = CUSTOMER_ACCOUNT_PROTOCOL_METHODS.get(
      request.nextUrl.pathname,
    );
    if (expectedMethod === undefined) {
      return accountUnavailableResponse();
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
  matcher: ["/account/:path*"],
};
