/**
 * Mini-cart lifecycle.
 *
 * The panel opens only on an explicit add announcement and reads the line it
 * reports from the server-owned cart. The add control's own contract (it
 * announces only once the cart reports the merchandise) and the cart request
 * are covered by the Shopify cart and live browser suites. Timers are faked so
 * the dismissal contract is asserted exactly rather than waited out.
 */

import { afterEach, beforeEach, describe, it, jest } from "bun:test";
import assert from "node:assert/strict";
import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MiniCart } from "@/components/site-header/mini-cart";
import { announceCartAdd } from "@/lib/cart/mini-cart-signal";
import { resolveProductSelection } from "@/lib/storefront/product-state";
import {
  cartData,
  cartLine,
  productByHandle,
  renderWithCart,
  visibleText,
} from "./harness";

const AUTO_DISMISS_MS = 8000;
const PRODUCT = productByHandle("weatherline-shell");
const SELECTION = resolveProductSelection(PRODUCT, "charcoal", { Size: "M" });
const VARIANT_ID = SELECTION.variant.id;

/**
 * The mini-cart and the control the shopper used mount separately, so each
 * surface can be queried on its own.
 */
let miniCartRoot: HTMLElement;

function setup() {
  const user = userEvent.setup({
    advanceTimers: jest.advanceTimersByTime,
    delay: null,
  });
  miniCartRoot = renderWithCart(
    <MiniCart />,
    cartData([cartLine(PRODUCT, SELECTION.variant)]),
  ).container;
  renderWithCart(
    <button type="button" onClick={() => announceCartAdd(VARIANT_ID)}>
      Add to cart
    </button>,
  );
  return { user, add: screen.getByRole("button", { name: "Add to cart" }) };
}

function panel(): HTMLElement | null {
  return screen.queryByRole("dialog", { name: "Cart updated" });
}

function status(): string {
  return visibleText(within(miniCartRoot).getByRole("status"));
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("mini-cart open signal", () => {
  it("stays closed until an add is explicitly announced", () => {
    setup();
    /* The line is already in the cart; a cart that holds it is not an add. */
    assert.equal(panel(), null);
  });

  it("opens on an announced add showing the exact line the cart reports", async () => {
    const { user, add } = setup();
    await user.click(add);

    const open = panel();
    assert.ok(open !== null);
    assert.equal(open.getAttribute("aria-modal"), null);
    assert.match(visibleText(open), /^Added to cart/);
    assert.ok(
      within(open).getByRole("link", { name: PRODUCT.title }),
      "the panel names the exact product added",
    );
    assert.match(visibleText(open), /Qty 1/);
    assert.equal(
      within(open)
        .getByRole("link", { name: "View cart" })
        .getAttribute("href"),
      "/cart",
    );
    /* A cart with no checkout URL has no handoff to advertise. */
    assert.equal(within(open).queryByRole("link", { name: "Checkout" }), null);
    assert.equal(status(), "Added to cart.");
  });

  it("never steals focus from the control the shopper used", async () => {
    const { user, add } = setup();
    await user.click(add);
    assert.ok(panel() !== null);
    assert.equal(document.activeElement, add);
  });
});

describe("mini-cart repeated adds", () => {
  it("restarts the lifecycle and re-announces an identical repeat add", async () => {
    const { user, add } = setup();
    await user.click(add);
    assert.equal(status(), "Added to cart.");

    act(() => {
      jest.advanceTimersByTime(AUTO_DISMISS_MS - 2000);
    });
    assert.ok(panel() !== null);

    /* Keyboard activation repeats the add without an outside pointer, so the
     * panel stays mounted and has to refresh itself in place. */
    add.focus();
    await user.keyboard("{Enter}");
    assert.equal(
      status(),
      "Item added to cart.",
      "an identical repeat add still needs a fresh live-region update",
    );
    assert.equal(
      screen.getAllByRole("dialog", { name: "Cart updated" }).length,
      1,
      "repeated adds must never stack a second mini-cart",
    );

    /* The dismissal timer restarted from the repeat add. */
    act(() => {
      jest.advanceTimersByTime(2001);
    });
    assert.ok(panel() !== null);

    await user.keyboard("{Enter}");
    assert.equal(status(), "Added to cart.");
  });

  it("closes and reopens when the shopper re-adds with a pointer", async () => {
    const { user, add } = setup();
    await user.click(add);
    /* The pointer lands outside the panel, which dismisses it, and the add
     * that follows opens a fresh panel. */
    await user.click(add);
    assert.ok(panel() !== null);
    assert.equal(
      screen.getAllByRole("dialog", { name: "Cart updated" }).length,
      1,
    );
  });
});

describe("mini-cart dismissal", () => {
  it("auto-dismisses once its timer elapses", async () => {
    const { user, add } = setup();
    await user.click(add);

    act(() => {
      jest.advanceTimersByTime(AUTO_DISMISS_MS - 2000);
    });
    assert.ok(panel() !== null, "the panel must not vanish before its window");

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    assert.equal(panel(), null);
    assert.equal(status(), "");
  });

  it("pauses auto-dismissal while focus is inside and resumes when it leaves", async () => {
    const { user, add } = setup();
    await user.click(add);

    const open = panel();
    assert.ok(open !== null);
    within(open).getByRole("link", { name: "View cart" }).focus();

    act(() => {
      jest.advanceTimersByTime(AUTO_DISMISS_MS * 3);
    });
    assert.ok(panel() !== null, "focus inside the panel must hold it open");

    act(() => {
      add.focus();
    });
    act(() => {
      jest.advanceTimersByTime(AUTO_DISMISS_MS);
    });
    assert.equal(panel(), null);
  });

  it("dismisses on Escape and on an outside pointer", async () => {
    const { user, add } = setup();
    await user.click(add);
    await user.keyboard("{Escape}");
    assert.equal(panel(), null);

    await user.click(add);
    assert.ok(panel() !== null);
    await user.click(document.body);
    assert.equal(panel(), null);
  });

  it("dismisses from its own close control", async () => {
    const { user, add } = setup();
    await user.click(add);
    await user.click(
      screen.getByRole("button", { name: "Close cart preview" }),
    );
    assert.equal(panel(), null);
    assert.equal(status(), "");
  });
});
