import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

import { ICON_PATHS } from "../src/components/icon.tsx";
import { createHeaderNavigationHref } from "../src/lib/header-navigation.ts";
import {
  CANONICAL_ROUTES,
  THEME_CUSTOM_PAGE_LINKS,
} from "../src/lib/routes/route-contract.ts";
import {
  NEWSLETTER_PROVIDER,
  SOCIAL_SECTION_HEADING,
  VERIFIED_CHECKOUT_PAYMENT_MARKS,
  VERIFIED_SOCIAL_LINKS,
} from "../src/lib/storefront/integrations.ts";
import {
  ACTIVE_STOREFRONT_COUNTRY,
  AVAILABLE_STOREFRONT_COUNTRIES,
  countryControlLabel,
} from "../src/lib/storefront/localization.ts";

const readSource = (path: string) => readFile(path, "utf8");

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
      "/shop?category=outerwear&activity=alpine&sort=name",
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

  it("renders decorative icons silently and named icons as images", async () => {
    const [icon, packageJson] = await Promise.all([
      readSource("src/components/icon.tsx"),
      readSource("package.json"),
    ]);

    assert.match(icon, /Phosphor/);
    assert.match(icon, /viewBox(?:=|:)\s*"0 0 256 256"/);
    assert.match(icon, /focusable:\s*"false"/);
    /* Decoration is hidden outright; a supplied `title` promotes the icon to
     * an image carrying that accessible name. */
    assert.match(icon, /if \(title === undefined\) \{/);
    assert.match(icon, /<svg aria-hidden="true" \{\.\.\.shared\}>/);
    assert.match(icon, /<svg role="img" \{\.\.\.shared\}>/);
    assert.match(icon, /<title>\{title\}<\/title>/);
    assert.doesNotMatch(packageJson, /phosphor|react-icons|lucide|heroicons/i);
  });

  it("replaces the header's raw glyph decoration with the icon family", async () => {
    const header = await readSource("src/components/field-index-header.tsx");

    assert.doesNotMatch(header, /↗/);
    assert.match(header, /<Icon name="arrow-up-right"/);
    assert.match(header, /<Icon name="magnifying-glass"/);
    assert.match(header, /<Icon name="shopping-bag"/);
    /* Shopify owns the utility destinations, so their glyphs are mapped by
     * href rather than hardcoded into the markup. */
    assert.match(header, /"\/account": "user"/);
    assert.match(header, /<Icon name=\{icon\} \/>/);
    assert.match(header, /<Icon name="list"/);
    assert.match(header, /<Icon name="x"/);
  });
});

