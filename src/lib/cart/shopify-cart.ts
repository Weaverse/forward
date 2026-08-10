import {
  createCartServerHandlers,
  createShopifyRequestContext,
  createStorefrontClient,
} from "@shopify/hydrogen";

import {
  type EnvSource,
  readShopifyCatalogConfig,
} from "@/lib/storefront/shopify/env";

import {
  hardenCartResponseHeaders,
  readTrustedBuyerIp,
  type RuntimeEnvironment,
  sanitizeCartHandlerResult,
} from "./shopify-cart-server";

const CART_I18N = { country: "US", language: "EN" } as const;

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

function createCartRequestContext(request: Request, source: EnvSource) {
  const config = readShopifyCatalogConfig(source);
  if (config === null) {
    throw new Error("Shopify cart is unavailable in static storefront mode.");
  }
  const environment = runtimeEnvironment(source.NODE_ENV);
  const buyerIp = readTrustedBuyerIp(request.headers, environment);
  const requestContext = createShopifyRequestContext({
    request,
    i18n: CART_I18N,
    buyerIp,
  });
  const storefrontClient = createStorefrontClient({
    type: "private",
    requestContext,
    config: {
      storeDomain: config.storeDomain,
      privateStorefrontToken: config.privateStorefrontToken,
      buyerIp,
    },
  });
  return { config, environment, requestContext, storefrontClient };
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

export async function readShopifyCart(
  request: Request,
  source: EnvSource = process.env,
): Promise<ShopifyCartData> {
  const context = createCartRequestContext(request, source);
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
