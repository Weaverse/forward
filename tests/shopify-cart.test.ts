import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  dynamic as cartRouteDynamic,
  fetchCache as cartRouteFetchCache,
  GET as cartRouteGet,
  POST as cartRoutePost,
  runtime as cartRouteRuntime,
} from "../src/app/api/cart/route.ts";
import {
  hardenCartResponseHeaders,
  readTrustedBuyerIp,
  sanitizeCartHandlerResult,
  validateCheckoutUrl,
} from "../src/lib/cart/shopify-cart-server.ts";
import { handleShopifyCartRequest } from "../src/lib/cart/shopify-cart.ts";
import { toHydrogenProductInput } from "../src/lib/cart/shopify-cart-react.tsx";
import { PRODUCT_FIXTURES } from "../src/lib/storefront/fixtures/products.ts";
import {
  PRIVATE_STOREFRONT_TOKEN_ENV_KEY,
  STORE_DOMAIN_ENV_KEY,
} from "../src/lib/storefront/shopify/env.ts";

const STORE_DOMAIN = "forward-test-shop.myshopify.com";

function cartResult(checkoutUrl = `https://${STORE_DOMAIN}/cart/c/synthetic`) {
  return {
    type: "json" as const,
    data: {
      cart: {
        id: "gid://shopify/Cart/synthetic?key=never-expose",
        checkoutUrl,
        totalQuantity: 1,
        lines: { nodes: [{ id: "gid://shopify/CartLine/1" }] },
      },
    },
    headers: {
      "set-cookie":
        "cart=synthetic%3Fkey%3Dcookie-only; Path=/; SameSite=Lax; Max-Age=1209600",
    },
  };
}

