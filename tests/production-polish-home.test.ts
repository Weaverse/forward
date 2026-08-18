/**
 * Slice B — bounded Home and editorial corrections.
 *
 * Covers the Journal card alignment, the concise presentation-owned Spotlight
 * and Kit merchandising copy, the one-viewport desktop bound for those two
 * sections, and the vertical `Shop by system` intro. Nothing here may loosen
 * the existing Home section order, links, media roles, or accessibility.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

import {
  CANONICAL_PRODUCT_HANDLES,
  CATALOG_PRESENTATION_PROFILES,
} from "../src/lib/storefront/catalog-presentation.ts";

const readSource = (path: string) => readFile(path, "utf8");

const CANONICAL_CSS = "src/app/canonical-source.css";
const POLISH_CSS = "src/app/production-polish.css";
const HOME = "src/app/page.tsx";

/** The desktop bound lives in one explicit min-width block. */
function desktopBoundBlock(polish: string): string {
  const start = polish.indexOf("@media (min-width: 821px)");
  assert.notEqual(
    start,
    -1,
    "the Home viewport bound needs an explicit desktop-only media query",
  );
  const open = polish.indexOf("{", start);
  let depth = 0;
  for (let index = open; index < polish.length; index += 1) {
    if (polish[index] === "{") depth += 1;
    if (polish[index] === "}") {
      depth -= 1;
      if (depth === 0) return polish.slice(start, index + 1);
    }
  }
  throw new Error("unterminated desktop media query");
}

