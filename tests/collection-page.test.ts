/**
 * The collection browse read, in both modes.
 *
 * The point of these is parity: a route asks the same question of the static
 * source and the Shopify source and gets the same shape back, so composition
 * cannot depend on which one answered.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  localCollectionPage,
  StaticStorefrontDataSource,
} from "../src/lib/storefront/data-source.ts";
import { PRODUCT_FIXTURES } from "../src/lib/storefront/fixtures/products.ts";
import {
  AVAILABILITY_FILTER_ID,
  applyProductFilters,
  PRICE_FILTER_ID,
  synthesizeProductFilters,
} from "../src/lib/storefront/product-filters.ts";
import {
  catalogSortArguments,
  collectionSortArguments,
  parseProductSort,
} from "../src/lib/storefront/sort.ts";

const source = new StaticStorefrontDataSource();

describe("collection page", () => {
  it("resolves an unknown collection to null rather than an empty page", async () => {
    assert.equal(await source.getCollectionPage("does-not-exist"), null);
  });

  it("offers the facets every Shopify store exposes, and no theme invention", async () => {
    const page = await source.getCollectionPage("forward");
    assert.ok(page);
    assert.deepEqual(
      page.filters.map((filter) => filter.id),
      [AVAILABILITY_FILTER_ID, PRICE_FILTER_ID],
    );
    /* Whatever a merchant enables in Search & Discovery arrives in the live
     * response; nothing here is declared by the theme. */
    assert.equal(page.filters[0]?.type, "LIST");
    assert.equal(page.filters[1]?.type, "PRICE_RANGE");
  });

  it("describes facets over the unnarrowed collection", async () => {
    /* Counts derived from the filtered result would delete the options a
     * shopper needs to widen the view again. */
    const all = await source.getCollectionPage("forward");
    const narrowed = await source.getCollectionPage("forward", {
      filters: [{ available: true }],
    });
    assert.deepEqual(all?.filters, narrowed?.filters);
  });

  it("round-trips a facet's own input through the query", async () => {
    const page = await source.getCollectionPage("forward");
    const inStock = page?.filters[0]?.values[0];
    assert.ok(inStock);
    /* The theme never builds this JSON; it comes from the facet and goes back
     * unchanged, which is what lets an unknown facet work. */
    const applied = await source.getCollectionPage("forward", {
      filters: [JSON.parse(inStock.input)],
    });
    assert.equal(applied?.products.length, inStock.count);
  });

  it("pages forward and back over cursors", async () => {
    const first = await source.getCollectionPage("forward", { pageBy: 4 });
    assert.ok(first);
    assert.equal(first.products.length, 4);
    assert.equal(first.pageInfo.hasPreviousPage, false);
    assert.equal(first.pageInfo.hasNextPage, true);

    const second = await source.getCollectionPage("forward", {
      pageBy: 4,
      after: first.pageInfo.endCursor ?? undefined,
    });
    assert.ok(second);
    assert.equal(second.pageInfo.hasPreviousPage, true);
    assert.deepEqual(
      second.products.map((product) => product.handle).slice(0, 1),
      ["approach-18-day-pack"],
    );

    const back = await source.getCollectionPage("forward", {
      pageBy: 4,
      before: second.pageInfo.startCursor ?? undefined,
    });
    assert.deepEqual(
      back?.products.map((product) => product.handle),
      first.products.map((product) => product.handle),
    );
  });

  it("orders by the requested sort", async () => {
    const ascending = await source.getCollectionPage("forward", {
      sort: "price-asc",
      pageBy: 50,
    });
    const amounts = ascending?.products.map((product) => product.price.amount);
    assert.deepEqual(
      amounts,
      [...(amounts ?? [])].sort((a, b) => a - b),
    );
  });
});

describe("local filter semantics", () => {
  it("requires every filter to match", () => {
    const expensive = Math.max(
      ...PRODUCT_FIXTURES.map((product) => product.price.amount),
    );
    assert.deepEqual(
      applyProductFilters(PRODUCT_FIXTURES, [
        { available: true },
        { price: { min: expensive } },
      ]).map((product) => product.price.amount),
      [expensive],
    );
  });

  it("ignores a filter shape it does not recognise", () => {
    /* A merchant-enabled facet reaches the static source as an unknown shape.
     * Dropping every product would be a worse lie than showing them all. */
    assert.equal(
      applyProductFilters(PRODUCT_FIXTURES, [{ productMetafield: {} }]).length,
      PRODUCT_FIXTURES.length,
    );
  });

  it("synthesizes nothing for an empty collection", () => {
    assert.deepEqual(synthesizeProductFilters([]), []);
  });

  it("keeps a page shaped like a live response", () => {
    const page = localCollectionPage(PRODUCT_FIXTURES, { pageBy: 2 });
    assert.equal(page.products.length, 2);
    assert.equal(page.pageInfo.hasNextPage, true);
    assert.equal(page.pageInfo.hasPreviousPage, false);
    assert.equal(typeof page.pageInfo.endCursor, "string");
  });
});

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
