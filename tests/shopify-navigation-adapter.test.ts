import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

import { fieldIndexCollections } from "../src/components/site-header/header-navigation.ts";
import { createNavigationQueryExecutor } from "../src/lib/storefront/shopify/client.ts";
import { ShopifyCatalogDataSource } from "../src/lib/storefront/shopify/data-source.ts";
import { DEFAULT_MAIN_MENU_HANDLE } from "../src/lib/storefront/shopify/env.ts";
import { ShopifyCatalogError } from "../src/lib/storefront/shopify/errors.ts";
import {
  mapFooterMenuResult,
  mapNavigationResult,
} from "../src/lib/storefront/shopify/navigation-mapper.ts";
import { FOOTER_MENU_HANDLE } from "../src/lib/storefront/shopify/navigation-query.ts";
import {
  catalogResponse,
  UNREAD_EXECUTORS,
} from "./fixtures/shopify-catalog-response.ts";
import {
  navigationResponse,
  navigationResponseWith,
} from "./fixtures/shopify-navigation-response.ts";
import { COLLECTION_FIXTURES } from "./fixtures/storefront/collections.ts";

const SYNTHETIC_STORE_DOMAIN = "forward-test-shop.myshopify.com";
const SYNTHETIC_STORE_ORIGIN = `https://${SYNTHETIC_STORE_DOMAIN}`;

