import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatDate, formatMoney } from "../src/lib/storefront/format.ts";

describe("formatMoney", () => {
  it("drops cents only from a whole amount", () => {
    assert.equal(
      formatMoney({ amount: 248, currencyCode: "USD" }, "en-us"),
      "$248",
    );
    assert.equal(
      formatMoney({ amount: 228.2, currencyCode: "GBP" }, "en-us"),
      "£228.20",
    );
    assert.equal(
      formatMoney({ amount: 141.3, currencyCode: "EUR" }, "en-us"),
      "€141.30",
    );
    assert.equal(
      formatMoney({ amount: 39476, currencyCode: "JPY" }, "en-us"),
      "¥39,476",
    );
  });

  it("writes money the way the market writes it", () => {
    assert.equal(
      formatMoney({ amount: 221.78, currencyCode: "EUR" }, "de-de"),
      "221,78\u00a0€",
    );
    assert.equal(
      formatMoney({ amount: 221.78, currencyCode: "EUR" }, "en-us"),
      "€221.78",
    );
    /* ICU builds differ on the full- or half-width yen sign. */
    assert.match(
      formatMoney({ amount: 3000, currencyCode: "JPY" }, "ja-jp"),
      /^[¥￥]3,000$/,
    );
    assert.equal(
      formatMoney({ amount: 248, currencyCode: "USD" }, "fr-fr"),
      "248\u00a0$US",
    );
  });
});

describe("formatDate", () => {
  it("writes the date in the market's language", () => {
    assert.equal(formatDate("2026-07-21", "en-us"), "July 21, 2026");
    assert.equal(formatDate("2026-07-21", "de-de"), "21. Juli 2026");
    assert.equal(formatDate("2026-07-21", "ja-jp"), "2026年7月21日");
  });
});
