import { describe, expect, it } from "vite-plus/test";

import { isDefaultMarketCustomPage } from "@/lib/weaverse/custom-pages";

describe("isDefaultMarketCustomPage", () => {
  it.each([
    [{ scope: "global", locale: null, market: null }, true],
    [{ scope: "locale", locale: "en-us", market: null }, true],
    [{ scope: "locale", locale: "de-de", market: null }, false],
    [{ scope: "market", locale: null, market: "us" }, true],
    [{ scope: "market", locale: null, market: "de" }, false],
    [{ locale: null }, false],
  ] as const)("%j → %s", (page, expected) => {
    expect(isDefaultMarketCustomPage(page)).toBe(expected);
  });
});
