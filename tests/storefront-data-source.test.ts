import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { StaticStorefrontDataSource } from "../src/lib/storefront/data-source.ts";
import { productColorwayHref } from "../src/lib/storefront/product-state.ts";

const storefront = new StaticStorefrontDataSource();

describe("StaticStorefrontDataSource unknown handles", () => {
  it("resolves unknown product handles to null", async () => {
    assert.equal(await storefront.getProduct("does-not-exist"), null);
    assert.equal(await storefront.getProduct(""), null);
  });

  it("resolves unknown collection handles to null", async () => {
    assert.equal(await storefront.getCollection("does-not-exist"), null);
    assert.equal(
      await storefront.getCollectionProducts("does-not-exist"),
      null,
    );
  });

  it("resolves unknown journal, page, and policy handles to null", async () => {
    assert.equal(await storefront.getArticle("does-not-exist"), null);
    assert.equal(await storefront.getPage("does-not-exist"), null);
    assert.equal(await storefront.getPolicy("does-not-exist"), null);
  });

  it("resolves unknown demo order ids to null", async () => {
    assert.equal(await storefront.getDemoOrder("does-not-exist"), null);
  });
});

describe("StaticStorefrontDataSource known handles", () => {
  it("returns every fixture product by handle", async () => {
    const products = await storefront.listProducts();
    assert.ok(products.length > 0);
    for (const product of products) {
      const found = await storefront.getProduct(product.handle);
      assert.equal(found?.handle, product.handle);
    }
  });

  it("returns only known products for a known collection", async () => {
    const collections = await storefront.listCollections();
    assert.ok(collections.length > 0);
    for (const collection of collections) {
      const products = await storefront.getCollectionProducts(
        collection.handle,
      );
      assert.notEqual(products, null);
      for (const product of products ?? []) {
        assert.ok(collection.productHandles.includes(product.handle));
      }
    }
  });

  it("keeps every demo order line linked to its exact product colorway", async () => {
    const hrefs: string[] = [];
    for (const order of await storefront.listDemoOrders()) {
      for (const line of order.lines) {
        const product = await storefront.getProduct(line.productHandle);
        assert.ok(
          product !== null,
          `Unknown order product: ${line.productHandle}`,
        );
        assert.ok(
          product.colorways.some((colorway) => colorway.id === line.colorwayId),
          `Unknown ${line.productHandle} colorway: ${line.colorwayId}`,
        );
        hrefs.push(productColorwayHref(product, line.colorwayId));
      }
    }
    assert.ok(hrefs.includes("/products/talus-trail-shoe?colorway=limestone"));
    assert.ok(hrefs.includes("/products/ridge-30-field-pack?colorway=dune"));
  });
});

describe("StaticStorefrontDataSource search", () => {
  it("returns no results for empty or whitespace-only queries", async () => {
    assert.deepEqual(await storefront.searchProducts(""), []);
    assert.deepEqual(await storefront.searchProducts("   "), []);
  });

  it("returns no results for queries matching nothing", async () => {
    assert.deepEqual(await storefront.searchProducts("zzzzzz"), []);
  });

  it("matches product titles case-insensitively", async () => {
    const products = await storefront.listProducts();
    const first = products[0];
    assert.ok(first !== undefined);
    const results = await storefront.searchProducts(first.title.toUpperCase());
    assert.ok(results.some((product) => product.handle === first.handle));
  });

  it("requires every term to match", async () => {
    const products = await storefront.listProducts();
    const first = products[0];
    assert.ok(first !== undefined);
    const results = await storefront.searchProducts(`${first.title} zzzzzz`);
    assert.deepEqual(results, []);
  });

  it("matches colorway names", async () => {
    const products = await storefront.listProducts();
    const first = products[0];
    const colorway = first?.colorways[0];
    assert.ok(first !== undefined && colorway !== undefined);
    const results = await storefront.searchProducts(colorway.name);
    assert.ok(results.some((product) => product.handle === first.handle));
  });
});
