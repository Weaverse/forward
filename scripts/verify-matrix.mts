/**
 * Build/route/smoke verification per credential matrix
 * (`bun run verify:static`, `bun run verify:live`).
 *
 * `verify:static` strips every Shopify catalog, cart, and account credential
 * in a script-owned child environment and proves the storefront still builds
 * and serves its full route contract from the deterministic static catalog.
 *
 * `verify:live` requires the complete live catalog configuration, runs the
 * read-only Shopify catalog verification, and then exercises the route and
 * HTTP smoke contract twice: once with accounts explicitly disabled and once
 * with the complete account configuration. A missing required input fails the
 * gate; it is never skipped. No credential value is read or printed.
 */

import process from "node:process";

import {
  buildChildEnvironment,
  type ChildEnvironment,
  runInChildEnvironment,
} from "./env-matrix.mts";

const NEXT_BIN = "node_modules/next/dist/bin/next";
const mode = process.argv[2];

async function buildAndVerify(child: ChildEnvironment): Promise<void> {
  console.log(`\n=== ${child.matrix} — ${child.description} ===`);
  await runInChildEnvironment(child, "node", [
    "-e",
    "require('node:fs').rmSync('.next',{recursive:true,force:true})",
  ]);
  await runInChildEnvironment(child, "node", [NEXT_BIN, "build"]);
  await runInChildEnvironment(child, "node", ["scripts/check-routes.mts"]);
  await runInChildEnvironment(child, "node", ["scripts/smoke-routes.mts"]);
}

try {
  if (mode === "static") {
    await buildAndVerify(
      buildChildEnvironment("static", { NEXT_TELEMETRY_DISABLED: "1" }),
    );
    console.log(
      "\nverify:static: the credential-free storefront built and served its full route contract.",
    );
  } else if (mode === "live") {
    const disabled = buildChildEnvironment("live-account-disabled", {
      NEXT_TELEMETRY_DISABLED: "1",
    });
    const enabled = buildChildEnvironment("live-account-enabled", {
      NEXT_TELEMETRY_DISABLED: "1",
    });

    await runInChildEnvironment(disabled, "bun", [
      "scripts/verify-shopify.mts",
    ]);
    await buildAndVerify(disabled);
    await buildAndVerify(enabled);
    console.log(
      "\nverify:live: live catalog read-only verification passed, and both the account-disabled and account-enabled configurations built and served their route contracts.",
    );
  } else {
    throw new Error(
      `unknown verify mode ${JSON.stringify(mode ?? "")}; expected static or live`,
    );
  }
} catch (error) {
  console.error(`verify:${mode ?? "?"}: ${(error as Error).message}`);
  process.exit(1);
}
