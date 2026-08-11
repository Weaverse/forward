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
  cart.id = "";
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
