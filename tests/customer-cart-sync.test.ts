import assert from "node:assert/strict";
import { afterAll, beforeAll, beforeEach, describe, it } from "vite-plus/test";

import { NextRequest } from "next/server";
import type { CustomerAccountConfig } from "../src/lib/account/env.ts";
import {
  handleShopifyCartRequest,
  readShopifyCart,
} from "../src/lib/cart/shopify-cart.ts";
import {
  PRIVATE_STOREFRONT_TOKEN_ENV_KEY,
  STORE_DOMAIN_ENV_KEY,
} from "../src/lib/storefront/shopify/env.ts";
import { proxy } from "../src/proxy.ts";

const CONFIG: CustomerAccountConfig = {
  shopId: "97847574828",
  clientId: "shp_00000000-0000-4000-8000-000000000000",
  sessionSecret: "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8",
  storefrontOrigin: "https://forward-shopify-hydrogen.vercel.app",
};
const STORE_DOMAIN = "forward-test-shop.myshopify.com";
const ORIGIN = CONFIG.storefrontOrigin;
const ISSUER = `https://shopify.com/authentication/${CONFIG.shopId}`;
const CART_COOKIE = "cart=synthetic%3Fkey%3Dsecret";
const CART_ID = "gid://shopify/Cart/synthetic?key=secret";
const ACCESS_TOKEN = "synthetic-access-token";
const REFRESHED_TOKEN = "synthetic-refreshed-token";

type StorefrontCall = { query: string; variables: Record<string, unknown> };

/* One fake for the whole file: the customer session keeps the `fetch` it was
 * created with, and the runtime is cached for `process.env`. */
let storefrontCalls: StorefrontCall[] = [];
let failBuyerIdentityUpdate = false;
let idTokenNonce = "";
/* Below Hydrogen's 120 s expiry buffer, a sign-in's token is already expired. */
let tokenExpiresIn = 3600;
let refreshStatus = 200;
let refreshCalls = 0;
const originalFetch = globalThis.fetch;

