/**
 * Slice B — PDP commerce truth.
 *
 * Covers the nullable compare-at money contract, selected-variant price
 * switching, sold-out option/ATC semantics, and the full-width natural-aspect
 * gallery continuation for the fourth and later media.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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

const readSource = (path: string) => readFile(path, "utf8");

const USD = (amount: number): Money => ({ amount, currencyCode: "USD" });

function mappedShell(response: CatalogResponse = catalogResponse()): Product {
  const product = mapCatalogResult(response).find(
    (entry) => entry.handle === "weatherline-shell",
  );
  assert.ok(product !== undefined);
  return product;
}

describe("compare-at money contract", () => {
  it("asks Shopify for compare-at money on every variant", async () => {
    const queries = await readSource("src/lib/storefront/shopify/queries.ts");

    assert.match(
      queries,
      /compareAtPrice \{\s*amount\s*currencyCode\s*\}/,
      "the catalog query must request compare-at money for each variant",
    );
  });

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

  it("renders the current price with a semantic del only for a real sale", async () => {
    const [pdp, polish] = await Promise.all([
      readSource("src/app/products/[productHandle]/product-detail.tsx"),
      readSource("src/app/production-polish.css"),
    ]);

    assert.match(pdp, /saleCompareAtPrice\(selection\.variant\)/);
    assert.match(pdp, /<del/);
    assert.match(pdp, /compareAt !== null \? \(/);
    assert.match(pdp, /Regular price/);
    assert.match(pdp, /Sale price/);
    assert.match(polish, /\.product-panel \.product-price \{/);
    assert.doesNotMatch(
      polish,
      /(?:^|\n)\.product-price \{/,
      "PDP sale styling must not restyle every product card price",
    );
    /* Percent-off and savings claims need data this contract does not carry. */
    assert.doesNotMatch(pdp, /% off|Save \$|You save/i);
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

  it("marks unavailable option values for assistive tech and sight", async () => {
    const pdp = await readSource(
      "src/app/products/[productHandle]/product-detail.tsx",
    );

    assert.match(pdp, /option-chip sold-out unavailable/);
    assert.match(pdp, /aria-disabled="true"/);
    assert.match(pdp, /<span className="sr-only"> \(sold out\)<\/span>/);
    /* A fully sold-out colorway stays a working deep link, but must say so. */
    assert.match(pdp, /colorwayIsSoldOut/);
  });

  it("says Sold out in both cart modes rather than disabling Add to cart", async () => {
    const form = await readSource("src/components/add-to-cart-form.tsx");

    assert.equal(form.match(/"Sold out"/g)?.length, 2);
    assert.match(
      form,
      /selectedVariant\?\.availableForSale\s*\?\s*"Add to cart"\s*:\s*"Sold out"/,
    );
    assert.match(form, /!selectedVariant\.availableForSale/);
  });

  it("draws a robust strike over sold-out chips without dimming them away", async () => {
    const polish = await readSource("src/app/production-polish.css");

    assert.match(
      polish,
      /\.option-chip\.sold-out \{[^}]*text-decoration: line-through;/,
    );
    assert.match(
      polish,
      /\.option-chip\.sold-out::after \{[^}]*linear-gradient\(/,
    );
    assert.match(polish, /\.option-chip\.unavailable \{[^}]*opacity: 1;/);
  });

  it("keeps every option value readable instead of inheriting the 9px source size", async () => {
    const polish = await readSource("src/app/production-polish.css");

    assert.match(polish, /\.option-chip \{[^}]*font-size: 12px;/);
  });
});

describe("PDP gallery continuation", () => {
  it("keeps the first three media in the canonical composition", async () => {
    const canonical = await readSource("src/app/canonical-source.css");

    assert.match(
      canonical,
      /\.gallery-button:first-child \{\s*grid-column: 1 \/ -1;/,
    );
    assert.match(canonical, /\.gallery-button img \{[^}]*object-fit: cover;/);
  });

  it("spans image four and later full width at natural aspect ratio", async () => {
    const [canonical, pdp] = await Promise.all([
      readSource("src/app/canonical-source.css"),
      readSource("src/app/products/[productHandle]/product-detail.tsx"),
    ]);
    const continuation = canonical.match(
      /\.gallery-button:nth-child\(n \+ 4\) img \{[^}]*\}/g,
    );

    assert.match(
      canonical,
      /\.gallery-button:nth-child\(n \+ 4\) \{\s*grid-column: 1 \/ -1;\s*\}/,
    );
    assert.equal(
      continuation?.length,
      1,
      "one responsive-agnostic rule keeps the natural aspect ratio everywhere",
    );
    const [rule] = continuation ?? [];
    assert.ok(rule !== undefined);
    assert.match(rule, /width: 100%;/);
    assert.match(rule, /height: auto;/);
    assert.match(rule, /aspect-ratio: auto;/);
    assert.match(rule, /object-fit: contain;/);
    assert.match(
      pdp,
      /index === 0 \|\| index >= 3[\s\S]*?55vw, 100vw/,
      "full-width continuation media must advertise a full-width Next image size",
    );
    assert.doesNotMatch(
      rule,
      /aspect-ratio: \d|min-height: \d*[1-9]/,
      "a fixed ratio or height would crop the full-width media again",
    );
  });

  it("keeps zoom, dialog, and gallery accessibility intact", async () => {
    const pdp = await readSource(
      "src/app/products/[productHandle]/product-detail.tsx",
    );

    assert.match(pdp, /aria-label=\{`Zoom image \$\{index \+ 1\}/);
    assert.match(pdp, /className="gallery-modal"/);
    assert.match(pdp, /dialog\.showModal\(\)/);
    assert.match(pdp, /event\.key === "Escape"/);
  });
});
