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
 * matrices, and it is what keeps `PUBLIC_STOREFRONT_API_TOKEN` out of the
 * SDK's browser-visible `publicEnv` payload.
 */

import { ShopifyConfigurationError } from "@/lib/storefront/shopify/errors";

export const WEAVERSE_PROJECT_ID_ENV_KEY = "WEAVERSE_PROJECT_ID";
export const WEAVERSE_HOST_ENV_KEY = "WEAVERSE_HOST";
export const WEAVERSE_API_KEY_ENV_KEY = "WEAVERSE_API_KEY";
export const WEAVERSE_PUBLIC_API_BASE_ENV_KEY = "WEAVERSE_PUBLIC_API_BASE";
export const STORE_DOMAIN_ENV_KEY = "PUBLIC_STORE_DOMAIN";
export const PUBLIC_STOREFRONT_TOKEN_ENV_KEY = "PUBLIC_STOREFRONT_API_TOKEN";

/**
 * Every key `@weaverse/next` reads from the environment.
 *
 * If the SDK gains a new one, this list goes stale silently, so
 * `tests/weaverse-env.test.ts` asserts the set against the installed package.
 */
export const SDK_ENV_KEYS = [
  WEAVERSE_PROJECT_ID_ENV_KEY,
  WEAVERSE_HOST_ENV_KEY,
  WEAVERSE_API_KEY_ENV_KEY,
  WEAVERSE_PUBLIC_API_BASE_ENV_KEY,
  STORE_DOMAIN_ENV_KEY,
  PUBLIC_STOREFRONT_TOKEN_ENV_KEY,
] as const;

/**
 * Keys deliberately blanked before the SDK sees them.
 *
 * `PUBLIC_STOREFRONT_API_TOKEN` lands in the SDK's `publicEnv`, which reaches
 * the browser. Public-token browser use is outside the current approval, so it
 * is suppressed rather than forwarded.
 *
 * `WEAVERSE_API_KEY` is not a storefront runtime input at all — it belongs to
 * local admin-data tooling — so the running theme never forwards it.
 *
 * `WEAVERSE_PUBLIC_API_BASE` is a self-hosted override Forward does not use;
 * blanking it keeps the API base derived from the resolved host alone.
 */
export const SUPPRESSED_ENV_KEYS = [
  PUBLIC_STOREFRONT_TOKEN_ENV_KEY,
  WEAVERSE_API_KEY_ENV_KEY,
  WEAVERSE_PUBLIC_API_BASE_ENV_KEY,
] as const;

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

/** `true` when the deployment has Weaverse composition configured. */
export function isWeaverseEnabled(source: EnvSource): boolean {
  return readWeaverseConfig(source) !== null;
}
