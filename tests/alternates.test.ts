import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { marketAlternates } from "../src/lib/i18n/alternates.ts";

describe("marketAlternates", () => {
  it("lists every market plus x-default on a market-invariant path", () => {
    assert.deepEqual(marketAlternates("/shop", "de-de"), {
      canonical: "/de-de/shop",
      languages: {
        "en-US": "/shop",
        "en-GB": "/en-gb/shop",
        "de-DE": "/de-de/shop",
        "fr-FR": "/fr-fr/shop",
        "ja-JP": "/ja-jp/shop",
        "x-default": "/shop",
      },
    });
    assert.equal(marketAlternates("/", "fr-fr").canonical, "/fr-fr");
    assert.equal(marketAlternates("/", "en-us").canonical, "/");
  });

  it("gives a handle route only its own canonical", () => {
    /* A handle is per-market data; prefix-swapping it can name a 404. */
    assert.deepEqual(marketAlternates("/products/trail-shell", "ja-jp"), {
      canonical: "/ja-jp/products/trail-shell",
    });
    assert.deepEqual(marketAlternates("/shop/outerwear", "en-us"), {
      canonical: "/shop/outerwear",
    });
  });
});
