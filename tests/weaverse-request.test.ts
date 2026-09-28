import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildRequestContext } from "../src/lib/weaverse/request-info.ts";

/**
 * These cover the fields the Studio bridge reads and the storefront never
 * does. Every case below is a defect that actually shipped and was found by
 * opening a page rather than by any gate, because a storefront-facing check
 * cannot see a field the storefront does not read.
 */

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
