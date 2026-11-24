import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";

import robots from "../src/app/robots.ts";

/** Google's robots.txt matching: a prefix match where `*` spans anything. */
function blocks(pattern: string, url: string): boolean {
  const source = pattern
    .split("*")
    .map((part) => part.replace(/[.?+^$()[\]{}|\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(`^${source}`).test(url);
}

function disallowed(userAgent: string, url: string): boolean {
  const rules = [robots().rules].flat();
  const group = rules.find((rule) => rule.userAgent === userAgent);
  assert.ok(group, userAgent);
  return [group.disallow ?? []].flat().some((pattern) => blocks(pattern, url));
}

describe("robots.txt", () => {
  it("keeps buyer pages and duplicate browse URLs out in every market", () => {
    for (const url of [
      "/cart",
      "/de-de/cart",
      "/ja-jp/account/orders",
      "/fr-fr/search?q=shell",
      "/cart.js",
      "/checkout",
      "/api/2026-10/graphql.json",
      "/shop/outerwear?sort=price-asc",
      "/de-de/shop?sort=newest",
      "/shop/outerwear?filter.p.m.a=1&filter.p.m.b=2",
      "/shop/outerwear?filter.p.m.a=1&price-min=10",
      "/shop?price-min=10&price-max=50",
    ]) {
      assert.ok(disallowed("*", url), url);
    }
  });

  it("leaves content, single-facet landing pages and UCP crawlable", () => {
    for (const url of [
      "/",
      "/de-de",
      "/products/cart-organizer",
      "/shop/outerwear",
      "/shop/outerwear?filter.p.m.a=1",
      "/shop?after=cursor",
      "/journal/layering",
      "/.well-known/ucp",
    ]) {
      assert.ok(!disallowed("*", url), url);
    }
  });

  it("lets AdsBot reach sorted and filtered landing pages", () => {
    assert.ok(!disallowed("adsbot-google", "/shop/outerwear?sort=price-asc"));
    assert.ok(disallowed("adsbot-google", "/de-de/cart"));
  });
});