describe("Shopify cart request boundary", () => {
  it("keeps the fixed Color option needed to resolve a color-only variant", () => {
    const product = PRODUCT_FIXTURES.find(
      ({ handle }) => handle === "ridge-30-field-pack",
    );
    if (product === undefined) throw new Error("missing product fixture");
    const colorway = product.colorways[0];
    const variant = product.variants[0];
    if (colorway === undefined || variant === undefined) {
      throw new Error("missing product variant fixture");
    }
    const input = toHydrogenProductInput(product, colorway.id);
    assert.deepEqual(
      input.options.map(({ name }) => name),
      ["Color"],
    );
    assert.equal(input.selectedOrFirstAvailableVariant?.id, variant.id);
  });

  it("keeps Color ahead of Size and preserves adjacent variant identities", () => {
    const product = PRODUCT_FIXTURES.find(
      ({ handle }) => handle === "weatherline-shell",
    );
    if (product === undefined) throw new Error("missing product fixture");
    const colorway = product.colorways[0];
    if (colorway === undefined) throw new Error("missing product colorway");

    const input = toHydrogenProductInput(product, colorway.id);
    assert.deepEqual(
      input.options.map(({ name }) => name),
      ["Color", "Size"],
    );
    assert.deepEqual(
      input.options[0]?.optionValues.map(({ name }) => name),
      [colorway.name],
    );
    for (const variant of input.adjacentVariants ?? []) {
      assert.equal(
        variant.selectedOptions.find(({ name }) => name === "Color")?.value,
        colorway.name,
      );
    }
    assert.deepEqual(
      input.adjacentVariants?.map(({ id }) => id),
      product.variants
        .filter((variant) => variant.colorwayId === colorway.id)
        .map(({ id }) => id),
    );
  });

  it("accepts only the first valid Vercel forwarded buyer IP", () => {
    assert.equal(
      readTrustedBuyerIp(
        new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }),
        "production",
      ),
      "203.0.113.7",
    );
    assert.equal(readTrustedBuyerIp(new Headers(), "development"), "127.0.0.1");
  });

  it("rejects missing or malformed production buyer IP", () => {
    assert.throws(
      () => readTrustedBuyerIp(new Headers(), "production"),
      /buyer IP/i,
    );
    assert.throws(
      () =>
        readTrustedBuyerIp(
          new Headers({ "x-forwarded-for": "not-an-ip" }),
          "production",
        ),
      /buyer IP/i,
    );
  });

  it("hardens the Hydrogen cart cookie without exposing a second identity", () => {
    const headers = hardenCartResponseHeaders(
      new Headers(cartResult().headers),
      "production",
    );
    const cookie = headers.get("set-cookie") ?? "";
    assert.match(cookie, /^cart=/);
    assert.match(cookie, /Path=\//);
    assert.match(cookie, /SameSite=Lax/i);
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /Secure/i);
    assert.equal((cookie.match(/HttpOnly/gi) ?? []).length, 1);
    assert.equal((cookie.match(/Secure/gi) ?? []).length, 1);
  });

  it("keeps development cookies usable over local HTTP", () => {
    const headers = hardenCartResponseHeaders(
      new Headers(cartResult().headers),
      "development",
    );
    const cookie = headers.get("set-cookie") ?? "";
    assert.match(cookie, /HttpOnly/i);
    assert.doesNotMatch(cookie, /Secure/i);
  });

  it("fails closed when Hydrogen returns more than one cart identity cookie", () => {
    const headers = new Headers();
    headers.append("set-cookie", "cart=first; Path=/");
    headers.append("set-cookie", "cart=second; Path=/");

    assert.throws(
      () => hardenCartResponseHeaders(headers, "production"),
      /more than one cart identity cookie/i,
    );
  });

  it("preserves non-cart cookies while hardening the single cart identity", () => {
    const nonCartCookie = "analytics=synthetic; Path=/metrics; SameSite=Strict";
    const headers = new Headers();
    headers.append("set-cookie", nonCartCookie);
    headers.append(
      "set-cookie",
      "cart=synthetic; Path=/legacy; SameSite=None; Secure",
    );

    const cookies = hardenCartResponseHeaders(
      headers,
      "production",
    ).getSetCookie();
    assert.equal(cookies.length, 2);
    assert.ok(cookies.includes(nonCartCookie));
    const cartCookie = cookies.find((cookie) => cookie.startsWith("cart="));
    assert.ok(cartCookie !== undefined);
    assert.match(cartCookie, /Path=\/(?:;|$)/);
    assert.doesNotMatch(cartCookie, /Path=\/legacy/);
    assert.match(cartCookie, /SameSite=Lax/i);
    assert.doesNotMatch(cartCookie, /SameSite=None/i);
    assert.match(cartCookie, /HttpOnly/i);
    assert.match(cartCookie, /Secure/i);
  });

  it("redacts the Shopify cart identity while retaining server-owned line data", () => {
    const result = sanitizeCartHandlerResult(cartResult(), STORE_DOMAIN);
    assert.equal(result.type, "json");
    if (result.type !== "json") return;
    const cart = result.data.cart as {
      id: string;
      checkoutUrl: string;
      lines: { nodes: Array<{ id: string }> };
    };
    assert.equal(cart.id, "");
    assert.equal(cart.lines.nodes[0]?.id, "gid://shopify/CartLine/1");
    assert.equal(cart.checkoutUrl, `https://${STORE_DOMAIN}/cart/c/synthetic`);
    assert.ok(!JSON.stringify(result).includes("never-expose"));
  });

  it("validates checkout as an HTTPS Shopify-owned handoff", () => {
    assert.equal(
      validateCheckoutUrl(
        `https://${STORE_DOMAIN}/cart/c/synthetic`,
        STORE_DOMAIN,
      ),
      `https://${STORE_DOMAIN}/cart/c/synthetic`,
    );
    assert.equal(
      validateCheckoutUrl(
        "https://checkout.shopify.com/c/pay/abc",
        STORE_DOMAIN,
      ),
      "https://checkout.shopify.com/c/pay/abc",
    );
    for (const unsafe of [
      "http://forward-test-shop.myshopify.com/cart/c/x",
      "https://evil.example/cart/c/x",
      "https://user:pass@forward-test-shop.myshopify.com/cart/c/x",
      "https://forward-test-shop.myshopify.com:444/cart/c/x",
      "/checkout",
    ]) {
      assert.throws(() => validateCheckoutUrl(unsafe, STORE_DOMAIN));
    }
  });

  it("rejects a cart payload carrying an unsafe checkout URL", () => {
    assert.throws(
      () =>
        sanitizeCartHandlerResult(
          cartResult("https://evil.example/checkout"),
          STORE_DOMAIN,
        ),
      /checkout URL/i,
    );
  });
});

