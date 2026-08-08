/**
 * Server-only environment boundary for the Shopify catalog adapter.
 *
 * Selection is explicit and fails closed:
 *
 * - no Shopify environment at all -> static catalog (the deterministic default
 *   used by tests and by this worktree);
 * - both required keys present -> Shopify catalog mode;
 * - a partial configuration -> `ShopifyConfigurationError` naming only the
 *   missing keys.
 *
 * `PUBLIC_STOREFRONT_API_TOKEN` and `PUBLIC_STOREFRONT_ID` are intentionally
 * not read here. Catalog reads are server-owned and use the private token with
 * `private_no_buyer_context`; the public token stays reserved for a deliberate
 * future client/Studio/ShopifyScripts slice.
 */

import { ShopifyConfigurationError } from "./errors";

export const STORE_DOMAIN_ENV_KEY = "PUBLIC_STORE_DOMAIN";
export const PRIVATE_STOREFRONT_TOKEN_ENV_KEY = "PRIVATE_STOREFRONT_API_TOKEN";
export const MAIN_MENU_HANDLE_ENV_KEY = "PUBLIC_MAIN_MENU_HANDLE";
export const DEFAULT_MAIN_MENU_HANDLE = "main-menu";

/** Every environment key that participates in catalog-mode selection. */
export const SHOPIFY_CATALOG_ENV_KEYS = [
  STORE_DOMAIN_ENV_KEY,
  PRIVATE_STOREFRONT_TOKEN_ENV_KEY,
] as const;

export type EnvSource = Readonly<Record<string, string | undefined>>;

export interface ShopifyCatalogConfig {
  storeDomain: string;
  privateStorefrontToken: string;
  mainMenuHandle: string;
}

const STORE_DOMAIN_PATTERN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;
const MENU_HANDLE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
      "The Shopify catalog configuration is server-only and must never be read from browser code.",
    );
  }
}

/**
 * Resolves the catalog configuration from an environment source.
 *
 * Returns `null` when no Shopify environment is present (static mode). Throws a
 * sanitized `ShopifyConfigurationError` for partial or malformed configuration.
 * The source is a parameter so selection stays injectable and tests never have
 * to mutate `process.env`.
 */
export function readShopifyCatalogConfig(
  source: EnvSource,
): ShopifyCatalogConfig | null {
  assertServerOnly();

  const storeDomain = readKey(source, STORE_DOMAIN_ENV_KEY);
  const privateStorefrontToken = readKey(
    source,
    PRIVATE_STOREFRONT_TOKEN_ENV_KEY,
  );

  if (storeDomain === undefined && privateStorefrontToken === undefined) {
    return null;
  }

  const missing = SHOPIFY_CATALOG_ENV_KEYS.filter(
    (key) => readKey(source, key) === undefined,
  );
  if (missing.length > 0) {
    throw new ShopifyConfigurationError(
      `Shopify catalog mode is partially configured. Missing required environment ${
        missing.length === 1 ? "key" : "keys"
      }: ${missing.join(", ")}. Set every key, or unset all of them to use the static catalog.`,
    );
  }

  if (storeDomain === undefined || privateStorefrontToken === undefined) {
    // Unreachable: `missing` above already covers both keys.
    throw new ShopifyConfigurationError(
      "Shopify catalog mode is partially configured.",
    );
  }

  if (!STORE_DOMAIN_PATTERN.test(storeDomain)) {
    throw new ShopifyConfigurationError(
      `${STORE_DOMAIN_ENV_KEY} must be a "<shop>.myshopify.com" domain.`,
    );
  }

  const mainMenuHandle =
    readKey(source, MAIN_MENU_HANDLE_ENV_KEY) ?? DEFAULT_MAIN_MENU_HANDLE;
  if (!MENU_HANDLE_PATTERN.test(mainMenuHandle)) {
    throw new ShopifyConfigurationError(
      `${MAIN_MENU_HANDLE_ENV_KEY} must be a lowercase Shopify resource handle.`,
    );
  }

  return { storeDomain, privateStorefrontToken, mainMenuHandle };
}
