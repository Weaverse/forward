import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

import {
  createFieldIndexCollections,
  FIELD_INDEX_PRESENTATION,
} from "../src/lib/header-navigation.ts";
import { COLLECTION_PRESENTATION_PROFILES } from "../src/lib/storefront/collection-presentation.ts";
import { StaticStorefrontDataSource } from "../src/lib/storefront/data-source.ts";
import { createNavigationQueryExecutor } from "../src/lib/storefront/shopify/client.ts";
import { ShopifyCatalogDataSource } from "../src/lib/storefront/shopify/data-source.ts";
import { ShopifyCatalogError } from "../src/lib/storefront/shopify/errors.ts";
import { DEFAULT_MAIN_MENU_HANDLE } from "../src/lib/storefront/shopify/env.ts";
import {
  mapFooterMenuResult,
  mapNavigationResult,
} from "../src/lib/storefront/shopify/navigation-mapper.ts";
import { FOOTER_MENU_HANDLE } from "../src/lib/storefront/shopify/navigation-query.ts";
import {
  navigationResponse,
  navigationResponseWith,
  type ShopifyMenuItemFixture,
} from "./fixtures/shopify-navigation-response.ts";
import { catalogResponse } from "./fixtures/shopify-catalog-response.ts";

const SYNTHETIC_STORE_DOMAIN = "forward-test-shop.myshopify.com";
const SYNTHETIC_STORE_ORIGIN = `https://${SYNTHETIC_STORE_DOMAIN}`;

/** Canonical upstream `main-menu` with `Shop all` as its first Shop child. */
function targetShopMenuResponse(
  mutate: (shopChildren: ShopifyMenuItemFixture[]) => void = () => undefined,
) {
  return navigationResponseWith((draft) => {
    const shop = draft.data.menu?.items[0];
    assert.ok(shop !== undefined);
    mutate(shop.items);
  });
}

const expectedPrimary = [
  {
    href: "/shop",
    label: "Shop",
    children: [
      { href: "/shop", label: "Shop all" },
      { href: "/shop/outerwear", label: "Outerwear" },
      { href: "/shop/packs", label: "Packs" },
      { href: "/shop/footwear", label: "Footwear" },
    ],
  },
  { href: "/journal", label: "Field Notes" },
  {
    href: "/pages/about-forward",
    label: "About",
    children: [
      { href: "/pages/materials-and-care", label: "Materials & Care" },
      { href: "/pages/fit-and-sizing", label: "Fit & Sizing" },
      { href: "/pages/field-testing", label: "Field Testing" },
      { href: "/pages/field-repair", label: "Field Repair" },
      { href: "/pages/shipping-returns", label: "Shipping & Returns" },
      { href: "/pages/contact", label: "Contact" },
    ],
  },
] as const;

const expectedCompanyLinks = [
  { href: "/pages/about-forward", label: "About Forward" },
  { href: "/pages/field-repair", label: "Field Repair" },
  { href: "/pages/shipping-returns", label: "Shipping & Returns" },
  { href: "/pages/contact", label: "Contact" },
] as const;

const expectedFooterColumns = [
  {
    heading: "Shop",
    links: [
      { href: "/shop", label: "All products" },
      ...expectedPrimary[0].children.slice(1),
    ],
  },
  { heading: "Company", links: expectedCompanyLinks },
  {
    heading: "Support",
    links: [
      { href: "/account", label: "Account" },
      { href: "/policies/shipping-policy", label: "Shipping" },
      { href: "/policies/refund-policy", label: "Returns" },
      { href: "/policies/privacy-policy", label: "Privacy" },
      { href: "/policies/terms-of-service", label: "Terms" },
    ],
  },
] as const;

function mapped(response = navigationResponse()) {
  return mapNavigationResult(
    response,
    SYNTHETIC_STORE_DOMAIN,
    DEFAULT_MAIN_MENU_HANDLE,
  );
}

