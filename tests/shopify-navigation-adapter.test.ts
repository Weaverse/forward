import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

import {
  createFieldIndexCollections,
  FIELD_INDEX_PRESENTATION,
} from "../src/lib/header-navigation.ts";
import { StaticStorefrontDataSource } from "../src/lib/storefront/data-source.ts";
import { createNavigationQueryExecutor } from "../src/lib/storefront/shopify/client.ts";
import { ShopifyCatalogDataSource } from "../src/lib/storefront/shopify/data-source.ts";
import { ShopifyCatalogError } from "../src/lib/storefront/shopify/errors.ts";
import { DEFAULT_MAIN_MENU_HANDLE } from "../src/lib/storefront/shopify/env.ts";
import { mapNavigationResult } from "../src/lib/storefront/shopify/navigation-mapper.ts";
import {
  navigationResponse,
  navigationResponseWith,
} from "./fixtures/shopify-navigation-response.ts";
import { catalogResponse } from "./fixtures/shopify-catalog-response.ts";

const SYNTHETIC_STORE_DOMAIN = "forward-test-shop.myshopify.com";

const expectedPrimary = [
  {
    href: "/shop",
    label: "Shop",
    children: [
      { href: "/shop/outerwear", label: "Outerwear" },
      { href: "/shop/packs", label: "Packs" },
      { href: "/shop/footwear", label: "Footwear" },
    ],
  },
  { href: "/journal", label: "Field Notes" },
  { href: "/pages/about-forward", label: "About" },
] as const;

function mapped(response = navigationResponse()) {
  return mapNavigationResult(
    response,
    SYNTHETIC_STORE_DOMAIN,
    DEFAULT_MAIN_MENU_HANDLE,
  );
}

function shopifySource(response = navigationResponse()) {
  return new ShopifyCatalogDataSource({
    base: new StaticStorefrontDataSource(),
    execute: async () => catalogResponse(),
    executeNavigation: async () => response,
    storeDomain: SYNTHETIC_STORE_DOMAIN,
    mainMenuHandle: DEFAULT_MAIN_MENU_HANDLE,
  });
}

