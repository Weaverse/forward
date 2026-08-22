/**
 * Field Index header behavior.
 *
 * Everything here is asserted from the rendered accessibility tree and real
 * user interaction. Layout, inert background, responsive visibility, focus
 * geometry, and reduced motion are CSS/browser contracts and live in
 * `tests/browser/`, not here.
 */

import assert from "node:assert/strict";
import { afterEach, describe, it } from "bun:test";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FieldIndexHeader } from "@/components/field-index-header";
import { ICON_PATHS } from "@/components/icon";
import { THEME_CONTENT_FIXTURE } from "@/lib/storefront/fixtures/navigation";
import { createFieldIndexCollections } from "@/lib/header-navigation";
import { currentRoute, setRoute } from "./preload";
import {
  type AccountStatusStub,
  PRIMARY_NAV,
  stubAccountStatus,
  UTILITY_NAV_NO_ACCOUNT,
  UTILITY_NAV_WITH_ACCOUNT,
  visibleText,
} from "./harness";

const SHOP_CHILDREN = [
  { label: "Shop all", href: "/shop" },
  { label: "Outerwear", href: "/shop/outerwear" },
  { label: "Packs", href: "/shop/packs" },
  { label: "Footwear", href: "/shop/footwear" },
] as const;

const ABOUT_CHILDREN = [
  { label: "Materials & Care", href: "/pages/materials-and-care" },
  { label: "Fit & Sizing", href: "/pages/fit-and-sizing" },
  { label: "Field Testing", href: "/pages/field-testing" },
  { label: "Field Repair", href: "/pages/field-repair" },
  { label: "Shipping & Returns", href: "/pages/shipping-returns" },
  { label: "Contact", href: "/pages/contact" },
] as const;

let account: AccountStatusStub | null = null;

afterEach(() => {
  account?.restore();
  account = null;
});

interface MountOptions {
  pathname?: string;
  queryString?: string;
  signedIn?: boolean | null;
  withAccount?: boolean;
}

function mountHeader({
  pathname = "/",
  queryString = "",
  signedIn = false,
  withAccount = true,
}: MountOptions = {}) {
  setRoute(pathname, queryString);
  account = stubAccountStatus(signedIn);
  return render(
    <FieldIndexHeader
      announcement={THEME_CONTENT_FIXTURE.announcement}
      primary={PRIMARY_NAV}
      queryString={queryString}
      utility={withAccount ? UTILITY_NAV_WITH_ACCOUNT : UTILITY_NAV_NO_ACCOUNT}
    />,
  );
}

function hrefs(links: readonly HTMLElement[]): string[] {
  return links.map((link) => link.getAttribute("href") ?? "");
}

describe("header shell", () => {
  it("renders the announcement, market, wordmark, and utility controls", () => {
    mountHeader();

    const announcement = screen.getByRole("complementary", {
      name: "Store announcement",
    });
    assert.match(
      visibleText(announcement),
      /Forward field report \/ 01Free shipping over \$150 · Repairs for life/,
    );
    assert.match(visibleText(announcement), /United States · USD/);

    assert.ok(screen.getByRole("banner"));
    assert.equal(
      screen.getAllByRole("link", { name: "Forward — home" }).length,
      1,
    );
    assert.ok(screen.getByRole("link", { name: /^Search$/ }));
    assert.ok(screen.getByRole("link", { name: /^Account/ }));
    assert.ok(screen.getByRole("link", { name: /^Cart/ }));
    assert.ok(screen.getByRole("button", { name: /^Menu$/ }));
  });

  it("drops the Account affordance and session probe when accounts are disabled", () => {
    mountHeader({ withAccount: false });

    assert.equal(screen.queryByRole("link", { name: /^Account/ }), null);
    assert.deepEqual(account?.calls, []);
    for (const link of screen.getAllByRole("link")) {
      assert.notEqual(link.getAttribute("href"), "/account");
    }
  });

  it("labels the account control from the boolean no-store session probe", async () => {
    mountHeader({ signedIn: true });

    await screen.findByRole("link", { name: /^Signed in/ });
    assert.deepEqual(account?.calls, [
      { url: "/account/status", cache: "no-store" },
    ]);
  });

  it("keeps the plain label when the session probe fails", async () => {
    mountHeader({ signedIn: null });

    await Promise.resolve();
    assert.ok(screen.getByRole("link", { name: /^Account/ }));
  });

  it("draws every header glyph from the shared icon family", () => {
    const { container } = mountHeader();
    const allowed = new Set<string>(Object.values(ICON_PATHS));

    const paths = [...container.querySelectorAll("svg > path")];
    assert.ok(paths.length > 0);
    for (const path of paths) {
      assert.ok(
        allowed.has(path.getAttribute("d") ?? ""),
        "header rendered a glyph outside the shared icon family",
      );
    }
    assert.doesNotMatch(visibleText(container), /↗/);
  });

  it("mounts exactly one mini-cart region in the shell", () => {
    const { container } = mountHeader();

    assert.equal(container.querySelectorAll(".mini-cart-mount").length, 1);
  });
});

