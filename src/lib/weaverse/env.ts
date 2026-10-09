/**
 * Server-only Weaverse configuration boundary.
 *
 * Mode selection mirrors the storefront and account boundaries and fails
 * closed:
 *
 * - `WEAVERSE_PROJECT_ID` absent -> Weaverse composition is disabled (`null`);
 * - present -> Weaverse mode.
 *
 * ## Why the env object is built explicitly
 *
 * The SDK resolves configuration with `readEnv(env, key)`, which falls back to
 * `process.env[key]` whenever the key is *missing* from the object it was
 * handed. Passing a short allowlist therefore blocks nothing — the SDK reads
 * straight past it. Only a key that is present with a defined value
 * short-circuits that fallback.
 *
 * So this module names every key the SDK reads and supplies each one
 * deliberately: the values Weaverse legitimately needs, and an explicit empty
 * string for the ones it must not see. That is the same explicit-empty
 * discipline `scripts/env-matrix.mts` already uses for the credential
 * matrices.
 *
 * `PUBLIC_STOREFRONT_API_TOKEN` is forwarded, and so reaches the browser in the
 * SDK's `publicEnv` payload. That is deliberate: it is Shopify's public
 * Storefront token, made to be shipped to browsers, and Studio needs it to
 * resolve the store's default product, collection and page for the page
 * selector. The private token never enters this object.
 */

import { ShopifyConfigurationError } from "@/lib/storefront/shopify/errors";

export const WEAVERSE_PROJECT_ID_ENV_KEY = "WEAVERSE_PROJECT_ID";
export const WEAVERSE_HOST_ENV_KEY = "WEAVERSE_HOST";
export const WEAVERSE_PUBLIC_API_BASE_ENV_KEY = "WEAVERSE_PUBLIC_API_BASE";
export const STORE_DOMAIN_ENV_KEY = "PUBLIC_STORE_DOMAIN";
export const PUBLIC_STOREFRONT_TOKEN_ENV_KEY = "PUBLIC_STOREFRONT_API_TOKEN";

/**
 * Every key `@weaverse/next` reads from the environment.
 *
 * The list goes stale silently in both directions — a key the SDK gains falls
 * through to `process.env`, and a key it drops leaves a value here that means
 * nothing — so `tests/weaverse-env.test.ts` asserts the set against the
 * installed package both ways.
 */
export const SDK_ENV_KEYS = [
  WEAVERSE_PROJECT_ID_ENV_KEY,
  WEAVERSE_HOST_ENV_KEY,
  WEAVERSE_PUBLIC_API_BASE_ENV_KEY,
  STORE_DOMAIN_ENV_KEY,
  PUBLIC_STOREFRONT_TOKEN_ENV_KEY,
] as const;

/**
 * Keys deliberately blanked before the SDK sees them.
 *
 * `WEAVERSE_PUBLIC_API_BASE` is a self-hosted override Forward does not use;
 * blanking it keeps the API base derived from the resolved host alone.
 */
export const SUPPRESSED_ENV_KEYS = [WEAVERSE_PUBLIC_API_BASE_ENV_KEY] as const;

export type EnvSource = Readonly<Record<string, string | undefined>>;

export interface WeaverseConfig {
  projectId: string;
  /** Omitted unless explicitly configured, so the SDK applies its default. */
  weaverseHost?: string;
  /** The exact environment handed to the SDK. Never `process.env`. */
  sdkEnv: Readonly<Record<string, string>>;
}

function readKey(source: EnvSource, key: string): string | undefined {
  const raw = source[key];
  if (typeof raw !== "string") {
    return undefined;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function assertServerOnly(): void {
  if (typeof document !== "undefined") {
    throw new ShopifyConfigurationError(
      "The Weaverse configuration is server-only and must never be read from browser code.",
    );
  }
}

/**
 * Builds the exact environment object handed to the SDK.
 *
 * Every key the SDK reads is present, so none of them can fall through to
 * `process.env`. Suppressed keys are present as empty strings.
 */
export function buildSdkEnv(
  source: EnvSource,
): Readonly<Record<string, string>> {
  const suppressed = new Set<string>(SUPPRESSED_ENV_KEYS);
  const env: Record<string, string> = {};
  for (const key of SDK_ENV_KEYS) {
    env[key] = suppressed.has(key) ? "" : (readKey(source, key) ?? "");
  }
  return Object.freeze(env);
}

/**
 * Resolves Weaverse configuration, or `null` when composition is disabled.
 *
 * A placeholder project id is treated as absent so a half-filled `.env` cannot
 * reach the Weaverse API with a sentinel value.
 */
export function readWeaverseConfig(source: EnvSource): WeaverseConfig | null {
  assertServerOnly();

  const projectId = readKey(source, WEAVERSE_PROJECT_ID_ENV_KEY);
  if (projectId === undefined || projectId === "REPLACE_ME") {
    return null;
  }

  const weaverseHost = readKey(source, WEAVERSE_HOST_ENV_KEY);
  return {
    projectId,
    ...(weaverseHost === undefined ? {} : { weaverseHost }),
    sdkEnv: buildSdkEnv(source),
  };
}

/**
 * The `publicEnv` the root provider hands Studio, which resolves the store's
 * default product, collection and page with it.
 *
 * The SDK attaches `publicEnv` to the theme settings only in design mode, which
 * it reads from `?isDesignMode=true`. Next gives a layout no search params, so
 * the root layout's response never carries it; the layout builds it here
 * instead. Both values are made for the browser.
 */
export function weaversePublicEnv(
  source: EnvSource,
): Record<string, string> | undefined {
  const env = readWeaverseConfig(source)?.sdkEnv;
  if (env === undefined) {
    return undefined;
  }
  return {
    [STORE_DOMAIN_ENV_KEY]: env[STORE_DOMAIN_ENV_KEY] ?? "",
    [PUBLIC_STOREFRONT_TOKEN_ENV_KEY]:
      env[PUBLIC_STOREFRONT_TOKEN_ENV_KEY] ?? "",
  };
}

/** `true` when the deployment has Weaverse composition configured. */
export function isWeaverseEnabled(source: EnvSource): boolean {
  return readWeaverseConfig(source) !== null;
}
