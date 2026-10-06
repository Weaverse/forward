import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createTranslator } from "../src/lib/i18n/translate.ts";

const STATIC = {
  cart: { title: "Your cart", count: "{{count}} items" },
  footer: { tagline: "" },
};

describe("createTranslator", () => {
  it("falls back from a live edit to an override to static copy to the key", () => {
    const t = createTranslator({
      designOverrides: { "cart.title": "Live" },
      overrides: { cart: { title: "Warenkorb", count: "{{count}} Artikel" } },
      staticContent: STATIC,
    });
    assert.equal(t("cart.title"), "Live");
    assert.equal(t("cart.count", { count: 2 }), "2 Artikel");

    const published = createTranslator({ staticContent: STATIC });
    assert.equal(published("cart.title"), "Your cart");
    assert.equal(published("cart.missing"), "cart.missing");
  });

  it("keeps an intentionally empty translation", () => {
    const t = createTranslator({
      overrides: { cart: { title: "" } },
      staticContent: STATIC,
    });
    assert.equal(t("cart.title"), "");
    assert.equal(t("footer.tagline"), "");
  });

  it("never resolves a key through the prototype chain", () => {
    const overrides = JSON.parse('{"__proto__": {"title": "polluted"}}');
    const t = createTranslator({ overrides, staticContent: STATIC });
    assert.equal(t("constructor"), "constructor");
    assert.equal(t("toString"), "toString");
    assert.equal(t("cart.constructor"), "cart.constructor");
    assert.equal(t("title"), "title");
    assert.equal(
      createTranslator({ designOverrides: {}, staticContent: STATIC })(
        "hasOwnProperty",
      ),
      "hasOwnProperty",
    );
  });

  it("leaves an unknown placeholder in place", () => {
    const t = createTranslator({ staticContent: STATIC });
    assert.equal(t("cart.count"), "{{count}} items");
    assert.equal(t("cart.count", { other: 1 }), "{{count}} items");
  });
});
