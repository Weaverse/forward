import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { WeaverseNextLoaderData } from "@weaverse/next";
import {
  hasAuthoredSections,
  pageRenders,
} from "../src/lib/weaverse/page-payload.ts";
import { buildRequestContext } from "../src/lib/weaverse/request-info.ts";

/**
 * These cover the fields the Studio bridge reads and the storefront never
 * does. Every case below is a defect that actually shipped and was found by
 * opening a page rather than by any gate, because a storefront-facing check
 * cannot see a field the storefront does not read.
 */

/** A minimal loader payload carrying exactly the item list under test. */
function page(items: unknown): WeaverseNextLoaderData {
  return { page: { items } } as unknown as WeaverseNextLoaderData;
}

describe("hasAuthoredSections", () => {
  it("rejects the Builder's shared default template", () => {
    /* The exact payload that rendered a blank page: a real page id and a root
     * with no children. Matching on the id containing "fallback" passed it. */
    assert.equal(
      hasAuthoredSections(
        page([{ id: "01a07f60", type: "main", children: [] }]),
      ),
      false,
    );
  });

  it("rejects an empty item list, a missing page, and a null payload", () => {
    assert.equal(hasAuthoredSections(page([])), false);
    assert.equal(hasAuthoredSections({} as WeaverseNextLoaderData), false);
    assert.equal(hasAuthoredSections(null), false);
    assert.equal(hasAuthoredSections(undefined), false);
  });

  it("accepts a root that carries authored sections", () => {
    assert.equal(
      hasAuthoredSections(
        page([
          { id: "root", type: "main", children: [{ id: "a" }, { id: "b" }] },
          { id: "a", type: "editorial-hero" },
          { id: "b", type: "stat-band" },
        ]),
      ),
      true,
    );
  });

  it("ignores a children value that is not an array", () => {
    assert.equal(
      hasAuthoredSections(page([{ id: "root", children: "two" }])),
      false,
    );
  });
});

describe("buildRequestContext", () => {
  const headers = new Headers({ host: "forward.example" });

  it("always carries i18n, which the Studio bridge reads", () => {
    const context = buildRequestContext({ headers, pathname: "/about" });

    /* The bridge does `i18n.language`; undefined here crashed Studio. */
    assert.equal(context.i18n?.language, "EN");
    assert.equal(context.i18n?.country, "US");
    assert.equal(context.i18n?.locale, "en-us");
  });

  it("carries the page identity Studio edits against", () => {
    const context = buildRequestContext({
      headers,
      page: { handle: "about", type: "CUSTOM" },
      pathname: "/about",
    });

    assert.equal(context.pageType, "CUSTOM");
    assert.equal(context.handle, "about");
  });

  it("omits the page identity when the route supplies none", () => {
    const context = buildRequestContext({ headers, pathname: "/" });

    assert.equal("pageType" in context, false);
    assert.equal("handle" in context, false);
  });

  it("builds an absolute url from the request host", () => {
    /* resolveRequestUrl prefers `url` over `pathname`, and a bare pathname
     * resolves against http://localhost, which never matches a real preview. */
    assert.equal(
      buildRequestContext({ headers, pathname: "/about" }).url,
      "http://forward.example/about",
    );
  });

  it("honours the forwarded host and protocol behind a proxy", () => {
    const context = buildRequestContext({
      headers: new Headers({
        host: "internal:3000",
        "x-forwarded-host": "forward-sandy.vercel.app",
        "x-forwarded-proto": "https",
      }),
      pathname: "/materials",
    });

    assert.equal(context.url, "https://forward-sandy.vercel.app/materials");
  });

  it("keeps the search string on the url and in searchParams", () => {
    const context = buildRequestContext({
      headers,
      pathname: "/about",
      searchParams: { isDesignMode: "true", weaverseProjectId: "p1" },
    });

    assert.equal(context.searchParams?.get("isDesignMode"), "true");
    assert.ok(String(context.url).includes("weaverseProjectId=p1"));
  });

  it("leaves the url clean when there is no search", () => {
    assert.equal(
      buildRequestContext({ headers, pathname: "/about", searchParams: {} })
        .url,
      "http://forward.example/about",
    );
  });

  it("keeps repeated query values instead of collapsing them", () => {
    const context = buildRequestContext({
      headers,
      pathname: "/shop",
      searchParams: { activity: ["hiking", "climbing"] },
    });

    assert.deepEqual(context.searchParams?.getAll("activity"), [
      "hiking",
      "climbing",
    ]);
  });
});

describe("pageRenders", () => {
  const page = (items: unknown[]) =>
    ({ page: { items } }) as unknown as WeaverseNextLoaderData;

  it("finds a component the page places", () => {
    assert.equal(
      pageRenders(page([{ id: "a", type: "main-product" }]), "main-product"),
      true,
    );
  });

  it("reports a component the page omits", () => {
    /* The product route relies on this to keep a buy block on every product
     * URL when a template has not been seeded, or a merchant removed it. */
    assert.equal(
      pageRenders(
        page([{ id: "a", type: "related-products" }]),
        "main-product",
      ),
      false,
    );
    assert.equal(pageRenders(null, "main-product"), false);
    assert.equal(pageRenders(page([]), "main-product"), false);
  });
});
