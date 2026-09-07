/**
 * Canonical header navigation data.
 *
 * Header rendering, keyboard, focus, panel, and query behavior are proved by
 * rendering the header in `tests/dom/site-header.test.tsx`, and its layout,
 * inert background, responsive surfaces, and reduced motion in
 * `tests/browser/shell.pw.ts`. What stays here is the pure navigation mapping
 * those surfaces consume.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createHeaderNavigationHref,
  createFieldIndexCollections,
  currentCollectionIndex,
  FIELD_INDEX_PRESENTATION,
} from "../src/components/site-header/header-navigation.ts";
import { NAVIGATION_FIXTURE } from "../src/lib/storefront/fixtures/navigation.ts";

describe("canonical header presentation", () => {
  it("preserves only destination-owned query state across header navigation", () => {
    assert.equal(createHeaderNavigationHref("/shop", ""), "/shop");
    assert.equal(
      createHeaderNavigationHref(
        "/shop/outerwear",
        "q=trail&sort=price-desc&filter.v.availability=1",
      ),
      "/shop/outerwear?sort=price-desc",
    );
    assert.equal(
      createHeaderNavigationHref(
        "/search?view=compact#results",
        "q=trail&colorway=claystone",
      ),
      "/search?view=compact&q=trail#results",
    );
  });

  it("maps the nested Shop fixture into four approved local-image systems", () => {
    const shop = NAVIGATION_FIXTURE.primary.find(
      (item) => item.href === "/shop",
    );
    assert.ok(shop !== undefined);
    assert.deepEqual(shop.children, [
      { href: "/shop", label: "Shop all" },
      { href: "/shop/outerwear", label: "Outerwear" },
      { href: "/shop/packs", label: "Packs" },
      { href: "/shop/footwear", label: "Footwear" },
    ]);
    const collections = createFieldIndexCollections(shop);
    assert.deepEqual(
      collections.map(({ id, index, label, href }) => ({
        id,
        index,
        label,
        href,
      })),
      [
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
      ],
    );
    assert.equal(FIELD_INDEX_PRESENTATION.length, 4);
    for (const collection of collections) {
      assert.match(collection.image.src, /^\/images\/editorial\/.+\.webp$/);
      assert.ok(collection.description.length >= 30);
      assert.ok(collection.fieldNote.length >= 30);
    }
  });

  it("marks only the deepest matching Shop destination as current", () => {
    const shop = NAVIGATION_FIXTURE.primary.find(
      (item) => item.href === "/shop",
    );
    assert.ok(shop !== undefined);
    const collections = createFieldIndexCollections(shop);

    assert.equal(currentCollectionIndex("/shop", collections), 0);
    assert.equal(currentCollectionIndex("/shop/outerwear", collections), 1);
    assert.equal(currentCollectionIndex("/shop/packs", collections), 2);
    assert.equal(currentCollectionIndex("/shop/footwear", collections), 3);
    assert.equal(
      currentCollectionIndex("/products/weatherline-shell", collections),
      0,
    );
    assert.equal(currentCollectionIndex("/journal", collections), -1);
  });

  it("keeps the canonical About branch available in static and live modes", () => {
    const about = NAVIGATION_FIXTURE.primary.find(
      (item) => item.href === "/pages/about-forward",
    );
    assert.deepEqual(about?.children, [
      { href: "/pages/materials-and-care", label: "Materials & Care" },
      { href: "/pages/fit-and-sizing", label: "Fit & Sizing" },
      { href: "/pages/field-testing", label: "Field Testing" },
      { href: "/pages/field-repair", label: "Field Repair" },
      { href: "/pages/shipping-returns", label: "Shipping & Returns" },
      { href: "/pages/contact", label: "Contact" },
    ]);
  });
});