describe("header query ownership", () => {
  const query = "colorway=claystone&size=M&q=trail&sort=name&category=packs";

  it("carries only the query state each destination owns", async () => {
    const user = userEvent.setup();
    mountHeader({ queryString: query });

    assert.equal(
      screen.getByRole("link", { name: /^Search$/ }).getAttribute("href"),
      "/search?q=trail",
    );
    assert.equal(
      screen.getByRole("link", { name: /^Cart/ }).getAttribute("href"),
      "/cart",
    );
    assert.equal(
      screen.getByRole("link", { name: /Field Notes/ }).getAttribute("href"),
      "/journal",
    );
    assert.equal(
      screen.getByRole("link", { name: "Forward — home" }).getAttribute("href"),
      "/",
    );

    await user.click(screen.getByRole("button", { name: /Shop/ }));
    const shopLinks = within(
      screen.getByRole("navigation", { name: "Shop collections" }),
    ).getAllByRole("link");
    assert.deepEqual(hrefs(shopLinks), [
      "/shop?sort=name&category=packs",
      "/shop/outerwear?sort=name&category=packs",
      "/shop/packs?sort=name&category=packs",
      "/shop/footwear?sort=name&category=packs",
    ]);
  });

  it("never leaks product selection state into another destination", async () => {
    const user = userEvent.setup();
    const { container } = mountHeader({
      pathname: "/products/weatherline-shell",
      queryString: "colorway=claystone&size=M",
    });

    await user.click(screen.getByRole("button", { name: /Shop/ }));
    for (const link of container.querySelectorAll("a[href]")) {
      const href = link.getAttribute("href") ?? "";
      assert.doesNotMatch(href, /colorway=|size=/, `selection leaked: ${href}`);
    }
  });
});

