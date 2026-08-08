import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { describe, it } from "node:test";

import {
  createFieldIndexCollections,
  FIELD_INDEX_PRESENTATION,
} from "../src/lib/header-navigation.ts";
import { NAVIGATION_FIXTURE } from "../src/lib/storefront/fixtures/navigation.ts";

const readSource = (path: string) => readFile(path, "utf8");

function openingTagContaining(
  source: string,
  marker: string,
  fromEnd = false,
): string {
  const markerIndex = fromEnd
    ? source.lastIndexOf(marker)
    : source.indexOf(marker);
  assert.ok(markerIndex >= 0, `missing tag marker: ${marker}`);
  const tagStart = source.lastIndexOf("<Link", markerIndex);
  const tagEnd = source.indexOf(">", markerIndex);
  assert.ok(tagStart >= 0 && tagEnd >= 0, `invalid tag marker: ${marker}`);
  return source.slice(tagStart, tagEnd + 1);
}

describe("canonical header presentation", () => {
  it("maps the nested Shop fixture into three approved local-image systems", () => {
    const shop = NAVIGATION_FIXTURE.primary.find(
      (item) => item.href === "/shop",
    );
    assert.ok(shop !== undefined);
    const collections = createFieldIndexCollections(shop);
    assert.deepEqual(
      collections.map(({ id, index, href }) => ({
        id,
        index,
        href,
      })),
      [
        { id: "outerwear", index: "01", href: "/shop/outerwear" },
        { id: "packs", index: "02", href: "/shop/packs" },
        { id: "footwear", index: "03", href: "/shop/footwear" },
      ],
    );
    assert.equal(FIELD_INDEX_PRESENTATION.length, 3);
    for (const collection of collections) {
      assert.match(collection.image.src, /^\/images\/editorial\/.+\.webp$/);
      assert.ok(collection.description.length >= 30);
      assert.ok(collection.fieldNote.length >= 30);
    }
  });
});

describe("canonical Field Index header", () => {
  it("keeps desktop and mobile accessibility plus reduced-motion handling explicit", async () => {
    const [component, styles] = await Promise.all([
      readSource("src/components/field-index-header.tsx"),
      readSource("src/app/site-header.css"),
    ]);
    for (const marker of [
      "aria-expanded={desktopOpen}",
      'aria-modal="true"',
      'role="dialog"',
      'event.key === "Escape"',
      "desktopTriggerRef.current?.focus()",
      "mobileTriggerRef.current?.focus()",
      "restoreMobileFocusRef.current = true",
      "closeButtonRef.current?.focus()",
      "element.inert = true",
      'aria-label="Store announcement"',
      "aria-current=",
    ]) {
      assert.ok(
        component.includes(marker),
        `missing accessibility marker: ${marker}`,
      );
    }
    assert.ok(styles.includes("@media (prefers-reduced-motion: reduce)"));
    assert.ok(styles.includes(".field-header-root {\n  display: contents;"));
    assert.ok(component.includes("onNavigate={closeMobile}"));
    assert.equal(
      component.includes("onClick={() => setMobileOpen(false)}"),
      false,
    );
    assert.ok(component.includes("mobileOpenRef.current"));
    assert.ok(
      component.includes(
        "aria-controls={desktopOpen ? desktopPanelId : undefined}",
      ),
    );
    assert.ok(
      component.includes(
        "aria-controls={mobileOpen ? mobilePanelId : undefined}",
      ),
    );
  });

  it("contains one static header without review variants or query rewriting", async () => {
    const [component, data, styles, shell, layout] = await Promise.all([
      readSource("src/components/field-index-header.tsx"),
      readSource("src/lib/header-navigation.ts"),
      readSource("src/app/site-header.css"),
      readSource("src/components/site-header.tsx"),
      readSource("src/app/layout.tsx"),
    ]);
    const source = [component, data, styles, shell, layout].join("\n");
    for (const forbidden of [
      "HEADER_VARIANTS",
      "HeaderVariant",
      "resolveHeaderVariant",
      "withHeaderVariant",
      "HEADER_PRODUCT_PREVIEWS",
      "useSearchParams",
      "useRouter",
      "MutationObserver",
      "data-header-variant",
      "NavigationRail",
      "ProductSystem",
      "header-exploration",
      "Option 2",
      "Option 3",
    ]) {
      assert.ok(
        !source.includes(forbidden),
        `stale exploration code: ${forbidden}`,
      );
    }
    assert.ok(shell.includes("<FieldIndexHeader"));
    assert.ok(layout.includes('import "./site-header.css"'));
    await Promise.all(
      ["src/components/header-nav.tsx", "src/components/mobile-menu.tsx"].map(
        (legacyPath) => assert.rejects(access(legacyPath)),
      ),
    );
  });

  it("marks every current desktop and mobile destination", async () => {
    const source = await readSource("src/components/field-index-header.tsx");

    for (const [marker, fromEnd] of [
      ['className="header-link field-header-search"', false],
      ['className="header-link account-hide"', false],
      ['className="icon-button cart-button"', false],
      ['href="/cart"', true],
    ] as const) {
      assert.ok(
        openingTagContaining(source, marker, fromEnd).includes("aria-current="),
        `missing current-route semantics: ${marker}`,
      );
    }
  });
});