describe("header utility spacing and readable typography", () => {
  it("separates the utility controls and keeps their labels accessible", async () => {
    const [header, styles] = await Promise.all([
      readSource("src/components/field-index-header.tsx"),
      readSource("src/app/production-polish.css"),
    ]);

    assert.match(header, /className="header-link-label"/);
    assert.match(header, /className="cart-label"/);
    assert.match(
      styles,
      /\.field-header-actions \{[^}]*gap: 12px;/,
      "utility controls still sit flush against each other",
    );
    assert.match(
      styles,
      /\.cart-label[\s\S]{0,220}clip-path: inset\(50%\);/,
      "compact widths must hide labels visually, not from assistive tech",
    );
  });

  it("raises the header type off the 9px/10px production defect", async () => {
    const styles = await readSource("src/app/production-polish.css");

    assert.match(
      styles,
      /\.field-header-primary > a,\s*\.field-header-primary > button \{[^}]*font-size: 12px;/,
    );
    assert.match(
      styles,
      /\.header-actions \.icon-button,\s*\.header-actions \.header-link \{[^}]*font-size: 12px;/,
    );
    assert.doesNotMatch(styles, /font-size: (?:8|9|10)px;/);
  });

  it("keeps the readable dark secondary token on dark shell surfaces", async () => {
    const styles = await readSource("src/app/production-polish.css");

    assert.match(styles, /--secondary-dark: #aeb1a7;/i);
    for (const legacy of ["#8fa095", "#aab7ae", "#c7d1ca"]) {
      assert.ok(
        styles.includes(legacy) === false,
        `production polish must not reintroduce ${legacy}`,
      );
    }
    assert.match(styles, /color: var\(--secondary-dark\);/);
  });
});

describe("truthful country control", () => {
  it("exposes exactly the one market the store sells to today", () => {
    assert.equal(AVAILABLE_STOREFRONT_COUNTRIES.length, 1);
    assert.deepEqual(ACTIVE_STOREFRONT_COUNTRY, {
      isoCode: "US",
      name: "United States",
      currencyCode: "USD",
    });
    assert.equal(
      countryControlLabel(ACTIVE_STOREFRONT_COUNTRY),
      "United States · USD",
    );
  });

  it("never names a market or currency the storefront does not publish", async () => {
    const [localization, control] = await Promise.all([
      readSource("src/lib/storefront/localization.ts"),
      readSource("src/components/country-control.tsx"),
    ]);

    assert.doesNotMatch(
      localization,
      /Canada|United Kingdom|Australia|Germany|EUR|GBP|CAD|AUD/,
    );
    assert.match(control, /<Icon name="globe-hemisphere-west"/);
    assert.doesNotMatch(
      control,
      /<select|<option|<a |<Link/,
      "a single-market control must not imply a choice that does not exist",
    );
    assert.match(control, /className="sr-only"/);
  });

  it("mounts the control in the header topbar", async () => {
    const header = await readSource("src/components/field-index-header.tsx");

    assert.match(header, /<CountryControl \/>/);
    assert.doesNotMatch(header, /54\.4609° N \/ 3\.0886° W/);
  });
});

describe("footer composition and integration truth", () => {
  it("removes the shopper-visible live-mode placeholder", async () => {
    const [shopify, footer] = await Promise.all([
      readSource("src/lib/storefront/shopify/data-source.ts"),
      readSource("src/components/site-footer.tsx"),
    ]);

    assert.doesNotMatch(
      shopify,
      /Live Shopify catalog, navigation, content, and cart/,
    );
    assert.match(footer, /footerStatus\.length > 0/);
  });

  it("renders only the verified live social accounts, under an honest heading", async () => {
    const footer = await readSource("src/components/site-footer.tsx");
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
    assert.doesNotMatch(footer, /rel="me/);
  });

  it("hides the unverified payment marks and the unconfigured newsletter", async () => {
    const footer = await readSource("src/components/site-footer.tsx");

    assert.equal(VERIFIED_CHECKOUT_PAYMENT_MARKS.length, 0);
    assert.equal(NEWSLETTER_PROVIDER, null);
    assert.match(footer, /VERIFIED_SOCIAL_LINKS\.length > 0/);
    assert.match(footer, /VERIFIED_CHECKOUT_PAYMENT_MARKS\.length > 0/);
    /* No form, no field, and no provider wiring at all — an unconfigured
     * newsletter must render nothing rather than a control that cannot work. */
    assert.doesNotMatch(footer, /<form|<input|NEWSLETTER_PROVIDER|formAction/);
    assert.doesNotMatch(
      footer,
      /visa|mastercard|amex|paypal|klaviyo|shop pay|apple pay/i,
    );
  });

  it("surfaces the theme-owned custom pages without conflating Shopify routes", async () => {
    const footer = await readSource("src/components/site-footer.tsx");
    const contentPatterns = new Set(
      CANONICAL_ROUTES.filter((entry) => entry.category === "content").map(
        (entry) => entry.pattern,
      ),
    );

    assert.deepEqual(
      THEME_CUSTOM_PAGE_LINKS.map((link) => link.href),
      ["/about", "/materials", "/field-testing"],
    );
    for (const link of THEME_CUSTOM_PAGE_LINKS) {
      assert.ok(
        contentPatterns.has(link.href),
        `${link.href} is not an owned content route`,
      );
      assert.doesNotMatch(link.href, /^\/pages\/|^\/journal\//);
    }
    assert.match(footer, /THEME_CUSTOM_PAGE_LINKS/);
    assert.match(footer, /Field guide/);
  });
});

describe("square swatches and the unified button system", () => {
  it("squares the swatches while keeping the 44px target", async () => {
    const [polish, canonical] = await Promise.all([
      readSource("src/app/production-polish.css"),
      readSource("src/app/canonical-source.css"),
    ]);

    assert.match(polish, /\.swatch,\s*\.swatch-ring \{\s*border-radius: 0;/);
    assert.match(
      canonical,
      /\.swatch-control \{\s*width: 44px;\s*height: 44px;/,
    );
  });

  it("gives every button one square hard-shadow contract", async () => {
    const polish = await readSource("src/app/production-polish.css");

    assert.match(
      polish,
      /\.button \{[^}]*border-radius: 0;[\s\S]*?box-shadow: 4px 4px 0 var\(--button-shadow-color\);/,
    );
    assert.match(polish, /\.button:hover[\s\S]{0,140}box-shadow: 2px 2px 0/);
    assert.match(polish, /\.button:active[\s\S]{0,140}box-shadow: 0 0 0/);
    assert.match(polish, /\.button:focus-visible[\s\S]{0,140}outline:/);
    assert.match(polish, /\.button:disabled[\s\S]{0,220}box-shadow: none;/);
    assert.match(
      polish,
      /\.button-light[\s\S]{0,200}--button-shadow-color: var\(--white\);/,
    );
    assert.match(
      polish,
      /\.product-panel \.product-atc[\s\S]{0,200}--button-shadow-color: var\(--white\);/,
    );
  });

  it("routes PDP add-to-cart through the same button contract in both modes", async () => {
    const form = await readSource("src/components/add-to-cart-form.tsx");

    assert.equal(
      form.match(/className="button button-signal product-atc"/g)?.length,
      2,
    );
  });
});

describe("compact mini-cart popover", () => {
  it("opens from an explicit add signal instead of any cart change", async () => {
    const [signal, miniCart, form] = await Promise.all([
      readSource("src/lib/cart/mini-cart-signal.ts"),
      readSource("src/components/mini-cart.tsx"),
      readSource("src/components/add-to-cart-form.tsx"),
    ]);

    assert.match(signal, /export function announceCartAdd/);
    assert.match(signal, /export function subscribeToCartAdd/);
    assert.match(miniCart, /subscribeToCartAdd/);
    assert.match(form, /announceCartAdd\(/);
    assert.match(form, /onSubmitCapture/);
    assert.match(form, /previousQuantity/);
    assert.match(form, /currentQuantity <= submitted\.previousQuantity/);
  });

  it("is a dismissible popover that never steals focus", async () => {
    const miniCart = await readSource("src/components/mini-cart.tsx");

    assert.match(miniCart, /role="dialog"/);
    assert.match(miniCart, /aria-label="Cart updated"/);
    assert.match(miniCart, /aria-live="polite"/);
    assert.match(miniCart, /event\.key === "Escape"/);
    assert.match(miniCart, /pointerdown/);
    assert.match(miniCart, /setTimeout/);
    assert.doesNotMatch(miniCart, /\.focus\(\)/);
    assert.doesNotMatch(miniCart, /aria-modal/);
  });

  it("restarts the lifecycle for every add and resumes dismissal after focus leaves", async () => {
    const miniCart = await readSource("src/components/mini-cart.tsx");

    assert.match(miniCart, /interface MiniCartPresentation/);
    assert.match(miniCart, /eventId: \(current\?\.eventId \?\? 0\) \+ 1/);
    assert.match(miniCart, /function scheduleDismiss\(\)/);
    assert.match(miniCart, /scheduleDismiss\(\);/);
    assert.match(miniCart, /addEventListener\("focusout", handleFocusOut\)/);
    assert.match(miniCart, /removeEventListener\("focusout", handleFocusOut\)/);
    assert.match(
      miniCart,
      /current === "Added to cart\."\s*\? "Item added to cart\."\s*: "Added to cart\."/,
      "same-variant adds need a fresh live-region text update",
    );
  });

  it("reads the exact existing cart rather than writing a second one", async () => {
    const miniCart = await readSource("src/components/mini-cart.tsx");

    assert.doesNotMatch(
      miniCart,
      /addCartLine|setCartLineQuantity|useShopifyCartForm/,
    );
    assert.match(miniCart, /useDemoCartLines/);
    assert.match(miniCart, /useShopifyCart\(/);
    assert.match(miniCart, /selectedOptions/);
    assert.match(miniCart, /checkoutUrl/);
    assert.match(miniCart, /href="\/cart"/);
  });

  it("mounts once in the header shell", async () => {
    const header = await readSource("src/components/field-index-header.tsx");

    assert.equal(header.match(/<MiniCart \/>/g)?.length, 1);
  });
});
