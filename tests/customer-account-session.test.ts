import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { CustomerAccountConfig } from "../src/lib/account/env.ts";
import { createCustomerAccountSessionManager } from "../src/lib/account/session-manager.ts";
import {
  CUSTOMER_ACCOUNT_COOKIE_NAME,
  CustomerAccountSessionError,
  deriveSessionKey,
  MAX_COOKIE_VALUE_BYTES,
  openSession,
  readSessionCookie,
  sealSession,
  SESSION_MAX_AGE_IN_SECONDS,
  serializeSessionCookie,
} from "../src/lib/account/session-cookie.ts";

const CONFIG: CustomerAccountConfig = {
  shopId: "97847574828",
  clientId: "shp_00000000-0000-4000-8000-000000000000",
  sessionSecret:
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  storefrontOrigin: "https://forward-sandy.vercel.app",
};

const ACCESS_TOKEN = "shcat_live_access_token_value";
const TOKENS = {
  customerAccount: {
    tokens: {
      accessToken: ACCESS_TOKEN,
      refreshToken: "shcrt_live_refresh_token_value",
      idToken: "header.payload.signature",
      expiresAt: Number.MAX_SAFE_INTEGER,
    },
  },
};

function cookieHeader(value: string): string {
  return `cart=abc; ${CUSTOMER_ACCOUNT_COOKIE_NAME}=${value}; other=1`;
}

function setCookieValue(headers: HeadersInit): string {
  const value = new Headers(headers).get("set-cookie");
  assert.ok(value, "expected a Set-Cookie header");
  return value;
}

describe("customer account session envelope", () => {
  it("round-trips session data through authenticated encryption", async () => {
    const key = await deriveSessionKey(CONFIG.sessionSecret);
    const now = Date.now();
    const sealed = await sealSession(TOKENS, key, now);
    assert.ok(!sealed.includes(ACCESS_TOKEN));
    assert.deepEqual(await openSession(sealed, key, now), TOKENS);
  });

  it("issues a fresh nonce and generation on every commit", async () => {
    const key = await deriveSessionKey(CONFIG.sessionSecret);
    const now = Date.now();
    const first = await sealSession(TOKENS, key, now);
    const second = await sealSession(TOKENS, key, now);
    assert.notEqual(first, second);
  });

  it("rejects tampered ciphertext, wrong keys, and unknown versions", async () => {
    const key = await deriveSessionKey(CONFIG.sessionSecret);
    const otherKey = await deriveSessionKey(`${CONFIG.sessionSecret}-other`);
    const now = Date.now();
    const sealed = await sealSession(TOKENS, key, now);

    // Flip one nonce character, where every base64url bit is significant.
    const nonceChar = sealed.charAt(6);
    const flipped = `${sealed.slice(0, 6)}${nonceChar === "A" ? "B" : "A"}${sealed.slice(7)}`;
    assert.notEqual(flipped, sealed);
    assert.equal(await openSession(flipped, key, now), null);
    assert.equal(await openSession(sealed, otherKey, now), null);
    assert.equal(
      await openSession(sealed.replace("v1.", "v2."), key, now),
      null,
    );
    assert.equal(await openSession(sealed.slice(0, 20), key, now), null);
    assert.equal(await openSession("", key, now), null);
  });

  it("expires the envelope at its bounded lifetime", async () => {
    const key = await deriveSessionKey(CONFIG.sessionSecret);
    const now = Date.now();
    const sealed = await sealSession(TOKENS, key, now);
    const lifetimeMs = SESSION_MAX_AGE_IN_SECONDS * 1_000;
    assert.deepEqual(
      await openSession(sealed, key, now + lifetimeMs - 1),
      TOKENS,
    );
    assert.equal(await openSession(sealed, key, now + lifetimeMs), null);
  });

  it("sets host-only HttpOnly Lax cookie flags and Secure only when asked", () => {
    const secure = serializeSessionCookie("v1.value", { secure: true });
    assert.match(secure, /^forward_customer_account=v1\.value;/);
    assert.match(secure, /; Path=\/(;|$)/);
    assert.match(secure, /; SameSite=Lax(;|$)/);
    assert.match(secure, /; HttpOnly(;|$)/);
    assert.match(secure, /; Secure$/);
    assert.ok(!/Domain=/i.test(secure));
    assert.ok(!/SameSite=None/i.test(secure));
    assert.ok(
      !serializeSessionCookie("v1.value", { secure: false }).includes("Secure"),
    );
  });

  it("rejects rather than truncates an oversized cookie", () => {
    const oversized = `v1.${"a".repeat(MAX_COOKIE_VALUE_BYTES)}`;
    assert.throws(
      () => serializeSessionCookie(oversized, { secure: true }),
      CustomerAccountSessionError,
    );
    assert.ok(
      serializeSessionCookie(`v1.${"a".repeat(MAX_COOKIE_VALUE_BYTES - 3)}`, {
        secure: true,
      }),
    );
  });

  it("fits a bounded synthetic token generation and rejects a larger one", async () => {
    const boundedTokens = {
      tokens: {
        accessToken: `access.${"a".repeat(560)}`,
        refreshToken: `refresh.${"r".repeat(560)}`,
        idToken: `id.${"i".repeat(1_100)}`,
        expiresAt: Number.MAX_SAFE_INTEGER,
      },
    };
    const bounded = await createCustomerAccountSessionManager({
      config: CONFIG,
      cookieHeader: null,
      secure: true,
    });
    bounded.setSessionItem("customerAccount", boundedTokens);
    const committed = setCookieValue(await bounded.commit());
    assert.ok(Buffer.byteLength(committed, "utf8") <= 4_096);
    assert.ok(!committed.includes(boundedTokens.tokens.accessToken));
    assert.ok(!committed.includes(boundedTokens.tokens.refreshToken));
    assert.ok(!committed.includes(boundedTokens.tokens.idToken));

    const oversized = await createCustomerAccountSessionManager({
      config: CONFIG,
      cookieHeader: null,
      secure: true,
    });
    oversized.setSessionItem("customerAccount", {
      tokens: {
        accessToken: `access.${"a".repeat(1_200)}`,
        refreshToken: `refresh.${"r".repeat(1_200)}`,
        idToken: `id.${"i".repeat(1_600)}`,
        expiresAt: Number.MAX_SAFE_INTEGER,
      },
    });
    await assert.rejects(oversized.commit(), CustomerAccountSessionError);
  });

  it("reads only one unambiguous account cookie out of a shared header", () => {
    assert.equal(readSessionCookie(cookieHeader("v1.abc")), "v1.abc");
    assert.equal(readSessionCookie("cart=abc"), null);
    assert.equal(readSessionCookie(null), null);
    assert.equal(readSessionCookie(`${CUSTOMER_ACCOUNT_COOKIE_NAME}=`), null);
    assert.equal(
      readSessionCookie(
        `${CUSTOMER_ACCOUNT_COOKIE_NAME}=v1.first; ${CUSTOMER_ACCOUNT_COOKIE_NAME}=v1.second`,
      ),
      null,
    );
    assert.equal(
      readSessionCookie(
        `${CUSTOMER_ACCOUNT_COOKIE_NAME}=; ${CUSTOMER_ACCOUNT_COOKIE_NAME}=v1.second`,
      ),
      null,
    );
  });
});

