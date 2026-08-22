/**
 * Shared helpers for the Happy DOM behavior suite.
 *
 * These deliberately stay small: the doubles here replace only the runtime a
 * Next server would provide (routing, images, `/account/status`), never the
 * component under test. Nothing in this file may import
 * `src/lib/storefront/data-source.ts` — that module reads the server-only
 * environment boundary, which refuses to run once `document` exists.
 */

import { NAVIGATION_FIXTURE } from "@/lib/storefront/fixtures/navigation";
import { PRODUCT_FIXTURES } from "@/lib/storefront/fixtures/products";
import type { NavItem, Product } from "@/lib/storefront/types";

export const PRIMARY_NAV: readonly NavItem[] = NAVIGATION_FIXTURE.primary;

/** Utility navigation as the shell renders it when accounts are enabled. */
export const UTILITY_NAV_WITH_ACCOUNT: readonly NavItem[] =
  NAVIGATION_FIXTURE.utility;

/** Utility navigation as the shell renders it when accounts are disabled. */
export const UTILITY_NAV_NO_ACCOUNT: readonly NavItem[] =
  NAVIGATION_FIXTURE.utility.filter((item) => item.href !== "/account");

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

/** Accessible names of a list of elements, in DOM order. */
export function names(elements: readonly HTMLElement[]): string[] {
  return elements.map((element) => visibleText(element));
}
