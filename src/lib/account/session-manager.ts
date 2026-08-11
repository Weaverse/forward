/**
 * Forward's `ShopifyRouteSessionManager`.
 *
 * Hydrogen owns OAuth state, nonce, PKCE, pending-login expiry, and token
 * parsing. This manager owns only the storage boundary: decrypt on read,
 * re-encrypt into a fresh generation on `commit()`, and remove the complete
 * session value when nothing is left to store.
 *
 * `commit()` is deliberately non-optional. The pinned Hydrogen route handlers
 * call it on every successful 303, and a manager without it would silently
 * drop tokens.
 */

import type { CustomerAccountConfig } from "./env";
import {
  deriveSessionKey,
  openSession,
  readSessionCookie,
  sealSession,
  type SessionData,
  serializeSessionCookie,
  serializeSessionDeletion,
} from "./session-cookie";

export interface CustomerAccountSessionManagerOptions {
  config: CustomerAccountConfig;
  /** Raw `Cookie` request header, or `null`. */
  cookieHeader: string | null;
  /** `Secure` cookie attribute. Always true in Production. */
  secure: boolean;
  now?: () => number;
}

/**
 * Structurally the package's `ShopifyRouteSessionManager` (which the pinned
 * package does not export as a public type) with a required `commit()`.
 */
export interface ForwardCustomerSessionManager {
  getSessionOrigin(): string;
  getSessionItem(key: string): unknown;
  setSessionItem(key: string, value: unknown): void;
  removeSessionItem(key: string): void;
  commit(): Promise<HeadersInit>;
}

export async function createCustomerAccountSessionManager(
  options: CustomerAccountSessionManagerOptions,
): Promise<ForwardCustomerSessionManager> {
  const { config, cookieHeader, secure, now = Date.now } = options;
  const key = await deriveSessionKey(config.sessionSecret);
  const cookieValue = readSessionCookie(cookieHeader);
  let data: SessionData =
    cookieValue === null
      ? {}
      : ((await openSession(cookieValue, key, now())) ?? {});
  let dirty = false;

  return {
    // The configured origin is the only origin source. Request headers are
    // never consulted, so Host/Forwarded poisoning cannot reach OAuth.
    getSessionOrigin: () => config.storefrontOrigin,
    getSessionItem: (sessionKey) => data[sessionKey],
    setSessionItem: (sessionKey, value) => {
      data = { ...data, [sessionKey]: value };
      dirty = true;
    },
    removeSessionItem: (sessionKey) => {
      const next = { ...data };
      delete next[sessionKey];
      data = next;
      dirty = true;
    },
    async commit(): Promise<HeadersInit> {
      if (!dirty) {
        return {};
      }
      dirty = false;
      if (Object.keys(data).length === 0) {
        return { "set-cookie": serializeSessionDeletion({ secure }) };
      }
      return {
        "set-cookie": serializeSessionCookie(
          await sealSession(data, key, now()),
          { secure },
        ),
      };
    },
  };
}
