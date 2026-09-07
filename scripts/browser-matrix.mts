/**
 * One permanent browser verification matrix
 * (`bun run test:browser:{static,live-account-disabled,live-account-enabled}`).
 *
 * Each matrix builds its own fresh production bundle into an isolated build
 * directory, starts its own `next start` on its own port through Playwright's
 * `webServer` (`reuseExistingServer: false`), runs the desktop, short-desktop,
 * and true-mobile projects against it, and shuts the server down cleanly.
 *
 * The matrix is established from a script-owned child environment. A missing
 * required live credential is a hard failure, never a skip, and no credential
 * value is ever read or printed here.
 */

import { readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import process from "node:process";

import {
  buildChildEnvironment,
  parseMatrixArgument,
  runInChildEnvironment,
} from "./env-matrix.mts";

const MATRIX_PORTS: Readonly<Record<string, string>> = {
  static: "4991",
  "live-account-disabled": "4992",
  "live-account-enabled": "4993",
};

const matrix = parseMatrixArgument(process.argv[2]);
const distDir = `.forward-browser/${matrix}/next`;
const port = MATRIX_PORTS[matrix] ?? "4991";

const child = buildChildEnvironment(matrix, {
  FORWARD_MATRIX: matrix,
  FORWARD_DIST_DIR: distDir,
  FORWARD_BROWSER_PORT: port,
  NEXT_TELEMETRY_DISABLED: "1",
});

console.log(`test:browser:${matrix} — ${child.description}`);

const nextBin = "node_modules/next/dist/bin/next";
const playwrightBin = "node_modules/@playwright/test/cli.js";

/* `next build` appends its own `distDir` type globs to `tsconfig.json` and
 * rewrites ignored `next-env.d.ts` imports. The matrix build directories are
 * throwaway, so both files are restored rather than left carrying generated
 * paths. */
const tsconfig = await readFile("tsconfig.json", "utf8");
const nextEnv = await readFile("next-env.d.ts", "utf8").catch(
  (error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return null;
    throw error;
  },
);

async function restoreGeneratedConfig(): Promise<void> {
  await writeFile("tsconfig.json", tsconfig);
  if (nextEnv === null) {
    await rm("next-env.d.ts", { force: true });
  } else {
    await writeFile("next-env.d.ts", nextEnv);
  }
}

/** An occupied port must fail the matrix, never verify somebody else's server. */
async function assertPortAvailable(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const probe = createServer();
    probe.once("error", (error) =>
      reject(
        new Error(
          `127.0.0.1:${port} is unavailable; refusing to verify another server (${String(error)})`,
        ),
      ),
    );
    probe.listen(
      { host: "127.0.0.1", port: Number(port), exclusive: true },
      () => probe.close((error) => (error ? reject(error) : resolve())),
    );
  });
}

try {
  await assertPortAvailable();
  await runInChildEnvironment(child, "node", [
    "-e",
    `require('node:fs').rmSync(${JSON.stringify(distDir)},{recursive:true,force:true})`,
  ]);
  await runInChildEnvironment(child, "node", [nextBin, "build"]);
  await restoreGeneratedConfig();
  await runInChildEnvironment(child, "node", [
    playwrightBin,
    "test",
    "--config",
    "tests/browser/playwright.config.ts",
  ]);
} catch (error) {
  await restoreGeneratedConfig();
  console.error(`test:browser:${matrix}: ${(error as Error).message}`);
  process.exit(1);
}

console.log(
  `test:browser:${matrix}: desktop, short desktop, and true mobile passed against a fresh production build on port ${port}; server stopped.`,
);
