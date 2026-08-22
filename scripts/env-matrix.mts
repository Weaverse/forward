/**
 * Credential matrices for the verification and browser gates.
 *
 * Every gate runs against a *script-owned child environment*, never the
 * ambient shell. Three matrices exist and each one is explicit:
 *
 * - `static` — every Shopify catalog, cart, and account credential is set to
 *   the empty string, which both fails the storefront's own `readKey` check
 *   and stops `@next/env` re-injecting a repository `.env` value into the
 *   child. This is explicit-empty, not "hope nothing is set".
 * - `live-account-disabled` — the live catalog/cart credentials are required,
 *   and every account credential is explicitly emptied.
 * - `live-account-enabled` — the complete live catalog/cart *and* account
 *   configuration is required.
 *
 * A missing required input is a hard failure naming only the environment key.
 * Nothing here ever reads, prints, logs, or compares a credential value.
 */

import process from "node:process";
import nextEnv from "@next/env";

export type MatrixId =
  | "static"
  | "live-account-disabled"
  | "live-account-enabled";

/** Selects Shopify catalog/cart mode; both are required for live matrices. */
export const CATALOG_CART_REQUIRED_KEYS = [
  "PUBLIC_STORE_DOMAIN",
  "PRIVATE_STOREFRONT_API_TOKEN",
] as const;

/** Catalog/cart inputs that are optional live but must be empty in static. */
export const CATALOG_CART_OPTIONAL_KEYS = [
  "PUBLIC_STOREFRONT_API_TOKEN",
  "PUBLIC_STOREFRONT_ID",
  "PUBLIC_MAIN_MENU_HANDLE",
] as const;

/** The all-or-none Customer Account tuple. */
export const ACCOUNT_KEYS = [
  "SHOP_ID",
  "PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID",
  "CUSTOMER_ACCOUNT_SESSION_SECRET",
  "PUBLIC_STOREFRONT_ORIGIN",
] as const;

const ALL_CREDENTIAL_KEYS = [
  ...CATALOG_CART_REQUIRED_KEYS,
  ...CATALOG_CART_OPTIONAL_KEYS,
  ...ACCOUNT_KEYS,
] as const;

let repositoryEnvLoaded = false;

/** Loads the repository dotenv files exactly as `next build`/`next start` do. */
function loadRepositoryEnv(): void {
  if (repositoryEnvLoaded) return;
  nextEnv.loadEnvConfig(process.cwd());
  repositoryEnvLoaded = true;
}

/** Presence only — the value is never returned, compared, or printed. */
function isPresent(key: string): boolean {
  const raw = process.env[key];
  return typeof raw === "string" && raw.trim().length > 0;
}

function requirePresent(label: string, keys: readonly string[]): void {
  const missing = keys.filter((key) => !isPresent(key));
  if (missing.length === 0) return;
  throw new Error(
    `${label}: required environment ${
      missing.length === 1 ? "key" : "keys"
    } not configured: ${missing.join(", ")}. This matrix fails rather than silently falling back to another mode.`,
  );
}

export interface ChildEnvironment {
  matrix: MatrixId;
  /** Human-readable matrix description for gate output. */
  description: string;
  env: NodeJS.ProcessEnv;
  accountEnabled: boolean;
  shopifyMode: boolean;
}

const DESCRIPTIONS: Readonly<Record<MatrixId, string>> = {
  static: "explicit-empty static catalog/cart with accounts disabled",
  "live-account-disabled": "live Shopify catalog/cart with accounts disabled",
  "live-account-enabled":
    "complete live Shopify catalog/cart with accounts enabled",
};

/**
 * Builds the controlled child environment for one matrix.
 *
 * `extra` is for gate-owned, non-credential variables such as the build
 * directory or the browser port.
 */
export function buildChildEnvironment(
  matrix: MatrixId,
  extra: Readonly<Record<string, string>> = {},
): ChildEnvironment {
  loadRepositoryEnv();
  const env: NodeJS.ProcessEnv = { ...process.env, ...extra };

  if (matrix === "static") {
    for (const key of ALL_CREDENTIAL_KEYS) {
      env[key] = "";
    }
    return {
      matrix,
      description: DESCRIPTIONS[matrix],
      env,
      accountEnabled: false,
      shopifyMode: false,
    };
  }

  requirePresent(matrix, CATALOG_CART_REQUIRED_KEYS);

  if (matrix === "live-account-disabled") {
    for (const key of ACCOUNT_KEYS) {
      env[key] = "";
    }
    return {
      matrix,
      description: DESCRIPTIONS[matrix],
      env,
      accountEnabled: false,
      shopifyMode: true,
    };
  }

  requirePresent(matrix, ACCOUNT_KEYS);
  return {
    matrix,
    description: DESCRIPTIONS[matrix],
    env,
    accountEnabled: true,
    shopifyMode: true,
  };
}

export function parseMatrixArgument(value: string | undefined): MatrixId {
  if (
    value === "static" ||
    value === "live-account-disabled" ||
    value === "live-account-enabled"
  ) {
    return value;
  }
  throw new Error(
    `unknown matrix ${JSON.stringify(value ?? "")}; expected static, live-account-disabled, or live-account-enabled`,
  );
}

/**
 * Runs one gate step inside a matrix's child environment and fails the whole
 * gate on a non-zero exit. Child stdio is inherited so the underlying gate's
 * own output is the record; this wrapper adds no credential-bearing output.
 */
export async function runInChildEnvironment(
  child: ChildEnvironment,
  command: string,
  args: readonly string[],
  extraEnv: Readonly<Record<string, string>> = {},
): Promise<void> {
  const { spawn } = await import("node:child_process");
  const label = `${child.matrix}: ${command} ${args.join(" ")}`.trim();
  console.log(`▸ ${label}`);
  const code = await new Promise<number>((resolve, reject) => {
    const proc = spawn(command, [...args], {
      stdio: "inherit",
      env: { ...child.env, ...extraEnv },
    });
    proc.on("error", reject);
    proc.on("exit", (exitCode, signal) =>
      resolve(exitCode ?? (signal === null ? 1 : 1)),
    );
  });
  if (code !== 0) {
    throw new Error(`${label} failed with exit code ${code}`);
  }
}
