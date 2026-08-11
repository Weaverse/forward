import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";

import {
  CATALOG_PRESENTATION_PROFILES,
  CANONICAL_PRODUCT_HANDLES,
} from "../src/lib/storefront/catalog-presentation.ts";
import {
  createStorefrontDataSource,
  StaticStorefrontDataSource,
  type StorefrontDataSource,
} from "../src/lib/storefront/data-source.ts";
import { isAllowedProductImageSrc } from "../src/lib/storefront/image-source.ts";
import {
  type CatalogQueryResult,
  createCatalogQueryExecutor,
} from "../src/lib/storefront/shopify/client.ts";
import {
  CATALOG_REVALIDATE_SECONDS,
  ShopifyCatalogDataSource,
} from "../src/lib/storefront/shopify/data-source.ts";
import {
  DEFAULT_MAIN_MENU_HANDLE,
  MAIN_MENU_HANDLE_ENV_KEY,
  PRIVATE_STOREFRONT_TOKEN_ENV_KEY,
  readShopifyCatalogConfig,
  STORE_DOMAIN_ENV_KEY,
} from "../src/lib/storefront/shopify/env.ts";
import {
  ShopifyCatalogError,
  ShopifyConfigurationError,
  safeErrorLabel,
} from "../src/lib/storefront/shopify/errors.ts";
import { mapCatalogResult } from "../src/lib/storefront/shopify/mapper.ts";
import type { Product } from "../src/lib/storefront/types.ts";
import {
  catalogResponse,
  type CatalogResponse,
  catalogResponseWith,
  syntheticMediaIds,
} from "./fixtures/shopify-catalog-response.ts";
import { navigationResponse } from "./fixtures/shopify-navigation-response.ts";

const SYNTHETIC_STORE_DOMAIN = "forward-test-shop.myshopify.com";
const SYNTHETIC_PRIVATE_TOKEN = "synthetic-private-storefront-value";

const COMPLETE_ENV = {
  [STORE_DOMAIN_ENV_KEY]: SYNTHETIC_STORE_DOMAIN,
  [PRIVATE_STOREFRONT_TOKEN_ENV_KEY]: SYNTHETIC_PRIVATE_TOKEN,
} as const;

function shopifySource(
  response: CatalogQueryResult = catalogResponse(),
): ShopifyCatalogDataSource {
  return new ShopifyCatalogDataSource({
    base: new StaticStorefrontDataSource(),
    execute: async () => response,
    executeNavigation: async () => navigationResponse(),
    storeDomain: SYNTHETIC_STORE_DOMAIN,
    mainMenuHandle: DEFAULT_MAIN_MENU_HANDLE,
  });
}

function mapped(response: CatalogResponse = catalogResponse()) {
  return mapCatalogResult(response);
}

async function assertRejectsCatalog(
  response: CatalogResponse,
  messageIncludes?: string,
): Promise<void> {
  assert.throws(
    () => mapCatalogResult(response),
    (error: unknown) => {
      assert.ok(
        error instanceof ShopifyCatalogError,
        `expected ShopifyCatalogError, got ${String(error)}`,
      );
      if (messageIncludes !== undefined) {
        assert.ok(
          error.message.includes(messageIncludes),
          `expected message to include "${messageIncludes}", got "${error.message}"`,
        );
      }
      return true;
    },
  );
}

/* -------------------------------------------------------------------------- */
/* 1–3: mode selection                                                        */
/* -------------------------------------------------------------------------- */

describe("catalog mode selection", () => {
  it("defaults to the static adapter with no Shopify configuration", () => {
    assert.equal(readShopifyCatalogConfig({}), null);
    assert.equal(
      readShopifyCatalogConfig({
        [MAIN_MENU_HANDLE_ENV_KEY]: "forward-main-menu",
      }),
      null,
    );
    assert.ok(
      createStorefrontDataSource({}) instanceof StaticStorefrontDataSource,
    );
  });

  it("ignores unrelated environment keys", () => {
    assert.equal(
      readShopifyCatalogConfig({ NODE_ENV: "test", PUBLIC_STOREFRONT_ID: "0" }),
      null,
    );
  });

  it("selects Shopify mode for a complete configuration", () => {
    const config = readShopifyCatalogConfig(COMPLETE_ENV);
    assert.equal(config?.storeDomain, SYNTHETIC_STORE_DOMAIN);
    assert.equal(config?.mainMenuHandle, DEFAULT_MAIN_MENU_HANDLE);
    assert.ok(
      createStorefrontDataSource(COMPLETE_ENV) instanceof
        ShopifyCatalogDataSource,
    );
  });

  it("accepts an explicit Shopify primary-menu handle override", () => {
    assert.equal(
      readShopifyCatalogConfig({
        ...COMPLETE_ENV,
        [MAIN_MENU_HANDLE_ENV_KEY]: "forward-main-menu",
      })?.mainMenuHandle,
      "forward-main-menu",
    );
  });

  it("rejects a malformed primary-menu handle without leaking its value", () => {
    const malformed = "Not A Shopify Handle";
    assert.throws(
      () =>
        readShopifyCatalogConfig({
          ...COMPLETE_ENV,
          [MAIN_MENU_HANDLE_ENV_KEY]: malformed,
        }),
      (error: unknown) => {
        assert.ok(error instanceof ShopifyConfigurationError);
        assert.ok(!error.message.includes(malformed));
        return true;
      },
    );
  });

  it("fails closed on partial configuration without leaking any value", () => {
    for (const partial of [
      { [STORE_DOMAIN_ENV_KEY]: SYNTHETIC_STORE_DOMAIN },
      { [PRIVATE_STOREFRONT_TOKEN_ENV_KEY]: SYNTHETIC_PRIVATE_TOKEN },
      {
        [STORE_DOMAIN_ENV_KEY]: SYNTHETIC_STORE_DOMAIN,
        [PRIVATE_STOREFRONT_TOKEN_ENV_KEY]: "   ",
      },
    ]) {
      assert.throws(
        () => readShopifyCatalogConfig(partial),
        (error: unknown) => {
          assert.ok(error instanceof ShopifyConfigurationError);
          assert.ok(!error.message.includes(SYNTHETIC_PRIVATE_TOKEN));
          assert.ok(!error.message.includes(SYNTHETIC_STORE_DOMAIN));
          return true;
        },
      );
    }
  });

  it("rejects a store domain that is not a myshopify.com host", () => {
    assert.throws(
      () =>
        readShopifyCatalogConfig({
          ...COMPLETE_ENV,
          [STORE_DOMAIN_ENV_KEY]: "shop.example.com",
        }),
      ShopifyConfigurationError,
    );
  });

  it("sanitizes arbitrary caught error names", () => {
    const error = new Error("synthetic secret-bearing message");
    error.name = "synthetic-secret-sentinel";
    assert.equal(safeErrorLabel(error), "Error");
    assert.equal(safeErrorLabel(new TypeError("private context")), "TypeError");
    assert.equal(safeErrorLabel("private context"), "UnknownError");
  });
});

