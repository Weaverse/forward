import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

import {
  buildSdkEnv,
  isWeaverseEnabled,
  readWeaverseConfig,
  SDK_ENV_KEYS,
  SUPPRESSED_ENV_KEYS,
} from "../src/lib/weaverse/env.ts";

const SDK_SERVER_BUNDLE = "node_modules/@weaverse/next/dist/server.mjs";

/** Every environment key the installed SDK bundle names. */
async function sdkEnvKeysFromBundle(): Promise<Set<string>> {
  const source = await readFile(SDK_SERVER_BUNDLE, "utf8");
  const matches =
    source.match(/"(?:PUBLIC_STORE(?:FRONT)?_[A-Z_]+|WEAVERSE_[A-Z_]+)"/g) ??
    [];
  return new Set(matches.map((literal) => literal.slice(1, -1)));
}

const FULL_ENV = {
  WEAVERSE_PROJECT_ID: "project-123",
  WEAVERSE_HOST: "https://staging.example",
  WEAVERSE_API_KEY: "admin-seed-key",
  WEAVERSE_PUBLIC_API_BASE: "https://self-hosted.example",
  PUBLIC_STORE_DOMAIN: "forward.myshopify.com",
  PUBLIC_STOREFRONT_API_TOKEN: "public-token",
  PRIVATE_STOREFRONT_API_TOKEN: "private-token",
  CUSTOMER_ACCOUNT_SESSION_SECRET: "session-secret",
};

describe("Weaverse SDK environment key coverage", () => {
  it("names every environment key the installed SDK reads", async () => {
    const fromBundle = await sdkEnvKeysFromBundle();
    const missing = [...fromBundle].filter(
      (key) => !SDK_ENV_KEYS.includes(key as (typeof SDK_ENV_KEYS)[number]),
    );

    assert.deepEqual(
      missing,
      [],
      `The SDK reads environment keys this boundary does not name, so they would fall through to process.env: ${missing.join(", ")}`,
    );
  });
});

describe("buildSdkEnv", () => {
  it("supplies every SDK key so none can fall through to process.env", () => {
    const env = buildSdkEnv(FULL_ENV);

    for (const key of SDK_ENV_KEYS) {
      assert.equal(
        typeof env[key],
        "string",
        `${key} must be present, not undefined`,
      );
    }
  });

  it("blanks the suppressed keys even when they are configured", () => {
    const env = buildSdkEnv(FULL_ENV);

    for (const key of SUPPRESSED_ENV_KEYS) {
      assert.equal(env[key], "", `${key} must never reach the SDK`);
    }
  });

  it("keeps the public store domain, which the SDK exposes deliberately", () => {
    assert.equal(
      buildSdkEnv(FULL_ENV).PUBLIC_STORE_DOMAIN,
      "forward.myshopify.com",
    );
  });

  it("never forwards a key the SDK does not read", () => {
    const env = buildSdkEnv(FULL_ENV);

    assert.equal(env.PRIVATE_STOREFRONT_API_TOKEN, undefined);
    assert.equal(env.CUSTOMER_ACCOUNT_SESSION_SECRET, undefined);
    assert.deepEqual(Object.keys(env).sort(), [...SDK_ENV_KEYS].sort());
  });
});

describe("readWeaverseConfig", () => {
  it("disables composition when the project id is absent", () => {
    assert.equal(readWeaverseConfig({}), null);
    assert.equal(isWeaverseEnabled({}), false);
  });

  it("treats a blank or whitespace project id as absent", () => {
    assert.equal(readWeaverseConfig({ WEAVERSE_PROJECT_ID: "" }), null);
    assert.equal(readWeaverseConfig({ WEAVERSE_PROJECT_ID: "   " }), null);
  });

  it("treats the template placeholder as absent", () => {
    assert.equal(
      readWeaverseConfig({ WEAVERSE_PROJECT_ID: "REPLACE_ME" }),
      null,
    );
  });

  it("resolves the project id and trims it", () => {
    const config = readWeaverseConfig({
      WEAVERSE_PROJECT_ID: "  project-123  ",
    });

    assert.equal(config?.projectId, "project-123");
    assert.equal(
      isWeaverseEnabled({ WEAVERSE_PROJECT_ID: "project-123" }),
      true,
    );
  });

  it("omits the host when it is unset so the SDK applies its own default", () => {
    const config = readWeaverseConfig({ WEAVERSE_PROJECT_ID: "project-123" });

    assert.equal("weaverseHost" in (config ?? {}), false);
  });

  it("forwards an explicitly configured host", () => {
    const config = readWeaverseConfig({
      WEAVERSE_PROJECT_ID: "project-123",
      WEAVERSE_HOST: "https://staging.example",
    });

    assert.equal(config?.weaverseHost, "https://staging.example");
  });

  it("suppresses the public storefront token on the resolved config", () => {
    const config = readWeaverseConfig(FULL_ENV);

    assert.equal(config?.sdkEnv.PUBLIC_STOREFRONT_API_TOKEN, "");
  });
});
