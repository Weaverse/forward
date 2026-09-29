/**
 * The sort vocabulary: every option is a real Shopify sort key, for a
 * collection and for the whole catalog.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  catalogSortArguments,
  collectionSortArguments,
  parseProductSort,
} from "../src/lib/storefront/sort.ts";

describe("sort vocabulary", () => {
  it("maps every option to a real Shopify sort key", () => {
    for (const sort of [
      "featured",
      "price-asc",
      "price-desc",
      "name",
      "best-selling",
      "newest",
    ] as const) {
      assert.ok(collectionSortArguments(sort).sortKey.length > 0);
      assert.ok(catalogSortArguments(sort).sortKey.length > 0);
    }
    assert.equal(collectionSortArguments("name").sortKey, "TITLE");
    assert.equal(catalogSortArguments("newest").sortKey, "CREATED_AT");
    assert.equal(collectionSortArguments("newest").sortKey, "CREATED");
    assert.equal(collectionSortArguments("price-desc").reverse, true);
  });

  it("falls back to the merchant's own order for an unknown sort", () => {
    assert.equal(parseProductSort("sideways"), "featured");
    assert.equal(
      collectionSortArguments(parseProductSort(null)).sortKey,
      "COLLECTION_DEFAULT",
    );
  });
});
