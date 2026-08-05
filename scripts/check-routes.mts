/**
 * Static route-contract gate (`bun run check:routes`).
 *
 * Validates actual Next.js build output, not source filenames:
 * - `.next/app-path-routes-manifest.json` must contain every canonical,
 *   account-protocol, and resource route pattern from the contract.
 * - `.next/routes-manifest.json` must contain every compatibility redirect
 *   with permanent-redirect semantics.
 *
 * Run `bun run build` first; this script never starts a server.
 */

import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  findMissingRoutePatterns,
  normalizeAppRoutePattern,
  PERMANENT_REDIRECT_STATUS,
  REDIRECT_CONTRACT,
  ROUTE_CONTRACT,
} from "../src/lib/routes/route-contract.ts";

const BUILD_DIR = path.join(process.cwd(), ".next");

try {
  await access(path.join(BUILD_DIR, "BUILD_ID"));
} catch {
  console.error(
    "check:routes: no production build found — run `bun run build` first.",
  );
  process.exit(1);
}

interface ManifestRedirect {
  source: string;
  destination: string;
  statusCode?: number;
  permanent?: boolean;
  internal?: boolean;
}

async function readJson<T>(relativePath: string): Promise<T> {
  const filePath = path.join(BUILD_DIR, relativePath);
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch (error) {
    console.error(
      `check:routes: cannot read ${filePath} — run \`bun run build\` first.`,
    );
    throw error;
  }
}

const appPathsManifest = await readJson<Record<string, string>>(
  "app-path-routes-manifest.json",
);
const routesManifest = await readJson<{ redirects?: ManifestRedirect[] }>(
  "routes-manifest.json",
);

const actualPatterns = Object.keys(appPathsManifest)
  .map(normalizeAppRoutePattern)
  .filter((pattern): pattern is string => pattern !== null);

const missingRoutes = findMissingRoutePatterns(actualPatterns);

const buildRedirects = routesManifest.redirects ?? [];
const missingRedirects = REDIRECT_CONTRACT.filter((expected) => {
  return !buildRedirects.some(
    (actual) =>
      actual.source === expected.source &&
      actual.destination === expected.destination &&
      actual.internal !== true &&
      (actual.statusCode === PERMANENT_REDIRECT_STATUS ||
        actual.permanent === true),
  );
});

let failed = false;

if (missingRoutes.length > 0) {
  failed = true;
  console.error(
    "check:routes: required route patterns missing from build output:",
  );
  for (const pattern of missingRoutes) {
    console.error(`  ✗ ${pattern}`);
  }
}

if (missingRedirects.length > 0) {
  failed = true;
  console.error(
    "check:routes: required permanent redirects missing from routes manifest:",
  );
  for (const redirect of missingRedirects) {
    console.error(`  ✗ ${redirect.source} → ${redirect.destination}`);
  }
}

if (failed) {
  process.exit(1);
}

console.log(
  `check:routes: ${ROUTE_CONTRACT.length} route patterns and ${REDIRECT_CONTRACT.length} permanent redirects verified against build output.`,
);
