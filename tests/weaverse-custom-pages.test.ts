import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";

import {
  isWeaverseCustomPage,
  resetCustomPageCache,
} from "../src/lib/weaverse/custom-pages.ts";

/**
 * This decides whether a URL reaches the Weaverse renderer or gets Next's
 * ordinary 404, so its failure direction is a storefront-visible contract, not
 * an implementation detail.
 */

const realFetch = globalThis.fetch;

function respondWith(paths: string[]): void {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ data: paths.map((path) => ({ path })) }), {
      headers: { "content-type": "application/json" },
      status: 200,
    })) as typeof fetch;
}

function failWith(error: Error): void {
  globalThis.fetch = (async () => {
    throw error;
  }) as typeof fetch;
}

beforeEach(() => {
  resetCustomPageCache();
});

afterEach(() => {
  globalThis.fetch = realFetch;
  resetCustomPageCache();
});

describe("isWeaverseCustomPage", () => {
  it("recognises a published path", async () => {
    respondWith(["/about", "/materials"]);

    assert.equal(await isWeaverseCustomPage("/about", "p1"), true);
    assert.equal(await isWeaverseCustomPage("/materials", "p1"), true);
  });

  it("rejects a path Weaverse does not publish", async () => {
    respondWith(["/about"]);

    assert.equal(await isWeaverseCustomPage("/lookbook", "p1"), false);
  });

  it("normalizes stored paths that lack or repeat a leading slash", async () => {
    respondWith(["about", "//materials//"]);

    assert.equal(await isWeaverseCustomPage("/about", "p1"), true);
    assert.equal(await isWeaverseCustomPage("/materials", "p1"), true);
  });

  it("falls back to the handle when no path is stored", async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ data: [{ handle: "lookbook" }] }), {
        status: 200,
      })) as typeof fetch;

    assert.equal(await isWeaverseCustomPage("/lookbook", "p1"), true);
  });

  it("admits every path when the listing has never been fetched", async () => {
    /* The renderer is not at the app root, so a `false` here is a hard 404.
     * During an outage that would take every real custom page offline, so an
     * unknown listing must admit the request and let the renderer decide. */
    failWith(new Error("network down"));

    assert.equal(await isWeaverseCustomPage("/about", "p1"), true);
    assert.equal(await isWeaverseCustomPage("/anything", "p1"), true);
  });

  it("keeps serving the last good listing when a refresh fails", async () => {
    respondWith(["/about"]);
    assert.equal(await isWeaverseCustomPage("/about", "p1"), true);

    resetCustomPageCache();
    respondWith(["/about"]);
    await isWeaverseCustomPage("/about", "p1");
    failWith(new Error("network down"));

    /* Still inside the TTL, so the cached listing answers and an unpublished
     * path stays a hard 404 rather than becoming a soft one. */
    assert.equal(await isWeaverseCustomPage("/lookbook", "p1"), false);
  });

  it("treats a non-ok response as a failed fetch", async () => {
    globalThis.fetch = (async () =>
      new Response("nope", { status: 500 })) as typeof fetch;

    assert.equal(await isWeaverseCustomPage("/anything", "p1"), true);
  });

  it("caches, so repeated lookups do not refetch", async () => {
    let calls = 0;
    globalThis.fetch = (async () => {
      calls += 1;
      return new Response(JSON.stringify({ data: [{ path: "/about" }] }), {
        status: 200,
      });
    }) as typeof fetch;

    await isWeaverseCustomPage("/about", "p1");
    await isWeaverseCustomPage("/materials", "p1");
    await isWeaverseCustomPage("/about", "p1");

    assert.equal(calls, 1);
  });

  it("shares one refresh across concurrent lookups", async () => {
    let calls = 0;
    globalThis.fetch = (async () => {
      calls += 1;
      await new Promise((resolve) => setTimeout(resolve, 5));
      return new Response(JSON.stringify({ data: [{ path: "/about" }] }), {
        status: 200,
      });
    }) as typeof fetch;

    const results = await Promise.all([
      isWeaverseCustomPage("/about", "p1"),
      isWeaverseCustomPage("/about", "p1"),
      isWeaverseCustomPage("/lookbook", "p1"),
    ]);

    assert.deepEqual(results, [true, true, false]);
    assert.equal(calls, 1);
  });
});
