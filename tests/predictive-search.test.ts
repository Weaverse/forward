import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "vite-plus/test";

import { NextRequest } from "next/server";

import { predictiveSearchGroups } from "../src/lib/storefront/predictive-search.ts";
import { proxy } from "../src/proxy.ts";

const ORIGIN = "https://forward.example";
const SAVED_ENV = { ...process.env };
const REAL_FETCH = globalThis.fetch;
const IMAGE = "https://cdn.shopify.com/s/files/1/0001/shell.jpg";

const ITEMS = {
  queries: [
    {
      __typename: "SearchQuerySuggestion",
      text: "shell jacket",
      styledText: "",
      trackingParameters: "_pos=1",
    },
  ],
  products: [
    {
      __typename: "Product",
      id: "gid://shopify/Product/1",
      title: "Weatherline Shell",
      handle: "weatherline-shell",
      trackingParameters: "_pos=1&_psq=shell",
      selectedOrFirstAvailableVariant: {
        id: "gid://shopify/ProductVariant/1",
        image: { url: IMAGE, altText: null, width: 1200, height: 1500 },
        price: { amount: "248.0", currencyCode: "EUR" },
      },
    },
    {
      __typename: "Product",
      id: "gid://shopify/Product/2",
      title: "Off-CDN image",
      handle: "off-cdn",
      trackingParameters: null,
      selectedOrFirstAvailableVariant: {
        id: "gid://shopify/ProductVariant/2",
        image: {
          url: "https://evil.example/s/files/x.jpg",
          altText: null,
          width: 1,
          height: 1,
        },
        price: { amount: "10", currencyCode: "EUR" },
      },
    },
  ],
  collections: [],
  pages: [
    {
      __typename: "Page",
      id: "gid://shopify/Page/1",
      title: "Repairs",
      handle: "repairs",
      trackingParameters: null,
    },
  ],
  articles: [
    {
      __typename: "Article",
      id: "gid://shopify/Article/1",
      title: "Shell care",
      handle: "shell-care",
      blog: { handle: "news" },
      image: null,
      trackingParameters: null,
    },
  ],
};

describe("predictive search", () => {
  beforeEach(() => {
    process.env.PUBLIC_STORE_DOMAIN = "forward-test.myshopify.com";
    process.env.PRIVATE_STOREFRONT_API_TOKEN = "test-private-token";
  });

  afterEach(() => {
    process.env = { ...SAVED_ENV };
    globalThis.fetch = REAL_FETCH;
  });

  it("answers under the locale prefix in that market", async () => {
    let variables: Record<string, unknown> = {};
    globalThis.fetch = async (_input, init) => {
      variables = JSON.parse(String(init?.body)).variables;
      return Response.json({ data: { predictiveSearch: ITEMS } });
    };

    const response = await proxy(
      new NextRequest(`${ORIGIN}/de-de/api/predictive-search?q=%20shell%20`, {
        headers: { "x-forwarded-for": "203.0.113.7" },
      }),
    );

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.term, "shell");
    assert.equal(body.total, 5);
    assert.equal(variables.term, "shell");
    assert.equal(variables.country, "DE");
    assert.equal(variables.language, "DE");
    assert.equal(variables.limit, 4);
  });

  it("maps results to Forward paths and keeps only allowlisted images", () => {
    const groups = predictiveSearchGroups(ITEMS as never);

    assert.deepEqual(
      groups.map((group) => group.kind),
      ["query", "product", "page", "article"],
    );
    const [query, products, page, article] = groups;
    assert.equal(query?.options[0]?.href, "/search?q=shell+jacket&_pos=1");
    assert.deepEqual(products?.options[0], {
      kind: "product",
      title: "Weatherline Shell",
      href: "/products/weatherline-shell?_pos=1&_psq=shell",
      image: IMAGE,
      price: { amount: 248, currencyCode: "EUR" },
    });
    assert.equal(products?.options[1]?.image, null);
    assert.equal(page?.options[0]?.href, "/pages/repairs");
    assert.equal(article?.options[0]?.href, "/journal/shell-care");
  });
});
