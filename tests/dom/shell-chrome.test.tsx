/**
 * Shell chrome behavior — icon semantics, the market indicator, the approved
 * wordmarks, and the announced cart count, proved by rendering them.
 */

import { describe, it } from "bun:test";
import assert from "node:assert/strict";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ICON_PATHS, Icon } from "@/components/icon";
import { PaymentMarks } from "@/components/payment-marks";
import { CartCount } from "@/components/site-header/cart-count";
import { CountryControl } from "@/components/site-header/country-control";
import { Wordmark } from "@/components/wordmark";
import {
  DEFAULT_LOCALE,
  LOCALE_IDS,
  LOCALES,
  localizePath,
} from "@/lib/i18n/locales";
import { CHECKOUT_PAYMENT_MARKS } from "@/lib/storefront/integrations";
import {
  cartData,
  cartLine,
  productByHandle,
  renderWithCart,
  visibleText,
} from "./harness";
import { setRoute } from "./preload";

/** Every glyph the shell is allowed to render. */
const SHELL_ICONS = [
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
] as const;

describe("icon semantics", () => {
  it("hides a decorative icon from assistive tech", () => {
    const { container } = renderWithCart(<Icon name="shopping-bag" />);
    const svg = container.querySelector("svg");

    assert.ok(svg !== null);
    assert.equal(svg.getAttribute("aria-hidden"), "true");
    assert.equal(svg.getAttribute("focusable"), "false");
    assert.equal(svg.getAttribute("viewBox"), "0 0 256 256");
    assert.equal(screen.queryByRole("img"), null);
  });

  it("promotes a titled icon to an image carrying that accessible name", () => {
    renderWithCart(<Icon name="x" title="Close menu" />);
    const image = screen.getByRole("img", { name: "Close menu" });

    assert.equal(image.getAttribute("aria-hidden"), null);
    assert.equal(image.getAttribute("focusable"), "false");
  });

  it("renders every shell glyph from one local path family", () => {
    for (const name of SHELL_ICONS) {
      const { container, unmount } = renderWithCart(
        <Icon name={name} size={20} />,
      );
      const path = container.querySelector("svg > path");

      assert.ok(path !== null, `missing icon: ${name}`);
      assert.equal(path.getAttribute("d"), ICON_PATHS[name]);
      assert.match(ICON_PATHS[name], /^M/, `icon ${name} is not path data`);
      assert.equal(container.querySelector("svg")?.getAttribute("width"), "20");
      unmount();
    }
  });
});

describe("market selector", () => {
  it("opens on the current market and links every market to this page", async () => {
    const user = userEvent.setup();
    setRoute("/shop/packs");
    renderWithCart(<CountryControl />);

    const trigger = screen.getByRole("button", {
      name: new RegExp(LOCALES[DEFAULT_LOCALE].label.replace(/[()$]/g, "\\$&")),
    });
    assert.equal(trigger.getAttribute("aria-expanded"), "false");
    assert.equal(screen.queryByRole("list"), null);

    await user.click(trigger);
    assert.equal(trigger.getAttribute("aria-expanded"), "true");
    const options = within(screen.getByRole("list")).getAllByRole("link");
    assert.deepEqual(
      options.map((option) => visibleText(option)),
      LOCALE_IDS.map((locale) => LOCALES[locale].label),
    );
    assert.deepEqual(
      options.map((option) => option.getAttribute("href")),
      LOCALE_IDS.map((locale) => localizePath("/shop/packs", locale)),
    );
    assert.deepEqual(
      options
        .filter((option) => option.getAttribute("aria-current") === "true")
        .map((option) => visibleText(option)),
      [LOCALES[DEFAULT_LOCALE].label],
    );
  });

  it("keeps the page's own path when it is already in another market", async () => {
    const user = userEvent.setup();
    setRoute("/de-de/cart");
    renderWithCart(<CountryControl />, undefined, "de-de");

    await user.click(screen.getByRole("button"));
    const options = within(screen.getByRole("list")).getAllByRole("link");
    assert.equal(options[0]?.getAttribute("href"), "/cart");
    assert.deepEqual(
      options
        .filter((option) => option.getAttribute("aria-current") === "true")
        .map((option) => visibleText(option)),
      [LOCALES["de-de"].label],
    );
  });

  it("flags every market and keeps the flags out of the accessible name", () => {
    const { container } = renderWithCart(<CountryControl />);

    const flag = container.querySelector("img");
    assert.ok(flag !== null);
    assert.equal(flag.getAttribute("alt"), "");
    assert.equal(flag.getAttribute("aria-hidden"), "true");
    assert.match(flag.getAttribute("src") ?? "", /us\.svg$/);
  });

  it("closes on Escape without changing the market", async () => {
    const user = userEvent.setup();
    renderWithCart(<CountryControl />);

    const trigger = screen.getByRole("button");
    await user.click(trigger);
    await user.keyboard("{Escape}");

    assert.equal(screen.queryByRole("list"), null);
    assert.ok(visibleText(trigger).includes(LOCALES[DEFAULT_LOCALE].label));
  });
});

describe("approved wordmarks", () => {
  it("uses the moss lockup for light surfaces and the reversed lockup for dark", () => {
    const header = renderWithCart(
      <Wordmark href="/?utm=x" />,
    ).container.querySelector("a");
    assert.ok(header !== null);
    assert.equal(header.getAttribute("aria-label"), "Forward — home");
    assert.equal(header.getAttribute("href"), "/?utm=x");
    assert.equal(
      within(header).getByRole("presentation", { hidden: true }) instanceof
        HTMLImageElement,
      true,
    );
    assert.equal(
      header.querySelector("img")?.getAttribute("src"),
      "/images/brand/forward-wordmark-horizontal-moss.svg",
    );
    /* The lockup is decoration inside a named link, never a second name. */
    assert.equal(header.querySelector("img")?.getAttribute("alt"), "");

    for (const variant of ["footer", "mobile"] as const) {
      const { container, unmount } = renderWithCart(
        <Wordmark variant={variant} />,
      );
      assert.equal(
        container.querySelector("img")?.getAttribute("src"),
        "/images/brand/forward-wordmark-horizontal-reversed.svg",
      );
      unmount();
    }
  });
});

describe("cart count", () => {
  it("announces the live item count politely", () => {
    const product = productByHandle("weatherline-shell");
    const variant = product.variants[0];
    assert.ok(variant !== undefined);

    const empty = renderWithCart(<CartCount />);
    assert.equal(visibleText(empty.container), ", 0 items in cart0");
    const live = empty.container.querySelector("[aria-live='polite']");
    assert.ok(live !== null);
    assert.equal(live.getAttribute("aria-atomic"), "true");
    empty.unmount();

    const { container } = renderWithCart(
      <CartCount />,
      cartData([cartLine(product, variant)]),
    );
    assert.equal(visibleText(container), ", 1 item in cart1");
  });
});

describe("footer payment marks", () => {
  it("draws every mark with its brand name available to assistive tech", () => {
    renderWithCart(<PaymentMarks />);

    const row = screen.getByRole("list", { name: "Accepted payment methods" });
    assert.deepEqual(
      within(row)
        .getAllByRole("img")
        .map((mark) => mark.getAttribute("aria-label")),
      CHECKOUT_PAYMENT_MARKS.map((mark) => mark.label),
    );
  });
});
