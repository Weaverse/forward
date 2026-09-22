import { describe, it } from "bun:test";
import assert from "node:assert/strict";
import { render } from "@testing-library/react";

import { deriveFilterGroups } from "@/lib/storefront/catalog-facets";
import { COLLECTION_FIXTURES } from "@/lib/storefront/fixtures/collections";
import { PRODUCT_FIXTURES } from "@/lib/storefront/fixtures/products";
import type { ProductListFilter, ProductSort } from "@/lib/storefront/types";
import {
  type StorefrontDataContext,
  StorefrontDataProvider,
} from "@/lib/weaverse/data-context";
import MainCollection from "@/sections/main-collection";
import CollectionContent from "@/sections/main-collection/content";
import CollectionFilters from "@/sections/main-collection/filters";
import CollectionProductGrid from "@/sections/main-collection/product-grid";
import CollectionToolbar from "@/sections/main-collection/toolbar";

import { setRoute } from "./preload";

const COLLECTION = COLLECTION_FIXTURES[0];
const PATH = `/shop/${COLLECTION?.handle}`;

/**
 * The context the collection route builds, with filter and sort already
 * resolved. Sections are rendered against exactly this shape, because that is
 * the whole point of the seam: no section parses a param.
 */
function routeContext(
  query = "",
  filter: ProductListFilter = {},
  sort: ProductSort = "featured",
  products = PRODUCT_FIXTURES,
): StorefrontDataContext {
  return {
    collection: COLLECTION,
    collectionProducts: products,
    collectionBrowse: {
      facets: deriveFilterGroups({
        pathname: PATH,
        params: new URLSearchParams(query),
        products: PRODUCT_FIXTURES,
        filter,
      }),
      filter,
      sort,
    },
  };
}

function renderBrowse(context: StorefrontDataContext) {
  return render(
    <StorefrontDataProvider value={context}>
      <MainCollection>
        <CollectionToolbar />
        <CollectionContent>
          <CollectionFilters />
          <CollectionProductGrid />
        </CollectionContent>
      </MainCollection>
    </StorefrontDataProvider>,
  );
}

describe("collection browse composition", () => {
  it("renders the toolbar, facets and grid supplied by Studio", () => {
    setRoute(PATH);
    const { container } = renderBrowse(routeContext());

    assert.notEqual(container.querySelector("form[method='get']"), null);
    assert.notEqual(container.querySelector("select[name='sort']"), null);
    assert.ok(
      container.querySelectorAll("article").length > 0,
      "no product cards rendered",
    );
  });

  it("renders nothing at all without a collection", () => {
    setRoute(PATH);
    const { container } = render(
      <StorefrontDataProvider value={{}}>
        <MainCollection />
      </StorefrontDataProvider>,
    );

    assert.equal(container.firstElementChild, null);
  });
});

describe("collection facet links", () => {
  it("applies the count setting to mobile and desktop filters", () => {
    setRoute(PATH);
    const { container, rerender } = render(
      <StorefrontDataProvider value={routeContext()}>
        <CollectionFilters showCounts={false} />
      </StorefrontDataProvider>,
    );

    assert.notEqual(container.querySelector("details > summary"), null);
    assert.ok(container.querySelectorAll("a[href*='activity=']").length > 1);
    assert.equal(container.querySelectorAll(".tabular-nums").length, 0);

    rerender(
      <StorefrontDataProvider value={routeContext()}>
        <CollectionFilters showCounts />
      </StorefrontDataProvider>,
    );
    assert.ok(container.querySelectorAll(".tabular-nums").length > 1);
  });

  it("points every facet at the current path with validated query state", () => {
    setRoute(PATH, "utm_source=newsletter");
    const { container } = renderBrowse(routeContext("utm_source=newsletter"));

    const links = [
      ...container.querySelectorAll<HTMLAnchorElement>("a[href*='category=']"),
    ];
    assert.ok(links.length > 0, "no category facet rendered");
    for (const link of links) {
      assert.ok(link.getAttribute("href")?.startsWith(`${PATH}?`));
      assert.match(link.getAttribute("href") ?? "", /utm_source=newsletter/);
    }
  });

  it("marks the active facet for assistive technology", () => {
    setRoute(PATH, "category=packs");
    const { container } = renderBrowse(
      routeContext("category=packs", { category: "packs" }),
    );

    const current = container.querySelector("a[aria-current='page']");
    assert.notEqual(current, null);
    assert.match(current?.getAttribute("href") ?? "", /category=packs/);
  });

  it("carries the active filter through a re-sort without JavaScript", () => {
    /* The sort control is a plain GET form; anything it does not own has to
     * travel as a hidden input or the filter is lost on submit. */
    setRoute(PATH, "category=packs");
    const { container } = renderBrowse(
      routeContext("category=packs", { category: "packs" }),
    );

    const form = container.querySelector("form[method='get']");
    assert.equal(form?.getAttribute("action"), PATH);
    assert.equal(
      form?.querySelector("input[name='category']")?.getAttribute("value"),
      "packs",
    );
    assert.equal(form?.querySelector("input[name='page']"), null);
  });
});

describe("collection product grid", () => {
  function renderGrid(query: string, pageSize: number) {
    setRoute(PATH, query);
    return render(
      <StorefrontDataProvider value={routeContext(query)}>
        <CollectionProductGrid pageSize={pageSize} />
      </StorefrontDataProvider>,
    );
  }

  it("shows one page of products and links to the rest", () => {
    const { container } = renderGrid("", 2);

    assert.equal(container.querySelectorAll("article").length, 2);
    const pages = container.querySelectorAll("nav[aria-label='Pagination'] a");
    assert.equal(pages.length, Math.ceil(PRODUCT_FIXTURES.length / 2));
    assert.equal(pages[0]?.getAttribute("href"), PATH);
    assert.match(pages[1]?.getAttribute("href") ?? "", /page=2/);
  });

  it("renders the requested page", () => {
    const { container } = renderGrid("page=2", 2);

    const current = container.querySelector(
      "nav[aria-label='Pagination'] a[aria-current='page']",
    );
    assert.equal(current?.textContent, "2");
  });

  it("clamps a page past the end rather than showing nothing", () => {
    const { container } = renderGrid("page=99", 2);

    assert.ok(container.querySelectorAll("article").length > 0);
  });

  it("hides pagination when everything fits on one page", () => {
    const { container } = renderGrid("", 100);

    assert.equal(container.querySelector("nav[aria-label='Pagination']"), null);
  });

  it("offers a way back when the filter matched nothing", () => {
    setRoute(PATH, "category=packs&page=2");
    const { container } = render(
      <StorefrontDataProvider
        value={routeContext(
          "category=packs&page=2",
          { category: "packs" },
          "featured",
          [],
        )}
      >
        <CollectionProductGrid />
      </StorefrontDataProvider>,
    );

    assert.equal(container.querySelectorAll("article").length, 0);
    const reset = container.querySelector("a");
    assert.equal(reset?.getAttribute("href"), PATH);
  });
});
