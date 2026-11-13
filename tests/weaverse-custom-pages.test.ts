import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";

import { isDefaultMarketCustomPage } from "../src/lib/weaverse/custom-pages.ts";

describe("isDefaultMarketCustomPage", () => {
  it("keeps global and default-market entries, drops per-market `null` rows", () => {
    assert.equal(isDefaultMarketCustomPage({ locale: "" }), true);
    assert.equal(isDefaultMarketCustomPage({ locale: "en-US" }), true);
    assert.equal(isDefaultMarketCustomPage({ locale: "de-de" }), false);
    /* Market-first per-market assignment: the endpoint omits `market`. */
    assert.equal(isDefaultMarketCustomPage({ locale: null }), false);
  });
});
