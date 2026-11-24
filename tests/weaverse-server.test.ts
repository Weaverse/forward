import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const sdk = vi.hoisted(() => ({
  createClient: vi.fn(),
  loadPage: vi.fn(),
  fetchCustomPages: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/lib/weaverse/env", () => ({
  readWeaverseConfig: () => ({ projectId: "project", sdkEnv: {} }),
}));
vi.mock("@/lib/weaverse/server-components", () => ({
  WEAVERSE_SERVER_COMPONENTS: [],
}));
vi.mock("@weaverse/hydrogen/next/server", () => ({
  createWeaverseNextServerClient: sdk.createClient,
}));

const { loadWeaversePage } = await import("@/lib/weaverse/server");

let call = 0;
/* A distinct pathname per call keeps React's `cache()` from sharing results
 * between cases. */
function load() {
  call += 1;
  return loadWeaversePage({ type: "CUSTOM", pathname: `/page-${call}` });
}

function page(id: string, extra: Record<string, unknown> = {}) {
  return { page: { id }, configs: {}, ...extra };
}

describe("loadWeaversePage", () => {
  beforeEach(() => {
    sdk.createClient.mockReset();
    sdk.createClient.mockReturnValue({
      loadPage: sdk.loadPage,
      fetchCustomPages: sdk.fetchCustomPages,
    });
    sdk.loadPage.mockReset();
    sdk.fetchCustomPages.mockReset();
  });

  it("asks the SDK to throw upstream failures", async () => {
    sdk.loadPage.mockResolvedValue(page("real"));
    await load();
    expect(sdk.createClient).toHaveBeenCalledWith(
      expect.objectContaining({ throwPageLoadFailures: true }),
    );
  });

  it("rethrows an upstream failure instead of answering 404", async () => {
    const failure = new Error("Weaverse unavailable");
    sdk.loadPage.mockRejectedValue(failure);
    await expect(load()).rejects.toBe(failure);
  });

  it("answers null when the SDK has no page", async () => {
    sdk.loadPage.mockResolvedValue(null);
    await expect(load()).resolves.toBeNull();
  });

  it("answers null for the fallback page on the storefront", async () => {
    sdk.loadPage.mockResolvedValue(page("any-id", { isFallback: true }));
    await expect(load()).resolves.toBeNull();
  });

  it("renders the fallback page in design mode", async () => {
    const fallback = page("any-id", {
      isFallback: true,
      configs: { isDesignMode: true },
    });
    sdk.loadPage.mockResolvedValue(fallback);
    await expect(load()).resolves.toBe(fallback);
  });

  it("renders an assigned page whose id mentions fallback", async () => {
    const assigned = page("fallback-sale");
    sdk.loadPage.mockResolvedValue(assigned);
    await expect(load()).resolves.toBe(assigned);
  });
});
