/** Account affordances rendered without crossing an OAuth or mutation boundary. */

import { describe, it } from "bun:test";
import assert from "node:assert/strict";
import { screen, within } from "@testing-library/react";

import { AccountAccessPanel } from "@/components/account-access";
import { AccountShell } from "@/components/account-shell";
import { ENGLISH_T, renderInShell as render } from "./harness";

describe("account access affordances", () => {
  it("keeps signed-out login as a raw full-page handoff", () => {
    render(
      <AccountShell
        locale="en-us"
        t={ENGLISH_T}
        activePath="/account/orders"
        title="Orders"
      >
        <AccountAccessPanel
          t={ENGLISH_T}
          path="/account/orders"
          session={{ status: "signed-out" }}
        />
      </AccountShell>,
    );

    const navigation = screen.getByRole("navigation", {
      name: "Account navigation",
    });
    assert.equal(
      within(navigation)
        .getByRole("link", { name: "Orders" })
        .getAttribute("aria-current"),
      "page",
    );

    const signIn = screen.getByRole("link", { name: "Sign in" });
    assert.equal(
      signIn.getAttribute("href"),
      "/account/login?return_to=%2Faccount%2Forders",
    );
    assert.equal(signIn.getAttribute("rel"), "nofollow");
    assert.equal(signIn.getAttribute("data-prefetch"), "false");
    assert.equal(screen.queryByRole("button", { name: "Sign out" }), null);
  });

  it("renders only the bounded refresh handoff and generic failure copy", () => {
    const href =
      "/account/refresh?return_to=%2Faccount%2Faddresses%3Faccount_refresh%3D1";
    render(
      <AccountAccessPanel
        t={ENGLISH_T}
        loginFailed
        path="/account/addresses"
        session={{ status: "needs-refresh", href }}
      />,
    );

    const continueLink = screen.getByRole("link", { name: "Continue" });
    assert.equal(continueLink.getAttribute("href"), href);
    assert.equal(continueLink.getAttribute("data-prefetch"), "false");
    assert.match(
      screen.getByText("Sign-in did not complete. Please try again.")
        .textContent ?? "",
      /try again/i,
    );
  });

  it("keeps signed-in logout as a same-origin POST form back to the market", () => {
    render(
      <AccountShell
        locale="de-de"
        t={ENGLISH_T}
        activePath="/account"
        signedIn
        title="Account"
      >
        Private account content
      </AccountShell>,
    );

    const signOut = screen.getByRole("button", { name: "Sign out" });
    const form = signOut.closest("form");
    assert.ok(form !== null);
    assert.equal(form.getAttribute("method"), "post");
    /* The protocol path stays unprefixed; the market rides on `return_to`. */
    assert.equal(
      form.getAttribute("action"),
      "/account/logout?return_to=%2Fde-de",
    );
  });
});
