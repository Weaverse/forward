import assert from "node:assert/strict";
import { afterEach, describe, it } from "vite-plus/test";

import { createShopifyRequestContext } from "@shopify/hydrogen";
import { createCustomerAccountClient } from "@shopify/hydrogen/customer-account";
import type { AccountSession } from "../src/lib/account/account-view.ts";
import {
  ADDRESS_ERROR_RATE_LIMITED,
  ADDRESS_ERROR_RATE_LIMITED_BRIEFLY,
  performAddressAction,
} from "../src/lib/account/addresses.ts";
import { createCustomerAccountRuntime } from "../src/lib/account/customer-account.ts";
import type { CustomerAccountConfig } from "../src/lib/account/env.ts";
import { ACCOUNT_PROFILE_QUERY } from "../src/lib/account/queries.ts";
import {
  CustomerAccountRateLimitError,
  retryAfterSeconds,
  withRateLimitPolicy,
} from "../src/lib/account/rate-limit.ts";
import { createCustomerAccountSessionManager } from "../src/lib/account/session-manager.ts";
import { SHOPIFY_I18N } from "../src/lib/i18n/shopify-i18n.ts";
import { STATIC_CONTENT } from "../src/lib/i18n/static-content.ts";

const CONFIG: CustomerAccountConfig = {
  shopId: "97847574828",
  clientId: "shp_00000000-0000-4000-8000-000000000000",
  sessionSecret: "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8",
  storefrontOrigin: "https://forward-shopify-hydrogen.vercel.app",
};
const ACCESS_TOKEN = "shcat_live_access_token_value";
const ADDRESS_ID = "gid://shopify/CustomerAddress/2?model_name=CustomerAddress";
const PROFILE_VARIABLES = { orderCount: 1, addressCount: 1, previewCount: 1 };

function requestContext() {
  return createShopifyRequestContext({
    request: new Request(`${CONFIG.storefrontOrigin}/account`),
    i18n: SHOPIFY_I18N,
    locale: { country: "US", language: "EN" },
  });
}

function rateLimited(retryAfter?: string): Response {
  return new Response(null, {
    status: 429,
    headers: retryAfter === undefined ? {} : { "retry-after": retryAfter },
  });
}

/** The real client behind the policy, answered with `responses` in turn. */
function clientAnswering(responses: Response[]) {
  let calls = 0;
  const client = withRateLimitPolicy(
    createCustomerAccountClient({
      shopId: CONFIG.shopId,
      requestContext: requestContext(),
      fetch: async () => {
        calls += 1;
        return responses.shift() ?? Response.json({ data: {} });
      },
    }),
  );
  return { client, calls: () => calls };
}

/** Submits an address delete through the action boundary with `client`. */
function deleteAddress(client: ReturnType<typeof withRateLimitPolicy>) {
  const session = {
    status: "authenticated",
    accessToken: ACCESS_TOKEN,
    locale: "en-us",
    client,
  } as unknown as AccountSession;
  const formData = new FormData();
  formData.set("intent", "delete");
  formData.set("addressId", ADDRESS_ID);
  return performAddressAction({
    session,
    requestHeaders: new Headers({ origin: CONFIG.storefrontOrigin }),
    origin: CONFIG.storefrontOrigin,
    formData,
    locale: "en-us",
  });
}

describe("Customer Account rate limits", () => {
  it("retries a rate-limited query once after Retry-After", async () => {
    const { client, calls } = clientAnswering([
      rateLimited("1"),
      Response.json({ data: { customer: { displayName: "Rowan" } } }),
    ]);
    const started = Date.now();
    const result = await client.graphql(ACCOUNT_PROFILE_QUERY, {
      accessToken: ACCESS_TOKEN,
      variables: PROFILE_VARIABLES,
    });
    assert.equal(result.data?.customer.displayName, "Rowan");
    assert.equal(calls(), 2);
    assert.ok(Date.now() - started >= 1000);
  });

  it("fails a query that is still rate limited after its retry", async () => {
    const { client, calls } = clientAnswering([
      rateLimited("0"),
      rateLimited("5"),
    ]);
    await assert.rejects(
      client.graphql(ACCOUNT_PROFILE_QUERY, {
        accessToken: ACCESS_TOKEN,
        variables: PROFILE_VARIABLES,
      }),
      (error) =>
        error instanceof CustomerAccountRateLimitError &&
        error.retryAfterSeconds === 5,
    );
    assert.equal(calls(), 2);
  });

  it("does not wait out a long Retry-After", async () => {
    const { client, calls } = clientAnswering([rateLimited("30")]);
    const started = Date.now();
    await assert.rejects(
      client.graphql(ACCOUNT_PROFILE_QUERY, {
        accessToken: ACCESS_TOKEN,
        variables: PROFILE_VARIABLES,
      }),
      CustomerAccountRateLimitError,
    );
    assert.equal(calls(), 1);
    assert.ok(Date.now() - started < 1000);
  });

  it("never retries a mutation and tells the shopper when to try again", async () => {
    const { client, calls } = clientAnswering([rateLimited("12")]);
    assert.deepEqual(await deleteAddress(client), {
      status: "error",
      message: ADDRESS_ERROR_RATE_LIMITED,
      variables: { seconds: 12 },
    });
    assert.equal(calls(), 1);
    assert.equal(
      STATIC_CONTENT.account.addressErrors.rateLimited,
      "Too many requests, please try again in {{seconds}} seconds.",
    );
  });

  it("asks for a moment when a mutation's wait is unknown", async () => {
    const { client, calls } = clientAnswering([rateLimited()]);
    assert.deepEqual(await deleteAddress(client), {
      status: "error",
      message: ADDRESS_ERROR_RATE_LIMITED_BRIEFLY,
    });
    assert.equal(calls(), 1);
  });

  it("reads Retry-After as seconds or an HTTP date", () => {
    const now = Date.parse("2026-11-25T00:00:00Z");
    assert.equal(retryAfterSeconds("3", now), 3);
    assert.equal(retryAfterSeconds("Wed, 25 Nov 2026 00:00:04 GMT", now), 4);
    assert.equal(retryAfterSeconds(undefined, now), undefined);
    assert.equal(retryAfterSeconds("soon", now), undefined);
  });
});

describe("rate-limited token refresh", () => {
  const realFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  it("keeps the customer signed in (Hydrogen treats a 429 as transient)", async () => {
    let refreshes = 0;
    globalThis.fetch = async () => {
      refreshes += 1;
      return rateLimited("1");
    };
    const runtime = createCustomerAccountRuntime(CONFIG);
    const manager = await createCustomerAccountSessionManager({
      config: CONFIG,
      cookieHeader: null,
      secure: true,
    });
    const tokens = {
      accessToken: ACCESS_TOKEN,
      refreshToken: "refresh-token",
      expiresAt: Date.now() - 1000,
    };
    manager.setSessionItem("customerAccount", { tokens });
    const context = requestContext();

    const accessToken = await runtime.customerSession.getOrRefreshAccessToken(
      manager,
      context,
    );

    assert.equal(refreshes, 1);
    assert.equal(accessToken, undefined);
    assert.equal(
      await runtime.customerSession.isLoggedIn(manager, context),
      true,
    );
    assert.deepEqual(manager.getSessionItem("customerAccount"), { tokens });
  });
});
