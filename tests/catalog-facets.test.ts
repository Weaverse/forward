import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  catalogHref,
  deriveFilterGroups,
  describeFilter,
  parseCatalogQuery,
  toSearchParams,
} from "../src/lib/storefront/catalog-facets.ts";
import { PRODUCT_FIXTURES } from "../src/lib/storefront/fixtures/products.ts";

const PATH = "/shop/field-essentials";

function groups(query: string, products = PRODUCT_FIXTURES) {
  const params = new URLSearchParams(query);
  const { filter } = parseCatalogQuery(params, products);
  return deriveFilterGroups({ pathname: PATH, params, products, filter });
}

describe("catalog query parsing", () => {
  it("keeps only categories the catalog defines", () => {
    const params = new URLSearchParams("category=not-a-category");
    assert.equal(
      parseCatalogQuery(params, PRODUCT_FIXTURES).filter.category,
      undefined,
    );
    assert.equal(
      parseCatalogQuery(new URLSearchParams("category=packs"), PRODUCT_FIXTURES)
        .filter.category,
      "packs",
    );
  });

  it("drops an activity the page does not offer", () => {
    /* An unknown activity would filter every product away and leave the
     * shopper on an empty grid with no way to tell why. */
    const activity = PRODUCT_FIXTURES[0]?.activities[0];
    assert.ok(activity);
    assert.equal(
      parseCatalogQuery(
        new URLSearchParams(`activity=${encodeURIComponent(activity)}`),
        PRODUCT_FIXTURES,
      ).filter.activity,
      activity,
    );
    assert.equal(
      parseCatalogQuery(
        new URLSearchParams("activity=spelunking"),
        PRODUCT_FIXTURES,
      ).filter.activity,
      undefined,
    );
  });

  it("falls back to the featured order for an unknown sort", () => {
    assert.equal(
      parseCatalogQuery(new URLSearchParams("sort=sideways"), PRODUCT_FIXTURES)
        .sort,
      "featured",
    );
  });

  it("reads route searchParams, taking the first of a repeated key", () => {
    const params = toSearchParams({
      category: ["packs", "shells"],
      sort: "name",
      missing: undefined,
    });
    assert.equal(params.get("category"), "packs");
    assert.equal(params.get("sort"), "name");
    assert.equal(params.has("missing"), false);
  });
});

describe("facet links", () => {
  it("keeps params the page does not own", () => {
    const [group] = groups("utm_source=newsletter");
    assert.ok(group);
    for (const link of group.links) {
      assert.match(link.href, /utm_source=newsletter/);
    }
  });

  it("returns to the first page whenever the filter changes", () => {
    const [group] = groups("page=3");
    assert.ok(group);
    for (const link of group.links) {
      assert.doesNotMatch(link.href, /page=/);
    }
  });

  it("marks exactly one link per group as selected", () => {
    for (const group of groups("category=packs")) {
      assert.equal(group.links.filter((link) => link.selected).length, 1);
    }
  });

  it("offers a way back to the unfiltered view", () => {
    const [activities] = groups("category=packs");
    assert.ok(activities);
    const reset = activities.links.find(
      (link) => link.key === "all-activities",
    );
    assert.ok(reset);
    /* Clearing one dimension must not clear the other. */
    assert.match(reset.href, /category=packs/);
    assert.doesNotMatch(reset.href, /activity=/);
  });

  it("leaves out a dimension that cannot change the result", () => {
    const single = PRODUCT_FIXTURES.filter(
      (product) => product.category === PRODUCT_FIXTURES[0]?.category,
    ).slice(0, 1);
    assert.equal(
      groups("", single).some((group) => group.heading === "Category"),
      false,
    );
  });

  it("counts against the other active dimension, not the whole catalog", () => {
    const params = new URLSearchParams("category=packs");
    const { filter } = parseCatalogQuery(params, PRODUCT_FIXTURES);
    const [activities] = deriveFilterGroups({
      pathname: PATH,
      params,
      products: PRODUCT_FIXTURES,
      filter,
      showCounts: true,
    });
    assert.ok(activities);
    const all = activities.links.find((link) => link.key === "all-activities");
    assert.equal(
      all?.count,
      PRODUCT_FIXTURES.filter((product) => product.category === "packs").length,
    );
  });

  it("omits counts unless the page asked for them", () => {
    const [group] = groups("");
    assert.ok(group);
    assert.equal(
      group.links.every((link) => link.count === undefined),
      true,
    );
  });
});

describe("catalogHref", () => {
  it("drops a param set to undefined and keeps the rest", () => {
    const params = new URLSearchParams("category=packs&sort=name&page=2");
    assert.equal(
      catalogHref("/shop", params, { category: undefined, page: undefined }),
      "/shop?sort=name",
    );
  });

  it("returns a bare pathname once nothing is left", () => {
    assert.equal(
      catalogHref("/shop", new URLSearchParams("page=2"), { page: undefined }),
      "/shop",
    );
  });
});

describe("describeFilter", () => {
  it("names the active dimensions and nothing else", () => {
    assert.equal(describeFilter({}), "");
    assert.equal(
      describeFilter({ category: "packs", activity: "hiking" }),
      " · Packs · hiking",
    );
  });
});