function mappedFooter(response = navigationResponse()) {
  return mapFooterMenuResult(response, SYNTHETIC_STORE_DOMAIN);
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

class StaticWithoutFooterNavigation extends StaticStorefrontDataSource {
  override async getNavigation() {
    const navigation = await super.getNavigation();
    return { ...navigation, footerColumns: [] };
  }
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
        footerMenuHandle: "footer",
        language: "EN",
        menuHandle: "main-menu",
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("preserves partial field errors for independently scoped mapping", async () => {
    const originalFetch = globalThis.fetch;
    const partialResponse = navigationResponse() as ReturnType<
      typeof navigationResponse
    > & {
      errors: Array<{ message: string; path: string[] }>;
    };
    partialResponse.errors = [
      { message: "synthetic footer failure", path: ["footerMenu"] },
    ];
    globalThis.fetch = async () => Response.json(partialResponse);

    try {
      const execute = createNavigationQueryExecutor(
        {
          storeDomain: SYNTHETIC_STORE_DOMAIN,
          privateStorefrontToken: "synthetic-private-storefront-value",
          mainMenuHandle: DEFAULT_MAIN_MENU_HANDLE,
        },
        { useNextCache: false },
      );
      assert.deepEqual((await execute()).errors, partialResponse.errors);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("fails safe on a malformed GraphQL errors container", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () =>
      Response.json({
        data: navigationResponse().data,
        errors: { message: "synthetic malformed errors container" },
      });

    try {
      const execute = createNavigationQueryExecutor(
        {
          storeDomain: SYNTHETIC_STORE_DOMAIN,
          privateStorefrontToken: "synthetic-private-storefront-value",
          mainMenuHandle: DEFAULT_MAIN_MENU_HANDLE,
        },
        { useNextCache: false },
      );
      await assert.rejects(execute, ShopifyCatalogError);
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
            "traverse-grid-fleece",
            "drift-insulated-vest",
            "ridge-30-field-pack",
            "approach-18-day-pack",
            "waypoint-sling-6",
            "talus-trail-shoe",
            "scree-approach-shoe",
            "camp-recovery-clog",
          ],
        },
        {
          handle: "outerwear",
          productHandles: [
            "weatherline-shell",
            "traverse-grid-fleece",
            "drift-insulated-vest",
          ],
        },
        {
          handle: "packs",
          productHandles: [
            "ridge-30-field-pack",
            "approach-18-day-pack",
            "waypoint-sling-6",
          ],
        },
        {
          handle: "footwear",
          productHandles: [
            "talus-trail-shoe",
            "scree-approach-shoe",
            "camp-recovery-clog",
          ],
        },
      ],
    );
  });

  it("maps every Footer column from the exact accepted nested footer menu", () => {
    assert.equal(FOOTER_MENU_HANDLE, "footer");
    assert.deepEqual(mappedFooter(), expectedFooterColumns);
  });

  it("rejects a missing or null footer menu", () => {
    const missing = navigationResponse() as unknown as {
      data: Record<string, unknown>;
    };
    delete missing.data.footerMenu;
    const nullMenu = navigationResponseWith((draft) => {
      draft.data.footerMenu = null;
    });
    assert.throws(() => mappedFooter(missing as never), ShopifyCatalogError);
    assert.throws(() => mappedFooter(nullMenu), ShopifyCatalogError);
  });

  it("rejects wrong footer handle, count, order, label, route, nesting, query, and hash", () => {
    const cases = [
      navigationResponseWith((draft) => {
        assert.ok(draft.data.footerMenu !== null);
        draft.data.footerMenu.handle = "forward-footer";
      }),
      navigationResponseWith((draft) => {
        draft.data.footerMenu?.items.pop();
      }),
      navigationResponseWith((draft) => {
        draft.data.footerMenu?.items.reverse();
      }),
      navigationResponseWith((draft) => {
        const item = draft.data.footerMenu?.items[0];
        assert.ok(item !== undefined);
        item.title = "About";
      }),
      navigationResponseWith((draft) => {
        const item = draft.data.footerMenu?.items[1];
        assert.ok(item !== undefined);
        item.url = "/pages/repairs";
      }),
      navigationResponseWith((draft) => {
        const item = draft.data.footerMenu?.items[2];
        assert.ok(item !== undefined);
        item.items.push({
          id: "gid://shopify/MenuItem/unexpected-child",
          title: "Unexpected",
          url: "/pages/contact",
          items: [],
        });
      }),
      navigationResponseWith((draft) => {
        const item = draft.data.footerMenu?.items[2];
        assert.ok(item !== undefined);
        item.url = "/pages/shipping-returns?from=footer";
      }),
      navigationResponseWith((draft) => {
        const item = draft.data.footerMenu?.items[1]?.items[3];
        assert.ok(item !== undefined);
        item.url = "/pages/contact#form";
      }),
      navigationResponseWith((draft) => {
        const item = draft.data.footerMenu?.items[1]?.items[3];
        assert.ok(item !== undefined);
        item.url = "/pages/contact?";
      }),
      navigationResponseWith((draft) => {
        const item = draft.data.footerMenu?.items[1]?.items[3];
        assert.ok(item !== undefined);
        item.url = "/pages/contact#";
      }),
    ];
    for (const response of cases) {
      assert.throws(() => mappedFooter(response), ShopifyCatalogError);
    }
  });

  it("rejects cross-store, non-HTTPS, protocol-relative, credentialed, and non-default-port footer URLs", () => {
    const urls = [
      "https://different-shop.myshopify.com/pages/contact",
      `http://${SYNTHETIC_STORE_DOMAIN}/pages/contact`,
      `//${SYNTHETIC_STORE_DOMAIN}/pages/contact`,
      `https://user:password@${SYNTHETIC_STORE_DOMAIN}/pages/contact`,
      `https://${SYNTHETIC_STORE_DOMAIN}:8443/pages/contact`,
    ];
    for (const url of urls) {
      const response = navigationResponseWith((draft) => {
        const item = draft.data.footerMenu?.items[1]?.items[3];
        assert.ok(item !== undefined);
        item.url = url;
      });
      assert.throws(() => mappedFooter(response), ShopifyCatalogError);
    }
  });

  it("maps the canonical upstream Shop tree that starts with Shop all", () => {
    assert.equal(targetShopMenuResponse().data.menu?.items[0]?.items.length, 4);
    assert.deepEqual(mapped(targetShopMenuResponse()).primary, expectedPrimary);
  });

  it("rejects the legacy upstream Shop tree after the live cutover", () => {
    const response = navigationResponseWith((draft) => {
      draft.data.menu?.items[0]?.items.shift();
    });
    assert.equal(response.data.menu?.items[0]?.items.length, 3);
    assert.throws(() => mapped(response), ShopifyCatalogError);
  });

  it("rejects Shop trees outside the canonical upstream shape", () => {
    const cases = [
      targetShopMenuResponse((children) => {
        const shopAll = children[0];
        assert.ok(shopAll !== undefined);
        shopAll.title = "All products";
      }),
      targetShopMenuResponse((children) => {
        const shopAll = children[0];
        assert.ok(shopAll !== undefined);
        children.splice(0, 1);
        children.push(shopAll);
      }),
      targetShopMenuResponse((children) => {
        const shopAll = children[0];
        assert.ok(shopAll !== undefined);
        shopAll.url = `${SYNTHETIC_STORE_ORIGIN}/collections/outerwear`;
      }),
      targetShopMenuResponse((children) => {
        const shopAll = children[0];
        assert.ok(shopAll !== undefined);
        shopAll.url = `${SYNTHETIC_STORE_ORIGIN}/collections/forward?view=all`;
      }),
      targetShopMenuResponse((children) => {
        const shopAll = children[0];
        assert.ok(shopAll !== undefined);
        shopAll.items.push({
          id: "gid://shopify/MenuItem/shop-all-deeper",
          title: "Too deep",
          url: `${SYNTHETIC_STORE_ORIGIN}/collections/forward`,
          items: [],
        });
      }),
      targetShopMenuResponse((children) => {
        children.push({
          id: "gid://shopify/MenuItem/accessories",
          title: "Accessories",
          url: `${SYNTHETIC_STORE_ORIGIN}/collections/accessories`,
          items: [],
        });
      }),
      navigationResponseWith((draft) => {
        draft.data.menu?.items[0]?.items.pop();
      }),
      navigationResponseWith((draft) => {
        const shop = draft.data.menu?.items[0];
        assert.ok(shop !== undefined);
        shop.items.unshift({
          id: "gid://shopify/MenuItem/shop-all-wrong-route",
          title: "Shop all",
          url: `${SYNTHETIC_STORE_ORIGIN}/pages/about-forward`,
          items: [],
        });
      }),
    ];
    for (const response of cases) {
      assert.throws(() => mapped(response), ShopifyCatalogError);
    }
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
  it("maps live primary and every Footer column while theme owns only utility/search", async () => {
    const source = shopifySource();
    const base = await new StaticStorefrontDataSource().getNavigation();
    assert.deepEqual(await source.getNavigation(), {
      primary: [...expectedPrimary, { href: "/search", label: "Search" }],
      utility: base.utility,
      footerColumns: expectedFooterColumns,
    });
    const navigation = await source.getNavigation();
    assert.equal(navigation.footerColumns.length, 3);
    assert.deepEqual(
      navigation.footerColumns[0]?.links.slice(1),
      navigation.primary[0]?.children?.slice(1),
    );
    assert.deepEqual(
      (await source.listCollections()).map((collection) => collection.handle),
      ["forward", "outerwear", "packs", "footwear"],
    );
    assert.equal((await source.getCollection("outerwear"))?.title, "Outerwear");
    assert.deepEqual(
      (await source.getCollectionProducts("packs"))?.map(
        (product) => product.handle,
      ),
      ["ridge-30-field-pack", "approach-18-day-pack", "waypoint-sling-6"],
    );
  });

  it("does not require theme-owned Footer navigation when the live footer menu is valid", async () => {
    const source = new ShopifyCatalogDataSource({
      base: new StaticWithoutFooterNavigation(),
      execute: async () => catalogResponse(),
      executeNavigation: async () => navigationResponse(),
      storeDomain: SYNTHETIC_STORE_DOMAIN,
      mainMenuHandle: DEFAULT_MAIN_MENU_HANDLE,
    });

    assert.deepEqual(
      (await source.getNavigation()).footerColumns,
      expectedFooterColumns,
    );
  });

  it("keeps the static Company fixture aligned with the accepted four-link contract", async () => {
    const navigation = await new StaticStorefrontDataSource().getNavigation();
    assert.deepEqual(navigation.footerColumns, expectedFooterColumns);
  });

  it("keeps every Company destination available in deterministic static mode", async () => {
    const source = new StaticStorefrontDataSource();
    const navigation = await source.getNavigation();
    const company = navigation.footerColumns.find(
      (column) => column.heading === "Company",
    );
    assert.ok(company !== undefined);

    for (const link of company.links) {
      const handle = link.href.match(/^\/pages\/(.+)$/)?.[1];
      assert.ok(
        handle !== undefined,
        `${link.href} must be an internal page route.`,
      );
      assert.ok(
        (await source.getPage(handle)) !== null,
        `${link.href} must resolve through the static data source.`,
      );
    }
  });

  it("falls back only the malformed footer while main navigation and collections stay live", async () => {
    const malformed = navigationResponseWith((draft) => {
      draft.data.footerMenu?.items.pop();
    });
    const footerObserved: ShopifyCatalogError[] = [];
    const navigationObserved: ShopifyCatalogError[] = [];
    const collectionObserved: ShopifyCatalogError[] = [];
    const source = new ShopifyCatalogDataSource({
      base: new StaticStorefrontDataSource(),
      execute: async () => catalogResponse(),
      executeNavigation: async () => malformed,
      storeDomain: SYNTHETIC_STORE_DOMAIN,
      mainMenuHandle: DEFAULT_MAIN_MENU_HANDLE,
      onFooterFallback: (error) => footerObserved.push(error),
      onNavigationFallback: (error) => navigationObserved.push(error),
      onCollectionFallback: (error) => collectionObserved.push(error),
    });

    assert.deepEqual(
      (await source.getNavigation()).primary.slice(0, 3),
      expectedPrimary,
    );
    assert.deepEqual(
      (await source.getNavigation()).footerColumns,
      expectedFooterColumns,
    );
    assert.deepEqual(
      (await source.listCollections()).map((collection) => collection.handle),
      ["forward", "outerwear", "packs", "footwear"],
    );
    assert.equal(footerObserved.length, 1);
    assert.equal(navigationObserved.length, 0);
    assert.equal(collectionObserved.length, 0);
  });

  it("keeps a separately valid live footer when main navigation falls back", async () => {
    const malformedMain = navigationResponseWith((draft) => {
      draft.data.menu = null;
    });
    const footerObserved: ShopifyCatalogError[] = [];
    const navigationObserved: ShopifyCatalogError[] = [];
    const source = new ShopifyCatalogDataSource({
      base: new StaticStorefrontDataSource(),
      execute: async () => catalogResponse(),
      executeNavigation: async () => malformedMain,
      storeDomain: SYNTHETIC_STORE_DOMAIN,
      mainMenuHandle: DEFAULT_MAIN_MENU_HANDLE,
      onFooterFallback: (error) => footerObserved.push(error),
      onNavigationFallback: (error) => navigationObserved.push(error),
    });

    assert.deepEqual(
      (await source.getNavigation()).footerColumns,
      expectedFooterColumns,
    );
    assert.equal(navigationObserved.length, 1);
    assert.equal(footerObserved.length, 0);
  });

  it("does not let footer fallback turn product failures into fixture success", async () => {
    const malformed = navigationResponseWith((draft) => {
      draft.data.footerMenu = null;
    });
    const source = new ShopifyCatalogDataSource({
      base: new StaticStorefrontDataSource(),
      execute: async () => {
        throw new ShopifyCatalogError("Synthetic product failure.");
      },
      executeNavigation: async () => malformed,
      storeDomain: SYNTHETIC_STORE_DOMAIN,
      mainMenuHandle: DEFAULT_MAIN_MENU_HANDLE,
      onFooterFallback: () => undefined,
    });

    assert.deepEqual(
      (await source.getNavigation()).footerColumns,
      expectedFooterColumns,
    );
    await assert.rejects(() => source.listProducts(), ShopifyCatalogError);
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
      ["weatherline-shell", "traverse-grid-fleece", "drift-insulated-vest"],
    );
    assert.equal(observed.length, 1);
  });

  it("contains structure transport failures while product data stays fail-closed", async () => {
    const collectionObserved: ShopifyCatalogError[] = [];
    const footerObserved: ShopifyCatalogError[] = [];
    const navigationObserved: ShopifyCatalogError[] = [];
    const source = new ShopifyCatalogDataSource({
      base: new StaticStorefrontDataSource(),
      execute: async () => catalogResponse(),
      executeNavigation: async () => {
        throw new ShopifyCatalogError("Synthetic navigation failure.");
      },
      onCollectionFallback: (error) => collectionObserved.push(error),
      onFooterFallback: (error) => footerObserved.push(error),
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
    assert.equal(footerObserved.length, 1);
    assert.equal(collectionObserved.length, 1);
  });

  it("scopes partial GraphQL field errors to only the affected structure", async () => {
    const staticNavigation =
      await new StaticStorefrontDataSource().getNavigation();
    for (const [rootField, expected] of [
      ["footerMenu", { main: 0, footer: 1, collections: 0 }],
      ["menu", { main: 1, footer: 0, collections: 0 }],
      ["collections", { main: 0, footer: 0, collections: 1 }],
    ] as const) {
      const response = navigationResponse() as ReturnType<
        typeof navigationResponse
      > & {
        errors: Array<{ message: string; path: string[] }>;
      };
      response.errors = [
        { message: "synthetic scoped failure", path: [rootField] },
      ];
      const observed = { main: 0, footer: 0, collections: 0 };
      const source = new ShopifyCatalogDataSource({
        base: new StaticStorefrontDataSource(),
        execute: async () => catalogResponse(),
        executeNavigation: async () => response,
        storeDomain: SYNTHETIC_STORE_DOMAIN,
        mainMenuHandle: DEFAULT_MAIN_MENU_HANDLE,
        onNavigationFallback: () => {
          observed.main += 1;
        },
        onFooterFallback: () => {
          observed.footer += 1;
        },
        onCollectionFallback: () => {
          observed.collections += 1;
        },
      });

      const navigation = await source.getNavigation();
      const collection = await source.getCollection("outerwear");
      assert.deepEqual(
        navigation.primary.slice(0, 3),
        expected.main === 1
          ? staticNavigation.primary.slice(0, 3)
          : expectedPrimary,
      );
      assert.deepEqual(
        navigation.footerColumns,
        expected.footer === 1
          ? staticNavigation.footerColumns
          : expectedFooterColumns,
      );
      assert.equal(collection?.handle, "outerwear");
      assert.deepEqual(observed, expected, rootField);
    }
  });

  it("treats an unscoped GraphQL error as affecting every structure", async () => {
    const response = navigationResponse() as ReturnType<
      typeof navigationResponse
    > & {
      errors: Array<{ message: string }>;
    };
    response.errors = [{ message: "synthetic unscoped failure" }];
    const observed = { main: 0, footer: 0, collections: 0 };
    const source = new ShopifyCatalogDataSource({
      base: new StaticStorefrontDataSource(),
      execute: async () => catalogResponse(),
      executeNavigation: async () => response,
      storeDomain: SYNTHETIC_STORE_DOMAIN,
      mainMenuHandle: DEFAULT_MAIN_MENU_HANDLE,
      onNavigationFallback: () => {
        observed.main += 1;
      },
      onFooterFallback: () => {
        observed.footer += 1;
      },
      onCollectionFallback: () => {
        observed.collections += 1;
      },
    });

    await source.getNavigation();
    await source.getCollection("outerwear");
    assert.deepEqual(observed, { main: 1, footer: 1, collections: 1 });
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

  it("fails live verification on footer fallback or link drift", async () => {
    const source = await readFile("scripts/verify-shopify.mts", "utf8");
    assert.match(source, /onFooterFallback/);
    assert.match(source, /footerFallbackUsed/);
    assert.match(source, /live footer has the canonical three-column tree/);
    for (const column of expectedFooterColumns) {
      assert.ok(source.includes(column.heading));
      for (const link of column.links) {
        assert.ok(source.includes(link.href));
        assert.ok(source.includes(link.label));
      }
    }
  });
});

describe("Footer navigation query/cache contract", () => {
  it("uses the accepted footer handle in query variables and the Next cache key", async () => {
    const querySource = await readFile(
      "src/lib/storefront/shopify/navigation-query.ts",
      "utf8",
    );
    const clientSource = await readFile(
      "src/lib/storefront/shopify/client.ts",
      "utf8",
    );
    assert.match(querySource, /\$footerMenuHandle: String!/);
    assert.doesNotMatch(querySource, /forward-footer/);
    assert.match(
      querySource,
      /footerMenu:\s*menu\(handle: \$footerMenuHandle\)/,
    );
    assert.match(clientSource, /footerMenuHandle:\s*FOOTER_MENU_HANDLE/);
    assert.match(
      clientSource,
      /NAVIGATION_CACHE_KEY,[\s\S]*config\.storeDomain,[\s\S]*config\.mainMenuHandle,[\s\S]*FOOTER_MENU_HANDLE/,
    );
  });
});

describe("Field Index presentation", () => {
  const expectedCards = [
    { id: "forward", index: "00", label: "Shop all", href: "/shop" },
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
  ] as const;

  it("maps the ordered Shopify Shop children into four presentation cards", () => {
    for (const response of [navigationResponse(), targetShopMenuResponse()]) {
      const shop = mapped(response).primary[0];
      assert.ok(shop !== undefined);
      assert.deepEqual(
        createFieldIndexCollections(shop).map(({ id, index, label, href }) => ({
          id,
          index,
          label,
          href,
        })),
        expectedCards,
      );
    }
    assert.equal(FIELD_INDEX_PRESENTATION.length, 4);
  });

  it("uses the canonical forward collection image for the Shop all card", () => {
    const shop = mapped().primary[0];
    assert.ok(shop !== undefined);
    const shopAll = createFieldIndexCollections(shop)[0];
    assert.deepEqual(
      shopAll?.image,
      COLLECTION_PRESENTATION_PROFILES.find(
        (profile) => profile.handle === "forward",
      )?.heroImage,
    );
  });

  it("rejects a Shop item without the exact four canonical children", () => {
    assert.throws(
      () => createFieldIndexCollections({ href: "/shop", label: "Shop" }),
      /exactly four children/i,
    );
    assert.throws(
      () =>
        createFieldIndexCollections({
          href: "/shop",
          label: "Shop",
          children: [
            { href: "/shop/outerwear", label: "Outerwear" },
            { href: "/shop", label: "Shop all" },
            { href: "/shop/packs", label: "Packs" },
            { href: "/shop/footwear", label: "Footwear" },
          ],
        }),
      /must target \/shop/i,
    );
  });
});
