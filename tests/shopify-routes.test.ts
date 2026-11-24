import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "vite-plus/test";

import { NextRequest } from "next/server";

import { findShopifyRedirect } from "../src/lib/routes/shopify-routes.ts";
import { proxy } from "../src/proxy.ts";

const ORIGIN = "https://forward.example";
const SAVED_ENV = { ...process.env };
const REAL_FETCH = globalThis.fetch;

function request(path: string): NextRequest {
  return new NextRequest(`${ORIGIN}${path}`, {
    headers: { "x-forwarded-for": "203.0.113.7" },
  });
}

describe("Shopify routes in the proxy", () => {
  beforeEach(() => {
    process.env.PUBLIC_STORE_DOMAIN = "forward-test.myshopify.com";
    process.env.PRIVATE_STOREFRONT_API_TOKEN = "test-private-token";
  });

  afterEach(() => {
    process.env = { ...SAVED_ENV };
    globalThis.fetch = REAL_FETCH;
  });

  it("answers Hydrogen's routes under /api before Next routes them", async () => {
    /* Hydrogen's Storefront API proxy refuses JSONP without a network call. */
    const response = await proxy(
      request("/api/2026-10/graphql.json?callback=steal"),
    );

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      error: "JSONP requests are not supported",
    });
  });

  it("redirects a Liquid ?variant= link to its option params", async () => {
    globalThis.fetch = async () =>
      Response.json({
        data: {
          node: {
            selectedOptions: [
              { name: "Color", value: "Claystone" },
              { name: "Size", value: "M" },
            ],
            product: { handle: "weatherline-shell" },
          },
        },
      });

    const response = await proxy(
      request("/de-de/products/weatherline-shell?variant=42&ref=mail"),
    );

    assert.equal(response.status, 302);
    assert.equal(
      response.headers.get("location"),
      `${ORIGIN}/de-de/products/weatherline-shell?ref=mail&Color=Claystone&Size=M`,
    );
  });

  it("passes route handlers and files through unlocalized", async () => {
    for (const path of ["/api/cart", "/robots.txt", "/icon.svg"]) {
      const response = await proxy(request(path));

      assert.equal(response.headers.get("x-middleware-next"), "1", path);
      assert.equal(response.headers.get("x-middleware-rewrite"), null, path);
    }
  });

  it("hands not-found the URL the shopper asked for", async () => {
    const response = await proxy(request("/admin?x=1"));

    assert.equal(
      new URL(response.headers.get("x-middleware-rewrite") ?? "").pathname,
      "/en-us/admin",
    );
    assert.equal(
      response.headers.get("x-middleware-request-x-storefront-url"),
      `${ORIGIN}/admin?x=1`,
    );
  });
});

describe("Shopify redirects after a 404", () => {
  const ENV = {
    PUBLIC_STORE_DOMAIN: "forward-test.myshopify.com",
    PRIVATE_STOREFRONT_API_TOKEN: "test-private-token",
  };

  it("sends /admin to the store's admin and Shopify paths to Forward's", async () => {
    assert.deepEqual(await findShopifyRedirect(`${ORIGIN}/admin`, ENV), {
      location: "https://forward-test.myshopify.com/admin",
      permanent: true,
    });
    assert.deepEqual(await findShopifyRedirect(`${ORIGIN}/products`, ENV), {
      location: "/categories",
      permanent: true,
    });
  });
});
