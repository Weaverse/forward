import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildWeaverseNextRequestInfo } from "@weaverse/next";

import { LOCALE_IDS } from "../src/lib/i18n/locales.ts";
import {
  buildRequestContext,
  loaderLocale,
} from "../src/lib/weaverse/request-info.ts";

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
    assert.equal(context.i18n?.locale, "en-US");
    assert.equal(context.i18n?.pathPrefix, "");
  });

  it("reports a market in Weaverse's format and gets it back in a loader", () => {
    const context = buildRequestContext({
      headers,
      pathname: "/shop",
      locale: "de-de",
    });
    assert.equal(context.i18n?.locale, "de-DE");
    assert.equal(context.i18n?.pathPrefix, "/de-de");
    /* Studio's address bar follows the request info's path: it must keep
     * the market, or Studio snaps back to the default market after
     * navigating. The theme reports the route path; the SDK adds the prefix. */
    assert.equal(context.pathname, "/shop");
    assert.equal(buildWeaverseNextRequestInfo(context).pathname, "/de-de/shop");

    /* Section loaders see the same `i18n`, so every market must round-trip. */
    for (const locale of LOCALE_IDS) {
      const { i18n } = buildRequestContext({ headers, pathname: "/", locale });
      assert.equal(loaderLocale({ i18n }), locale);
    }
    assert.equal(loaderLocale(undefined), "en-us");
    assert.equal(
      loaderLocale({ i18n: { language: "XX", country: "YY" } }),
      "en-us",
    );
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
