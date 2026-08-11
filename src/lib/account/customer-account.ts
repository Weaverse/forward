/**
 * Server-only Customer Account runtime.
 *
 * Hydrogen owns the OAuth protocol: state, nonce, PKCE `S256`, pending-login
 * expiry, token exchange, and the one-time replacement of a pending login with
 * tokens. Forward owns configuration, the session storage boundary, and the
 * exact redirect targets. There is deliberately no second OAuth implementation.
 */

import {
  CUSTOMER_ACCOUNT_AUTHORIZE_PATH,
  CUSTOMER_ACCOUNT_LOGIN_PATH,
  CUSTOMER_ACCOUNT_LOGOUT_PATH,
  CUSTOMER_ACCOUNT_REFRESH_PATH,
  type CustomerAccountServerHandlers,
  type CustomerSession,
  createCustomerAccountServerHandlers,
  createCustomerSession,
} from "@shopify/hydrogen/customer-account";

import type { EnvSource } from "@/lib/storefront/shopify/env";

import { type CustomerAccountConfig, readCustomerAccountConfig } from "./env";

export {
  CUSTOMER_ACCOUNT_AUTHORIZE_PATH,
  CUSTOMER_ACCOUNT_LOGIN_PATH,
  CUSTOMER_ACCOUNT_LOGOUT_PATH,
  CUSTOMER_ACCOUNT_REFRESH_PATH,
};

/** Every path the Customer Account handler group exclusively owns. */
export const CUSTOMER_ACCOUNT_PROTOCOL_PATHS = [
  CUSTOMER_ACCOUNT_LOGIN_PATH,
  CUSTOMER_ACCOUNT_AUTHORIZE_PATH,
  CUSTOMER_ACCOUNT_REFRESH_PATH,
  CUSTOMER_ACCOUNT_LOGOUT_PATH,
] as const;

export const ACCOUNT_PATH = "/account";
export const LOGIN_FAILED_PATH = "/account?login=failed";
export const POST_LOGOUT_REDIRECT_URI = "/";

/**
 * Forward's own return-target cap, well below Hydrogen's 2,048-byte package
 * cap. It reserves cookie headroom for the encrypted pending login.
 */
export const MAX_RETURN_TO_BYTES = 512;

/** Fixed, never-rendered marker that bounds a refresh attempt to one per flow. */
export const REFRESH_MARKER_PARAM = "account_refresh";
export const REFRESH_MARKER_VALUE = "1";

export interface CustomerAccountRuntime {
  config: CustomerAccountConfig;
  customerSession: CustomerSession;
  handlers: CustomerAccountServerHandlers;
}

export function createCustomerAccountRuntime(
  config: CustomerAccountConfig,
): CustomerAccountRuntime {
  const customerSession = createCustomerSession({
    shopId: config.shopId,
    customerAccountApiClientId: config.clientId,
  });
  return {
    config,
    customerSession,
    handlers: createCustomerAccountServerHandlers({
      customerSession,
      // The configured origin is the only origin source; request headers are
      // never consulted for callback, refresh, logout, or return targets.
      origin: config.storefrontOrigin,
      defaultPostLoginRedirectPathname: ACCOUNT_PATH,
      loginFailedRedirectPath: LOGIN_FAILED_PATH,
      postLogoutRedirectUri: POST_LOGOUT_REDIRECT_URI,
    }),
  };
}

let cachedSource: EnvSource | undefined;
let cachedRuntime: CustomerAccountRuntime | null = null;

/**
 * Resolves the runtime, or `null` when account integration is disabled.
 * Throws for a partial or malformed tuple, before any handler is registered.
 */
export function getCustomerAccountRuntime(
  source: EnvSource = process.env,
): CustomerAccountRuntime | null {
  if (source !== cachedSource) {
    const config = readCustomerAccountConfig(source);
    cachedRuntime =
      config === null ? null : createCustomerAccountRuntime(config);
    cachedSource = source;
  }
  return cachedRuntime;
}

const RETURN_TARGET_ORIGIN = "https://forward.invalid";

/**
 * Caps an app-owned return target: same-origin absolute path only, no
 * protocol-relative/backslash-normalized target, and at most 512 UTF-8 bytes.
 * Anything else falls back to the account root rather than being truncated.
 */
export function sanitizeReturnTarget(target: string): string {
  try {
    const parsed = new URL(target, RETURN_TARGET_ORIGIN);
    if (parsed.origin !== RETURN_TARGET_ORIGIN || !target.startsWith("/")) {
      return ACCOUNT_PATH;
    }
    const normalized = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    if (new TextEncoder().encode(normalized).byteLength > MAX_RETURN_TO_BYTES) {
      return ACCOUNT_PATH;
    }
    return normalized;
  } catch {
    return ACCOUNT_PATH;
  }
}

/** Raw full-page login href. Rendered with `<a>`, never `next/link`. */
export function loginHref(returnTo: string = ACCOUNT_PATH): string {
  const params = new URLSearchParams({
    return_to: sanitizeReturnTarget(returnTo),
  });
  return `${CUSTOMER_ACCOUNT_LOGIN_PATH}?${params.toString()}`;
}

/**
 * Raw full-page refresh href. The marker travels inside the sanitized
 * same-origin return target, so the page it lands on can prove a refresh was
 * already attempted and fall back to login instead of looping.
 */
export function refreshHref(returnTo: string = ACCOUNT_PATH): string {
  const [pathname = ACCOUNT_PATH, search] = returnTo.split("?", 2);
  const targetParams = new URLSearchParams(search);
  targetParams.set(REFRESH_MARKER_PARAM, REFRESH_MARKER_VALUE);
  const params = new URLSearchParams({
    return_to: sanitizeReturnTarget(`${pathname}?${targetParams.toString()}`),
  });
  return `${CUSTOMER_ACCOUNT_REFRESH_PATH}?${params.toString()}`;
}
