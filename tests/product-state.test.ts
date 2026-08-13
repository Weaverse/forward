import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PRODUCT_FIXTURES } from "../src/lib/storefront/fixtures/products.ts";
import {
  COLORWAY_PARAM,
  galleryImages,
  isKnownColorway,
  optionParamKey,
  productColorwayHref,
  productSelectionHref,
  resolveColorway,
  resolveProductSelection,
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

describe("resolveProductSelection", () => {
  it("selects the first available complete variant by default", () => {
    const product = firstProduct();
    const selection = resolveProductSelection(product, undefined);
    assert.equal(selection.colorway, product.colorways[0]);
    assert.equal(selection.variant.availableForSale, true);
    assert.deepEqual(selection.selectedOptions, { Size: "XS" });
  });

  it("restores an exact colorway and option selection", () => {
    const product = firstProduct();
    const second = product.colorways[1];
    assert.ok(second !== undefined);
    const selection = resolveProductSelection(product, second.id, {
      Size: "L",
    });
    assert.equal(selection.colorway.id, second.id);
    assert.equal(selection.selectedOptions.Size, "L");
    assert.equal(selection.variant.colorwayId, second.id);
  });

  it("falls back to a valid complete variant for stale option values", () => {
    const product = firstProduct();
    const selection = resolveProductSelection(product, undefined, {
      Size: "__missing__",
    });
    assert.equal(selection.selectedOptions.Size, "XS");
  });

  it("preserves an exact sold-out deep link instead of swapping variants", () => {
    const product = firstProduct();
    const soldOut = product.variants[1];
    assert.ok(soldOut);
    const unavailableProduct = {
      ...product,
      variants: product.variants.map((variant) =>
        variant.id === soldOut.id
          ? { ...variant, availableForSale: false }
          : variant,
      ),
    };
    const selectedOptions = Object.fromEntries(
      soldOut.selectedOptions.map(({ name, value }) => [name, value]),
    );
    const selection = resolveProductSelection(
      unavailableProduct,
      soldOut.colorwayId,
      selectedOptions,
    );
    assert.equal(selection.variant.id, soldOut.id);
    assert.equal(selection.variant.availableForSale, false);
  });
});

describe("productSelectionHref", () => {
  it("serializes every selected option and retains unrelated params", () => {
    const product = firstProduct();
    assert.equal(optionParamKey("Waist Size"), "waist-size");
    assert.equal(
      productSelectionHref(
        product,
        "claystone",
        { Size: "M" },
        new URLSearchParams("utm_source=field"),
      ),
      `/products/${product.handle}?utm_source=field&colorway=claystone&size=M`,
    );
  });
});
