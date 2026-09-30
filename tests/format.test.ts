import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatMoney } from "../src/lib/storefront/format.ts";

describe("formatMoney", () => {
  it("drops cents only from a whole amount", () => {
    assert.equal(formatMoney({ amount: 248, currencyCode: "USD" }), "$248");
    assert.equal(
      formatMoney({ amount: 228.2, currencyCode: "GBP" }),
      "£228.20",
    );
    assert.equal(
      formatMoney({ amount: 141.3, currencyCode: "EUR" }),
      "€141.30",
    );
    assert.equal(
      formatMoney({ amount: 39476, currencyCode: "JPY" }),
      "¥39,476",
    );
  });
});
