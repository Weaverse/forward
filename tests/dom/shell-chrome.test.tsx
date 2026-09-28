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
import { CHECKOUT_PAYMENT_MARKS } from "@/lib/storefront/integrations";
import {
  ACTIVE_STOREFRONT_COUNTRY,
  AVAILABLE_STOREFRONT_COUNTRIES,
  countryControlLabel,
} from "@/lib/storefront/localization";
import {
  cartData,
  cartLine,
  productByHandle,
  renderWithCart,
  visibleText,
} from "./harness";

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
  it("opens on the active market and lists every published market", async () => {
    const user = userEvent.setup();
    renderWithCart(<CountryControl />);

    const trigger = screen.getByRole("button", {
      name: new RegExp(countryControlLabel(ACTIVE_STOREFRONT_COUNTRY)),
    });
    assert.equal(trigger.getAttribute("aria-expanded"), "false");
    assert.equal(screen.queryByRole("list"), null);

    await user.click(trigger);
    assert.equal(trigger.getAttribute("aria-expanded"), "true");
    assert.deepEqual(
      within(screen.getByRole("list"))
        .getAllByRole("button")
        .map((option) => visibleText(option)),
      AVAILABLE_STOREFRONT_COUNTRIES.map((country) =>
        countryControlLabel(country),
      ),
    );
    assert.equal(
      within(screen.getByRole("list"))
        .getAllByRole("button")
        .filter((option) => option.getAttribute("aria-current") === "true")
        .length,
      1,
    );
  });

  it("flags every market and keeps the flags out of the accessible name", () => {
    const { container } = renderWithCart(<CountryControl />);

    const flag = container.querySelector("img");
    assert.ok(flag !== null);
    assert.equal(flag.getAttribute("alt"), "");
    assert.equal(flag.getAttribute("aria-hidden"), "true");
    assert.match(
      flag.getAttribute("src") ?? "",
      new RegExp(`${ACTIVE_STOREFRONT_COUNTRY.isoCode.toLowerCase()}\\.svg$`),
    );
    assert.equal(
      visibleText(screen.getByRole("button")).includes(
        countryControlLabel(ACTIVE_STOREFRONT_COUNTRY),
      ),
      true,
    );
  });

  it("moves the marker to the chosen market and closes", async () => {
    const user = userEvent.setup();
    const other = AVAILABLE_STOREFRONT_COUNTRIES[1];
    assert.ok(other !== undefined);
    renderWithCart(<CountryControl />);

    await user.click(
      screen.getByRole("button", {
        name: new RegExp(countryControlLabel(ACTIVE_STOREFRONT_COUNTRY)),
      }),
    );
    await user.click(
      within(screen.getByRole("list")).getByRole("button", {
        name: countryControlLabel(other),
      }),
    );

    assert.equal(screen.queryByRole("list"), null);
    const trigger = screen.getByRole("button");
    assert.match(visibleText(trigger), new RegExp(countryControlLabel(other)));
    assert.equal(trigger.getAttribute("aria-expanded"), "false");
  });

  it("closes on Escape without changing the market", async () => {
    const user = userEvent.setup();
    renderWithCart(<CountryControl />);

    const trigger = screen.getByRole("button");
    await user.click(trigger);
    await user.keyboard("{Escape}");

    assert.equal(screen.queryByRole("list"), null);
    assert.match(
      visibleText(trigger),
      new RegExp(countryControlLabel(ACTIVE_STOREFRONT_COUNTRY)),
    );
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
