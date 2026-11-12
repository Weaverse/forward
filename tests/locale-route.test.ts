import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";

import { NextRequest } from "next/server";

import { resolveLocaleRoute } from "../src/lib/i18n/locale-route.ts";
import { proxy } from "../src/proxy.ts";

describe("locale routing", () => {
  it("redirects an explicit default locale to the unprefixed path", () => {
    assert.deepEqual(resolveLocaleRoute("/en-us/shop"), {
      kind: "redirect",
      path: "/shop",
    });
    assert.deepEqual(resolveLocaleRoute("/en-us"), {
      kind: "redirect",
      path: "/",
    });
  });

  it("serves a known non-default locale as it is", () => {
    assert.deepEqual(resolveLocaleRoute("/de-de/products/talus-trail-shoe"), {
      kind: "serve",
      locale: "de-de",
      path: "/products/talus-trail-shoe",
    });
  });

  it("rewrites everything else under the default locale", () => {
    assert.deepEqual(resolveLocaleRoute("/"), {
      kind: "rewrite",
      locale: "en-us",
      path: "/",
      target: "/en-us",
    });
    assert.deepEqual(resolveLocaleRoute("/account/orders"), {
      kind: "rewrite",
      locale: "en-us",
      path: "/account/orders",
      target: "/en-us/account/orders",
    });
    /* An unknown prefix is not a locale: it is an ordinary (missing) path. */
    assert.equal(resolveLocaleRoute("/xx-yy/shop").kind, "rewrite");
    assert.equal(resolveLocaleRoute("/xx-yy/shop").path, "/xx-yy/shop");
  });
});

describe("locale cookie", () => {
  function page(path: string, headers: Record<string, string> = {}) {
    return new NextRequest(`https://forward.example${path}`, { headers });
  }

  it("records the market of a page the shopper loads", async () => {
    const response = await proxy(page("/de-de/shop"));

    assert.match(
      response.headers.get("set-cookie") ?? "",
      /forward_locale=de-de/,
    );
  });

  it("leaves the market alone on prefetches", async () => {
    const prefetches: Record<string, string>[] = [
      { "next-router-prefetch": "1", rsc: "1" },
      { "sec-purpose": "prefetch" },
      { purpose: "prefetch" },
    ];
    for (const headers of prefetches) {
      const response = await proxy(page("/ja-jp/shop", headers));

      assert.equal(response.headers.get("set-cookie"), null);
    }
  });
});
