import assert from "node:assert/strict";
import { afterEach, describe, it } from "vite-plus/test";

import {
  breadcrumbJsonLd,
  productJsonLd,
  serializeJsonLd,
} from "../src/lib/seo/structured-data.ts";
import { PRODUCT_FIXTURES } from "./fixtures/storefront/products.ts";

const SAVED_SITE_URL = process.env.PUBLIC_SITE_URL;

describe("structured data", () => {
  afterEach(() => {
    if (SAVED_SITE_URL === undefined) delete process.env.PUBLIC_SITE_URL;
    else process.env.PUBLIC_SITE_URL = SAVED_SITE_URL;
  });

  it("describes a product with one offer per variant at its own URL", () => {
    process.env.PUBLIC_SITE_URL = "https://shop.example.com";
    const product = PRODUCT_FIXTURES.find(
      ({ handle }) => handle === "weatherline-shell",
    );
    assert.ok(product);
    const soldOut = { ...product.variants[1], availableForSale: false };
    const data = productJsonLd(
      {
        ...product,
        variants: product.variants.map((variant, index) =>
          index === 1 ? (soldOut as typeof variant) : variant,
        ),
      },
      "de-de",
    );
    const offers = data.offers as Record<string, string>[];

    assert.equal(data["@type"], "Product");
    assert.equal(
      data.url,
      "https://shop.example.com/de-de/products/weatherline-shell",
    );
    assert.equal(offers.length, product.variants.length);
    const [first, second] = offers;
    const variant = product.variants[0];
    assert.ok(first && second && variant);
    assert.equal(first.price, String(variant.price.amount));
    assert.equal(first.priceCurrency, variant.price.currencyCode);
    assert.equal(first.availability, "https://schema.org/InStock");
    assert.equal(second.availability, "https://schema.org/OutOfStock");
    assert.match(
      first.url ?? "",
      new RegExp(
        `^https://shop\\.example\\.com/de-de/products/weatherline-shell\\?colorway=${variant.colorwayId}&size=`,
      ),
    );
  });

  it("keeps a three-decimal price as Shopify returned it", () => {
    const product = PRODUCT_FIXTURES[0];
    assert.ok(product);
    const [variant] = product.variants;
    assert.ok(variant);
    const data = productJsonLd(
      {
        ...product,
        variants: [
          { ...variant, price: { amount: 1.234, currencyCode: "KWD" } },
        ],
      },
      "en-us",
    );
    const [offer] = data.offers as Record<string, string>[];
    assert.equal(offer?.price, "1.234");
    assert.equal(offer?.priceCurrency, "KWD");
  });

  it("numbers a breadcrumb trail from home", () => {
    process.env.PUBLIC_SITE_URL = "https://shop.example.com";
    assert.deepEqual(
      breadcrumbJsonLd(
        [
          ["Home", "/"],
          ["Shop", "/shop"],
        ],
        "en-us",
      ).itemListElement,
      [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://shop.example.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Shop",
          item: "https://shop.example.com/shop",
        },
      ],
    );
  });

  it("cannot be closed early by store text", () => {
    const json = serializeJsonLd({ name: "</script><script>alert(1)" });
    assert.doesNotMatch(json, /<\/script>/);
    assert.deepEqual(JSON.parse(json), {
      name: "</script><script>alert(1)",
    });
  });
});
