/**
 * Production HTTP route smoke (`npm run smoke:routes`).
 *
 * Starts `next start` against the existing production build, verifies every
 * contract smoke path and compatibility redirect over real HTTP, then shuts
 * the server down. Fails fast if the build is missing. Non-interactive and
 * CI-safe: the server is always terminated, even on failure.
 */

import { spawn, type ChildProcess } from "node:child_process";
import { access } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

import {
  PERMANENT_REDIRECT_STATUS,
  REDIRECT_CONTRACT,
  ROUTE_CONTRACT,
} from "../src/lib/routes/route-contract.ts";

const PORT = Number(process.env.SMOKE_PORT ?? 4973);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const READY_TIMEOUT_MS = 60_000;
const NEXT_BIN = path.join(
  process.cwd(),
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);

try {
  await access(path.join(process.cwd(), ".next", "BUILD_ID"));
} catch {
  console.error("smoke:routes: no production build found — run `npm run build` first.");
  process.exit(1);
}

function startServer(): ChildProcess {
  const child = spawn(
    process.execPath,
    [NEXT_BIN, "start", "--hostname", "127.0.0.1", "--port", String(PORT)],
    { stdio: ["ignore", "pipe", "pipe"], detached: true },
  );
  child.stdout?.on("data", () => {});
  child.stderr?.on("data", (chunk: Buffer) => {
    process.stderr.write(`[next start] ${chunk.toString()}`);
  });
  return child;
}

async function stopServer(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null || child.pid === undefined) {
    return;
  }
  const exited = new Promise<void>((resolve) => {
    child.once("exit", () => resolve());
  });
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    child.kill("SIGTERM");
  }
  const result = await Promise.race([
    exited.then(() => "exited" as const),
    delay(5_000).then(() => "timeout" as const),
  ]);
  if (result === "timeout") {
    try {
      process.kill(-child.pid, "SIGKILL");
    } catch {
      child.kill("SIGKILL");
    }
    await exited;
  }
}

async function waitUntilReady(): Promise<void> {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      await fetch(`${BASE_URL}/`, { redirect: "manual" });
      return;
    } catch {
      await delay(300);
    }
  }
  throw new Error(`server did not become ready within ${READY_TIMEOUT_MS}ms`);
}

interface SmokeFailure {
  path: string;
  expected: string;
  actual: string;
}

const failures: SmokeFailure[] = [];
let checksRun = 0;

async function checkStatus(
  smokePath: string,
  expectedStatus: number,
): Promise<void> {
  checksRun += 1;
  const response = await fetch(`${BASE_URL}${smokePath}`, {
    redirect: "manual",
  });
  await response.arrayBuffer();
  if (response.status !== expectedStatus) {
    failures.push({
      path: smokePath,
      expected: `status ${expectedStatus}`,
      actual: `status ${response.status}`,
    });
  }
}

async function checkRedirect(
  smokePath: string,
  expectedLocation: string,
): Promise<void> {
  checksRun += 1;
  const response = await fetch(`${BASE_URL}${smokePath}`, {
    redirect: "manual",
  });
  await response.arrayBuffer();
  const location = response.headers.get("location");
  const normalizedLocation =
    location !== null && location.startsWith(BASE_URL)
      ? location.slice(BASE_URL.length)
      : location;
  if (
    response.status !== PERMANENT_REDIRECT_STATUS ||
    normalizedLocation !== expectedLocation
  ) {
    failures.push({
      path: smokePath,
      expected: `${PERMANENT_REDIRECT_STATUS} → ${expectedLocation}`,
      actual: `${response.status} → ${normalizedLocation ?? "(no location)"}`,
    });
  }
}

const server = startServer();

try {
  await waitUntilReady();

  for (const route of ROUTE_CONTRACT) {
    await checkStatus(route.smoke.path, route.smoke.expectedStatus);
  }
  for (const redirect of REDIRECT_CONTRACT) {
    await checkRedirect(redirect.smoke.path, redirect.smoke.expectedLocation);
  }
} catch (error) {
  console.error(`smoke:routes: ${String(error)}`);
  failures.push({
    path: "(startup)",
    expected: "server ready",
    actual: String(error),
  });
} finally {
  await stopServer(server);
}

if (failures.length > 0) {
  console.error("smoke:routes: failures:");
  for (const failure of failures) {
    console.error(
      `  ✗ ${failure.path} — expected ${failure.expected}, got ${failure.actual}`,
    );
  }
  process.exit(1);
}

console.log(
  `smoke:routes: ${checksRun} checks passed against the production server on port ${PORT}; server stopped.`,
);