describe("Hydrogen navigation client seam", () => {
  it("uses the private client and bounded canonical query variables", async () => {
    const originalFetch = globalThis.fetch;
    let requestUrl = "";
    let requestHeaders = new Headers();
    let requestBody: Record<string, unknown> = {};
    globalThis.fetch = async (input, init) => {
      requestUrl = input instanceof Request ? input.url : String(input);
      requestHeaders = new Headers(init?.headers);
      requestBody = JSON.parse(String(init?.body));
      return Response.json(navigationResponse());
    };

    try {
      const execute = createNavigationQueryExecutor(
        {
          storeDomain: "forward-test-shop.myshopify.com",
          privateStorefrontToken: "synthetic-private-storefront-value",
          mainMenuHandle: DEFAULT_MAIN_MENU_HANDLE,
        },
        { useNextCache: false },
      );
      assert.equal(
        mapNavigationResult(
          await execute(),
          SYNTHETIC_STORE_DOMAIN,
          DEFAULT_MAIN_MENU_HANDLE,
        ).primary.length,
        3,
      );
      assert.equal(new URL(requestUrl).pathname, "/api/2026-04/graphql.json");
      assert.equal(
        requestHeaders.get("shopify-storefront-private-token"),
        "synthetic-private-storefront-value",
      );
      assert.equal(
        requestHeaders.has("x-shopify-storefront-access-token"),
        false,
      );
      assert.deepEqual(requestBody.variables, {
        collectionFirst: 10,
        collectionProductFirst: 10,
        country: "US",
        language: "EN",
        menuHandle: "main-menu",
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe("Shopify navigation mapping", () => {
  it("maps the approved two-level menu and canonical collection routes", () => {
    const snapshot = mapped();
    assert.deepEqual(snapshot.primary, expectedPrimary);
    assert.deepEqual(
      snapshot.collections.map(({ handle, productHandles }) => ({
        handle,
        productHandles,
      })),
      [
        {
          handle: "forward",
          productHandles: [
            "weatherline-shell",
            "ridge-30-field-pack",
            "talus-trail-shoe",
          ],
        },
        { handle: "outerwear", productHandles: ["weatherline-shell"] },
        { handle: "packs", productHandles: ["ridge-30-field-pack"] },
        { handle: "footwear", productHandles: ["talus-trail-shoe"] },
      ],
    );
  });

  it("rejects a flat Shop menu instead of guessing parentage", () => {
    const response = navigationResponseWith((draft) => {
      const shop = draft.data.menu?.items[0];
      assert.ok(shop !== undefined);
      draft.data.menu?.items.splice(1, 0, ...shop.items);
      shop.items = [];
    });
    assert.throws(() => mapped(response), ShopifyCatalogError);
  });

  it("rejects wrong labels, order, URLs, and deeper nesting", () => {
    const cases = [
      navigationResponseWith((draft) => {
        const child = draft.data.menu?.items[0]?.items[0];
        assert.ok(child !== undefined);
        child.title = "Field Gear";
      }),
      navigationResponseWith((draft) => {
        const children = draft.data.menu?.items[0]?.items;
        assert.ok(children !== undefined);
        children.reverse();
      }),
      navigationResponseWith((draft) => {
        const child = draft.data.menu?.items[0]?.items[0];
        assert.ok(child !== undefined);
        child.url = "https://example.com/collections/outerwear";
      }),
      navigationResponseWith((draft) => {
        const child = draft.data.menu?.items[0]?.items[0];
        assert.ok(child !== undefined);
        child.url =
          "https://different-shop.myshopify.com/collections/outerwear";
      }),
      navigationResponseWith((draft) => {
        const child = draft.data.menu?.items[0]?.items[0];
        assert.ok(child !== undefined);
        child.items.push({
          id: "gid://shopify/MenuItem/deeper",
          title: "Too deep",
          url: "/collections/outerwear",
          items: [],
        });
      }),
    ];
    for (const response of cases) {
      assert.throws(() => mapped(response), ShopifyCatalogError);
    }
  });

  it("rejects missing, paginated, or contaminated canonical collections", () => {
    const cases = [
      navigationResponseWith((draft) => {
        draft.data.collections.nodes.pop();
      }),
      navigationResponseWith((draft) => {
        draft.data.collections.pageInfo.hasNextPage = true;
      }),
      navigationResponseWith((draft) => {
        draft.data.collections.pageInfo.hasNextPage =
          undefined as unknown as boolean;
      }),
      navigationResponseWith((draft) => {
        const outerwear = draft.data.collections.nodes[1];
        assert.ok(outerwear !== undefined);
        outerwear.products.nodes = [{ handle: "talus-trail-shoe" }];
      }),
    ];
    for (const response of cases) {
      assert.throws(() => mapped(response), ShopifyCatalogError);
    }
  });

  it("ignores unrelated published collections without exposing them", () => {
    const response = navigationResponseWith((draft) => {
      const first = draft.data.collections.nodes[0];
      assert.ok(first !== undefined);
      draft.data.collections.nodes.unshift({
        ...first,
        handle: "frontpage",
        title: "Home page",
      });
    });
    assert.deepEqual(
      mapped(response).collections.map((collection) => collection.handle),
      ["forward", "outerwear", "packs", "footwear"],
    );
  });
});

describe("Shopify navigation data source", () => {
  it("combines Shopify primary navigation with theme-owned utility/search/footer", async () => {
    const source = shopifySource();
    const base = await new StaticStorefrontDataSource().getNavigation();
    assert.deepEqual(await source.getNavigation(), {
      primary: [...expectedPrimary, { href: "/search", label: "Search" }],
      utility: base.utility,
      footerColumns: base.footerColumns,
    });
    assert.deepEqual(
      (await source.listCollections()).map((collection) => collection.handle),
      ["forward", "outerwear", "packs", "footwear"],
    );
    assert.equal((await source.getCollection("outerwear"))?.title, "Outerwear");
    assert.deepEqual(
      (await source.getCollectionProducts("packs"))?.map(
        (product) => product.handle,
      ),
      ["ridge-30-field-pack"],
    );
  });

  it("falls back to the canonical static menu when live data is missing or flat", async () => {
    const cases = [
      navigationResponseWith((draft) => {
        draft.data.menu = null;
      }),
      navigationResponseWith((draft) => {
        const shop = draft.data.menu?.items[0];
        assert.ok(shop !== undefined);
        draft.data.menu?.items.splice(1, 0, ...shop.items);
        shop.items = [];
      }),
    ];
    const base = await new StaticStorefrontDataSource().getNavigation();

    for (const response of cases) {
      const observed: ShopifyCatalogError[] = [];
      const source = new ShopifyCatalogDataSource({
        base: new StaticStorefrontDataSource(),
        execute: async () => catalogResponse(),
        executeNavigation: async () => response,
        storeDomain: SYNTHETIC_STORE_DOMAIN,
        mainMenuHandle: DEFAULT_MAIN_MENU_HANDLE,
        onNavigationFallback: (error) => observed.push(error),
      });
      assert.deepEqual(await source.getNavigation(), base);
      assert.deepEqual(await source.getNavigation(), base);
      assert.equal(observed.length, 1);
      assert.deepEqual(
        (await source.listCollections()).map((collection) => collection.handle),
        ["forward", "outerwear", "packs", "footwear"],
      );
    }
  });

  it("falls back to canonical collection structure without hiding the live menu", async () => {
    const response = navigationResponseWith((draft) => {
      draft.data.collections.nodes.pop();
    });
    const collectionObserved: ShopifyCatalogError[] = [];
    const navigationObserved: ShopifyCatalogError[] = [];
    const source = new ShopifyCatalogDataSource({
      base: new StaticStorefrontDataSource(),
      execute: async () => catalogResponse(),
      executeNavigation: async () => response,
      storeDomain: SYNTHETIC_STORE_DOMAIN,
      mainMenuHandle: DEFAULT_MAIN_MENU_HANDLE,
      onCollectionFallback: (error) => collectionObserved.push(error),
      onNavigationFallback: (error) => navigationObserved.push(error),
    });
    const base = new StaticStorefrontDataSource();

    assert.deepEqual(
      await source.listCollections(),
      await base.listCollections(),
    );
    assert.deepEqual(
      await source.listCollections(),
      await base.listCollections(),
    );
    assert.equal(collectionObserved.length, 1);
    assert.equal(navigationObserved.length, 0);
    assert.deepEqual(
      (await source.getNavigation()).primary.slice(0, 3),
      expectedPrimary,
    );
  });

  it("reports a collection fallback that begins after an initial live read", async () => {
    const malformed = navigationResponseWith((draft) => {
      draft.data.collections.nodes.pop();
    });
    const observed: ShopifyCatalogError[] = [];
    let reads = 0;
    const source = new ShopifyCatalogDataSource({
      base: new StaticStorefrontDataSource(),
      execute: async () => catalogResponse(),
      executeNavigation: async () => {
        reads += 1;
        return reads === 1 ? navigationResponse() : malformed;
      },
      onCollectionFallback: (error) => observed.push(error),
      storeDomain: SYNTHETIC_STORE_DOMAIN,
      mainMenuHandle: DEFAULT_MAIN_MENU_HANDLE,
    });

    assert.deepEqual(
      (await source.listCollections()).map((collection) => collection.handle),
      ["forward", "outerwear", "packs", "footwear"],
    );
    assert.equal(observed.length, 0);
    assert.deepEqual(
      (await source.getCollectionProducts("outerwear"))?.map(
        (product) => product.handle,
      ),
      ["weatherline-shell"],
    );
    assert.equal(observed.length, 1);
  });

  it("contains structure transport failures while product data stays fail-closed", async () => {
    const collectionObserved: ShopifyCatalogError[] = [];
    const navigationObserved: ShopifyCatalogError[] = [];
    const source = new ShopifyCatalogDataSource({
      base: new StaticStorefrontDataSource(),
      execute: async () => catalogResponse(),
      executeNavigation: async () => {
        throw new ShopifyCatalogError("Synthetic navigation failure.");
      },
      onCollectionFallback: (error) => collectionObserved.push(error),
      onNavigationFallback: (error) => navigationObserved.push(error),
      storeDomain: SYNTHETIC_STORE_DOMAIN,
      mainMenuHandle: DEFAULT_MAIN_MENU_HANDLE,
    });
    const base = await new StaticStorefrontDataSource().getNavigation();
    assert.deepEqual(await source.getNavigation(), base);
    assert.deepEqual(
      await source.listCollections(),
      await new StaticStorefrontDataSource().listCollections(),
    );
    assert.equal(navigationObserved.length, 1);
    assert.equal(collectionObserved.length, 1);
  });
});

describe("live Shopify verifier", () => {
  it("checks collection fallback only after the final collection read", async () => {
    const source = await readFile("scripts/verify-shopify.mts", "utf8");
    const finalCollectionRead = source.indexOf(
      'getCollectionProducts("frontpage")',
    );
    const fallbackCheck = source.indexOf(
      '"canonical collection reads stayed live and in contract order"',
    );
    assert.ok(finalCollectionRead >= 0);
    assert.ok(fallbackCheck > finalCollectionRead);
    assert.equal(source.indexOf("getCollectionProducts(", fallbackCheck), -1);
  });
});

describe("Field Index presentation", () => {
  it("maps the ordered Shopify Shop children into three presentation cards", () => {
    const shop = mapped().primary[0];
    assert.ok(shop !== undefined);
    assert.deepEqual(
      createFieldIndexCollections(shop).map(({ id, index, label, href }) => ({
        id,
        index,
        label,
        href,
      })),
      [
        {
          id: "outerwear",
          index: "01",
          label: "Outerwear",
          href: "/shop/outerwear",
        },
        { id: "packs", index: "02", label: "Packs", href: "/shop/packs" },
        {
          id: "footwear",
          index: "03",
          label: "Footwear",
          href: "/shop/footwear",
        },
      ],
    );
    assert.equal(FIELD_INDEX_PRESENTATION.length, 3);
  });

  it("rejects a Shop item without the exact three canonical children", () => {
    assert.throws(
      () => createFieldIndexCollections({ href: "/shop", label: "Shop" }),
      /exactly three children/i,
    );
  });
});
