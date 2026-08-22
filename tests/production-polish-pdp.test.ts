/**
 * PDP commerce truth — the normalized data half.
 *
 * The nullable compare-at money contract, honest sale detection, and
 * selected-variant resolution are pure mapper/selection logic and stay here.
 * How the PDP renders them — price, sale markup, sold-out semantics, option
 * readability, gallery composition, zoom accessibility, and add-to-cart
 * identity — is proved in `tests/dom/product-detail.test.tsx`, and gallery
 * geometry in `tests/browser/pdp.pw.ts`.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { PRODUCT_FIXTURES } from "../src/lib/storefront/fixtures/products.ts";
import {
  resolveProductSelection,
  saleCompareAtPrice,
} from "../src/lib/storefront/product-state.ts";
import { mapCatalogResult } from "../src/lib/storefront/shopify/mapper.ts";
import type { Money, Product } from "../src/lib/storefront/types.ts";
import {
  catalogResponse,
  type CatalogResponse,
  catalogResponseWith,
} from "./fixtures/shopify-catalog-response.ts";

const USD = (amount: number): Money => ({ amount, currencyCode: "USD" });

function mappedShell(response: CatalogResponse = catalogResponse()): Product {
  const product = mapCatalogResult(response).find(
    (entry) => entry.handle === "weatherline-shell",
  );
  assert.ok(product !== undefined);
  return product;
}

describe("compare-at money contract", () => {
  it("maps a present compare-at price for every mapped variant", () => {
    const shell = mappedShell();

    assert.equal(shell.variants.length, 10);
    for (const variant of shell.variants) {
      assert.deepEqual(variant.compareAtPrice, USD(248));
      assert.equal(
        saleCompareAtPrice(variant),
        null,
        "a compare-at equal to the price is not a sale",
      );
    }
  });

  it("maps absent and explicitly null compare-at to null", () => {
    const shell = mappedShell(
      catalogResponseWith("weatherline-shell", (product) => {
        product.variants.nodes[0].compareAtPrice = null;
        product.variants.nodes[1].compareAtPrice = undefined;
      }),
    );

    assert.equal(shell.variants[0]?.compareAtPrice, null);
    assert.equal(shell.variants[1]?.compareAtPrice, null);
    assert.deepEqual(shell.variants[2]?.compareAtPrice, USD(248));
  });

  it("maps a genuinely higher compare-at without touching the price", () => {
    const shell = mappedShell(
      catalogResponseWith("weatherline-shell", (product) => {
        product.variants.nodes[3].price.amount = "199.5";
        product.variants.nodes[3].compareAtPrice = {
          amount: "248.0",
          currencyCode: "USD",
        };
      }),
    );

    assert.deepEqual(shell.variants[3]?.price, USD(199.5));
    assert.deepEqual(shell.variants[3]?.compareAtPrice, USD(248));
  });

  it("rejects malformed or drifted compare-at money", () => {
    for (const compareAtPrice of [
      { amount: "248.0", currencyCode: "EUR" },
      { amount: "", currencyCode: "USD" },
      { amount: "not-a-number", currencyCode: "USD" },
      { amount: "-1.00", currencyCode: "USD" },
      { currencyCode: "USD" },
      { amount: "248.0" },
      [],
      "248.0",
    ]) {
      assert.throws(
        () =>
          mapCatalogResult(
            catalogResponseWith("weatherline-shell", (product) => {
              product.variants.nodes[0].compareAtPrice = compareAtPrice;
            }),
          ),
        /compareAtPrice/,
        `accepted malformed compare-at ${JSON.stringify(compareAtPrice)}`,
      );
    }
  });

  it("keeps the deterministic static catalog free of invented sale data", () => {
    for (const product of PRODUCT_FIXTURES) {
      for (const variant of product.variants) {
        assert.equal(variant.compareAtPrice, null);
        assert.equal(saleCompareAtPrice(variant), null);
      }
    }
  });
});

describe("honest sale detection", () => {
  const base = {
    id: "v",
    colorwayId: "charcoal",
    selectedOptions: [],
  } as const;

  it("only reports a sale for a strictly higher same-currency compare-at", () => {
    assert.deepEqual(
      saleCompareAtPrice({
        ...base,
        price: USD(199.5),
        compareAtPrice: USD(248),
        availableForSale: true,
      }),
      USD(248),
    );
    for (const compareAtPrice of [
      null,
      USD(248),
      USD(199),
      { amount: 300, currencyCode: "EUR" } as unknown as Money,
    ]) {
      assert.equal(
        saleCompareAtPrice({
          ...base,
          price: USD(248),
          compareAtPrice,
          availableForSale: true,
        }),
        null,
      );
    }
  });
});

describe("selected-variant pricing on the PDP", () => {
  it("switches price and compare-at with the selected variant", () => {
    const shell = mappedShell(
      catalogResponseWith("weatherline-shell", (product) => {
        product.variants.nodes[3].price.amount = "199.5";
        product.variants.nodes[3].compareAtPrice = {
          amount: "248.0",
          currencyCode: "USD",
        };
      }),
    );

    const regular = resolveProductSelection(shell, "charcoal", { Size: "XS" });
    const discounted = resolveProductSelection(shell, "charcoal", {
      Size: "L",
    });

    assert.deepEqual(regular.variant.price, USD(248));
    assert.equal(saleCompareAtPrice(regular.variant), null);
    assert.deepEqual(discounted.variant.price, USD(199.5));
    assert.deepEqual(saleCompareAtPrice(discounted.variant), USD(248));
  });
});

describe("sold-out truth on the PDP", () => {
  it("keeps a deep-linked sold-out variant selected instead of swapping it", () => {
    const shell = mappedShell(
      catalogResponseWith("weatherline-shell", (product) => {
        product.variants.nodes[3].availableForSale = false;
      }),
    );

    const selection = resolveProductSelection(shell, "charcoal", { Size: "L" });
    assert.equal(selection.selectedOptions.Size, "L");
    assert.equal(selection.variant.availableForSale, false);
    assert.equal(shell.variants[3]?.id, "gid://shopify/ProductVariant/1003");
  });
});
