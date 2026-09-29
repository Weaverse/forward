import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { searchNormalizedProducts } from "../src/lib/storefront/catalog-query.ts";
import { PRODUCT_FIXTURES } from "./fixtures/storefront/products.ts";

function search(query: string) {
  return searchNormalizedProducts(PRODUCT_FIXTURES, query);
}

const FIRST = PRODUCT_FIXTURES[0];

describe("catalog search", () => {
  it("returns no results for empty or whitespace-only queries", () => {
    assert.deepEqual(search(""), []);
    assert.deepEqual(search("   "), []);
  });

  it("returns no results for queries matching nothing", () => {
    assert.deepEqual(search("zzzzzz"), []);
  });

  it("matches product titles case-insensitively", () => {
    assert.ok(FIRST !== undefined);
    assert.ok(
      search(FIRST.title.toUpperCase()).some(
        (product) => product.handle === FIRST.handle,
      ),
    );
  });

  it("requires every term to match", () => {
    assert.ok(FIRST !== undefined);
    assert.deepEqual(search(`${FIRST.title} zzzzzz`), []);
  });

  it("matches colorway names", () => {
    const colorway = FIRST?.colorways[0];
    assert.ok(FIRST !== undefined && colorway !== undefined);
    assert.ok(
      search(colorway.name).some((product) => product.handle === FIRST.handle),
    );
  });
});