describe("Hydrogen catalog client seam", () => {
  it("uses the private Storefront client with bounded variables", async () => {
    const originalFetch = globalThis.fetch;
    let requestUrl = "";
    let requestHeaders = new Headers();
    let requestBody: Record<string, unknown> = {};

    globalThis.fetch = async (input, init) => {
      requestUrl = input instanceof Request ? input.url : String(input);
      requestHeaders = new Headers(init?.headers);
      requestBody = JSON.parse(String(init?.body));
      return new Response(JSON.stringify(catalogResponse()), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    };

    try {
      const execute = createCatalogQueryExecutor(
        {
          storeDomain: SYNTHETIC_STORE_DOMAIN,
          mainMenuHandle: DEFAULT_MAIN_MENU_HANDLE,
          privateStorefrontToken: SYNTHETIC_PRIVATE_TOKEN,
        },
        { useNextCache: false },
      );
      const result = await execute();
      assert.equal(mapCatalogResult(result).length, 3);
      assert.equal(new URL(requestUrl).pathname, "/api/2026-04/graphql.json");
      assert.equal(
        requestHeaders.get("shopify-storefront-private-token"),
        SYNTHETIC_PRIVATE_TOKEN,
      );
      assert.equal(
        requestHeaders.has("x-shopify-storefront-access-token"),
        false,
      );
      assert.deepEqual(requestBody.variables, {
        country: "US",
        first: 10,
        language: "EN",
        mediaFirst: 50,
        query: "tag:forward",
        variantFirst: 50,
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("sanitizes arbitrary transport error names", async () => {
    const originalFetch = globalThis.fetch;
    const sentinel = "synthetic-secret-sentinel";
    globalThis.fetch = async () => {
      const error = new Error("synthetic secret-bearing transport message");
      error.name = sentinel;
      throw error;
    };

    try {
      const execute = createCatalogQueryExecutor(
        {
          storeDomain: SYNTHETIC_STORE_DOMAIN,
          mainMenuHandle: DEFAULT_MAIN_MENU_HANDLE,
          privateStorefrontToken: SYNTHETIC_PRIVATE_TOKEN,
        },
        { useNextCache: false },
      );
      await assert.rejects(execute, (error: unknown) => {
        assert.ok(error instanceof ShopifyCatalogError);
        assert.equal(error.message.includes(sentinel), false);
        assert.equal(error.message.includes(SYNTHETIC_PRIVATE_TOKEN), false);
        return true;
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("throws GraphQL error payloads so a later execution can retry", async () => {
    const originalFetch = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      return Response.json(
        calls === 1
          ? { errors: [{ message: "synthetic transient error" }] }
          : { data: catalogResponse().data },
      );
    };

    try {
      const execute = createCatalogQueryExecutor(
        {
          storeDomain: SYNTHETIC_STORE_DOMAIN,
          mainMenuHandle: DEFAULT_MAIN_MENU_HANDLE,
          privateStorefrontToken: SYNTHETIC_PRIVATE_TOKEN,
        },
        { useNextCache: false },
      );
      await assert.rejects(execute, ShopifyCatalogError);
      const recovered = await execute();
      assert.equal(calls, 2);
      assert.equal(mapCatalogResult(recovered).length, 3);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("fails closed on a malformed GraphQL errors container", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () =>
      Response.json({
        data: catalogResponse().data,
        errors: { message: "synthetic malformed errors container" },
      });

    try {
      const execute = createCatalogQueryExecutor(
        {
          storeDomain: SYNTHETIC_STORE_DOMAIN,
          mainMenuHandle: DEFAULT_MAIN_MENU_HANDLE,
          privateStorefrontToken: SYNTHETIC_PRIVATE_TOKEN,
        },
        { useNextCache: false },
      );
      await assert.rejects(execute, ShopifyCatalogError);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("validates normalization before a response becomes cacheable", async () => {
    const originalFetch = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      return Response.json({
        data:
          calls === 1
            ? { products: { nodes: [], pageInfo: { hasNextPage: false } } }
            : catalogResponse().data,
      });
    };

    try {
      const execute = createCatalogQueryExecutor(
        {
          storeDomain: SYNTHETIC_STORE_DOMAIN,
          mainMenuHandle: DEFAULT_MAIN_MENU_HANDLE,
          privateStorefrontToken: SYNTHETIC_PRIVATE_TOKEN,
        },
        { useNextCache: false },
      );
      await assert.rejects(execute, ShopifyCatalogError);
      assert.equal(mapCatalogResult(await execute()).length, 3);
      assert.equal(calls, 2);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

/* -------------------------------------------------------------------------- */
/* 4–7: the live-shaped fixture maps to the normalized contract               */
/* -------------------------------------------------------------------------- */

describe("catalog mapping", () => {
  it("maps the three-product fixture to the normalized contract", () => {
    const products = mapped();
    assert.equal(products.length, 3);

    const shell = products[0];
    assert.ok(shell !== undefined);
    assert.equal(shell.handle, "weatherline-shell");
    assert.equal(shell.title, "Weatherline Shell");
    assert.deepEqual(shell.price, { amount: 248, currencyCode: "USD" });
    assert.equal(shell.plate, "01");
    assert.equal(shell.category, "shells");
    assert.deepEqual([...shell.activities], ["alpine", "trail", "camp"]);
    assert.deepEqual(
      [...shell.relatedHandles],
      ["ridge-30-field-pack", "talus-trail-shoe"],
    );
    assert.ok(shell.subtitle.length > 0);
    assert.ok(shell.repair.length > 0);
    assert.ok(shell.description.includes("three-layer shell"));
    assert.ok(shell.description.includes("days on foot. The Weatherline"));

    // description paragraphs first, then forward.materials
    assert.equal(shell.detailParagraphs.length, 3);
    assert.equal(shell.detailParagraphs[0]?.endsWith("days on foot."), true);
    assert.equal(
      shell.detailParagraphs[1]?.startsWith("The Weatherline Shell"),
      true,
    );
    assert.ok(
      shell.detailParagraphs.at(-1)?.startsWith("Recycled nylon face fabric"),
    );

    assert.deepEqual(
      [...shell.care],
      [
        "Machine wash cold with technical cleaner. Close all zippers. Tumble dry low to reactivate the water-repellent finish.",
      ],
    );

    assert.deepEqual(
      shell.specs.map((row) => row.label),
      ["Waterproofing", "Fit", "Recommended use"],
    );
    assert.equal(
      shell.specs[2]?.value,
      "hiking, fastpacking, wet-weather travel",
    );
  });

  it("preserves care list-item boundaries", () => {
    const products = mapped(
      catalogResponseWith("weatherline-shell", (product) => {
        product.care.value = JSON.stringify({
          type: "root",
          children: [
            {
              type: "list",
              listType: "unordered",
              children: [
                {
                  type: "list-item",
                  children: [{ type: "text", value: "Wash cold" }],
                },
                {
                  type: "list-item",
                  children: [{ type: "text", value: "Air dry" }],
                },
              ],
            },
          ],
        });
      }),
    );
    assert.deepEqual(products[0]?.care, ["Wash cold", "Air dry"]);
  });

  it("humanizes field-spec keys with stable unit labels", () => {
    const products = mapped();
    const pack = products.find(
      (product) => product.handle === "ridge-30-field-pack",
    );
    const shoe = products.find(
      (product) => product.handle === "talus-trail-shoe",
    );
    assert.equal(pack?.specs[0]?.label, "Volume (L)");
    assert.equal(pack?.specs[0]?.value, "30");
    assert.equal(shoe?.specs[0]?.label, "Drop (mm)");
    assert.equal(shoe?.specs[0]?.value, "6");
  });

  it("removes Color from options and turns it into colorways", () => {
    for (const product of mapped()) {
      assert.ok(
        product.options.every((option) => option.name !== "Color"),
        `${product.handle} still exposes a Color option`,
      );
      assert.ok(product.colorways.length > 0);
      for (const colorway of product.colorways) {
        assert.ok(colorway.name.length > 0);
        assert.match(colorway.swatchColor, /^#[0-9a-f]{6}$/);
      }
    }
  });

  it("keeps canonical colorway ids and full Shopify Color display names", () => {
    const products = mapped();
    assert.deepEqual(
      products.map((product) => product.colorways.map((entry) => entry.id)),
      [
        ["charcoal", "claystone"],
        ["charcoal", "dune"],
        ["charcoal", "limestone"],
      ],
    );
    assert.deepEqual(
      products[0]?.colorways.map((entry) => entry.name),
      ["Charcoal / Moss", "Claystone / Charcoal"],
    );
  });

  it("preserves non-Color option order and exact live size labels", () => {
    const products = mapped();
    assert.deepEqual(products[0]?.options, [
      { name: "Size", values: ["XS", "S", "M", "L", "XL"] },
    ]);
    assert.deepEqual(products[1]?.options, []);
    assert.deepEqual(products[2]?.options, [
      {
        name: "Size",
        values: ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12", "US 13"],
      },
    ]);
  });

  it("resolves the four media roles from the metafield id order", () => {
    const shell = mapped()[0];
    const ids = syntheticMediaIds("weatherline-shell", "Charcoal / Moss");
    const images = shell?.colorways[0]?.images;
    assert.ok(images !== undefined);

    // Node order in the fixture is reversed; role order must follow the map.
    assert.ok(
      images.primary.src.endsWith("-weatherline-charcoal-primary.webp"),
    );
    assert.ok(
      images.alternate.src.endsWith("-weatherline-charcoal-alternate.webp"),
    );
    assert.ok(images.detail.src.endsWith("-weatherline-charcoal-detail.webp"));
    assert.ok(
      images.context.src.endsWith("-weatherline-charcoal-context.webp"),
    );
    assert.equal(ids.length, 4);

    for (const image of Object.values(images)) {
      assert.ok(isAllowedProductImageSrc(image.src));
      assert.ok(image.alt.trim().length > 0);
      assert.ok(Number.isInteger(image.width) && image.width > 0);
      assert.ok(Number.isInteger(image.height) && image.height > 0);
    }
  });
});

/* -------------------------------------------------------------------------- */
/* 8–11: adversarial mapping boundaries                                       */
/* -------------------------------------------------------------------------- */

describe("catalog mapping failures", () => {
  it("rejects a colorway map entry with the wrong number of media ids", async () => {
    await assertRejectsCatalog(
      catalogResponseWith("weatherline-shell", (product) => {
        const map = JSON.parse(product.colorwayMediaMap.value);
        map["Charcoal / Moss"] = map["Charcoal / Moss"].slice(0, 3);
        product.colorwayMediaMap.value = JSON.stringify(map);
      }),
      "exactly 4 media ids",
    );

    await assertRejectsCatalog(
      catalogResponseWith("weatherline-shell", (product) => {
        const map = JSON.parse(product.colorwayMediaMap.value);
        map["Charcoal / Moss"] = [
          ...map["Charcoal / Moss"],
          map["Claystone / Charcoal"][0],
        ];
        product.colorwayMediaMap.value = JSON.stringify(map);
      }),
      "exactly 4 media ids",
    );
  });

  it("rejects duplicate media ids across roles or colorways", async () => {
    await assertRejectsCatalog(
      catalogResponseWith("weatherline-shell", (product) => {
        const map = JSON.parse(product.colorwayMediaMap.value);
        const ids = map["Charcoal / Moss"];
        map["Charcoal / Moss"] = [ids[0], ids[0], ids[2], ids[3]];
        product.colorwayMediaMap.value = JSON.stringify(map);
      }),
      "reuses media id",
    );

    await assertRejectsCatalog(
      catalogResponseWith("weatherline-shell", (product) => {
        const map = JSON.parse(product.colorwayMediaMap.value);
        map["Claystone / Charcoal"] = map["Charcoal / Moss"];
        product.colorwayMediaMap.value = JSON.stringify(map);
      }),
      "reuses media id",
    );
  });

  it("rejects unknown media ids and ids that resolve to non-image media", async () => {
    await assertRejectsCatalog(
      catalogResponseWith("weatherline-shell", (product) => {
        const map = JSON.parse(product.colorwayMediaMap.value);
        map["Charcoal / Moss"][2] = "gid://shopify/MediaImage/999999";
        product.colorwayMediaMap.value = JSON.stringify(map);
      }),
      "unknown or non-image media id",
    );

    await assertRejectsCatalog(
      catalogResponseWith("weatherline-shell", (product) => {
        const video = product.media.nodes.find(
          (node: { __typename: string }) => node.__typename === "Video",
        );
        const map = JSON.parse(product.colorwayMediaMap.value);
        map["Charcoal / Moss"][1] = video.id;
        product.colorwayMediaMap.value = JSON.stringify(map);
      }),
      "unknown or non-image media id",
    );
  });

  it("rejects an unreferenced MediaImage node", async () => {
    await assertRejectsCatalog(
      catalogResponseWith("weatherline-shell", (product) => {
        const source = product.media.nodes.find(
          (node: { __typename: string }) => node.__typename === "MediaImage",
        );
        const extra = structuredClone(source);
        extra.id = "gid://shopify/MediaImage/999998";
        extra.image.url =
          "https://cdn.shopify.com/s/files/1/0978/4757/4828/files/synthetic-extra.webp";
        product.media.nodes.push(extra);
      }),
      "unreferenced MediaImage",
    );
  });

  it("rejects a colorway map that misses or invents a Color value", async () => {
    await assertRejectsCatalog(
      catalogResponseWith("weatherline-shell", (product) => {
        const map = JSON.parse(product.colorwayMediaMap.value);
        delete map["Claystone / Charcoal"];
        product.colorwayMediaMap.value = JSON.stringify(map);
      }),
      "has no entry for Color value",
    );

    await assertRejectsCatalog(
      catalogResponseWith("weatherline-shell", (product) => {
        const map = JSON.parse(product.colorwayMediaMap.value);
        map["Fictional / Colour"] = map["Charcoal / Moss"];
        product.colorwayMediaMap.value = JSON.stringify(map);
      }),
      "unknown Color values",
    );
  });

  it("rejects a Color value with no approved colorway mapping", async () => {
    await assertRejectsCatalog(
      catalogResponseWith("weatherline-shell", (product) => {
        product.options[0].optionValues[1].name = "Unapproved / Colour";
        const map = JSON.parse(product.colorwayMediaMap.value);
        map["Unapproved / Colour"] = map["Claystone / Charcoal"];
        delete map["Claystone / Charcoal"];
        product.colorwayMediaMap.value = JSON.stringify(map);
        for (const variant of product.variants.nodes) {
          if (variant.selectedOptions[0].value === "Claystone / Charcoal") {
            variant.selectedOptions[0].value = "Unapproved / Colour";
          }
        }
      }),
      "no approved colorway mapping",
    );
  });

  it("rejects a repeated Color value on one product", async () => {
    await assertRejectsCatalog(
      catalogResponseWith("ridge-30-field-pack", (product) => {
        product.options[0].optionValues[1].name = "Charcoal / Moss / Tan";
        product.options[0].optionValues[0].name = "Charcoal / Moss / Tan";
      }),
      "duplicate values",
    );
  });

  it("resolves Color labels by own key only", async () => {
    for (const label of ["constructor", "toString", "__proto__"]) {
      await assertRejectsCatalog(
        catalogResponseWith("weatherline-shell", (product) => {
          product.options[0].optionValues[1].name = label;
          const map = JSON.parse(product.colorwayMediaMap.value);
          map[label] = map["Claystone / Charcoal"];
          delete map["Claystone / Charcoal"];
          product.colorwayMediaMap.value = JSON.stringify(map);
          for (const variant of product.variants.nodes) {
            if (variant.selectedOptions[0].value === "Claystone / Charcoal") {
              variant.selectedOptions[0].value = label;
            }
          }
        }),
        "no approved colorway mapping",
      );
    }
  });

  it("rejects invalid metafield JSON, rich text, and metafield types", async () => {
    await assertRejectsCatalog(
      catalogResponseWith("weatherline-shell", (product) => {
        product.colorwayMediaMap.value = "{not json";
      }),
      "not valid JSON",
    );

    await assertRejectsCatalog(
      catalogResponseWith("weatherline-shell", (product) => {
        product.fieldSpecs.value = "[]";
      }),
      "is not an object",
    );

    await assertRejectsCatalog(
      catalogResponseWith("weatherline-shell", (product) => {
        product.care.value = JSON.stringify({
          type: "root",
          children: [{ type: "mystery-node", children: [] }],
        });
      }),
      "unsupported rich-text node type",
    );

    await assertRejectsCatalog(
      catalogResponseWith("weatherline-shell", (product) => {
        product.care.value = JSON.stringify({ type: "paragraph" });
      }),
      "not a rich-text root node",
    );

    await assertRejectsCatalog(
      catalogResponseWith("weatherline-shell", (product) => {
        product.materials.type = "single_line_text_field";
      }),
      'must be a "multi_line_text_field" metafield',
    );

    await assertRejectsCatalog(
      catalogResponseWith("weatherline-shell", (product) => {
        product.highlights.value = "[]";
      }),
      "is empty",
    );

    for (const key of [
      "highlights",
      "materials",
      "fieldSpecs",
      "care",
      "colorwayMediaMap",
    ]) {
      await assertRejectsCatalog(
        catalogResponseWith("weatherline-shell", (product) => {
          product[key] = null;
        }),
        "is missing",
      );
    }
  });

  it("rejects media without dimensions, alt text, or a usable URL", async () => {
    await assertRejectsCatalog(
      catalogResponseWith("weatherline-shell", (product) => {
        product.media.nodes[0].image.width = 0;
      }),
      "not a positive integer",
    );

    await assertRejectsCatalog(
      catalogResponseWith("weatherline-shell", (product) => {
        product.media.nodes[0].image.height = null;
      }),
      "not a positive integer",
    );

    await assertRejectsCatalog(
      catalogResponseWith("weatherline-shell", (product) => {
        product.media.nodes[0].image.altText = "   ";
        product.media.nodes[0].alt = "";
      }),
      "no meaningful alt text",
    );

    await assertRejectsCatalog(
      catalogResponseWith("weatherline-shell", (product) => {
        product.media.nodes[0].image.url = "https://images.example.com/a.webp";
      }),
      "not an owned Shopify CDN media URL",
    );

    for (const url of [
      "https://cdn.shopify.com:8443/s/files/1/0978/4757/4828/files/a.webp",
      "https://cdn.shopify.com/s/files/9/9999/9999/9999/files/foreign.webp",
      "https://user:password@cdn.shopify.com/s/files/1/0978/4757/4828/files/a.webp",
      "https://cdn.shopify.com/s/files/1/0978/4757/4828/files/%2e%2e/foreign.webp",
      "https://cdn.shopify.com/s/files/1/0978/4757/4828/files/%252e%252e/foreign.webp",
    ]) {
      await assertRejectsCatalog(
        catalogResponseWith("weatherline-shell", (product) => {
          product.media.nodes[0].image.url = url;
        }),
        "not an owned Shopify CDN media URL",
      );
    }
  });

  it("rejects invalid and non-USD money", async () => {
    await assertRejectsCatalog(
      catalogResponseWith("weatherline-shell", (product) => {
        product.variants.nodes[0].price.currencyCode = "EUR";
      }),
      "must be USD",
    );

    for (const amount of ["", "not-a-number", "-12.00", null]) {
      await assertRejectsCatalog(
        catalogResponseWith("weatherline-shell", (product) => {
          product.variants.nodes[0].price.amount = amount;
        }),
      );
    }
  });

  it("uses the minimum variant price", () => {
    const products = mapCatalogResult(
      catalogResponseWith("weatherline-shell", (product) => {
        product.variants.nodes[3].price.amount = "199.5";
      }),
    );
    assert.equal(products[0]?.price.amount, 199.5);
  });

  it("maps exact Shopify merchandise identities beneath each product", () => {
    const products = mapped();
    const weatherline = products[0];
    assert.equal(weatherline?.variants.length, 10);
    assert.deepEqual(weatherline?.variants[0], {
      id: "gid://shopify/ProductVariant/1000",
      colorwayId: "charcoal",
      selectedOptions: [{ name: "Size", value: "XS" }],
      price: { amount: 248, currencyCode: "USD" },
      availableForSale: true,
    });
    assert.equal(
      new Set(weatherline?.variants.map((variant) => variant.id)).size,
      weatherline?.variants.length,
    );
  });

  it("keeps deterministic non-Shopify variants in the static source", async () => {
    const weatherline = await new StaticStorefrontDataSource().getProduct(
      "weatherline-shell",
    );
    assert.equal(weatherline?.variants.length, 10);
    assert.equal(
      weatherline?.variants[0]?.id,
      "demo:weatherline-shell:charcoal:XS",
    );
    assert.equal(weatherline?.variants[0]?.availableForSale, true);
  });

  it("rejects duplicate merchandise IDs", async () => {
    await assertRejectsCatalog(
      catalogResponseWith("weatherline-shell", (product) => {
        product.variants.nodes[1].id = product.variants.nodes[0].id;
      }),
      "duplicate merchandise",
    );
  });

  it("rejects a product missing the forward ownership tag", async () => {
    await assertRejectsCatalog(
      catalogResponseWith("weatherline-shell", (product) => {
        product.tags = ["managed-by:forward-seed"];
      }),
      "ownership tag",
    );
  });

  it("rejects unsupported product handles and missing canonical products", async () => {
    await assertRejectsCatalog(
      catalogResponseWith("weatherline-shell", (product) => {
        product.handle = "surprise-product";
      }),
      "not an approved Forward product",
    );

    const withoutShoe = catalogResponse();
    withoutShoe.data.products.nodes = withoutShoe.data.products.nodes.filter(
      (node) => node.handle !== "talus-trail-shoe",
    );
    await assertRejectsCatalog(withoutShoe, "missing the approved product");
  });

  it("fails on GraphQL errors and on truncated bounded pages", async () => {
    assert.throws(
      () =>
        mapCatalogResult({
          data: catalogResponse().data,
          errors: [{ message: "field failed" }],
        }),
      ShopifyCatalogError,
    );

    const truncatedCatalog = catalogResponse();
    truncatedCatalog.data.products.pageInfo.hasNextPage = true;
    await assertRejectsCatalog(truncatedCatalog, "more products");

    await assertRejectsCatalog(
      catalogResponseWith("weatherline-shell", (product) => {
        product.variants.pageInfo.hasNextPage = true;
      }),
      "more variants",
    );

    await assertRejectsCatalog(
      catalogResponseWith("weatherline-shell", (product) => {
        product.media.pageInfo.hasNextPage = true;
      }),
      "more media",
    );
  });

  it("rejects a null data payload rather than serving nothing", () => {
    assert.throws(() => mapCatalogResult({ data: null }), ShopifyCatalogError);
    assert.throws(() => mapCatalogResult({}), ShopifyCatalogError);
  });
});

/* -------------------------------------------------------------------------- */
/* 12–15: data-source behavior                                                */
/* -------------------------------------------------------------------------- */

describe("ShopifyCatalogDataSource", () => {
  it("returns null for unknown product handles", async () => {
    const source = shopifySource();
    assert.equal(await source.getProduct("does-not-exist"), null);
    assert.equal(await source.getProduct(""), null);
    assert.notEqual(await source.getProduct("weatherline-shell"), null);
  });

  it("keeps canonical product order regardless of API order", async () => {
    const reversed = catalogResponse();
    reversed.data.products.nodes.reverse();
    const source = shopifySource(reversed);
    assert.deepEqual(
      (await source.listProducts()).map((product) => product.handle),
      [...CANONICAL_PRODUCT_HANDLES],
    );
  });

  it("maps canonical Shopify collections with local presentation", async () => {
    const source = shopifySource();
    const collections = await source.listCollections();
    assert.deepEqual(
      collections.map((collection) => collection.handle),
      ["forward", "outerwear", "packs", "footwear"],
    );
    for (const collection of collections) {
      assert.ok(collection.heroImage.src.startsWith("/images/"));
      const products = await source.getCollectionProducts(collection.handle);
      assert.deepEqual(
        products?.map((product) => product.handle),
        [...collection.productHandles],
      );
    }
    assert.equal(await source.getCollectionProducts("frontpage"), null);
    assert.equal((await source.getCollection("forward"))?.title, "Forward");
  });

  it("preserves normalized search semantics over live products", async () => {
    const source = shopifySource();
    assert.deepEqual(await source.searchProducts(""), []);
    assert.deepEqual(await source.searchProducts("   "), []);
    assert.deepEqual(await source.searchProducts("zzzzzz"), []);

    const upper = await source.searchProducts("WEATHERLINE");
    assert.deepEqual(
      upper.map((product) => product.handle),
      ["weatherline-shell"],
    );

    assert.deepEqual(await source.searchProducts("Weatherline zzzzzz"), []);

    const byColorway = await source.searchProducts("limestone");
    assert.deepEqual(
      byColorway.map((product) => product.handle),
      ["talus-trail-shoe"],
    );

    const byActivity = await source.searchProducts("camp");
    assert.deepEqual(
      byActivity.map((product) => product.handle),
      ["weatherline-shell", "talus-trail-shoe"],
    );
  });

  it("preserves normalized filter and sort semantics over live products", async () => {
    const source = shopifySource();
    assert.deepEqual(
      (await source.listProducts({ category: "packs" })).map(
        (product) => product.handle,
      ),
      ["ridge-30-field-pack"],
    );
    assert.deepEqual(
      (await source.listProducts({ activity: "alpine" })).map(
        (product) => product.handle,
      ),
      ["weatherline-shell", "ridge-30-field-pack"],
    );
    assert.deepEqual(
      (await source.listProducts({}, "price-asc")).map(
        (product) => product.price.amount,
      ),
      [168, 198, 248],
    );
    assert.deepEqual(
      (await source.listProducts({}, "price-desc")).map(
        (product) => product.price.amount,
      ),
      [248, 198, 168],
    );
    assert.deepEqual(
      (await source.listProducts({}, "name")).map((product) => product.title),
      ["Ridge 30 Field Pack", "Talus Trail Shoe", "Weatherline Shell"],
    );
    assert.deepEqual(
      (await source.listProducts()).map((product) => product.handle),
      [...CANONICAL_PRODUCT_HANDLES],
    );
  });

  it("keeps deferred demo cart and account references resolvable", async () => {
    const source = shopifySource();
    for (const line of await source.getDemoCartSeed()) {
      const product = await source.getProduct(line.productHandle);
      assert.ok(product !== null, `missing ${line.productHandle}`);
      assert.ok(
        product.colorways.some((colorway) => colorway.id === line.colorwayId),
        `missing ${line.productHandle} colorway ${line.colorwayId}`,
      );
      if (line.size !== undefined) {
        assert.ok(
          product.options[0]?.values.includes(line.size),
          `missing ${line.productHandle} size ${line.size}`,
        );
      }
    }
  });

  it("keeps theme presentation static while reporting honest Shopify mode status", async () => {
    const source = shopifySource();
    const base: StorefrontDataSource = new StaticStorefrontDataSource();

    const liveTheme = await source.getThemeContent();
    const staticTheme = await base.getThemeContent();
    assert.deepEqual(
      {
        announcement: liveTheme.announcement,
        footerTagline: liveTheme.footerTagline,
        homeHeroImage: liveTheme.homeHeroImage,
        standardBandImage: liveTheme.standardBandImage,
      },
      {
        announcement: staticTheme.announcement,
        footerTagline: staticTheme.footerTagline,
        homeHeroImage: staticTheme.homeHeroImage,
        standardBandImage: staticTheme.standardBandImage,
      },
    );
    assert.match(
      liveTheme.demoNotice,
      /live Shopify catalog, navigation, content, and a secure Shopify cart/i,
    );
    assert.match(liveTheme.footerStatus, /content, and cart$/i);
    assert.match(staticTheme.footerStatus, /Not a live store/i);
    assert.deepEqual(await source.listArticles(), await base.listArticles());
    assert.deepEqual(await source.listPages(), await base.listPages());
    assert.deepEqual(await source.listPolicies(), await base.listPolicies());
    assert.equal(await source.getArticle("does-not-exist"), null);
  });

  it("fails closed instead of falling back to fixtures", async () => {
    const failing = new ShopifyCatalogDataSource({
      base: new StaticStorefrontDataSource(),
      execute: async () => {
        throw new ShopifyCatalogError("Storefront API catalog request failed.");
      },
      executeNavigation: async () => navigationResponse(),
      storeDomain: SYNTHETIC_STORE_DOMAIN,
      mainMenuHandle: DEFAULT_MAIN_MENU_HANDLE,
    });
    await assert.rejects(() => failing.listProducts(), ShopifyCatalogError);
    await assert.rejects(
      () => failing.getProduct("weatherline-shell"),
      ShopifyCatalogError,
    );
    await assert.rejects(
      () => failing.searchProducts("shell"),
      ShopifyCatalogError,
    );
    await assert.rejects(
      () => failing.getCollectionProducts("outerwear"),
      ShopifyCatalogError,
    );
  });
});

/* -------------------------------------------------------------------------- */
/* Bounded catalog caching                                                    */
/* -------------------------------------------------------------------------- */

describe("catalog revalidation window", () => {
  it("reuses one catalog read inside the window and refetches after it", async () => {
    let calls = 0;
    let clock = 0;
    const source = new ShopifyCatalogDataSource({
      base: new StaticStorefrontDataSource(),
      execute: async () => {
        calls += 1;
        return catalogResponse();
      },
      executeNavigation: async () => navigationResponse(),
      storeDomain: SYNTHETIC_STORE_DOMAIN,
      mainMenuHandle: DEFAULT_MAIN_MENU_HANDLE,
      ttlMs: CATALOG_REVALIDATE_SECONDS * 1000,
      now: () => clock,
    });

    await source.listProducts();
    await source.getProduct("weatherline-shell");
    await source.searchProducts("trail");
    assert.equal(calls, 1);

    clock += CATALOG_REVALIDATE_SECONDS * 1000 - 1;
    await source.listProducts();
    assert.equal(calls, 1);

    clock += 1;
    await source.listProducts();
    assert.equal(calls, 2);
  });

  it("deduplicates concurrent catalog reads", async () => {
    let calls = 0;
    const source = new ShopifyCatalogDataSource({
      base: new StaticStorefrontDataSource(),
      execute: async () => {
        calls += 1;
        return catalogResponse();
      },
      executeNavigation: async () => navigationResponse(),
      storeDomain: SYNTHETIC_STORE_DOMAIN,
      mainMenuHandle: DEFAULT_MAIN_MENU_HANDLE,
    });
    await Promise.all([
      source.listProducts(),
      source.getProduct("talus-trail-shoe"),
      source.getCollectionProducts("outerwear"),
    ]);
    assert.equal(calls, 1);
  });

  it("lets the Next-cached executor own production reuse", async () => {
    let calls = 0;
    const source = new ShopifyCatalogDataSource({
      base: new StaticStorefrontDataSource(),
      execute: async () => {
        calls += 1;
        return catalogResponse();
      },
      executeNavigation: async () => navigationResponse(),
      storeDomain: SYNTHETIC_STORE_DOMAIN,
      mainMenuHandle: DEFAULT_MAIN_MENU_HANDLE,
      useProcessCache: false,
    });
    await source.listProducts();
    await source.getProduct("talus-trail-shoe");
    assert.equal(calls, 2);
  });

  it("keeps shared route revalidation and personalized cart boundaries explicit", async () => {
    const routes = [
      "src/app/page.tsx",
      "src/app/shop/[collectionHandle]/page.tsx",
      "src/app/products/[productHandle]/page.tsx",
    ];
    for (const route of routes) {
      const source = await readFile(path.join(process.cwd(), route), "utf8");
      const match = source.match(/export const revalidate = (\d+);/);
      assert.ok(match !== null, `${route} has no revalidate segment value`);
      assert.equal(
        Number(match[1]),
        CATALOG_REVALIDATE_SECONDS,
        `${route} revalidate drifted from CATALOG_REVALIDATE_SECONDS`,
      );
    }

    // Personalized routes never share the catalog window.
    for (const route of [
      "src/app/cart/page.tsx",
      "src/app/account/orders/[orderId]/page.tsx",
    ]) {
      const personalized = await readFile(
        path.join(process.cwd(), route),
        "utf8",
      );
      assert.match(personalized, /export const dynamic = "force-dynamic";/);
      assert.match(personalized, /export const fetchCache = "force-no-store";/);
      assert.doesNotMatch(personalized, /export const revalidate/);
    }
  });
});

/* -------------------------------------------------------------------------- */
/* Contract guards                                                            */
/* -------------------------------------------------------------------------- */

describe("catalog presentation profile", () => {
  it("covers exactly the canonical handles in canonical order", () => {
    assert.deepEqual(
      CATALOG_PRESENTATION_PROFILES.map((profile) => profile.handle),
      [...CANONICAL_PRODUCT_HANDLES],
    );
  });

  it("never maps two Color labels of one product to the same colorway id", () => {
    for (const profile of CATALOG_PRESENTATION_PROFILES) {
      const ids = Object.values(profile.colorways).map(
        (colorway) => colorway.id,
      );
      assert.equal(
        new Set(ids).size,
        ids.length,
        `${profile.handle} maps two Color labels to one colorway id`,
      );
      assert.ok(ids.length > 0);
    }
  });

  it("matches the static catalog on every presentation-owned field", async () => {
    const staticProducts =
      await new StaticStorefrontDataSource().listProducts();
    const byHandle = new Map<string, Product>(
      staticProducts.map((product) => [product.handle, product]),
    );
    for (const profile of CATALOG_PRESENTATION_PROFILES) {
      const product = byHandle.get(profile.handle);
      assert.ok(product !== undefined, `missing ${profile.handle}`);
      assert.equal(product.plate, profile.plate);
      assert.equal(product.category, profile.category);
      assert.equal(product.subtitle, profile.subtitle);
      assert.equal(product.repair, profile.repair);
      assert.deepEqual([...product.activities], [...profile.activities]);
      assert.deepEqual(
        [...product.relatedHandles],
        [...profile.relatedHandles],
      );
      assert.deepEqual(
        product.colorways.map((colorway) => colorway.id),
        Object.values(profile.colorways).map((colorway) => colorway.id),
      );
      assert.deepEqual(
        product.colorways.map((colorway) => colorway.swatchColor),
        Object.values(profile.colorways).map(
          (colorway) => colorway.swatchColor,
        ),
      );
    }
  });
});

describe("data boundary", () => {
  async function collectSourceFiles(root: string): Promise<string[]> {
    const entries = await readdir(path.join(process.cwd(), root), {
      withFileTypes: true,
    });
    const files: string[] = [];
    for (const entry of entries) {
      const relative = path.join(root, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await collectSourceFiles(relative)));
      } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
        files.push(relative);
      }
    }
    return files;
  }

  const IMPORT_SPECIFIER_PATTERN = /(?:from|import)\s*\(?\s*["']([^"']+)["']/g;

  it("keeps fixtures and Shopify internals out of pages and components", async () => {
    const files = [
      ...(await collectSourceFiles("src/app")),
      ...(await collectSourceFiles("src/components")),
    ];
    assert.ok(files.length > 0);
    for (const file of files) {
      const source = await readFile(path.join(process.cwd(), file), "utf8");
      for (const match of source.matchAll(IMPORT_SPECIFIER_PATTERN)) {
        const specifier = match[1] ?? "";
        assert.ok(
          !specifier.includes("storefront/fixtures"),
          `${file} imports fixture records directly`,
        );
        assert.ok(
          !specifier.includes("storefront/shopify"),
          `${file} imports Shopify adapter internals`,
        );
        assert.ok(
          !specifier.startsWith("@shopify/hydrogen"),
          `${file} imports Shopify runtime code`,
        );
      }
    }
  });
});
