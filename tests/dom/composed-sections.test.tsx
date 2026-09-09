import { describe, it } from "bun:test";
import assert from "node:assert/strict";
import { render } from "@testing-library/react";

import { COLLECTION_FIXTURES } from "@/lib/storefront/fixtures/collections";
import { JOURNAL_FIXTURES } from "@/lib/storefront/fixtures/journal";
import { PAGE_FIXTURES } from "@/lib/storefront/fixtures/pages";
import { PRODUCT_FIXTURES } from "@/lib/storefront/fixtures/products";
import { WEAVERSE_COMPONENTS } from "@/lib/weaverse/components";
import {
  type StorefrontDataContext,
  StorefrontDataProvider,
} from "@/lib/weaverse/data-context";
import EditorialHero from "@/sections/editorial-hero";

/**
 * Every component a merchant can place in Studio, taken from the registry
 * itself rather than a hand-kept list — a section registered without coverage
 * here would otherwise ship unverified.
 */
const COMPOSED = WEAVERSE_COMPONENTS.map(
  (component) =>
    [component.schema.type, component.default] as [
      string,
      (props: Record<string, unknown>) => React.ReactNode,
    ],
);

/**
 * The storefront data a resource-backed template gets from its route.
 *
 * Resource-backed sections render nothing without it, so the identity
 * assertions below need a populated context to have a root element to check.
 * Fixtures are read directly rather than through the `storefront` data source,
 * which refuses to load in a document environment.
 */
const ROUTE_CONTEXT: StorefrontDataContext = {
  article: JOURNAL_FIXTURES[0],
  collection: COLLECTION_FIXTURES[0],
  collectionProducts: PRODUCT_FIXTURES,
  page: PAGE_FIXTURES[0],
  product: PRODUCT_FIXTURES[0],
  products: PRODUCT_FIXTURES,
};

describe("composed sections tolerate merchant-cleared settings", () => {
  for (const [type, Component] of COMPOSED) {
    it(`renders ${type} with no settings and no route data`, () => {
      /* Both halves are ordinary states: a merchant can clear any field, and
       * can drop a product section onto a page that has no product. */
      assert.doesNotThrow(() => render(<Component />));
    });
  }
});

describe("image inputs survive Builder's own shape", () => {
  /* Builder stores `{ url, altText }`; the theme renders `{ src, alt }`. The
   * two look compatible and are not, which is how the first composed render
   * crashed on `image.src` being undefined. */
  const BUILDER_IMAGE = {
    url: "https://cdn.example/hero.jpg",
    altText: "Field hero",
    width: 1600,
    height: 900,
  };

  it("renders a Builder image in the editorial hero", () => {
    const { container } = render(
      <EditorialHero
        eyebrowLabel="Eyebrow"
        heading="Heading"
        lede="Lede"
        image={BUILDER_IMAGE}
      />,
    );

    const image = container.querySelector("img");
    assert.notEqual(image, null);
    assert.equal(image?.getAttribute("alt"), "Field hero");
  });

  it("drops the image rather than crashing when it has no dimensions", () => {
    const { container } = render(
      <EditorialHero
        eyebrowLabel="Eyebrow"
        heading="Heading"
        lede="Lede"
        image={{ url: "https://cdn.example/hero.jpg" }}
      />,
    );

    assert.equal(container.querySelector("img"), null);
    assert.ok(container.textContent?.includes("Heading"));
  });
});

describe("composed components are addressable by Studio", () => {
  /* Studio finds an item by the data-wv-* attributes the runtime passes as
   * props. A component that renders correctly but drops them is invisible in
   * Studio: no outline entry, nothing to select or reorder. The storefront
   * looks fine, so only this assertion catches it. */
  for (const [type, Component] of COMPOSED) {
    it(`forwards the runtime identity attributes on ${type}`, () => {
      const { container } = render(
        <StorefrontDataProvider value={ROUTE_CONTEXT}>
          <Component data-wv-id="item-1" data-wv-type={type} />
        </StorefrontDataProvider>,
      );

      const root = container.firstElementChild;
      assert.notEqual(root, null, `${type} rendered nothing`);
      assert.equal(
        root?.getAttribute("data-wv-id"),
        "item-1",
        `${type} dropped data-wv-id, so Studio cannot select it`,
      );
      assert.equal(root?.getAttribute("data-wv-type"), type);
    });
  }
});
