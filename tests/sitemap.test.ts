import { describe, expect, it, vi } from "vite-plus/test";

const customPages = vi.hoisted(() => vi.fn());

vi.mock("@/lib/storefront/data-source", () => {
  const empty = async () => [];
  return {
    getStorefront: () => ({
      listProducts: empty,
      listCollections: empty,
      listBlogs: empty,
      listArticles: empty,
      listPages: empty,
      listPolicies: empty,
    }),
  };
});
vi.mock("@/lib/weaverse/server", () => ({
  fetchWeaverseCustomPages: customPages,
}));

const { default: sitemap } = await import("@/app/sitemap");

describe("sitemap custom pages", () => {
  it("lists default-market custom pages once", async () => {
    customPages.mockResolvedValue([
      { handle: "journal", scope: "global", locale: null, market: null },
      { handle: "about-us", scope: "global", locale: null, market: null },
      { handle: "about-us", scope: "locale", locale: "en-us", market: null },
      { handle: "uber-uns", scope: "market", locale: null, market: "de" },
    ]);

    const urls = (await sitemap()).map((entry) => entry.url);
    const path = (url: string) => new URL(url).pathname;

    expect(urls.filter((url) => path(url) === "/journal")).toHaveLength(1);
    expect(urls.filter((url) => path(url) === "/about-us")).toHaveLength(1);
    expect(urls.some((url) => path(url) === "/uber-uns")).toBe(false);
  });
});
