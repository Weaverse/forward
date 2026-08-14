/**
 * Production HTTP route smoke (`bun run smoke:routes`).
 *
 * Starts `next start` against the existing production build, verifies every
 * contract smoke path and compatibility redirect over real HTTP, then shuts
 * the entire server process group down. Fails before starting when the smoke
 * port is already occupied, so the gate can never pass against another server.
 */

import { type ChildProcess, spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { connect, createServer } from "node:net";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import nextEnv from "@next/env";

import {
  ACCOUNT_PROTOCOL_SMOKES,
  DYNAMIC_NOT_FOUND_SMOKES,
  NOT_FOUND_SMOKE,
  PERMANENT_REDIRECT_STATUS,
  REDIRECT_CONTRACT,
  ROUTE_CONTRACT,
  type RouteSmoke,
} from "../src/lib/routes/route-contract.ts";

const { loadEnvConfig } = nextEnv;
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

// Match `next start`: explicit process values win, otherwise load the same
// repository dotenv files. This keeps normal and explicit-empty smoke modes
// aligned with the server rather than guessing from the parent shell.
loadEnvConfig(process.cwd());

const ACCOUNT_ENV_KEYS = [
  "SHOP_ID",
  "PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID",
  "CUSTOMER_ACCOUNT_SESSION_SECRET",
  "PUBLIC_STOREFRONT_ORIGIN",
] as const;
const accountValues = ACCOUNT_ENV_KEYS.map(
  (key) => process.env[key]?.trim() ?? "",
);
if (accountValues.some(Boolean) && !accountValues.every(Boolean)) {
  throw new Error(
    "smoke:routes: Customer Account environment is partially configured",
  );
}
const CUSTOMER_ACCOUNT_MODE = accountValues.every(Boolean);

function modeAwareSmoke(route: (typeof ROUTE_CONTRACT)[number]): RouteSmoke {
  if (CUSTOMER_ACCOUNT_MODE && route.category === "account") {
    if (route.pattern === "/account/status") {
      return {
        ...route.smoke,
        expectedStatus: 200,
        expectedContentType: "application/json",
      };
    }
    return {
      ...route.smoke,
      expectedStatus: 200,
      expectedContentType: "text/html",
    };
  }
  return route.smoke;
}

function modeAwareAccountProtocolSmoke(smoke: RouteSmoke): RouteSmoke {
  if (!CUSTOMER_ACCOUNT_MODE) {
    return smoke;
  }
  if (smoke.path === "/account/logout") {
    return {
      ...smoke,
      expectedStatus: 405,
      expectedContentType: "text/plain",
    };
  }
  return { path: smoke.path, expectedStatus: 303 };
}

function modeAwareDynamicNotFoundSmoke(smoke: RouteSmoke): RouteSmoke {
  if (
    CUSTOMER_ACCOUNT_MODE &&
    smoke.path === "/account/orders/__forward-missing__"
  ) {
    return { ...smoke, expectedStatus: 200 };
  }
  return smoke;
}

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
    "smoke:routes: no production build found — run `bun run build` first.",
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
  const body = await response.text();

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

  if (
    CUSTOMER_ACCOUNT_MODE &&
    smoke.path === "/account/logout" &&
    smoke.expectedStatus === 405 &&
    response.headers.get("allow")?.toUpperCase() !== "POST"
  ) {
    failures.push({
      path: smoke.path,
      expected: "Allow: POST",
      actual: `Allow: ${response.headers.get("allow") ?? "(missing)"}`,
    });
  }

  if (
    CUSTOMER_ACCOUNT_MODE &&
    smoke.path.startsWith("/account") &&
    smoke.expectedStatus === 200
  ) {
    const cacheControl = response.headers.get("cache-control");
    if (cacheControl !== "private, no-store, max-age=0, must-revalidate") {
      failures.push({
        path: smoke.path,
        expected: "personalized private/no-store Cache-Control",
        actual: `Cache-Control: ${cacheControl ?? "(missing)"}`,
      });
    }
    for (const headerName of ["cdn-cache-control", "surrogate-control"]) {
      const headerValue = response.headers.get(headerName);
      if (headerValue !== null) {
        failures.push({
          path: smoke.path,
          expected: `no ${headerName}`,
          actual: `${headerName}: ${headerValue}`,
        });
      }
    }
  }

  if (CUSTOMER_ACCOUNT_MODE && smoke.path === "/account/login") {
    const setCookie = response.headers.get("set-cookie") ?? "";
    for (const attribute of ["HttpOnly", "Secure", "SameSite=Lax"]) {
      if (!setCookie.toLowerCase().includes(attribute.toLowerCase())) {
        failures.push({
          path: smoke.path,
          expected: `session cookie with ${attribute}`,
          actual: "required secure cookie attribute missing",
        });
      }
    }
  }

  const rendersAccountLink = body.includes('href="/account"');
  if (!CUSTOMER_ACCOUNT_MODE && rendersAccountLink) {
    failures.push({
      path: smoke.path,
      expected: "no disabled Account affordance",
      actual: "Account affordance rendered",
    });
  }

  if (smoke.path === "/" && CUSTOMER_ACCOUNT_MODE && !rendersAccountLink) {
    failures.push({
      path: smoke.path,
      expected: "configured Account navigation",
      actual: "Account navigation missing",
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
    await checkStatus(modeAwareSmoke(route));
  }
  await checkStatus(NOT_FOUND_SMOKE);
  for (const smoke of DYNAMIC_NOT_FOUND_SMOKES) {
    await checkStatus(modeAwareDynamicNotFoundSmoke(smoke));
  }
  for (const smoke of ACCOUNT_PROTOCOL_SMOKES) {
    await checkStatus(modeAwareAccountProtocolSmoke(smoke));
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
