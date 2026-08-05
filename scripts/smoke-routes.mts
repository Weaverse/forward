/**
 * Production HTTP route smoke (`npm run smoke:routes`).
 *
 * Starts `next start` against the existing production build, verifies every
 * contract smoke path and compatibility redirect over real HTTP, then shuts
 * the entire server process group down. Fails before starting when the smoke
 * port is already occupied, so the gate can never pass against another server.
 */

import { spawn, type ChildProcess } from "node:child_process";
import { access } from "node:fs/promises";
import { connect, createServer } from "node:net";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

import {
  NOT_FOUND_SMOKE,
  PERMANENT_REDIRECT_STATUS,
  REDIRECT_CONTRACT,
  ROUTE_CONTRACT,
  type RouteSmoke,
} from "../src/lib/routes/route-contract.ts";

const HOST = "127.0.0.1";
const PORT = parsePort(process.env.SMOKE_PORT ?? "4973");
const BASE_URL = `http://${HOST}:${PORT}`;
const READY_TIMEOUT_MS = 60_000;
const STOP_TIMEOUT_MS = 5_000;
const NEXT_BIN = path.join(
  process.cwd(),
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);

function parsePort(rawPort: string): number {
  const port = Number(rawPort);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(
      `smoke:routes: invalid SMOKE_PORT ${JSON.stringify(rawPort)}`,
    );
  }
  return port;
}

try {
  await access(path.join(process.cwd(), ".next", "BUILD_ID"));
} catch {
  console.error(
    "smoke:routes: no production build found — run `npm run build` first.",
  );
  process.exit(1);
}

/** Bind and release the target port. An occupied port must fail, never false-pass. */
async function assertPortAvailable(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const probe = createServer();
    probe.once("error", (error) => {
      reject(
        new Error(
          `smoke:routes: ${HOST}:${PORT} is unavailable; refusing to test another server (${String(error)})`,
        ),
      );
    });
    probe.listen({ host: HOST, port: PORT, exclusive: true }, () => {
      probe.close((error) => (error ? reject(error) : resolve()));
    });
  });
}

function startServer(): ChildProcess {
  const child = spawn(
    process.execPath,
    [NEXT_BIN, "start", "--hostname", HOST, "--port", String(PORT)],
    { stdio: ["ignore", "pipe", "pipe"], detached: true },
  );
  child.stdout?.on("data", () => {});
  child.stderr?.on("data", (chunk: Buffer) => {
    process.stderr.write(`[next start] ${chunk.toString()}`);
  });
  return child;
}

async function isPortOpen(): Promise<boolean> {
  return await new Promise<boolean>((resolve) => {
    const socket = connect({ host: HOST, port: PORT });
    socket.setTimeout(300);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    const closeAsUnavailable = () => {
      socket.destroy();
      resolve(false);
    };
    socket.once("error", closeAsUnavailable);
    socket.once("timeout", closeAsUnavailable);
  });
}

async function waitForPortToClose(timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!(await isPortOpen())) {
      return true;
    }
    await delay(100);
  }
  return !(await isPortOpen());
}

function signalServerGroup(child: ChildProcess, signal: NodeJS.Signals): void {
  if (child.pid === undefined) {
    return;
  }
  try {
    process.kill(-child.pid, signal);
  } catch {
    // Fallback for platforms without POSIX process groups or an exited leader.
    try {
      child.kill(signal);
    } catch {
      // The process may already be gone; the port-close check is authoritative.
    }
  }
}

async function stopServer(child: ChildProcess): Promise<void> {
  signalServerGroup(child, "SIGTERM");
  if (await waitForPortToClose(STOP_TIMEOUT_MS)) {
    return;
  }

  signalServerGroup(child, "SIGKILL");
  if (!(await waitForPortToClose(STOP_TIMEOUT_MS))) {
    throw new Error(
      `smoke:routes: server still listens on ${HOST}:${PORT} after SIGKILL`,
    );
  }
}

async function waitUntilReady(child: ChildProcess): Promise<void> {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(
        `server exited before readiness with code ${child.exitCode}`,
      );
    }
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

async function checkStatus(smoke: RouteSmoke): Promise<void> {
  checksRun += 1;
  const response = await fetch(`${BASE_URL}${smoke.path}`, {
    redirect: "manual",
  });
  await response.arrayBuffer();

  if (response.status !== smoke.expectedStatus) {
    failures.push({
      path: smoke.path,
      expected: `status ${smoke.expectedStatus}`,
      actual: `status ${response.status}`,
    });
  }

  if (smoke.expectedContentType !== undefined) {
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.toLowerCase().startsWith(smoke.expectedContentType)) {
      failures.push({
        path: smoke.path,
        expected: `content-type ${smoke.expectedContentType}`,
        actual: `content-type ${contentType || "(missing)"}`,
      });
    }
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
  const normalizedLocation = location?.startsWith(BASE_URL)
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

try {
  await assertPortAvailable();
} catch (error) {
  console.error(String(error));
  process.exit(1);
}

const server = startServer();

try {
  await waitUntilReady(server);

  for (const route of ROUTE_CONTRACT) {
    await checkStatus(route.smoke);
  }
  await checkStatus(NOT_FOUND_SMOKE);
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
