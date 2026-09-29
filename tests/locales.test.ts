import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  DEFAULT_LOCALE,
  localeTag,
  localizePath,
  parseLocale,
  splitLocale,
} from "../src/lib/i18n/locales.ts";

describe("locales", () => {
  it("parses only known locale segments", () => {
    assert.equal(parseLocale("de-de"), "de-de");
    assert.equal(parseLocale("xx-yy"), null);
    assert.equal(parseLocale("toString"), null);
    assert.equal(parseLocale(undefined), null);
  });

  it("keeps the default locale out of every URL", () => {
    assert.equal(localizePath("/shop", DEFAULT_LOCALE), "/shop");
    assert.equal(
      localizePath("/shop?sort=name", "de-de"),
      "/de-de/shop?sort=name",
    );
    assert.equal(localizePath("/", "ja-jp"), "/ja-jp");
  });

  it("never prefixes a path that already names a locale", () => {
    assert.equal(
      localizePath("/de-de/shop?sort=name", "de-de"),
      "/de-de/shop?sort=name",
    );
    assert.equal(localizePath("/de-de", "de-de"), "/de-de");
    assert.equal(localizePath("/de-defaults", "de-de"), "/de-de/de-defaults");
  });

  it("leaves external and non-path hrefs alone", () => {
    for (const href of [
      "https://example.com/x",
      "//cdn.example/x",
      "#top",
      "?q=1",
      "mailto:a@b.c",
    ]) {
      assert.equal(localizePath(href, "fr-fr"), href);
    }
  });

  it("splits a locale prefix back off", () => {
    assert.deepEqual(splitLocale("/de-de/shop/packs"), {
      locale: "de-de",
      path: "/shop/packs",
    });
    assert.deepEqual(splitLocale("/de-de"), { locale: "de-de", path: "/" });
    assert.deepEqual(splitLocale("/shop"), { locale: null, path: "/shop" });
    assert.deepEqual(splitLocale("/xx-yy/shop"), {
      locale: null,
      path: "/xx-yy/shop",
    });
    for (const locale of ["en-gb", "de-de"] as const) {
      assert.deepEqual(splitLocale(localizePath("/cart", locale)), {
        locale,
        path: "/cart",
      });
    }
  });

  it("builds the Intl tag from language and country", () => {
    assert.equal(localeTag("de-de"), "de-DE");
    assert.equal(localeTag("en-us"), "en-US");
  });
});
