import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

const readSource = (path: string) => readFile(path, "utf8");

describe("premium theme contract", () => {
  it("binds the approved typography roles", async () => {
    const [layout, styles] = await Promise.all([
      readSource("src/app/layout.tsx"),
      readSource("src/app/canonical-source.css"),
    ]);

    assert.match(layout, /IBM_Plex_Mono, Manrope, Space_Grotesk/);
    assert.match(layout, /variable: "--font-space-grotesk"/);
    assert.doesNotMatch(layout, /Literata|font-literata/);
    assert.match(
      styles,
      /--display: var\(--font-space-grotesk\), "Helvetica Neue", sans-serif;/,
    );
    assert.match(
      styles,
      /--ui: var\(--font-manrope\), "Helvetica Neue", sans-serif;/,
    );
    assert.match(styles, /--meta: var\(--font-plex-mono\), monospace;/);
    assert.match(
      styles,
      /\.eyebrow,[\s\S]*?\.meta,[\s\S]*?\.breadcrumbs,[\s\S]*?font-family: var\(--meta\);/,
    );
    assert.doesNotMatch(styles, /--mono:|font-family: var\(--mono\);/);
  });

  it("removes the global coordinate rail without weakening mobile inertness", async () => {
    const [header, styles] = await Promise.all([
      readSource("src/components/field-index-header.tsx"),
      readSource("src/app/canonical-source.css"),
    ]);

    assert.doesNotMatch(header, /coordinate-spine/);
    assert.doesNotMatch(styles, /\.coordinate-spine/);
    assert.match(
      header,
      /\.skip-link, \.announcement, \.field-header, #main-content, footer/,
    );
    assert.match(header, /element\.inert = true/);
  });

  it("uses one ordinal-free 4:5 product card across uniform grids", async () => {
    const [card, home, productDetail, collectionPage, styles] =
      await Promise.all([
        readSource("src/components/product-card.tsx"),
        readSource("src/app/page.tsx"),
        readSource("src/app/products/[productHandle]/product-detail.tsx"),
        readSource("src/app/shop/[collectionHandle]/page.tsx"),
        readSource("src/app/canonical-source.css"),
      ]);

    assert.doesNotMatch(
      card,
      /index\??:|product-number|cardIndex|product\.plate/,
    );
    assert.doesNotMatch(home, /index=\{/);
    assert.doesNotMatch(productDetail, /product\.plate|Plate \{/);
    assert.doesNotMatch(collectionPage, /product\.plate/);
    assert.match(styles, /\.product-card img \{[\s\S]*?aspect-ratio: 4 \/ 5;/);
    assert.match(
      styles,
      /\.product-runway \{\s*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/,
    );
    assert.match(
      styles,
      /\.plp-grid \{\s*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/,
    );
    assert.doesNotMatch(styles, /\.product-runway \.product-card:nth-child/);
    assert.doesNotMatch(styles, /\.plp-grid \.product-card:nth-child/);
  });

  it("places desktop PDP details left and gallery right while keeping mobile linear", async () => {
    const styles = await readSource("src/app/canonical-source.css");

    assert.match(
      styles,
      /\.pdp \{[\s\S]*?grid-template-areas: "details gallery";/,
    );
    assert.match(styles, /\.gallery \{[\s\S]*?grid-area: gallery;/);
    assert.match(styles, /\.product-panel \{[\s\S]*?grid-area: details;/);
    assert.match(
      styles,
      /@media \(max-width: 820px\)[\s\S]*?\.pdp \{[\s\S]*?grid-template-areas: "gallery" "details";/,
    );
    assert.match(
      styles,
      /@media \(max-width: 820px\)[\s\S]*?\.gallery \{[\s\S]*?grid-template-columns: minmax\(0, 1fr\);/,
    );
  });

  it("overrides desktop hero geometry at the mobile cascade winner", async () => {
    const styles = await readSource("src/app/canonical-source.css");

    assert.match(
      styles,
      /@media \(max-width: 820px\)[\s\S]*?\.page-hero-inner \{[\s\S]*?grid-template-columns: minmax\(0, 1fr\);/,
    );
    assert.match(
      styles,
      /@media \(max-width: 820px\)[\s\S]*?\.hero-advanced \.hero-sub \{[\s\S]*?max-width: 100%;[\s\S]*?overflow-wrap: anywhere;/,
    );
  });

  it("links repair surfaces to the exact owned page handle", async () => {
    const [productPage, accountPage] = await Promise.all([
      readSource("src/app/products/[productHandle]/page.tsx"),
      readSource("src/app/account/page.tsx"),
    ]);

    for (const source of [productPage, accountPage]) {
      assert.match(source, /href="\/pages\/field-repair"/);
      assert.doesNotMatch(source, /href="\/pages\/repairs"/);
    }
  });

  it("keeps the expanded PLP outline and empty state current", async () => {
    const shop = await readSource("src/app/shop/page.tsx");

    assert.match(shop, /<h2 className="sr-only">Products<\/h2>/);
    assert.match(shop, /full catalog is nine/);
    assert.doesNotMatch(shop, /No matching plates|full catalog is three/);
  });
});