describe("createCustomerAccountSessionManager", () => {
  it("exposes a non-optional commit boundary", async () => {
    const manager = await createCustomerAccountSessionManager({
      config: CONFIG,
      cookieHeader: null,
      secure: true,
    });
    assert.equal(typeof manager.commit, "function");
  });

  it("resolves the origin from configuration, never from request headers", async () => {
    const manager = await createCustomerAccountSessionManager({
      config: CONFIG,
      cookieHeader: null,
      secure: true,
    });
    assert.equal(await manager.getSessionOrigin(), CONFIG.storefrontOrigin);
  });

  it("commits nothing when the request never wrote session state", async () => {
    const manager = await createCustomerAccountSessionManager({
      config: CONFIG,
      cookieHeader: null,
      secure: true,
    });
    await manager.getSessionItem("customerAccount");
    assert.deepEqual(new Headers(await manager.commit()).getSetCookie(), []);
  });

  it("round-trips committed state into the next request", async () => {
    const writer = await createCustomerAccountSessionManager({
      config: CONFIG,
      cookieHeader: null,
      secure: true,
    });
    writer.setSessionItem("customerAccount", TOKENS.customerAccount);
    const committed = setCookieValue(await writer.commit());
    assert.ok(!committed.includes(ACCESS_TOKEN));

    const value =
      committed.split(";", 1)[0]?.split("=").slice(1).join("=") ?? "";
    const reader = await createCustomerAccountSessionManager({
      config: CONFIG,
      cookieHeader: cookieHeader(value),
      secure: true,
    });
    assert.deepEqual(
      await reader.getSessionItem("customerAccount"),
      TOKENS.customerAccount,
    );
  });

  it("rotates the cookie value on every commit", async () => {
    const first = await createCustomerAccountSessionManager({
      config: CONFIG,
      cookieHeader: null,
      secure: true,
    });
    first.setSessionItem("customerAccount", TOKENS.customerAccount);
    const second = await createCustomerAccountSessionManager({
      config: CONFIG,
      cookieHeader: null,
      secure: true,
    });
    second.setSessionItem("customerAccount", TOKENS.customerAccount);
    assert.notEqual(
      setCookieValue(await first.commit()),
      setCookieValue(await second.commit()),
    );
  });

  it("ignores a tampered cookie instead of failing the request", async () => {
    const manager = await createCustomerAccountSessionManager({
      config: CONFIG,
      cookieHeader: cookieHeader("v1.dGFtcGVyZWQ"),
      secure: true,
    });
    assert.equal(await manager.getSessionItem("customerAccount"), undefined);
  });

  it("removes the complete session value on logout", async () => {
    const key = await deriveSessionKey(CONFIG.sessionSecret);
    const sealed = await sealSession(TOKENS, key, Date.now());
    const manager = await createCustomerAccountSessionManager({
      config: CONFIG,
      cookieHeader: cookieHeader(sealed),
      secure: true,
    });
    manager.removeSessionItem("customerAccount");
    const committed = setCookieValue(await manager.commit());
    assert.match(committed, /^forward_customer_account=;/);
    assert.match(committed, /Max-Age=0/);
    assert.match(committed, /Expires=Thu, 01 Jan 1970/);
    assert.ok(!committed.includes(ACCESS_TOKEN));
  });
});