describe("journal card alignment", () => {
  it("drops the staggered nth-child transform entirely", async () => {
    const canonical = await readSource(CANONICAL_CSS);

    assert.doesNotMatch(
      canonical,
      /translateY\(100px\)/,
      "the Journal stagger must be removed, not overridden",
    );
    assert.doesNotMatch(
      canonical,
      /\.article-card:nth-child\(/,
      "no nth-child rule may reintroduce or reset a card offset",
    );
  });

  it("keeps the Journal grid composition and its responsive spans", async () => {
    const canonical = await readSource(CANONICAL_CSS);

    assert.match(canonical, /\.article-card \{\s*grid-column: span 4;\s*\}/);
    assert.match(canonical, /\.article-card \{\s*grid-column: span 6;\s*\}/);
    assert.match(canonical, /\.article-card \{\s*grid-column: 1 \/ -1;\s*\}/);
    assert.match(canonical, /\.journal-grid \{\s*grid-template-columns: 1fr;/);
  });

  it("keeps hover motion and the reduced-motion contract", async () => {
    const canonical = await readSource(CANONICAL_CSS);

    assert.match(canonical, /@media \(prefers-reduced-motion: reduce\)/);
    assert.match(canonical, /transition-duration: 0\.01ms !important;/);
    assert.match(canonical, /\.home-system-card:hover img \{/);
  });
});

describe("concise Home merchandising copy", () => {
  it("renders presentation-owned summaries instead of Shopify descriptions", async () => {
    const home = await readSource(HOME);

    assert.match(home, /\{spotlight\.subtitle\}/);
    assert.match(home, /\{pack\.subtitle\}/);
    assert.doesNotMatch(
      home,
      /spotlight\.description|pack\.description/,
      "Home must not print the full Shopify product description",
    );
  });

  it("never truncates copy at runtime", async () => {
    const home = await readSource(HOME);

    assert.doesNotMatch(
      home,
      /\b(?:substring|substr|truncate|dangerouslySetInnerHTML)\b|\.slice\(0, \d+\)\s*\+|…|\.\.\.["`]/,
      "summaries are authored short, never clipped from arbitrary text",
    );
  });

  it("keys one short sentence to every canonical product handle", () => {
    const handles = CATALOG_PRESENTATION_PROFILES.map(
      (profile) => profile.handle,
    );

    assert.deepEqual(handles, [...CANONICAL_PRODUCT_HANDLES]);
    for (const profile of CATALOG_PRESENTATION_PROFILES) {
      const { subtitle } = profile;
      assert.ok(
        subtitle.length > 0 && subtitle.length <= 90,
        `${profile.handle} summary is not a short sentence: ${subtitle}`,
      );
      assert.match(subtitle, /^[A-Z].*\.$/, profile.handle);
      assert.equal(
        subtitle.match(/[.!?](?:\s|$)/g)?.length,
        1,
        `${profile.handle} summary must be a single sentence`,
      );
      assert.doesNotMatch(subtitle, /<[^>]+>|&[a-z]+;/, profile.handle);
    }
  });
});

describe("one-viewport desktop Spotlight and Kit", () => {
  it("replaces the fixed 760px media with an svh-aware bound", async () => {
    const [canonical, polish] = await Promise.all([
      readSource(CANONICAL_CSS),
      readSource(POLISH_CSS),
    ]);
    const desktop = desktopBoundBlock(polish);

    assert.match(
      canonical,
      /\.home-spotlight-media img \{(?![^}]*min-height)[^}]*object-fit: cover;/,
      "the spotlight media must not keep a fixed pixel floor",
    );
    assert.match(desktop, /\.home-spotlight,\s*\.home-kit \{[^}]*100svh/);
    assert.match(
      desktop,
      /\.home-spotlight-media img \{[^}]*height: var\(--home-viewport-media\);/,
    );
    assert.match(
      desktop,
      /\.home-spotlight-copy \.h2 \{[^}]*min\(5\.6vw, 8svh\)/,
      "the copy column must shrink with short desktop viewports instead of stretching the grid row",
    );
    assert.match(
      desktop,
      /\.home-spotlight-copy li \{[^}]*1\.7svh/,
      "spec rows must share the short-viewport bound without hiding content",
    );
    assert.match(
      desktop,
      /\.home-kit-products img \{[^}]*max-height: calc\(var\(--home-viewport-media\)/,
    );
  });

  it("leaves mobile at natural content height", async () => {
    const [canonical, polish] = await Promise.all([
      readSource(CANONICAL_CSS),
      readSource(POLISH_CSS),
    ]);
    const desktop = desktopBoundBlock(polish);

    assert.doesNotMatch(
      polish.replace(desktop, "").replace(/\/\*[\s\S]*?\*\//g, ""),
      /--home-viewport-media|100svh/,
      "the viewport bound must not apply outside the desktop media query",
    );
    /* The canonical mobile rules keep the media at a natural stacked ratio. */
    assert.match(
      canonical,
      /\.home-spotlight-media img \{\s*min-height: 0;\s*aspect-ratio: 4 \/ 5;\s*\}/,
    );
    assert.match(
      canonical,
      /@media \(max-width: 820px\)[\s\S]*\.home-spotlight,[\s\S]*grid-template-columns: minmax\(0, 1fr\);/,
    );
  });
});

describe("vertical Shop by system intro", () => {
  it("stacks the label above the heading", async () => {
    const canonical = await readSource(CANONICAL_CSS);
    const [intro] = canonical.match(/\.home-system-intro \{[^}]*\}/g) ?? [];

    assert.ok(intro !== undefined);
    assert.doesNotMatch(intro, /justify-content: space-between;/);
    assert.doesNotMatch(intro, /align-items: end;/);
    assert.doesNotMatch(intro, /display: (?:flex|grid);/);
  });

  it("keeps the label before the heading in one intro header", async () => {
    const home = await readSource(HOME);

    assert.match(
      home,
      /<header className="home-system-intro shell">\s*<p className="eyebrow">Shop by system<\/p>\s*<h2 className="h2">Built separately\. Better together\.<\/h2>\s*<\/header>/,
    );
  });
});

describe("preserved Home composition", () => {
  it("keeps the exact section order", async () => {
    const home = await readSource(HOME);
    const order = [
      "commerce-hero",
      "home-shop-section",
      "home-system-section",
      "home-spotlight",
      "home-proof-band",
      "home-kit",
      "home-service-grid",
    ];
    const found = [...home.matchAll(/<section className="([\w-]+)/g)].map(
      (match) => match[1],
    );

    assert.deepEqual(found, order);
  });

  it("keeps real product roles, links, and image optimization", async () => {
    const home = await readSource(HOME);

    assert.match(home, /productsByHandle\.get\("drift-insulated-vest"\)/);
    assert.match(home, /productsByHandle\.get\("approach-18-day-pack"\)/);
    assert.match(home, /href=\{`\/products\/\$\{spotlight\.handle\}`\}/);
    assert.match(home, /href=\{`\/products\/\$\{pack\.handle\}`\}/);
    assert.match(home, /spotlight\?\.colorways\[0\]\?\.images\.context/);
    assert.match(home, /sizes="\(min-width: 820px\) 60vw, 100vw"/);
    assert.match(home, /sizes="\(min-width: 820px\) 20vw, 45vw"/);
    assert.match(home, /alt=\{spotlightImage\.alt\}/);
    assert.match(home, /alt=\{image\.alt\}/);
  });
});