/** The fixture menu as the theme routes it: every collection under `/shop`. */
const expectedPrimary = [
  {
    href: "/shop/forward",
    label: "Shop",
    children: [
      { href: "/shop/forward", label: "Shop all" },
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
      { href: "/shop/forward", label: "All products" },
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

function shopifySource(
  executeNavigation: () => Promise<
    ReturnType<typeof navigationResponse>
  > = async () => navigationResponse(),
) {
  return new ShopifyCatalogDataSource({
    ...UNREAD_EXECUTORS,
    execute: async () => catalogResponse(),
    executeNavigation,
    storeDomain: SYNTHETIC_STORE_DOMAIN,
    mainMenuHandle: DEFAULT_MAIN_MENU_HANDLE,
  });
}

/** A response whose GraphQL errors are scoped to one root field, or none. */
function withErrors(path?: string) {
  const response = navigationResponse() as ReturnType<
    typeof navigationResponse
  > & { errors: Array<{ message: string; path?: string[] }> };
  response.errors = [
    path === undefined
      ? { message: "synthetic unscoped failure" }
      : { message: "synthetic scoped failure", path: [path] },
  ];
  return response;
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
  it("maps the store's menu and every collection it publishes", () => {
    const snapshot = mapped();
    assert.deepEqual(snapshot.primary, expectedPrimary);
    assert.deepEqual(
      snapshot.collections.map((collection) => collection.handle),
      ["forward", "outerwear", "packs", "footwear"],
    );
  });

  it("maps every Footer column from the store's footer menu", () => {
    assert.equal(FOOTER_MENU_HANDLE, "footer");
    assert.deepEqual(mappedFooter(), expectedFooterColumns);
  });

  it("maps a menu the store has not set up to no links", () => {
    const missing = navigationResponse() as unknown as {
      data: Record<string, unknown>;
    };
    delete missing.data.footerMenu;
    assert.deepEqual(mappedFooter(missing as never), []);
    assert.deepEqual(
      mappedFooter(
        navigationResponseWith((draft) => {
          draft.data.footerMenu = null;
        }),
      ),
      [],
    );
    assert.deepEqual(
      mapped(
        navigationResponseWith((draft) => {
          draft.data.menu = null;
        }),
      ).primary,
      [],
    );
  });

  it("rejects a menu answered under the wrong handle", () => {
    const response = navigationResponseWith((draft) => {
      assert.ok(draft.data.footerMenu !== null);
      draft.data.footerMenu.handle = "forward-footer";
    });
    assert.throws(() => mappedFooter(response), ShopifyCatalogError);
  });

  it("keeps whatever the merchant arranged: order, labels and size", () => {
    const response = navigationResponseWith((draft) => {
      const shop = draft.data.menu?.items[0];
      assert.ok(shop !== undefined);
      shop.items.reverse();
      const first = shop.items[0];
      assert.ok(first !== undefined);
      first.title = "Trail shoes";
      shop.items.push({
        id: "gid://shopify/MenuItem/accessories",
        title: "Accessories",
        url: `${SYNTHETIC_STORE_ORIGIN}/collections/accessories`,
        items: [],
      });
      draft.data.footerMenu?.items.pop();
    });
    assert.deepEqual(mapped(response).primary[0]?.children, [
      { href: "/shop/footwear", label: "Trail shoes" },
      { href: "/shop/packs", label: "Packs" },
      { href: "/shop/outerwear", label: "Outerwear" },
      { href: "/shop/forward", label: "Shop all" },
      { href: "/shop/accessories", label: "Accessories" },
    ]);
    assert.equal(mappedFooter(response).length, 2);
  });

  it("routes Shopify paths onto the theme's own routes", () => {
    const cases = [
      ["/", "/"],
      ["/collections/all", "/shop"],
      ["/collections/packs", "/shop/packs"],
      ["/products/talus-trail-shoe", "/products/talus-trail-shoe"],
      ["/blogs/field-notes", "/journal"],
      ["/blogs/field-notes/layering", "/journal/layering"],
      ["/policies/refund-policy", "/policies/refund-policy"],
      ["/search", "/search"],
      ["/pages/contact#form", "/pages/contact"],
      ["/pages/contact?from=footer", "/pages/contact"],
      [`${SYNTHETIC_STORE_ORIGIN}/pages/contact/`, "/pages/contact"],
      ["/en-gb/collections/packs", "/shop/packs"],
      [`${SYNTHETIC_STORE_ORIGIN}/de-de/pages/contact`, "/pages/contact"],
      ["/ja-jp/blogs/field-notes/layering", "/journal/layering"],
      ["/de/collections/all", "/shop"],
      ["/fr-fr", "/"],
    ] as const;
    for (const [url, href] of cases) {
      const response = navigationResponseWith((draft) => {
        const item = draft.data.footerMenu?.items[1]?.items[3];
        assert.ok(item !== undefined);
        item.url = url;
      });
      assert.equal(mappedFooter(response)[1]?.links[3]?.href, href, url);
    }
  });

  it("leaves out links to other origins or to routes the theme lacks", () => {
    const urls = [
      "https://different-shop.myshopify.com/pages/contact",
      `http://${SYNTHETIC_STORE_DOMAIN}/pages/contact`,
      `//${SYNTHETIC_STORE_DOMAIN}/pages/contact`,
      `https://user:password@${SYNTHETIC_STORE_DOMAIN}/pages/contact`,
      `https://${SYNTHETIC_STORE_DOMAIN}:8443/pages/contact`,
      "/apps/loyalty",
    ];
    for (const url of urls) {
      const response = navigationResponseWith((draft) => {
        const item = draft.data.footerMenu?.items[1]?.items[3];
        assert.ok(item !== undefined);
        item.url = url;
      });
      assert.deepEqual(
        mappedFooter(response)[1]?.links,
        expectedCompanyLinks.slice(0, 3),
        url,
      );
    }
  });

  it("drops an entry the theme cannot route together with its children", () => {
    const response = navigationResponseWith((draft) => {
      const shop = draft.data.menu?.items[0];
      assert.ok(shop !== undefined);
      shop.url = "https://example.com/catalog";
    });
    assert.deepEqual(mapped(response).primary, expectedPrimary.slice(1));
  });

  it("reads only the two levels the query asks for", () => {
    const response = navigationResponseWith((draft) => {
      const child = draft.data.menu?.items[0]?.items[0];
      assert.ok(child !== undefined);
      child.items.push({
        id: "gid://shopify/MenuItem/deeper",
        title: "Too deep",
        url: "/collections/outerwear",
        items: [],
      });
    });
    assert.deepEqual(mapped(response).primary, expectedPrimary);
  });

  it("rejects a paginated or malformed collections page", () => {
    /* Membership is the merchant's, so it is never rejected. A truncated or
     * shapeless page still is: it would silently hide collections. */
    const cases = [
      navigationResponseWith((draft) => {
        draft.data.collections.pageInfo.hasNextPage = true;
      }),
      navigationResponseWith((draft) => {
        draft.data.collections.pageInfo.hasNextPage =
          undefined as unknown as boolean;
      }),
      navigationResponseWith((draft) => {
        const first = draft.data.collections.nodes[0];
        assert.ok(first !== undefined);
        first.handle = undefined as unknown as string;
      }),
    ];
    for (const response of cases) {
      assert.throws(() => mapped(response), ShopifyCatalogError);
    }
  });

  it("exposes every collection the store publishes, in its order", () => {
    /* A theme that only surfaced four approved handles could not run on
     * another store. Whatever the merchant published is what ships. */
    const response = navigationResponseWith((draft) => {
      const first = draft.data.collections.nodes[0];
      assert.ok(first !== undefined);
      draft.data.collections.nodes.unshift({
        ...first,
        handle: "frontpage",
        title: "Home page",
      });
    });
    assert.deepEqual(mapped(response).collections[0]?.handle, "frontpage");
    assert.equal(
      mapped(response).collections.length,
      response.data.collections.nodes.length,
    );
  });

  it("drops a collection's membership only when the store did", () => {
    const response = navigationResponseWith((draft) => {
      const outerwear = draft.data.collections.nodes[1];
      assert.ok(outerwear !== undefined);
      outerwear.products.nodes = [{ handle: "talus-trail-shoe" }];
    });
    assert.deepEqual(mapped(response).collections[1]?.productHandles, [
      "talus-trail-shoe",
    ]);
  });
});

describe("Shopify navigation data source", () => {
  it("maps the live primary menu and every Footer column", async () => {
    const source = shopifySource();
    assert.deepEqual(await source.getNavigation(), {
      primary: expectedPrimary,
      footerColumns: expectedFooterColumns,
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
      ["ridge-30-field-pack", "approach-18-day-pack", "waypoint-sling-6"],
    );
  });

  it("renders a store with no main menu as no primary links", async () => {
    const source = shopifySource(async () =>
      navigationResponseWith((draft) => {
        draft.data.menu = null;
      }),
    );
    const navigation = await source.getNavigation();
    assert.deepEqual(navigation.primary, []);
    assert.deepEqual(navigation.footerColumns, expectedFooterColumns);
  });

  it("fails closed when the navigation read fails, never serving fixtures", async () => {
    const source = shopifySource(async () => {
      throw new ShopifyCatalogError("Synthetic navigation failure.");
    });
    await assert.rejects(() => source.getNavigation(), ShopifyCatalogError);
    await assert.rejects(() => source.listCollections(), ShopifyCatalogError);
  });

  it("fails only the structure a scoped GraphQL error touches", async () => {
    const footerFailure = shopifySource(async () => withErrors("footerMenu"));
    await assert.rejects(
      () => footerFailure.getNavigation(),
      ShopifyCatalogError,
    );
    assert.equal(
      (await footerFailure.getCollection("outerwear"))?.handle,
      "outerwear",
    );

    const collectionFailure = shopifySource(async () =>
      withErrors("collections"),
    );
    assert.deepEqual(
      (await collectionFailure.getNavigation()).footerColumns,
      expectedFooterColumns,
    );
    await assert.rejects(
      () => collectionFailure.listCollections(),
      ShopifyCatalogError,
    );
  });

  it("treats an unscoped GraphQL error as affecting every structure", async () => {
    const source = shopifySource(async () => withErrors());
    await assert.rejects(() => source.getNavigation(), ShopifyCatalogError);
    await assert.rejects(() => source.listCollections(), ShopifyCatalogError);
  });
});

describe("live Shopify verifier", () => {
  it("fails live verification on footer link drift", async () => {
    const source = await readFile("scripts/verify-shopify.mts", "utf8");
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
  it("dresses each Shop link with its collection, in the merchant's order", async () => {
    const shop = mapped().primary[0];
    const collections = COLLECTION_FIXTURES;
    const cards = fieldIndexCollections(shop, collections);
    assert.deepEqual(
      cards?.map(({ index, label, href, fieldCode }) => ({
        index,
        label,
        href,
        fieldCode,
      })),
      [
        {
          index: "00",
          label: "Shop all",
          href: "/shop/forward",
          fieldCode: "FW-00",
        },
        {
          index: "01",
          label: "Outerwear",
          href: "/shop/outerwear",
          fieldCode: "OW-01",
        },
        {
          index: "02",
          label: "Packs",
          href: "/shop/packs",
          fieldCode: "PK-02",
        },
        {
          index: "03",
          label: "Footwear",
          href: "/shop/footwear",
          fieldCode: "FT-03",
        },
      ],
    );
    assert.deepEqual(
      cards?.[1]?.image,
      collections.find((collection) => collection.handle === "outerwear")
        ?.heroImage,
    );
  });

  it("keeps the label of a link to an unpublished collection and nothing else", () => {
    const cards = fieldIndexCollections(
      {
        href: "/shop",
        label: "Shop",
        children: [
          { href: "/shop", label: "Everything" },
          { href: "/shop/archive", label: "Archive" },
        ],
      },
      [],
    );
    assert.deepEqual(cards, [
      {
        id: "/shop",
        index: "00",
        label: "Everything",
        href: "/shop",
        fieldCode: "",
        description: "",
        image: null,
      },
      {
        id: "/shop/archive",
        index: "01",
        label: "Archive",
        href: "/shop/archive",
        fieldCode: "",
        description: "",
        image: null,
      },
    ]);
  });

  it("has no panel without Shop links", () => {
    assert.equal(fieldIndexCollections(undefined, []), null);
    assert.equal(
      fieldIndexCollections({ href: "/shop", label: "Shop" }, []),
      null,
    );
  });
});
