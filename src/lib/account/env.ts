/**
 * Server-only Customer Account configuration boundary.
 *
 * The account tuple is all-or-none and fails closed:
 *
 * - all four keys absent -> account integration is disabled (`null`);
 * - all four present and valid -> Shopify Customer Account mode;
 * - anything else -> a sanitized `ShopifyConfigurationError` naming only keys.
 *
 * `PUBLIC_STOREFRONT_ORIGIN` is the single origin source for OAuth callback
 * construction, refresh, logout, and return-target validation. Request `Host`,
 * `Forwarded`, and `X-Forwarded-Host` headers are never origin inputs.
 */

import type { EnvSource } from "@/lib/storefront/shopify/env";
import { ShopifyConfigurationError } from "@/lib/storefront/shopify/errors";

export const SHOP_ID_ENV_KEY = "SHOP_ID";
export const CUSTOMER_ACCOUNT_CLIENT_ID_ENV_KEY =
  "PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID";
export const CUSTOMER_ACCOUNT_SESSION_SECRET_ENV_KEY =
  "CUSTOMER_ACCOUNT_SESSION_SECRET";
export const STOREFRONT_ORIGIN_ENV_KEY = "PUBLIC_STOREFRONT_ORIGIN";

/** Every environment key that participates in account-mode selection. */
export const CUSTOMER_ACCOUNT_ENV_KEYS = [
  SHOP_ID_ENV_KEY,
  CUSTOMER_ACCOUNT_CLIENT_ID_ENV_KEY,
  CUSTOMER_ACCOUNT_SESSION_SECRET_ENV_KEY,
  STOREFRONT_ORIGIN_ENV_KEY,
] as const;

/** Minimum CSPRNG key material accepted for the session secret. */
export const MIN_SESSION_SECRET_BYTES = 32;

export interface CustomerAccountConfig {
  /** Numeric Shopify shop ID, e.g. `97847574828`. */
  shopId: string;
  /** Headless Customer Account API client ID. */
  clientId: string;
  /** Caller-owned session encryption secret. Never leaves the server. */
  sessionSecret: string;
  /** Canonical HTTPS storefront origin with no trailing slash. */
  storefrontOrigin: string;
}

const SHOP_ID_PATTERN = /^\d+$/;
const WHITESPACE_PATTERN = /\s/;
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;
const BASE64URL_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const MIN_SESSION_SECRET_SYMBOLS = 16;
function base64UrlDecodedByteLength(value: string): number {
  const remainder = value.length % 4;
  if (remainder === 1) {
    return -1;
  }
  return Math.floor((value.length * 6) / 8);
}

/** Rejects alternate encodings whose unused trailing bits are non-zero. */
function hasCanonicalBase64UrlTrailingBits(value: string): boolean {
  const remainder = value.length % 4;
  if (remainder === 0) {
    return true;
  }
  const lastIndex = BASE64URL_ALPHABET.indexOf(value.at(-1) ?? "");
  if (lastIndex < 0) {
    return false;
  }
  return remainder === 2 ? (lastIndex & 0x0f) === 0 : (lastIndex & 0x03) === 0;
}

function readKey(source: EnvSource, key: string): string | undefined {
  const raw = source[key];
  if (typeof raw !== "string" || raw.trim().length === 0) {
    return undefined;
  }
  return raw;
}

function assertServerOnly(): void {
  if (typeof document !== "undefined") {
    throw new ShopifyConfigurationError(
      "The Customer Account configuration is server-only and must never be read from browser code.",
    );
  }
}

/**
 * Validates the canonical storefront origin: exactly one HTTPS origin with no
 * credentials, port, path, query, fragment, or trailing slash.
 */
function validateStorefrontOrigin(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ShopifyConfigurationError(
      `${STOREFRONT_ORIGIN_ENV_KEY} must be a canonical HTTPS origin such as "https://example.com".`,
    );
  }
  if (
    url.protocol !== "https:" ||
    url.username !== "" ||
    url.password !== "" ||
    url.port !== "" ||
    url.pathname !== "/" ||
    url.search !== "" ||
    url.hash !== "" ||
    value !== url.origin
  ) {
    throw new ShopifyConfigurationError(
      `${STOREFRONT_ORIGIN_ENV_KEY} must be a canonical HTTPS origin with no credentials, port, path, query, fragment, or trailing slash.`,
    );
  }
  return url.origin;
}

/**
 * Resolves the Customer Account configuration from an environment source.
 *
 * The source is a parameter so selection stays injectable and tests never have
 * to mutate `process.env`.
 */
export function readCustomerAccountConfig(
  source: EnvSource,
): CustomerAccountConfig | null {
  assertServerOnly();

  const present = CUSTOMER_ACCOUNT_ENV_KEYS.filter(
    (key) => readKey(source, key) !== undefined,
  );
  if (present.length === 0) {
    return null;
  }

  const missing = CUSTOMER_ACCOUNT_ENV_KEYS.filter(
    (key) => readKey(source, key) === undefined,
  );
  if (missing.length > 0) {
    throw new ShopifyConfigurationError(
      `Shopify Customer Account mode is partially configured. Missing required environment ${
        missing.length === 1 ? "key" : "keys"
      }: ${missing.join(", ")}. Set every key, or unset all of them to disable customer accounts.`,
    );
  }

  const shopId = readKey(source, SHOP_ID_ENV_KEY) ?? "";
  const clientId = readKey(source, CUSTOMER_ACCOUNT_CLIENT_ID_ENV_KEY) ?? "";
  const sessionSecret =
    readKey(source, CUSTOMER_ACCOUNT_SESSION_SECRET_ENV_KEY) ?? "";
  const storefrontOrigin = readKey(source, STOREFRONT_ORIGIN_ENV_KEY) ?? "";

  if (!SHOP_ID_PATTERN.test(shopId)) {
    throw new ShopifyConfigurationError(
      `${SHOP_ID_ENV_KEY} must be the numeric Shopify shop ID, not a GID, domain, or storefront ID.`,
    );
  }
  if (WHITESPACE_PATTERN.test(clientId)) {
    throw new ShopifyConfigurationError(
      `${CUSTOMER_ACCOUNT_CLIENT_ID_ENV_KEY} must be the authoritative Headless client ID with no whitespace.`,
    );
  }
  if (
    WHITESPACE_PATTERN.test(sessionSecret) ||
    !BASE64URL_PATTERN.test(sessionSecret) ||
    !hasCanonicalBase64UrlTrailingBits(sessionSecret) ||
    base64UrlDecodedByteLength(sessionSecret) < MIN_SESSION_SECRET_BYTES ||
    new Set(sessionSecret).size < MIN_SESSION_SECRET_SYMBOLS
  ) {
    throw new ShopifyConfigurationError(
      `${CUSTOMER_ACCOUNT_SESSION_SECRET_ENV_KEY} must be canonical base64url for at least ${MIN_SESSION_SECRET_BYTES} bytes of freshly generated CSPRNG material. There is no development fallback.`,
    );
  }

  return {
    shopId,
    clientId,
    sessionSecret,
    storefrontOrigin: validateStorefrontOrigin(storefrontOrigin),
  };
}
