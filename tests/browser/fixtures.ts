/**
 * Shared browser-test fixtures.
 *
 * Every page is watched for console errors, uncaught page errors, failed
 * requests, and unexpected 4xx/5xx responses. A spec that genuinely expects
 * one (the 404 route) opts in explicitly with `test.use({ expectedProblem })`
 * rather than the harness silently tolerating it.
 */

import {
  test as base,
  expect,
  type Page,
  type Response as PlaywrightResponse,
} from "@playwright/test";

export type MatrixId =
  | "static"
  | "live-account-disabled"
  | "live-account-enabled";

export const MATRIX = (process.env.FORWARD_MATRIX ?? "static") as MatrixId;
export const ACCOUNT_ENABLED = MATRIX === "live-account-enabled";
export const SHOPIFY_MODE = MATRIX !== "static";

interface Options {
  expectedProblem: RegExp;
}

export const test = base.extend<Options & { runtimeHealth: null }>({
  expectedProblem: [/$a/, { option: true }],
  runtimeHealth: [
    async ({ page, expectedProblem }, use) => {
      const problems: string[] = [];
      const record = (problem: string) => {
        if (expectedProblem.test(problem)) return;
        problems.push(problem);
      };

      page.on("console", (message) => {
        if (message.type() === "error") {
          record(`console.error: ${message.text()}`);
        }
      });
      page.on("pageerror", (error) => {
        record(`pageerror: ${error.message}`);
      });
      page.on("requestfailed", (request) => {
        const failure = request.failure()?.errorText ?? "unknown";
        const url = new URL(request.url());
        if (failure === "net::ERR_ABORTED" && url.searchParams.has("_rsc")) {
          return;
        }
        record(`requestfailed: ${request.url()} (${failure})`);
      });
      page.on("response", (response) => {
        if (response.status() >= 400) {
          record(`http ${response.status()}: ${response.url()}`);
        }
      });

      await use(null);

      expect(
        problems,
        "the browser console and network must stay clean",
      ).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/**
 * Navigates to a normal route and waits for the streamed App Router loading
 * boundary to be replaced by the route content. Deliberate error/404 tests use
 * `page.goto()` directly because the system state is their final UI.
 */
export async function gotoReady(
  page: Page,
  path: string,
): Promise<PlaywrightResponse | null> {
  const response = await page.goto(path);
  await expect(
    page.getByText("Forward field report / Loading…", { exact: true }),
  ).toHaveCount(0);
  await expect(page.locator("#main-content")).toBeVisible();
  return response;
}

/** Bounding box of a locator, failing loudly when it is not laid out. */
export async function boxOf(locator: {
  boundingBox(): Promise<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>;
}): Promise<{ x: number; y: number; width: number; height: number }> {
  const box = await locator.boundingBox();
  expect(box, "element is not laid out").not.toBeNull();
  if (box === null) throw new Error("unreachable");
  return box;
}
