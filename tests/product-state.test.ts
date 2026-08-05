import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PRODUCT_FIXTURES } from "../src/lib/storefront/fixtures/products.ts";
import {
  COLORWAY_PARAM,
  galleryImages,
  isKnownColorway,
  productColorwayHref,
  resolveColorway,
} from "../src/lib/storefront/product-state.ts";
import type { Product } from "../src/lib/storefront/types.ts";

function firstProduct(): Product {
  const product = PRODUCT_FIXTURES[0];
  assert.ok(product !== undefined);
  assert.ok(product.colorways.length >= 2);
  return product;
}

describe("resolveColorway", () => {
  it("falls back to the first colorway when no id is given", () => {
    const product = firstProduct();
    assert.equal(resolveColorway(product, undefined), product.colorways[0]);
  });

  it("falls back to the first colorway for unknown ids", () => {
    const product = firstProduct();
    assert.equal(
      resolveColorway(product, "not-a-colorway"),
      product.colorways[0],
    );
  });

  it("resolves a known non-default colorway", () => {
    const product = firstProduct();
    const second = product.colorways[1];
    assert.ok(second !== undefined);
    assert.equal(resolveColorway(product, second.id), second);
  });

  it("throws for a product with no colorways", () => {
    const broken = { ...firstProduct(), colorways: [] };
    assert.throws(() => resolveColorway(broken, undefined));
  });
});

describe("isKnownColorway", () => {
  it("distinguishes known from unknown colorway ids", () => {
    const product = firstProduct();
    const first = product.colorways[0];
    assert.ok(first !== undefined);
    assert.equal(isKnownColorway(product, first.id), true);
    assert.equal(isKnownColorway(product, "not-a-colorway"), false);
  });
});

describe("galleryImages", () => {
  it("returns the four-image group in primary/alternate/detail/context order", () => {
    const colorway = firstProduct().colorways[0];
    assert.ok(colorway !== undefined);
    assert.deepEqual(galleryImages(colorway), [
      colorway.images.primary,
      colorway.images.alternate,
      colorway.images.detail,
      colorway.images.context,
    ]);
  });
});

describe("productColorwayHref", () => {
  it("keeps the first colorway on the canonical unparameterized URL", () => {
    const product = firstProduct();
    const first = product.colorways[0];
    assert.ok(first !== undefined);
    assert.equal(
      productColorwayHref(product, first.id),
      `/products/${product.handle}`,
    );
  });

  it("deep links non-default colorways via the colorway param", () => {
    const product = firstProduct();
    const second = product.colorways[1];
    assert.ok(second !== undefined);
    assert.equal(
      productColorwayHref(product, second.id),
      `/products/${product.handle}?${COLORWAY_PARAM}=${encodeURIComponent(second.id)}`,
    );
  });

  it("URL-encodes colorway ids", () => {
    const product = firstProduct();
    assert.equal(
      productColorwayHref(product, "a b/c"),
      `/products/${product.handle}?${COLORWAY_PARAM}=a%20b%2Fc`,
    );
  });
});
