import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { resolveLocaleRoute } from "../src/lib/i18n/locale-route.ts";

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
