import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { StaticStorefrontDataSource } from "../src/lib/storefront/data-source.ts";
import { PRODUCT_FIXTURES } from "../src/lib/storefront/fixtures/products.ts";
import {
  CONTENT_ARTICLE_HANDLES,
  CONTENT_PAGE_HANDLES,
} from "../src/lib/storefront/shopify/content-query.ts";

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
});

describe("StaticStorefrontDataSource known handles", () => {
  it("returns every fixture product by handle", async () => {
    const products = await storefront.listProducts();
    assert.deepEqual(
      products.map((product) => product.handle),
      PRODUCT_FIXTURES.map((product) => product.handle),
    );
    for (const product of products) {
      const found = await storefront.getProduct(product.handle);
      assert.equal(found?.handle, product.handle);
    }
  });

  it("keeps exact expanded product and content contracts", async () => {
    const products = await storefront.listProducts();
    const byHandle = new Map(
      products.map((product) => [product.handle, product]),
    );
    assert.equal(byHandle.get("ridge-30-field-pack")?.price.amount, 198);
    assert.equal(byHandle.get("talus-trail-shoe")?.price.amount, 168);
    assert.deepEqual(byHandle.get("talus-trail-shoe")?.options[0]?.values, [
      "US 7",
      "US 8",
      "US 9",
      "US 10",
      "US 11",
      "US 12",
      "US 13",
    ]);
    assert.deepEqual(
      (await storefront.listPages()).map((page) => page.handle),
      [...CONTENT_PAGE_HANDLES],
    );
    assert.deepEqual(
      (await storefront.listArticles()).map((article) => article.handle),
      [...CONTENT_ARTICLE_HANDLES],
    );
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

  it("narrows and orders a collection through the same normalized semantics", async () => {
    /* The collection route hands filter and sort straight to this call, so
     * the seam has to apply them rather than return the whole collection and
     * leave a page to re-filter what it was given. */
    const [collection] = await storefront.listCollections();
    assert.ok(collection);
    const all = await storefront.getCollectionProducts(collection.handle);
    assert.ok(all);

    const category = all[0]?.category;
    assert.ok(category);
    const narrowed = await storefront.getCollectionProducts(collection.handle, {
      category,
    });
    assert.ok(narrowed);
    assert.ok(narrowed.length <= all.length);
    assert.deepEqual(
      narrowed.map((product) => product.category),
      narrowed.map(() => category),
    );

    const ascending = await storefront.getCollectionProducts(
      collection.handle,
      {},
      "price-asc",
    );
    assert.ok(ascending);
    const amounts = ascending.map((product) => product.price.amount);
    assert.deepEqual(
      amounts,
      [...amounts].sort((a, b) => a - b),
    );
  });

  it("returns nothing for a filter the collection cannot satisfy", async () => {
    const [collection] = await storefront.listCollections();
    assert.ok(collection);
    assert.deepEqual(
      await storefront.getCollectionProducts(collection.handle, {
        activity: "no-such-activity",
      }),
      [],
    );
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