describe("Preview deployment hygiene", () => {
  it("excludes local editor, secret, build, and QA artifacts", async () => {
    const ignore = await readSource(".vercelignore");

    for (const pattern of [
      ".env",
      ".env.*",
      ".vscode",
      ".vercel/",
      ".next/",
      "node_modules/",
      "*.tsbuildinfo",
      "coverage/",
      "test-results/",
      "playwright-report/",
      "tests",
      "tests/",
    ]) {
      assert.ok(
        ignore.split("\n").includes(pattern),
        `missing ignore: ${pattern}`,
      );
    }
  });
});

describe("approved Forward wordmarks", () => {
  it("uses the approved horizontal moss mark in the header and reversed mark in the footer", async () => {
    const [
      component,
      headerAsset,
      footerAsset,
      footer,
      canonicalStyles,
      headerStyles,
    ] = await Promise.all([
      readSource("src/components/wordmark.tsx"),
      readSource("public/images/brand/forward-wordmark-horizontal-moss.svg"),
      readSource(
        "public/images/brand/forward-wordmark-horizontal-reversed.svg",
      ),
      readSource("src/components/site-footer.tsx"),
      readSource("src/app/canonical-source.css"),
      readSource("src/app/site-header.css"),
    ]);

    assert.ok(
      component.includes("/images/brand/forward-wordmark-horizontal-moss.svg"),
    );
    assert.ok(
      component.includes(
        "/images/brand/forward-wordmark-horizontal-reversed.svg",
      ),
    );
    assert.ok(component.includes('alt=""'));
    assert.ok(component.includes('aria-label="Forward — home"'));
    assert.ok(footer.includes('<Wordmark variant="footer" />'));

    assert.ok(headerAsset.includes('viewBox="0 0 480 96"'));
    assert.ok(headerAsset.includes('fill="#20231f"'));
    assert.ok(headerAsset.includes('fill="#74805d"'));
    assert.ok(footerAsset.includes('viewBox="0 0 480 96"'));
    assert.ok(footerAsset.includes('fill="#f2ede3"'));
    assert.ok(footerAsset.includes('fill="#a6ad8b"'));

    const sharedLogoRule = canonicalStyles.slice(
      canonicalStyles.indexOf(".brand-image,"),
      canonicalStyles.indexOf("}", canonicalStyles.indexOf(".brand-image,")),
    );
    const mobileLogoRule = headerStyles.slice(
      headerStyles.indexOf(".mobile-brand-image"),
      headerStyles.indexOf("}", headerStyles.indexOf(".mobile-brand-image")),
    );
    assert.match(sharedLogoRule, /background:\s*transparent/);
    assert.match(mobileLogoRule, /background:\s*transparent/);
  });
});
