import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DYNAMIC_NOT_FOUND_SMOKES,
  findMissingRoutePatterns,
  NOT_FOUND_SMOKE,
  normalizeAppRoutePattern,
  REDIRECT_CONTRACT,
  RESOURCE_ROUTES,
  ROUTE_CONTRACT,
  SMOKE_FIXTURES,
} from "../src/lib/routes/route-contract.ts";
import {
  formatRouteSegment,
  safeDecodeRouteSegment,
} from "../src/lib/routes/segments.ts";

describe("normalizeAppRoutePattern", () => {
  it("normalizes page manifest keys to route patterns", () => {
    assert.equal(normalizeAppRoutePattern("/page"), "/");
    assert.equal(normalizeAppRoutePattern("/shop/page"), "/shop");
    assert.equal(
      normalizeAppRoutePattern("/shop/[collectionHandle]/page"),
      "/shop/[collectionHandle]",
    );
    assert.equal(
      normalizeAppRoutePattern("/account/orders/[orderId]/page"),
      "/account/orders/[orderId]",
    );
  });

  it("normalizes route-handler and metadata manifest keys", () => {
    assert.equal(
      normalizeAppRoutePattern("/account/logout/route"),
      "/account/logout",
    );
    assert.equal(normalizeAppRoutePattern("/robots.txt/route"), "/robots.txt");
    assert.equal(
      normalizeAppRoutePattern("/sitemap.xml/route"),
      "/sitemap.xml",
    );
  });

  it("strips route groups and parallel-route slots", () => {
    assert.equal(
      normalizeAppRoutePattern("/(marketing)/journal/page"),
      "/journal",
    );
    assert.equal(
      normalizeAppRoutePattern("/shop/@modal/[collectionHandle]/page"),
      "/shop/[collectionHandle]",
    );
  });

  it("rejects manifest keys that are not addressable routes", () => {
    assert.equal(normalizeAppRoutePattern("/_not-found/page"), null);
    assert.equal(normalizeAppRoutePattern("/shop/layout"), null);
    assert.equal(normalizeAppRoutePattern("/shop/default"), null);
  });
});

describe("findMissingRoutePatterns", () => {
  const allPatterns = ROUTE_CONTRACT.map((entry) => entry.pattern);

  it("returns an empty list when every required pattern is present", () => {
    assert.deepEqual(findMissingRoutePatterns(allPatterns), []);
  });

  it("reports required patterns absent from the build output", () => {
    const withoutProduct = allPatterns.filter(
      (pattern) => pattern !== "/products/[productHandle]",
    );
    assert.deepEqual(findMissingRoutePatterns(withoutProduct), [
      "/products/[productHandle]",
    ]);
  });

  it("fails when resource routes are missing", () => {
    const withoutResources = allPatterns.filter(
      (pattern) => pattern !== "/robots.txt" && pattern !== "/sitemap.xml",
    );
    const missing = findMissingRoutePatterns(withoutResources);
    assert.ok(missing.includes("/robots.txt"));
    assert.ok(missing.includes("/sitemap.xml"));
  });

  it("ignores extra routes that are not part of the contract", () => {
    assert.deepEqual(
      findMissingRoutePatterns([...allPatterns, "/extra", "/beta/[x]"]),
      [],
    );
  });
});

describe("route contract shape", () => {
  it("keeps the literal /collections/all redirect ahead of the parameterised rule", () => {
    const allIndex = REDIRECT_CONTRACT.findIndex(
      (entry) => entry.source === "/collections/all",
    );
    const paramIndex = REDIRECT_CONTRACT.findIndex(
      (entry) => entry.source === "/collections/:collectionHandle",
    );
    assert.ok(allIndex !== -1 && paramIndex !== -1);
    assert.ok(allIndex < paramIndex);
  });

  it("only uses permanent redirects", () => {
    for (const entry of REDIRECT_CONTRACT) {
      assert.equal(entry.permanent, true);
    }
  });

  it("preserves compatibility-redirect query strings in HTTP smoke", () => {
    const collectionsAll = REDIRECT_CONTRACT.find(
      (entry) => entry.source === "/collections/all",
    );
    assert.ok(collectionsAll);
    assert.equal(
      collectionsAll.smoke.path,
      "/collections/all?utm_source=route-smoke",
    );
    assert.equal(
      collectionsAll.smoke.expectedLocation,
      "/shop?utm_source=route-smoke",
    );
  });

  it("defines an unknown-path 404 smoke outside the route contract", () => {
    assert.equal(NOT_FOUND_SMOKE.expectedStatus, 404);
    assert.equal(NOT_FOUND_SMOKE.expectedContentType, "text/html");
    assert.ok(
      !ROUTE_CONTRACT.some((route) => route.pattern === NOT_FOUND_SMOKE.path),
    );
  });

  it("smokes unknown handles for every fixture-backed dynamic route", () => {
    assert.deepEqual(
      DYNAMIC_NOT_FOUND_SMOKES.map((smoke) => smoke.path),
      [
        "/shop/__forward-missing__",
        "/products/__forward-missing__",
        "/journal/__forward-missing__",
        "/pages/__forward-missing__",
        "/policies/__forward-missing__",
        "/account/orders/__forward-missing__",
      ],
    );
    for (const smoke of DYNAMIC_NOT_FOUND_SMOKES) {
      assert.equal(smoke.expectedStatus, 404);
      assert.equal(smoke.expectedContentType, "text/html");
    }
  });

  it("checks resource response media types", () => {
    assert.deepEqual(
      RESOURCE_ROUTES.map((route) => route.smoke.expectedContentType),
      ["text/plain", "application/xml"],
    );
  });

  it("smokes dynamic patterns with approved fixture handles", () => {
    const productSmoke = ROUTE_CONTRACT.find(
      (entry) => entry.pattern === "/products/[productHandle]",
    );
    assert.ok(productSmoke);
    const handle = productSmoke.smoke.path.replace("/products/", "");
    assert.ok(
      (SMOKE_FIXTURES.productHandles as readonly string[]).includes(handle),
    );
  });

  it("keeps account protocol surfaces honest (501, not success)", () => {
    for (const pattern of ["/account/authorize", "/account/logout"]) {
      const entry = ROUTE_CONTRACT.find((route) => route.pattern === pattern);
      assert.ok(entry, `${pattern} missing from contract`);
      assert.equal(entry.smoke.expectedStatus, 501);
      assert.equal(entry.smoke.expectedContentType, "text/plain");
    }
  });
});

describe("route-segment display helpers", () => {
  it("decodes valid URL segments once", () => {
    assert.equal(safeDecodeRouteSegment("ridge%2030"), "ridge 30");
    assert.equal(
      formatRouteSegment("ridge-30-field-pack"),
      "Ridge 30 Field Pack",
    );
  });

  it("does not throw for malformed raw percent sequences", () => {
    assert.equal(safeDecodeRouteSegment("100%"), "100%");
    assert.equal(formatRouteSegment("100%"), "100%");
  });
});
