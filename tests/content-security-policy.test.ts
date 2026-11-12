import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";

import {
  applyContentSecurityPolicy,
  mergeCspDirectives,
  readCspMode,
} from "../src/lib/security/content-security-policy.ts";

const PAGE = "https://shop.example/products/hat";
const STUDIO_PAGE =
  "https://shop.example/?isDesignMode=true&weaverseHost=https://studio.weaverse.io";

function policyFor(url: string, mode: Parameters<typeof readCspMode>[0]) {
  const headers = new Headers();
  applyContentSecurityPolicy(new Request(url), headers, readCspMode(mode));
  return headers;
}

describe("content security policy", () => {
  it("defaults to report-only for unset or unknown modes", () => {
    assert.equal(readCspMode(undefined), "report-only");
    assert.equal(readCspMode("strict"), "report-only");
  });

  it("sends nothing when the mode is off", () => {
    const headers = policyFor(PAGE, "off");

    assert.deepEqual([...headers.keys()], []);
  });

  it("reports without enforcing by default", () => {
    const headers = policyFor(PAGE, undefined);

    assert.equal(headers.has("content-security-policy"), false);
    assert.match(
      headers.get("content-security-policy-report-only") ?? "",
      /script-src [^;]*'unsafe-inline'/,
    );
  });

  it("enforces when asked", () => {
    const headers = policyFor(PAGE, "enforce");

    assert.equal(headers.has("content-security-policy-report-only"), false);
    assert.match(
      headers.get("content-security-policy") ?? "",
      /frame-ancestors 'none'/,
    );
  });

  it("lets Weaverse Studio frame the page in design mode", () => {
    const header =
      policyFor(STUDIO_PAGE, "enforce").get("content-security-policy") ?? "";

    assert.match(header, /frame-ancestors https:\/\/studio\.weaverse\.io/);
    assert.match(header, /script-src [^;]*'unsafe-inline'/);
  });

  it("keeps every theme directive and adds Studio's sources to it", () => {
    const merged = mergeCspDirectives(
      {
        connectSrc: ["https://api.example"],
        fontSrc: ["https://fonts.example"],
      },
      { connectSrc: ["https://studio.weaverse.io"] },
    );

    assert.deepEqual(merged, {
      connectSrc: ["https://api.example", "https://studio.weaverse.io"],
      fontSrc: ["https://fonts.example"],
    });
  });
});
