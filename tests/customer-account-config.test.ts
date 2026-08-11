import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CUSTOMER_ACCOUNT_CLIENT_ID_ENV_KEY,
  CUSTOMER_ACCOUNT_ENV_KEYS,
  CUSTOMER_ACCOUNT_SESSION_SECRET_ENV_KEY,
  readCustomerAccountConfig,
  SHOP_ID_ENV_KEY,
  STOREFRONT_ORIGIN_ENV_KEY,
} from "../src/lib/account/env.ts";
import { ShopifyConfigurationError } from "../src/lib/storefront/shopify/errors.ts";

const VALID_ENV = {
  [SHOP_ID_ENV_KEY]: "97847574828",
  [CUSTOMER_ACCOUNT_CLIENT_ID_ENV_KEY]:
    "shp_00000000-0000-4000-8000-000000000000",
  // Canonical unpadded base64url encoding of a 32-byte test fixture.
  [CUSTOMER_ACCOUNT_SESSION_SECRET_ENV_KEY]:
    "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8",
  [STOREFRONT_ORIGIN_ENV_KEY]: "https://forward-sandy.vercel.app",
} as const;

describe("readCustomerAccountConfig", () => {
  it("disables account integration when the whole tuple is absent", () => {
    assert.equal(readCustomerAccountConfig({}), null);
    assert.equal(
      readCustomerAccountConfig({ PUBLIC_STORE_DOMAIN: "shop.myshopify.com" }),
      null,
    );
  });

  it("accepts the complete tuple and normalizes the origin", () => {
    const config = readCustomerAccountConfig(VALID_ENV);
    assert.ok(config);
    assert.equal(config.shopId, "97847574828");
    assert.equal(
      config.clientId,
      VALID_ENV[CUSTOMER_ACCOUNT_CLIENT_ID_ENV_KEY],
    );
    assert.equal(config.storefrontOrigin, "https://forward-sandy.vercel.app");
  });

  it("throws for every partial tuple and names only the missing keys", () => {
    for (const missingKey of CUSTOMER_ACCOUNT_ENV_KEYS) {
      const source: Record<string, string> = { ...VALID_ENV };
      delete source[missingKey];
      assert.throws(
        () => readCustomerAccountConfig(source),
        (error: unknown) => {
          assert.ok(error instanceof ShopifyConfigurationError);
          assert.match(error.message, new RegExp(missingKey));
          for (const key of CUSTOMER_ACCOUNT_ENV_KEYS) {
            if (key !== missingKey) {
              assert.doesNotMatch(error.message, new RegExp(`: .*${key}`));
            }
          }
          return true;
        },
      );
    }
  });

  it("treats blank values as absent rather than as configuration", () => {
    assert.throws(
      () =>
        readCustomerAccountConfig({ ...VALID_ENV, [SHOP_ID_ENV_KEY]: "  " }),
      ShopifyConfigurationError,
    );
  });

  it("rejects a non-numeric shop id", () => {
    for (const shopId of [
      "gid://shopify/Shop/97847574828",
      "forward-xbirmxxt.myshopify.com",
      "97847574828a",
      "97847574828 ",
    ]) {
      assert.throws(
        () =>
          readCustomerAccountConfig({
            ...VALID_ENV,
            [SHOP_ID_ENV_KEY]: shopId,
          }),
        ShopifyConfigurationError,
      );
    }
  });

  it("rejects a client id containing whitespace", () => {
    for (const clientId of ["shp_0000 0000", "shp_00000000 "]) {
      assert.throws(
        () =>
          readCustomerAccountConfig({
            ...VALID_ENV,
            [CUSTOMER_ACCOUNT_CLIENT_ID_ENV_KEY]: clientId,
          }),
        ShopifyConfigurationError,
      );
    }
  });

  it("requires a canonical, non-placeholder 32-byte base64url secret", () => {
    for (const sessionSecret of [
      "a".repeat(31),
      "a".repeat(43),
      ` ${VALID_ENV[CUSTOMER_ACCOUNT_SESSION_SECRET_ENV_KEY]}`,
      `${VALID_ENV[CUSTOMER_ACCOUNT_SESSION_SECRET_ENV_KEY]}=`,
      `${VALID_ENV[CUSTOMER_ACCOUNT_SESSION_SECRET_ENV_KEY].slice(0, -1)}9`,
      "not+base64url/not-base64url-not-base64url",
    ]) {
      assert.throws(
        () =>
          readCustomerAccountConfig({
            ...VALID_ENV,
            [CUSTOMER_ACCOUNT_SESSION_SECRET_ENV_KEY]: sessionSecret,
          }),
        ShopifyConfigurationError,
      );
    }
    assert.ok(readCustomerAccountConfig(VALID_ENV));
  });

  it("never repeats a secret value in a configuration error", () => {
    const secret = "not-long-enough";
    assert.throws(
      () =>
        readCustomerAccountConfig({
          ...VALID_ENV,
          [CUSTOMER_ACCOUNT_SESSION_SECRET_ENV_KEY]: secret,
        }),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.ok(!error.message.includes(secret));
        return true;
      },
    );
  });

  it("rejects every non-canonical storefront origin", () => {
    for (const origin of [
      "http://forward-sandy.vercel.app",
      "https://forward-sandy.vercel.app/",
      "https://forward-sandy.vercel.app/account",
      "https://forward-sandy.vercel.app:8443",
      "https://user:pass@forward-sandy.vercel.app",
      "https://forward-sandy.vercel.app?x=1",
      "https://forward-sandy.vercel.app#x",
      "forward-sandy.vercel.app",
      "*.vercel.app",
    ]) {
      assert.throws(
        () =>
          readCustomerAccountConfig({
            ...VALID_ENV,
            [STOREFRONT_ORIGIN_ENV_KEY]: origin,
          }),
        ShopifyConfigurationError,
        `expected ${origin} to be rejected`,
      );
    }
  });
});
