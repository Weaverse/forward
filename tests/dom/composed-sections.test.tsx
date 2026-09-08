import { describe, it } from "bun:test";
import assert from "node:assert/strict";
import { render } from "@testing-library/react";

import Button from "@/components/button";
import Heading from "@/components/heading";
import Paragraph from "@/components/paragraph";
import Subheading from "@/components/subheading";
import EditorialCallout from "@/sections/editorial-callout";
import EditorialHero from "@/sections/editorial-hero";
import EditorialOverlayHero from "@/sections/editorial-overlay-hero";
import NumberedSequence from "@/sections/numbered-sequence";
import PrincipleGrid from "@/sections/principle-grid";
import ProductCaseStudy from "@/sections/product-case-study";
import ProductStrip from "@/sections/product-strip";
import ProductTiles from "@/sections/product-tiles";
import StandardStatement from "@/sections/standard-statement";
import StatBand from "@/sections/stat-band";

/**
 * Every component a merchant can place in Studio.
 *
 * A composed component is fed merchant-editable data, and a merchant can clear
 * any field. So "every setting is missing" is an ordinary state to survive, not
 * an edge case — this is the same fail-soft contract the Header already has.
 */
const COMPOSED = [
  ["heading", Heading],
  ["subheading", Subheading],
  ["paragraph", Paragraph],
  ["button", Button],
  ["editorial-hero", EditorialHero],
  ["editorial-overlay-hero", EditorialOverlayHero],
  ["editorial-callout", EditorialCallout],
  ["standard-statement", StandardStatement],
  ["stat-band", StatBand],
  ["principle-grid", PrincipleGrid],
  ["numbered-sequence", NumberedSequence],
  ["product-strip", ProductStrip],
  ["product-tiles", ProductTiles],
  ["product-case-study", ProductCaseStudy],
] as const;

describe("composed sections tolerate merchant-cleared settings", () => {
  for (const [type, Component] of COMPOSED) {
    it(`renders ${type} with no settings at all`, () => {
      const Untyped = Component as unknown as () => React.ReactNode;

      assert.doesNotThrow(() => render(<Untyped />));
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
      const Untyped = Component as unknown as (props: {
        "data-wv-id": string;
        "data-wv-type": string;
      }) => React.ReactNode;

      const { container } = render(
        <Untyped data-wv-id="item-1" data-wv-type={type} />,
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
