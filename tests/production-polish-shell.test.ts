/**
 * Storefront shell data contracts.
 *
 * The shell's rendered behavior lives in `tests/dom/site-header.test.tsx`,
 * `tests/dom/shell-chrome.test.tsx`, `tests/dom/mini-cart.test.tsx`, and
 * `tests/browser/shell.pw.ts`. What remains here is the pure logic and
 * normalized data those surfaces render: header query ownership, the icon
 * family, the published market, and the verified integration gates.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ICON_PATHS } from "../src/components/icon.tsx";
import { createHeaderNavigationHref } from "../src/components/site-header/header-navigation.ts";
import {
  DEFAULT_LOCALE,
  LOCALE_IDS,
  LOCALES,
} from "../src/lib/i18n/locales.ts";
import {
  CANONICAL_ROUTES,
  THEME_CUSTOM_PAGE_LINKS,
} from "../src/lib/routes/route-contract.ts";
import {
  CHECKOUT_PAYMENT_MARKS,
  NEWSLETTER_PROVIDER,
  SOCIAL_SECTION_HEADING,
  VERIFIED_CHECKOUT_PAYMENT_MARKS,
  VERIFIED_SOCIAL_LINKS,
} from "../src/lib/storefront/integrations.ts";

describe("route-aware header query ownership", () => {
  it("drops PDP selection state on every unrelated header destination", () => {
    for (const href of [
      "/",
      "/shop",
      "/shop/outerwear",
      "/search",
      "/journal",
      "/cart",
      "/account",
      "/pages/about-forward",
    ]) {
      assert.equal(
        createHeaderNavigationHref(href, "colorway=claystone&size=M"),
        href,
        `selection params leaked into ${href}`,
      );
    }
  });

  it("carries only the parameters each destination owns", () => {
    assert.equal(createHeaderNavigationHref("/shop", ""), "/shop");
    assert.equal(
      createHeaderNavigationHref("/search", "q=trail&colorway=claystone"),
      "/search?q=trail",
    );
    assert.equal(
      createHeaderNavigationHref(
        "/shop",
        "category=outerwear&activity=alpine&sort=name",
      ),
      "/shop?sort=name",
    );
    assert.equal(
      createHeaderNavigationHref(
        "/shop/outerwear",
        "q=trail&sort=price-desc&filter.v.availability=1",
      ),
      "/shop/outerwear?sort=price-desc",
    );
    assert.equal(
      createHeaderNavigationHref("/journal", "q=trail&sort=price-desc"),
      "/journal",
    );
    assert.equal(
      createHeaderNavigationHref("/search", "category=outerwear"),
      "/search",
    );
  });

  it("keeps the destination's own query and hash intact", () => {
    assert.equal(
      createHeaderNavigationHref(
        "/search?view=compact#results",
        "q=trail&colorway=claystone",
      ),
      "/search?view=compact&q=trail#results",
    );
    assert.equal(
      createHeaderNavigationHref("/shop?sort=name", "sort=price-desc"),
      "/shop?sort=name",
    );
  });

  it("matches destinations on whole path segments only", () => {
    assert.equal(
      createHeaderNavigationHref("/shopping-guide", "sort=name"),
      "/shopping-guide",
    );
    assert.equal(
      createHeaderNavigationHref("/searchable", "q=trail"),
      "/searchable",
    );
  });
});

describe("Phosphor icon system", () => {
  it("ships every utility glyph as local Phosphor path data", () => {
    for (const name of [
      "arrow-up-right",
      "caret-down",
      "caret-up",
      "check-circle",
      "globe-hemisphere-west",
      "list",
      "magnifying-glass",
      "shopping-bag",
      "user",
      "x",
    ]) {
      const path = ICON_PATHS[name as keyof typeof ICON_PATHS];
      assert.equal(typeof path, "string", `missing icon: ${name}`);
      assert.match(path, /^M/, `icon ${name} is not SVG path data`);
    }
  });
});

describe("market list", () => {
  it("keeps the store's US market as the default, unprefixed locale", () => {
    assert.equal(DEFAULT_LOCALE, "en-us");
    assert.equal(LOCALES[DEFAULT_LOCALE].country, "US");
    assert.equal(LOCALE_IDS[0], DEFAULT_LOCALE);
  });

  it("describes every market completely and without duplicates", () => {
    for (const locale of LOCALE_IDS) {
      const entry = LOCALES[locale];
      assert.equal(entry.id, locale);
      assert.match(locale, /^[a-z]{2}-[a-z]{2}$/);
      assert.equal(locale, `${entry.language}-${entry.country}`.toLowerCase());
      assert.match(entry.currency, /^[A-Z]{3}$/);
      assert.ok(entry.label.length > 0);
    }
    assert.equal(
      new Set(LOCALE_IDS.map((locale) => LOCALES[locale].label)).size,
      LOCALE_IDS.length,
    );
  });
});

describe("verified footer integrations", () => {
  it("publishes only verified live social accounts, named as Weaverse's", () => {
    assert.equal(SOCIAL_SECTION_HEADING, "Weaverse community");
    assert.deepEqual(
      VERIFIED_SOCIAL_LINKS.map((link) => link.href),
      [
        "https://www.linkedin.com/company/weaverseio",
        "https://x.com/weaverseio",
        "https://www.youtube.com/@weaverse",
        "https://www.facebook.com/weaverse",
      ],
    );
    for (const link of VERIFIED_SOCIAL_LINKS) {
      assert.match(link.href, /^https:\/\//);
      assert.match(
        link.label,
        /^Weaverse on /,
        "social labels must not present Weaverse accounts as Forward's",
      );
      assert.equal(typeof ICON_PATHS[link.icon], "string");
    }
  });

  it("has nothing to claim for payments or a newsletter provider", () => {
    assert.equal(VERIFIED_CHECKOUT_PAYMENT_MARKS.length, 0);
    assert.equal(NEWSLETTER_PROVIDER, null);
  });

  it("falls back to labelled preview marks only while nothing is verified", () => {
    /* The preview row exists to demonstrate the theme. The moment the Store
     * reports real methods, the Footer must draw those instead, so the drawn
     * list may never be the preview list once anything is verified. */
    if (VERIFIED_CHECKOUT_PAYMENT_MARKS.length > 0) {
      assert.deepEqual(CHECKOUT_PAYMENT_MARKS, VERIFIED_CHECKOUT_PAYMENT_MARKS);
    } else {
      assert.notDeepEqual(
        CHECKOUT_PAYMENT_MARKS,
        VERIFIED_CHECKOUT_PAYMENT_MARKS,
      );
    }
    assert.ok(CHECKOUT_PAYMENT_MARKS.length > 0);
    for (const mark of CHECKOUT_PAYMENT_MARKS) {
      assert.ok(mark.label.length > 0, `payment mark ${mark.id} needs a label`);
    }
    assert.equal(
      new Set(CHECKOUT_PAYMENT_MARKS.map((mark) => mark.id)).size,
      CHECKOUT_PAYMENT_MARKS.length,
    );
  });

  it("keeps the theme-owned custom pages distinct from Shopify routes", () => {
    /* Custom pages share one renderer route, so the guaranteed pathnames live
     * on each entry's smoke path rather than on its pattern. */
    const contentPaths = new Set(
      CANONICAL_ROUTES.filter((entry) => entry.category === "content").map(
        (entry) => entry.smoke?.path,
      ),
    );

    assert.deepEqual(
      THEME_CUSTOM_PAGE_LINKS.map((link) => link.href),
      ["/about", "/materials", "/field-testing"],
    );
    for (const link of THEME_CUSTOM_PAGE_LINKS) {
      assert.ok(
        contentPaths.has(link.href),
        `${link.href} is not an owned content route`,
      );
      assert.doesNotMatch(link.href, /^\/pages\/|^\/journal\//);
    }
  });
});