describe("desktop Shop field index", () => {
  it("opens on demand and lists every Shop child in exact order", async () => {
    const user = userEvent.setup();
    mountHeader();

    const trigger = screen.getByRole("button", { name: /Shop/ });
    assert.equal(trigger.getAttribute("aria-expanded"), "false");
    assert.equal(trigger.getAttribute("aria-controls"), null);
    assert.equal(
      screen.queryByRole("region", { name: "Shop field index" }),
      null,
    );

    await user.click(trigger);
    assert.equal(trigger.getAttribute("aria-expanded"), "true");
    const panel = screen.getByRole("region", { name: "Shop field index" });
    assert.equal(trigger.getAttribute("aria-controls"), panel.id);

    const links = within(
      within(panel).getByRole("navigation", { name: "Shop collections" }),
    ).getAllByRole("link");
    assert.deepEqual(
      links.map((link) => link.querySelector("strong")?.textContent),
      SHOP_CHILDREN.map((child) => child.label),
    );
    assert.deepEqual(
      hrefs(links),
      SHOP_CHILDREN.map((child) => child.href),
    );
  });

  it("closes on Escape and returns focus to the Shop trigger", async () => {
    const user = userEvent.setup();
    mountHeader();
    const trigger = screen.getByRole("button", { name: /Shop/ });

    await user.click(trigger);
    assert.ok(screen.getByRole("region", { name: "Shop field index" }));

    await user.keyboard("{Escape}");
    assert.equal(
      screen.queryByRole("region", { name: "Shop field index" }),
      null,
    );
    assert.equal(document.activeElement, trigger);
  });

  it("closes when a pointer lands outside the header", async () => {
    const user = userEvent.setup();
    mountHeader();

    await user.click(screen.getByRole("button", { name: /Shop/ }));
    await user.click(document.body);
    assert.equal(
      screen.queryByRole("region", { name: "Shop field index" }),
      null,
    );
  });

  it("swaps the previewed system on hover and focus without navigating", async () => {
    const user = userEvent.setup();
    mountHeader();

    await user.click(screen.getByRole("button", { name: /Shop/ }));
    const panel = screen.getByRole("region", { name: "Shop field index" });
    const links = within(
      within(panel).getByRole("navigation", { name: "Shop collections" }),
    ).getAllByRole("link");
    const packs = links[2];
    assert.ok(packs !== undefined);

    const shopItem = PRIMARY_NAV.find((item) => item.href === "/shop");
    assert.ok(shopItem !== undefined);
    const [forward, , packsCollection] = createFieldIndexCollections(shopItem);
    assert.ok(forward !== undefined && packsCollection !== undefined);

    const before = panel.querySelector("img");
    assert.equal(before?.getAttribute("src"), forward.image.src);

    await user.hover(packs);
    const image = panel.querySelector("img");
    assert.ok(image !== null);
    assert.equal(image.getAttribute("src"), packsCollection.image.src);
    assert.equal(image.getAttribute("alt"), packsCollection.image.alt);
    assert.match(visibleText(panel), new RegExp(packsCollection.fieldNote));
    /* Previewing a system must never navigate away from the current route. */
    assert.equal(currentRoute().pushed.length, 0);
  });

  it("marks the deepest current Shop destination, not the broader entry", async () => {
    const user = userEvent.setup();
    mountHeader({ pathname: "/shop/packs" });

    assert.equal(
      screen.getByRole("button", { name: /Shop/ }).getAttribute("aria-current"),
      "page",
    );

    await user.click(screen.getByRole("button", { name: /Shop/ }));
    const links = within(
      screen.getByRole("navigation", { name: "Shop collections" }),
    ).getAllByRole("link");
    assert.deepEqual(
      links.map((link) => link.getAttribute("aria-current")),
      [null, null, "page", null],
    );
  });

  it("treats a product route as the Shop branch without marking a collection", async () => {
    const user = userEvent.setup();
    mountHeader({ pathname: "/products/weatherline-shell" });

    assert.equal(
      screen.getByRole("button", { name: /Shop/ }).getAttribute("aria-current"),
      "page",
    );
    await user.click(screen.getByRole("button", { name: /Shop/ }));
    const links = within(
      screen.getByRole("navigation", { name: "Shop collections" }),
    ).getAllByRole("link");
    assert.deepEqual(
      links.map((link) => link.getAttribute("aria-current")),
      ["page", null, null, null],
    );
  });
});

describe("desktop About field manual", () => {
  it("lists the canonical About branch and an overview link", async () => {
    const user = userEvent.setup();
    mountHeader();

    const trigger = screen.getByRole("button", { name: /About/ });
    await user.click(trigger);
    const panel = screen.getByRole("region", { name: "About Forward pages" });

    assert.match(visibleText(panel), /^About \/ Field manual/);
    assert.equal(
      within(panel)
        .getByRole("link", { name: /^Overview/ })
        .getAttribute("href"),
      "/pages/about-forward",
    );

    const links = within(
      within(panel).getByRole("navigation", { name: "About Forward" }),
    ).getAllByRole("link");
    assert.deepEqual(
      hrefs(links),
      ABOUT_CHILDREN.map((child) => child.href),
    );
    for (const [index, child] of ABOUT_CHILDREN.entries()) {
      assert.match(visibleText(links[index] ?? null), new RegExp(child.label));
    }
  });

  it("opens one desktop panel at a time and restores its own trigger", async () => {
    const user = userEvent.setup();
    mountHeader();
    const shop = screen.getByRole("button", { name: /Shop/ });
    const about = screen.getByRole("button", { name: /About/ });

    await user.click(shop);
    await user.click(about);
    assert.equal(
      screen.queryByRole("region", { name: "Shop field index" }),
      null,
    );
    assert.equal(shop.getAttribute("aria-expanded"), "false");
    assert.equal(about.getAttribute("aria-expanded"), "true");

    await user.keyboard("{Escape}");
    assert.equal(document.activeElement, about);
  });

  it("marks the About branch current from any of its children", () => {
    mountHeader({ pathname: "/pages/fit-and-sizing" });

    assert.equal(
      screen
        .getByRole("button", { name: /About/ })
        .getAttribute("aria-current"),
      "page",
    );
  });
});

