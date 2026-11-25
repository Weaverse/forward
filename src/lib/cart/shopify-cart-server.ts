import { isIP } from "node:net";
import type { CartGetResult, CartPostResult } from "@shopify/hydrogen";

export type RuntimeEnvironment = "development" | "production" | "test";
export type CartHandlerResult = CartGetResult | CartPostResult;

export function readTrustedBuyerIp(
  headers: Headers,
  environment: RuntimeEnvironment,
): string {
  const forwarded = headers.get("x-forwarded-for");
  const buyerIp = forwarded?.split(",", 1)[0]?.trim();
  if (buyerIp !== undefined && isIP(buyerIp) !== 0) {
    return buyerIp;
  }
  if (environment !== "production") {
    return "127.0.0.1";
  }
  throw new Error(
    "A trusted Vercel buyer IP is required for Shopify cart operations.",
  );
}

function hardenCartCookie(
  value: string,
  environment: RuntimeEnvironment,
): string {
  const parts = value
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  const nameValue = parts.shift();
  if (nameValue === undefined || !nameValue.toLowerCase().startsWith("cart=")) {
    return value;
  }
  const retained = parts.filter((part) => {
    const attribute = part.split("=", 1)[0]?.toLowerCase();
    return !["path", "samesite", "httponly", "secure"].includes(
      attribute ?? "",
    );
  });
  return [
    nameValue,
    ...retained,
    "Path=/",
    "SameSite=Lax",
    "HttpOnly",
    ...(environment === "production" ? ["Secure"] : []),
  ].join("; ");
}

export function hardenCartResponseHeaders(
  input: HeadersInit,
  environment: RuntimeEnvironment,
): Headers {
  const source = new Headers(input);
  const cookies = source.getSetCookie();
  source.delete("set-cookie");
  let cartCookieCount = 0;
  for (const cookie of cookies) {
    if (cookie.trimStart().toLowerCase().startsWith("cart=")) {
      cartCookieCount += 1;
      source.append("set-cookie", hardenCartCookie(cookie, environment));
    } else {
      source.append("set-cookie", cookie);
    }
  }
  if (cartCookieCount > 1) {
    throw new Error("Shopify returned more than one cart identity cookie.");
  }
  source.set("cache-control", "private, no-store, max-age=0");
  source.set("vary", "Cookie");
  return source;
}

export function validateCheckoutUrl(
  value: string,
  storeDomain: string,
): string {
  let checkout: URL;
  try {
    checkout = new URL(value);
  } catch {
    throw new Error("Shopify returned an invalid checkout URL.");
  }
  const shopifyOwnedHost =
    checkout.hostname === storeDomain ||
    checkout.hostname === "shopify.com" ||
    checkout.hostname.endsWith(".shopify.com") ||
    checkout.hostname === "myshopify.com" ||
    checkout.hostname.endsWith(".myshopify.com");
  if (
    checkout.protocol !== "https:" ||
    checkout.port !== "" ||
    checkout.username !== "" ||
    checkout.password !== "" ||
    checkout.hash !== "" ||
    !shopifyOwnedHost
  ) {
    throw new Error("Shopify returned an unsafe checkout URL.");
  }
  return checkout.toString();
}

const PUBLIC_CART_ID = /^gid:\/\/shopify\/Cart\/[^?#\s]+$/;

/**
 * The cart GID the browser may hold: Shopify's id with its `?key=` query cut
 * off, `gid://shopify/Cart/<token>`. The key, the cart's secret, stays in the
 * HttpOnly cookie. Hydrogen's cart analytics needs an id to track the cart.
 */
export function publicCartId(id: string): string {
  const [publicId = ""] = id.split("?", 1);
  if (!PUBLIC_CART_ID.test(publicId)) {
    throw new Error("Shopify returned a cart without an identity.");
  }
  return publicId;
}

/**
 * Drops the cart id a browser sends (`cartId` in a JSON body or the query).
 * Hydrogen's cart client sends back the id it holds, and its handlers prefer
 * that over the cookie; the browser's id has no key, so the HttpOnly cookie
 * stays the only cart identity the server acts on.
 */
export async function withCookieCartIdentity(
  request: Request,
): Promise<Request> {
  const url = new URL(request.url);
  url.searchParams.delete("cartId");
  if (request.method !== "POST") {
    return new Request(url, {
      method: request.method,
      headers: request.headers,
    });
  }
  let body: BodyInit = await request.arrayBuffer();
  if (request.headers.get("content-type")?.includes("application/json")) {
    try {
      const json: unknown = JSON.parse(new TextDecoder().decode(body));
      if (json !== null && typeof json === "object" && "cartId" in json) {
        delete json.cartId;
        body = JSON.stringify(json);
      }
    } catch {
      /* Malformed JSON goes on unchanged; Hydrogen answers it with a 400. */
    }
  }
  return new Request(url, { method: "POST", headers: request.headers, body });
}

function sanitizeCartData(
  data: Record<string, unknown>,
  storeDomain: string,
): Record<string, unknown> {
  const cartValue = data.cart;
  if (cartValue === null || cartValue === undefined) {
    return structuredClone(data);
  }
  if (typeof cartValue !== "object" || Array.isArray(cartValue)) {
    throw new Error("Shopify returned a malformed cart.");
  }
  const cart = structuredClone(cartValue) as Record<string, unknown>;
  if (typeof cart.id !== "string" || cart.id.length === 0) {
    throw new Error("Shopify returned a cart without an identity.");
  }
  cart.id = publicCartId(cart.id);
  if (cart.checkoutUrl !== null && cart.checkoutUrl !== undefined) {
    if (typeof cart.checkoutUrl !== "string") {
      throw new Error("Shopify returned an invalid checkout URL.");
    }
    cart.checkoutUrl = validateCheckoutUrl(cart.checkoutUrl, storeDomain);
  }
  return { ...structuredClone(data), cart };
}

export function sanitizeCartHandlerResult<T extends CartHandlerResult>(
  result: T,
  storeDomain: string,
): T {
  if (result.type !== "json") {
    return result;
  }
  return {
    ...result,
    data: sanitizeCartData(result.data as Record<string, unknown>, storeDomain),
  } as T;
}
