/**
 * Shopify's browser runtime: the script tags Forward renders and the
 * Standard Actions `openCart` it configures.
 */

import assert from "node:assert/strict";
import { render } from "@testing-library/react";
import { afterEach, describe, it } from "vite-plus/test";

import { ShopifyScripts } from "@/lib/shopify-scripts";
import { setRoute } from "./preload";

type Handler = () => Promise<void>;

describe("ShopifyScripts", () => {
  afterEach(() => {
    delete window.Shopify;
  });

  it("loads Standard Actions and opens the market's cart page from openCart", async () => {
    const route = setRoute("/de-de/shop");
    let handler: Handler | undefined;
    window.Shopify = {
      actions: {
        openCart: {
          configure: (options: { handler: Handler }) => {
            handler = options.handler;
            return true;
          },
        },
      },
    } as unknown as typeof window.Shopify;

    const { container } = render(
      <ShopifyScripts
        cartPath="/de-de/cart"
        analytics={{ channel: "headless" }}
        i18n={{
          country: "DE",
          language: "DE",
          currency: "EUR",
          pathPrefix: "/de-de",
        }}
        routes={{ collection: "/shop/:collectionHandle" }}
        shop={{
          shopId: "gid://shopify/Shop/1",
          storefrontId: "0",
          myshopifyDomain: "forward-test.myshopify.com",
        }}
      />,
    );

    for (const id of [
      "shopify-global-bootstrap",
      "shopify-standard-actions",
      "shopify-analytics-bus",
      "shopify-consent",
    ]) {
      assert.ok(container.querySelector(`script#${id}`), id);
    }
    assert.ok(handler, "openCart is configured");
    await handler();
    assert.deepEqual(route.pushed, ["/de-de/cart"]);
  });

  it("configures openCart on load when hydration ran before Standard Actions", async () => {
    const route = setRoute("/shop");
    Object.defineProperty(document, "readyState", {
      configurable: true,
      get: () => "interactive",
    });
    let handler: Handler | undefined;
    try {
      render(
        <ShopifyScripts
          cartPath="/cart"
          analytics={{ channel: "headless" }}
          i18n={{
            country: "US",
            language: "EN",
            currency: "USD",
            pathPrefix: "",
          }}
          routes={{}}
          shop={{
            shopId: "gid://shopify/Shop/1",
            storefrontId: "0",
            myshopifyDomain: "forward-test.myshopify.com",
          }}
        />,
      );
      window.Shopify = {
        actions: {
          openCart: {
            configure: (options: { handler: Handler }) => {
              handler = options.handler;
              return true;
            },
          },
        },
      } as unknown as typeof window.Shopify;
      window.dispatchEvent(new Event("load"));
    } finally {
      delete (document as { readyState?: unknown }).readyState;
    }
    assert.ok(handler, "openCart is configured on load");
    await handler();
    assert.deepEqual(route.pushed, ["/cart"]);
  });
});