describe("mobile navigation dialog", () => {
  it("opens a labelled modal, locks the body, and focuses its close control", async () => {
    const user = userEvent.setup();
    mountHeader();
    const trigger = screen.getByRole("button", { name: /^Menu$/ });

    assert.equal(document.body.classList.contains("locked"), false);
    await user.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Site menu" });
    assert.equal(dialog.getAttribute("aria-modal"), "true");
    assert.equal(trigger.getAttribute("aria-expanded"), "true");
    assert.equal(trigger.getAttribute("aria-controls"), dialog.id);
    assert.equal(document.body.classList.contains("locked"), true);
    assert.equal(
      document.activeElement,
      within(dialog).getByRole("button", { name: "Close menu" }),
    );
  });

  it("repeats every Shop child in exact order on the mobile surface", async () => {
    const user = userEvent.setup();
    mountHeader();

    await user.click(screen.getByRole("button", { name: /^Menu$/ }));
    const links = within(
      screen.getByRole("navigation", { name: "Mobile shop collections" }),
    ).getAllByRole("link");

    assert.deepEqual(
      hrefs(links),
      SHOP_CHILDREN.map((child) => child.href),
    );
    for (const [index, child] of SHOP_CHILDREN.entries()) {
      assert.match(visibleText(links[index] ?? null), new RegExp(child.label));
    }
  });

  it("closes on Escape, unlocks the body, and restores the menu trigger", async () => {
    const user = userEvent.setup();
    mountHeader();
    const trigger = screen.getByRole("button", { name: /^Menu$/ });

    await user.click(trigger);
    await user.keyboard("{Escape}");

    assert.equal(screen.queryByRole("dialog", { name: "Site menu" }), null);
    assert.equal(document.body.classList.contains("locked"), false);
    assert.equal(document.activeElement, trigger);
  });

  it("closes from its own close control and from navigating away", async () => {
    const user = userEvent.setup();
    mountHeader();
    const trigger = screen.getByRole("button", { name: /^Menu$/ });

    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Close menu" }));
    assert.equal(screen.queryByRole("dialog", { name: "Site menu" }), null);
    assert.equal(document.activeElement, trigger);

    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Site menu" });
    await user.click(within(dialog).getByRole("link", { name: /Outerwear/ }));
    assert.equal(screen.queryByRole("dialog", { name: "Site menu" }), null);
    assert.equal(document.body.classList.contains("locked"), false);
  });

  it("keeps Tab inside the open dialog", async () => {
    const user = userEvent.setup();
    mountHeader();

    await user.click(screen.getByRole("button", { name: /^Menu$/ }));
    const dialog = screen.getByRole("dialog", { name: "Site menu" });
    const focusables = [
      ...dialog.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
      ),
    ];
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    assert.ok(first !== undefined && last !== undefined);

    last.focus();
    await user.tab();
    assert.equal(document.activeElement, first);

    await user.tab({ shift: true });
    assert.equal(document.activeElement, last);
  });

  it("closes the desktop panel when the mobile dialog opens", async () => {
    const user = userEvent.setup();
    mountHeader();

    await user.click(screen.getByRole("button", { name: /Shop/ }));
    await user.click(screen.getByRole("button", { name: /^Menu$/ }));

    assert.equal(
      screen.queryByRole("region", { name: "Shop field index" }),
      null,
    );
    assert.ok(screen.getByRole("dialog", { name: "Site menu" }));
  });
});