function base64Url(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function cart(checkoutUrl = `https://${STORE_DOMAIN}/cart/c/synthetic`) {
  return {
    id: CART_ID,
    checkoutUrl,
    totalQuantity: 1,
    note: null,
    buyerIdentity: { countryCode: "US" },
    lines: { nodes: [] },
    discountCodes: [],
  };
}

async function fakeFetch(
  input: string | URL | Request,
  init?: RequestInit,
): Promise<Response> {
  const url = new URL(input instanceof Request ? input.url : input);
  if (url.href === `${ISSUER}/oauth/token`) {
    if (String(init?.body).includes("grant_type=refresh_token")) {
      refreshCalls += 1;
      if (refreshStatus !== 200) {
        return new Response(null, { status: refreshStatus });
      }
      return Response.json({ access_token: REFRESHED_TOKEN, expires_in: 3600 });
    }
    return Response.json({
      access_token: ACCESS_TOKEN,
      refresh_token: "synthetic-refresh-token",
      expires_in: tokenExpiresIn,
      id_token: `${base64Url({ alg: "none" })}.${base64Url({
        iss: ISSUER,
        aud: CONFIG.clientId,
        nonce: idTokenNonce,
        exp: Math.floor(Date.now() / 1000) + 3600,
      })}.`,
    });
  }
  assert.equal(url.hostname, STORE_DOMAIN);
  const call = JSON.parse(String(init?.body)) as StorefrontCall;
  storefrontCalls.push(call);
  if (call.query.includes("mutation CartBuyerIdentityUpdate")) {
    if (failBuyerIdentityUpdate) {
      return Response.json({ errors: [{ message: "Throttled" }] });
    }
    return Response.json({
      data: {
        cartBuyerIdentityUpdate: { cart: { id: CART_ID }, userErrors: [] },
      },
    });
  }
  if (call.query.includes("mutation CartCreate")) {
    return Response.json({
      data: { cartCreate: { cart: cart(), userErrors: [], warnings: [] } },
    });
  }
  return Response.json({ data: { cart: cart() } });
}

function buyerIdentityUpdates() {
  return storefrontCalls
    .filter(({ query }) => query.includes("mutation CartBuyerIdentityUpdate"))
    .map(({ variables }) => variables);
}

/** The buyer identity `syncCartCountry` sent. */
function countryUpdate() {
  const update = storefrontCalls.find(({ query }) =>
    query.includes("mutation ForwardCartCountryUpdate"),
  );
  assert.ok(update, "expected a country update");
  return update.variables.buyerIdentity;
}

/** A cart read from the German market, which moves the US cart. */
function readFromGermany(session: string) {
  return handleShopifyCartRequest(
    new Request(`${ORIGIN}/api/cart`, {
      headers: { cookie: `${session}; ${CART_COOKIE}; forward_locale=de-de` },
    }),
  );
}

function cookiePair(setCookie: string, name: string): string {
  const pair = setCookie
    .split(/,(?=\s*[\w-]+=)/)
    .map((cookie) => cookie.trim().split(";", 1)[0] ?? "")
    .find((cookie) => cookie.startsWith(`${name}=`));
  assert.ok(pair, `expected a ${name} cookie`);
  return pair;
}

/** Signs in through `/account/login` and `/account/authorize`. */
async function signIn(cookie = "") {
  const login = await proxy(new NextRequest(`${ORIGIN}/account/login`));
  assert.equal(login.status, 303);
  const provider = new URL(login.headers.get("location") ?? "");
  idTokenNonce = provider.searchParams.get("nonce") ?? "";
  const pending = cookiePair(
    login.headers.get("set-cookie") ?? "",
    "forward_customer_account",
  );
  const authorize = await proxy(
    new NextRequest(
      `${ORIGIN}/account/authorize?code=synthetic&state=${provider.searchParams.get("state")}`,
      { headers: { cookie: [pending, cookie].filter(Boolean).join("; ") } },
    ),
  );
  assert.equal(authorize.status, 303);
  assert.equal(authorize.headers.get("location"), `${ORIGIN}/account`);
  return {
    authorize,
    session: cookiePair(
      authorize.headers.get("set-cookie") ?? "",
      "forward_customer_account",
    ),
  };
}

function logout(cookie: string) {
  return proxy(
    new NextRequest(`${ORIGIN}/account/logout`, {
      method: "POST",
      headers: { origin: ORIGIN, cookie },
    }),
  );
}

describe("customer and cart buyer identity sync", () => {
  beforeAll(() => {
    globalThis.fetch = fakeFetch as typeof fetch;
    process.env.SHOP_ID = CONFIG.shopId;
    process.env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID = CONFIG.clientId;
    process.env.CUSTOMER_ACCOUNT_SESSION_SECRET = CONFIG.sessionSecret;
    process.env.PUBLIC_STOREFRONT_ORIGIN = CONFIG.storefrontOrigin;
    process.env[STORE_DOMAIN_ENV_KEY] = STORE_DOMAIN;
    process.env[PRIVATE_STOREFRONT_TOKEN_ENV_KEY] = "synthetic-private-token";
  });
  afterAll(() => {
    globalThis.fetch = originalFetch;
  });
  beforeEach(() => {
    storefrontCalls = [];
    failBuyerIdentityUpdate = false;
    tokenExpiresIn = 3600;
    refreshStatus = 200;
    refreshCalls = 0;
  });

  it("attaches the signed-in customer to the guest cart on authorize", async () => {
    await signIn(CART_COOKIE);
    assert.deepEqual(buyerIdentityUpdates(), [
      { cartId: CART_ID, buyerIdentity: { customerAccessToken: ACCESS_TOKEN } },
    ]);
  });

  it("detaches the customer on logout and keeps the cart", async () => {
    const { session } = await signIn();
    storefrontCalls = [];
    const response = await logout(`${session}; ${CART_COOKIE}`);
    assert.equal(response.status, 303);
    assert.deepEqual(buyerIdentityUpdates(), [
      { cartId: CART_ID, buyerIdentity: { customerAccessToken: null } },
    ]);
    assert.doesNotMatch(response.headers.get("set-cookie") ?? "", /cart=/);
  });

  it("expires the cart cookie when the logout detach fails", async () => {
    const { session } = await signIn();
    failBuyerIdentityUpdate = true;
    const response = await logout(`${session}; ${CART_COOKIE}`);
    assert.equal(response.status, 303);
    assert.match(
      response.headers.get("set-cookie") ?? "",
      /(^|, )cart=; Path=\/; SameSite=Lax; Max-Age=0/,
    );
  });

  it("creates the first cart with the signed-in customer attached", async () => {
    const { session } = await signIn();
    storefrontCalls = [];
    const response = await handleShopifyCartRequest(
      new Request(`${ORIGIN}/api/cart`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie: session },
        body: JSON.stringify({
          lines: [
            { merchandiseId: "gid://shopify/ProductVariant/1000", quantity: 1 },
          ],
        }),
      }),
    );
    assert.equal(response.status, 200);
    const create = storefrontCalls.find(({ query }) =>
      query.includes("mutation CartCreate"),
    );
    assert.ok(create, "expected a cartCreate");
    assert.deepEqual(
      (create.variables.input as { buyerIdentity?: unknown }).buyerIdentity,
      { customerAccessToken: ACCESS_TOKEN },
    );
    assert.match(response.headers.get("set-cookie") ?? "", /^cart=/);
  });

  it("marks a signed-in cart read's checkout URL logged_in", async () => {
    const { session } = await signIn();
    const read = (cookie: string) =>
      handleShopifyCartRequest(
        new Request(`${ORIGIN}/api/cart`, { headers: { cookie } }),
      ).then(
        async (response) =>
          ((await response.json()) as { cart: { checkoutUrl: string } }).cart
            .checkoutUrl,
      );
    assert.equal(
      new URL(await read(`${session}; ${CART_COOKIE}`)).searchParams.get(
        "logged_in",
      ),
      "true",
    );
    assert.equal(
      new URL(await read(CART_COOKIE)).searchParams.get("logged_in"),
      null,
    );
  });

  it("names the signed-in customer when the cart changes market", async () => {
    const { session } = await signIn();
    storefrontCalls = [];
    assert.equal((await readFromGermany(session)).status, 200);
    assert.deepEqual(countryUpdate(), {
      countryCode: "DE",
      customerAccessToken: ACCESS_TOKEN,
    });
  });

  it("refreshes an expired token for the country update and commits it", async () => {
    tokenExpiresIn = 60;
    const { session } = await signIn();
    storefrontCalls = [];
    const response = await readFromGermany(session);
    assert.equal(response.status, 200);
    assert.deepEqual(countryUpdate(), {
      countryCode: "DE",
      customerAccessToken: REFRESHED_TOKEN,
    });
    assert.match(
      response.headers.get("set-cookie") ?? "",
      /(^|, )forward_customer_account=v1\./,
    );
  });

  it("detaches the customer when Shopify rejects the refresh", async () => {
    tokenExpiresIn = 60;
    refreshStatus = 400;
    const { session } = await signIn();
    storefrontCalls = [];
    const response = await readFromGermany(session);
    assert.equal(response.status, 200);
    assert.deepEqual(countryUpdate(), {
      countryCode: "DE",
      customerAccessToken: null,
    });
    assert.match(
      response.headers.get("set-cookie") ?? "",
      /(^|, )forward_customer_account=/,
    );
  });

  it("leaves the customer alone when the refresh fails transiently", async () => {
    tokenExpiresIn = 60;
    refreshStatus = 503;
    const { session } = await signIn();
    storefrontCalls = [];
    assert.equal((await readFromGermany(session)).status, 200);
    assert.equal(refreshCalls, 1);
    assert.deepEqual(countryUpdate(), { countryCode: "DE" });
  });

  it("never refreshes on a cart page render", async () => {
    tokenExpiresIn = 60;
    const { session } = await signIn();
    storefrontCalls = [];
    await readShopifyCart(
      new Request(`${ORIGIN}/de-de/cart`, {
        headers: { cookie: `${session}; ${CART_COOKIE}` },
      }),
      "de-de",
    );
    assert.equal(refreshCalls, 0);
    assert.deepEqual(countryUpdate(), { countryCode: "DE" });
  });
});
