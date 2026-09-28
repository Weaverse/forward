/**
 * Shared helpers for the Happy DOM behavior suite.
 *
 * These deliberately stay small: the doubles here replace only the runtime a
 * Next server would provide (routing, images, `/account/status`), never the
 * component under test. Nothing in this file may import
 * `src/lib/storefront/data-source.ts` — that module reads the server-only
 * environment boundary, which refuses to run once `document` exists.
 */

import { render } from "@testing-library/react";
import type { ReactNode } from "react";

import { ACCOUNT_LINK } from "@/components/site-header/header-navigation";
import type { ShopifyCartData } from "@/lib/cart/shopify-cart";
import { ShopifyCartProvider } from "@/lib/cart/shopify-cart-react";
import type { NavItem, Product } from "@/lib/storefront/types";
import { NAVIGATION_FIXTURE } from "../fixtures/storefront/navigation";
import { PRODUCT_FIXTURES } from "../fixtures/storefront/products";

export const PRIMARY_NAV: readonly NavItem[] = NAVIGATION_FIXTURE.primary;

/** Utility navigation as the shell renders it when accounts are enabled. */
export const UTILITY_NAV_WITH_ACCOUNT: readonly NavItem[] = [ACCOUNT_LINK];

/** Utility navigation as the shell renders it when accounts are disabled. */
export const UTILITY_NAV_NO_ACCOUNT: readonly NavItem[] = [];

interface CartLineStub {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    selectedOptions: { name: string; value: string }[];
    product: { handle: string; title: string };
    image: null;
  };
}

/** A server-owned cart as the Shopify cart provider would hold it. */
export function cartData(lines: readonly CartLineStub[] = []): ShopifyCartData {
  return {
    cart: {
      id: "gid://shopify/Cart/test",
      checkoutUrl: null,
      totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
      lines: { nodes: lines },
      cost: { subtotalAmount: { amount: "0.0", currencyCode: "USD" } },
    },
  } as unknown as ShopifyCartData;
}

/** One cart line for `variant` of `product`. */
export function cartLine(
  product: Product,
  variant: Product["variants"][number],
  quantity = 1,
): CartLineStub {
  return {
    id: `gid://shopify/CartLine/${variant.id}`,
    quantity,
    merchandise: {
      id: variant.id,
      selectedOptions: [...variant.selectedOptions],
      product: { handle: product.handle, title: product.title },
      image: null,
    },
  };
}

/** Renders inside the Shopify cart provider every storefront page mounts. */
export function renderWithCart(ui: ReactNode, data = cartData()) {
  return render(
    <ShopifyCartProvider initialData={data}>{ui}</ShopifyCartProvider>,
  );
}

export function productByHandle(handle: string): Product {
  const product = PRODUCT_FIXTURES.find((entry) => entry.handle === handle);
  if (product === undefined) {
    throw new Error(`missing product fixture: ${handle}`);
  }
  return product;
}

export interface AccountStatusStub {
  calls: { url: string; cache: string | undefined }[];
  restore: () => void;
}

/**
 * Answers the header's boolean-only `/account/status` probe. Every other
 * request fails loudly so a test can never pass on an unnoticed network call.
 */
export function stubAccountStatus(signedIn: boolean | null): AccountStatusStub {
  const calls: AccountStatusStub["calls"] = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const url = String(input);
    calls.push({ url, cache: init?.cache });
    if (!url.includes("/account/status")) {
      throw new Error(`unexpected fetch in a DOM test: ${url}`);
    }
    if (signedIn === null) {
      return new Response("", { status: 503 });
    }
    return Response.json({ signedIn });
  }) as typeof globalThis.fetch;
  return {
    calls,
    restore: () => {
      globalThis.fetch = original;
    },
  };
}

/** Text content of an element with runs collapsed to single spaces. */
export function visibleText(element: Element | null): string {
  return (element?.textContent ?? "").replace(/\s+/g, " ").trim();
}
