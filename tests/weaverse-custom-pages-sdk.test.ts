import { afterEach, describe, expect, it, vi } from "vite-plus/test";

/* The real SDK client and the real env reader: only the network is stubbed,
 * so these cases fail if the SDK stops reporting a failed read. */
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/lib/weaverse/server-components", () => ({
  WEAVERSE_SERVER_COMPONENTS: [],
}));

vi.stubEnv("WEAVERSE_PROJECT_ID", "project");
vi.stubEnv("WEAVERSE_HOST", "https://weaverse.test");

const { fetchWeaverseCustomPages } = await import("@/lib/weaverse/server");

function answerCustomPages(respond: () => Response) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input instanceof Request ? input.url : input);
      return url.includes("/custom-pages") ? respond() : Response.json({});
    }),
  );
}

describe("fetchWeaverseCustomPages through the SDK", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects when the endpoint fails", async () => {
    answerCustomPages(() => {
      throw new TypeError("fetch failed");
    });

    const result = fetchWeaverseCustomPages();

    await expect(result).rejects.toMatchObject({ name: "WeaverseLoadError" });
  });

  it("lists the pages the endpoint answers", async () => {
    answerCustomPages(() =>
      Response.json({ data: [{ handle: "about" }], nextCursor: null }),
    );

    const pages = await fetchWeaverseCustomPages();

    expect(pages.map((page) => page.handle)).toEqual(["about"]);
  });
});
