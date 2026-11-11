import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";

import { siteBaseUrl } from "../src/lib/routes/site.ts";

describe("siteBaseUrl", () => {
  it("prefers PUBLIC_SITE_URL, then Vercel's production domain, then localhost", () => {
    assert.equal(
      siteBaseUrl({
        PUBLIC_SITE_URL: "https://shop.example.com/",
        VERCEL_PROJECT_PRODUCTION_URL: "forward.vercel.app",
      }),
      "https://shop.example.com",
    );
    assert.equal(
      siteBaseUrl({ VERCEL_PROJECT_PRODUCTION_URL: "forward.vercel.app" }),
      "https://forward.vercel.app",
    );
    assert.equal(
      siteBaseUrl({ PUBLIC_SITE_URL: " " }),
      "http://localhost:3000",
    );
  });

  it("rejects a malformed origin", () => {
    assert.throws(() => siteBaseUrl({ PUBLIC_SITE_URL: "shop.example.com" }));
  });
});
