/**
 * Permanent browser verification harness.
 *
 * This is where the contracts JSDOM/Happy DOM cannot honestly prove live:
 * layout and responsive geometry, overflow, pseudo-element decoration, the
 * `inert` background, focus geometry, reduced motion, real navigation reuse,
 * and browser console/network health.
 *
 * Every run is driven by `scripts/browser-matrix.mts`, which supplies the
 * credential matrix, an isolated build directory, and a dedicated port. The
 * server is always started here (`reuseExistingServer: false`) so a matrix can
 * never be verified against somebody else's server, and Playwright's default
 * ephemeral browser profile keeps each run's storage state isolated.
 */

import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const SPEC_DIR = path.dirname(fileURLToPath(import.meta.url));

const MATRIX = process.env.FORWARD_MATRIX ?? "static";
const PORT = Number(process.env.FORWARD_BROWSER_PORT ?? "4991");
const OUTPUT_ROOT = path.join(
  process.cwd(),
  ".forward-browser",
  MATRIX,
  "playwright",
);

export default defineConfig({
  testDir: SPEC_DIR,
  testMatch: /.*\.pw\.ts$/,
  outputDir: path.join(OUTPUT_ROOT, "artifacts"),
  fullyParallel: false,
  workers: 1,
  forbidOnly: true,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: path.join(OUTPUT_ROOT, "report") }],
  ],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "short-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 400 },
      },
    },
    {
      /* A real touch/mobile context, not a narrow desktop window. */
      name: "mobile",
      use: {
        ...devices["iPhone 13"],
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port ${PORT}`,
    cwd: process.cwd(),
    port: PORT,
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