describe("Next Shopify cart route contract", () => {
  it("keeps personalized route config and exposes both HTTP method handlers", () => {
    assert.equal(cartRouteDynamic, "force-dynamic");
    assert.equal(cartRouteFetchCache, "force-no-store");
    assert.equal(cartRouteRuntime, "nodejs");
    assert.equal(typeof cartRouteGet, "function");
    assert.equal(typeof cartRoutePost, "function");
  });
});

describe("pinned Hydrogen cart handler integration", () => {
  it("creates a hardened cookie and serves a cookie-seeded redacted cart", async () => {
    const originalFetch = globalThis.fetch;
    const cart = {
      id: "gid://shopify/Cart/synthetic?key=server-cookie-secret",
      checkoutUrl: `https://${STORE_DOMAIN}/cart/c/synthetic`,
      totalQuantity: 1,
      note: null,
      cost: {
        subtotalAmount: { amount: "248.0", currencyCode: "USD" },
        totalAmount: { amount: "248.0", currencyCode: "USD" },
        checkoutChargeAmount: { amount: "248.0", currencyCode: "USD" },
      },
      lines: { nodes: [] },
      discountCodes: [],
    };
    let buyerIpHeader = "";
    globalThis.fetch = async (_input, init) => {
      const headers = new Headers(init?.headers);
      buyerIpHeader =
        headers.get("Shopify-Storefront-Buyer-IP") ??
        headers.get("shopify-storefront-buyer-ip") ??
        "";
      const request = JSON.parse(String(init?.body)) as { query?: string };
      const isCreate = request.query?.includes("mutation CartCreate") === true;
      return Response.json({
        data: isCreate
          ? { cartCreate: { cart, userErrors: [], warnings: [] } }
          : { cart },
      });
    };

    const env = {
      NODE_ENV: "production",
      [STORE_DOMAIN_ENV_KEY]: STORE_DOMAIN,
      [PRIVATE_STOREFRONT_TOKEN_ENV_KEY]: "synthetic-private-token",
    };

    try {
      const form = new FormData();
      form.set("intent", "add");
      form.set("merchandiseId", "gid://shopify/ProductVariant/1000");
      form.set("quantity", "1");
      const post = await handleShopifyCartRequest(
        new Request("https://forward.example/api/cart", {
          method: "POST",
          headers: {
            "x-forwarded-for": "203.0.113.9",
            referer: "https://forward.example/products/weatherline-shell",
          },
          body: form,
        }),
        env,
      );
      assert.equal(post.status, 303);
      assert.equal(post.headers.get("location"), "/products/weatherline-shell");
      const cookie = post.headers.get("set-cookie") ?? "";
      assert.match(cookie, /^cart=/);
      assert.match(cookie, /HttpOnly/i);
      assert.match(cookie, /Secure/i);
      assert.equal(buyerIpHeader, "203.0.113.9");

      const get = await handleShopifyCartRequest(
        new Request("https://forward.example/api/cart", {
          headers: {
            "x-forwarded-for": "203.0.113.9",
            cookie: cookie.split(";", 1)[0] ?? "",
          },
        }),
        env,
      );
      assert.equal(get.status, 200);
      const body = (await get.json()) as { cart: { id: string } };
      assert.equal(body.cart.id, "");
      assert.ok(!JSON.stringify(body).includes("server-cookie-secret"));
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
