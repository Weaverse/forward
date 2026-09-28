/**
 * Home merchandising data contract.
 *
 * Home's rendered composition — section order, links, media, geometry, and
 * reduced motion — is covered by `tests/browser/home.pw.ts`, which renders the
 * real page. What remains here is the pure presentation data those sections
 * read: the theme-owned one-sentence product summaries.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { PRODUCT_FIXTURES } from "../src/lib/storefront/fixtures/products.ts";

describe("concise Home merchandising copy", () => {
  it("keys one short sentence to every product the store returns", () => {
    assert.ok(PRODUCT_FIXTURES.length > 0);
    for (const profile of PRODUCT_FIXTURES) {
      const { subtitle } = profile;
      assert.ok(
        subtitle.length > 0 && subtitle.length <= 90,
        `${profile.handle} summary is not a short sentence: ${subtitle}`,
      );
      assert.match(subtitle, /^[A-Z].*\.$/, profile.handle);
      assert.equal(
        subtitle.match(/[.!?](?:\s|$)/g)?.length,
        1,
        `${profile.handle} summary must be a single sentence`,
      );
      assert.doesNotMatch(subtitle, /<[^>]+>|&[a-z]+;/, profile.handle);
    }
  });
});
