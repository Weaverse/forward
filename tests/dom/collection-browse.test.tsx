import { describe, it } from "bun:test";
import assert from "node:assert/strict";
import { render } from "@testing-library/react";

import { COLLECTION_FIXTURES } from "@/lib/storefront/fixtures/collections";
import { PRODUCT_FIXTURES } from "@/lib/storefront/fixtures/products";
import { synthesizeProductFilters } from "@/lib/storefront/product-filters";
import type { CollectionProductsPage } from "@/lib/storefront/types";
import {
  type StorefrontDataContext,
  StorefrontDataProvider,
} from "@/lib/weaverse/data-context";
import CollectionContent from "@/sections/main-collection/content";
import CollectionFilters from "@/sections/main-collection/filters";
import CollectionProductGrid from "@/sections/main-collection/product-grid";
import CollectionToolbar from "@/sections/main-collection/toolbar";

import { setRoute } from "./preload";

const COLLECTION = COLLECTION_FIXTURES[0];
const PATH = `/shop/${COLLECTION?.handle}`;
const NO_PAGES: CollectionProductsPage["pageInfo"] = {
  hasNextPage: false,
  hasPreviousPage: false,
  startCursor: null,
  endCursor: null,
};

/**
 * The context the route builds: a page the store already narrowed, ordered and
 * cut, plus the facets it offered. No section parses a param.
 */
function routeContext(
  products = PRODUCT_FIXTURES,
  pageInfo = NO_PAGES,
): StorefrontDataContext {
  return {
    collection: COLLECTION,
    collectionProducts: products,
    browse: {
      filters: synthesizeProductFilters(PRODUCT_FIXTURES),
      sort: "featured",
      pageInfo,
    },
  };
}

function renderBrowse(query: string, context = routeContext()) {
  setRoute(PATH, query);
  return render(
    <StorefrontDataProvider value={context}>
      <CollectionToolbar />
      <CollectionContent>
        <CollectionFilters />
        <CollectionProductGrid />
      </CollectionContent>
    </StorefrontDataProvider>,
  );
}

describe("collection browse", () => {
  it("renders the store's facets, not a theme-declared list", () => {
    const { container } = renderBrowse("");
    const headings = [...container.querySelectorAll("summary")].map(
      (node) => node.textContent,
    );
    /* Availability and Price are what this store exposes; nothing else is
     * invented by the theme. */
    assert.ok(headings.includes("Availability"));
    assert.ok(headings.includes("Price"));
    assert.equal(headings.includes("Activity"), false);
    assert.equal(headings.includes("Category"), false);
  });

  it("carries a facet's own input into the URL untouched", () => {
    const { container } = renderBrowse("");
    const inStock = [
      ...container.querySelectorAll<HTMLAnchorElement>("a[href*='filter.']"),
    ][0];
    assert.ok(inStock);
    const href = inStock.getAttribute("href") ?? "";
    assert.ok(href.startsWith(`${PATH}?`));
    const value = new URL(href, "http://localhost").searchParams.get(
      "filter.v.availability",
    );
    assert.deepEqual(JSON.parse(value ?? "{}"), { available: true });
  });

  it("marks an applied facet and offers a link that removes it", () => {
    const applied = `filter.v.availability=${encodeURIComponent(
      JSON.stringify({ available: true }),
    )}`;
    const { container } = renderBrowse(applied);
    const current = container.querySelector("a[aria-current='true']");
    assert.notEqual(current, null);
    /* Clicking an applied value clears it rather than re-applying it. */
    assert.equal(
      current?.getAttribute("href")?.includes("filter.v.availability"),
      false,
    );
  });

  it("keeps unrelated params across a facet click and a re-sort", () => {
    const { container } = renderBrowse("utm_source=newsletter");
    for (const link of container.querySelectorAll("a[href*='filter.']")) {
      assert.match(link.getAttribute("href") ?? "", /utm_source=newsletter/);
    }
    const form = container.querySelector("form[method='get']");
    assert.equal(form?.getAttribute("action"), PATH);
    assert.equal(
      form?.querySelector("input[name='utm_source']")?.getAttribute("value"),
      "newsletter",
    );
    /* A new order invalidates the cursor, so it must not travel. */
    assert.equal(form?.querySelector("input[name='after']"), null);
  });

  it("offers a price range as two plain numbers", () => {
    const { container } = renderBrowse("");
    assert.notEqual(container.querySelector("input[name='price-min']"), null);
    assert.notEqual(container.querySelector("input[name='price-max']"), null);
  });

  it("pages with cursors rather than page numbers", () => {
    const { container } = renderBrowse("", {
      ...routeContext(),
      browse: {
        filters: [],
        sort: "featured",
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false,
          startCursor: "a",
          endCursor: "z",
        },
      },
    });
    const next = container.querySelector(
      "nav[aria-label='Pagination'] a[rel='next']",
    );
    assert.match(next?.getAttribute("href") ?? "", /after=z/);
    assert.equal(
      container.querySelector("nav[aria-label='Pagination'] a[rel='prev']"),
      null,
    );
  });

  it("offers a way back when a filter matched nothing", () => {
    const applied = `filter.v.availability=${encodeURIComponent(
      JSON.stringify({ available: false }),
    )}`;
    const { container } = renderBrowse(applied, routeContext([]));
    assert.equal(container.querySelectorAll("article").length, 0);
    const reset = [...container.querySelectorAll<HTMLAnchorElement>("a")].find(
      (node) => node.textContent === "Clear filters",
    );
    assert.equal(reset?.getAttribute("href"), PATH);
  });
});
