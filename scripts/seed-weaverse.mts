/**
 * Seeds the Weaverse project with Forward's current page content.
 *
 * The payloads in `scripts/weaverse-seed/*.json` are transcribed from what the
 * routes render today, so seeding produces a Studio project that matches the
 * live storefront instead of an empty shell a merchant has to rebuild.
 *
 * Safety:
 *
 * - dry run by default; `--apply` is required to write anything;
 * - every section type is checked against the registry before any request, so
 *   a typo cannot create an item the theme has no component for;
 * - item ids are derived deterministically from the page and section keys, so
 *   re-running updates the same items instead of appending duplicates;
 * - the API key is read from the environment and never logged, echoed, or
 *   written into an error message.
 *
 * Usage:
 *
 *   bun run seed:weaverse            # dry run, prints the plan
 *   bun run seed:weaverse --apply    # writes to the project
 *
 * Requires `WEAVERSE_PROJECT_ID` and, for `--apply`, `WEAVERSE_API_KEY`.
 */

import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { WEAVERSE_SECTION_TYPES } from "../src/lib/weaverse/components.ts";

const CONTENT_API_BASE = "https://studio.weaverse.io/api/v1/content";
const SEED_DIR = path.join(import.meta.dirname, "weaverse-seed");
const THEME_FILE = "theme-settings.json";
/** The Content API caps a page update at 100 items. */
const MAX_ITEMS_PER_REQUEST = 100;

interface SeedSection {
  key: string;
  type: string;
  data: Record<string, unknown>;
}

interface SeedPage {
  pageType: string;
  handle: string;
  description?: string;
  sections: SeedSection[];
}

interface SeedTheme {
  description?: string;
  theme: Record<string, unknown>;
}

interface PageItem {
  id: string;
  type: string;
  data: Record<string, unknown>;
  children?: { id: string }[];
}

function fail(message: string): never {
  console.error(`seed:weaverse: ${message}`);
  process.exit(1);
}

/**
 * A stable UUID-shaped id for one section on one page.
 *
 * Deterministic so a second run targets the same items. The Content API
 * creates an unknown id when `type` is supplied, so the first run creates and
 * every later run merges.
 */
function itemId(pageKey: string, sectionKey: string): string {
  const digest = createHash("sha256")
    .update(`forward:${pageKey}:${sectionKey}`)
    .digest("hex");
  return [
    digest.slice(0, 8),
    digest.slice(8, 12),
    `7${digest.slice(13, 16)}`,
    ((Number.parseInt(digest.slice(16, 17), 16) & 0x3) | 0x8).toString(16) +
      digest.slice(17, 20),
    digest.slice(20, 32),
  ].join("-");
}

function readEnv(key: string): string | undefined {
  const raw = process.env[key];
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  return trimmed.length > 0 ? trimmed : undefined;
}

async function readJson<T>(file: string): Promise<T> {
  const source = await readFile(path.join(SEED_DIR, file), "utf8");
  try {
    return JSON.parse(source) as T;
  } catch (error) {
    fail(`${file} is not valid JSON: ${(error as Error).message}`);
  }
}

/** Builds the flat item list the Content API expects, root first. */
function buildItems(page: SeedPage): PageItem[] {
  const rootId = itemId(page.handle, "root");
  const sections = page.sections.map((section) => ({
    id: itemId(page.handle, section.key),
    type: section.type,
    data: section.data,
  }));

  return [
    {
      id: rootId,
      type: "root",
      data: {},
      children: sections.map((section) => ({ id: section.id })),
    },
    ...sections,
  ];
}

function validate(pages: SeedPage[]): void {
  const registered = new Set(WEAVERSE_SECTION_TYPES);
  const problems: string[] = [];

  for (const page of pages) {
    if (page.sections.length === 0) {
      problems.push(`${page.handle}: no sections`);
    }
    if (page.sections.length + 1 > MAX_ITEMS_PER_REQUEST) {
      problems.push(
        `${page.handle}: ${page.sections.length + 1} items exceeds the ${MAX_ITEMS_PER_REQUEST}-item request cap`,
      );
    }

    const seen = new Set<string>();
    for (const section of page.sections) {
      if (seen.has(section.key)) {
        problems.push(
          `${page.handle}: duplicate section key "${section.key}" would collide on one item id`,
        );
      }
      seen.add(section.key);

      if (!registered.has(section.type)) {
        problems.push(
          `${page.handle}: section type "${section.type}" is not in the component registry`,
        );
      }
    }
  }

  if (problems.length > 0) {
    fail(`seed data is invalid:\n  - ${problems.join("\n  - ")}`);
  }
}

async function request(
  apiKey: string,
  endpoint: string,
  body: unknown,
): Promise<void> {
  const response = await fetch(`${CONTENT_API_BASE}${endpoint}`, {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    /* The response body can echo the request; report status and endpoint only
     * so a key can never reach the log. */
    fail(`${endpoint} responded ${response.status} ${response.statusText}`);
  }
}

async function main(): Promise<void> {
  const apply = process.argv.includes("--apply");

  const projectId = readEnv("WEAVERSE_PROJECT_ID");
  if (projectId === undefined) {
    fail("WEAVERSE_PROJECT_ID is not configured.");
  }

  const files = (await readdir(SEED_DIR))
    .filter((file) => file.endsWith(".json") && file !== THEME_FILE)
    .sort();
  const pages = await Promise.all(
    files.map((file) => readJson<SeedPage>(file)),
  );
  const theme = await readJson<SeedTheme>(THEME_FILE);

  validate(pages);

  console.log(
    `seed:weaverse: ${apply ? "APPLYING to" : "dry run against"} project ${projectId}`,
  );
  for (const page of pages) {
    const items = buildItems(page);
    console.log(
      `  ${page.pageType}/${page.handle}: ${page.sections.length} sections (${items.length} items)`,
    );
    for (const section of page.sections) {
      console.log(`    - ${section.type}`);
    }
  }
  console.log(
    `  theme settings: ${Object.keys(theme.theme).length} top-level keys`,
  );

  if (!apply) {
    console.log(
      "seed:weaverse: dry run complete. Nothing was written. Re-run with --apply to seed.",
    );
    return;
  }

  const apiKey = readEnv("WEAVERSE_API_KEY");
  if (apiKey === undefined) {
    fail(
      "WEAVERSE_API_KEY is required for --apply. Generate one in Weaverse Dashboard -> Settings.",
    );
  }

  for (const page of pages) {
    await request(
      apiKey,
      `/projects/${projectId}/pages/${page.pageType}/${page.handle}`,
      { items: buildItems(page) },
    );
    console.log(`  wrote ${page.pageType}/${page.handle}`);
  }

  await request(apiKey, `/projects/${projectId}/theme-settings`, {
    theme: theme.theme,
  });
  console.log("  wrote theme settings");
  console.log("seed:weaverse: done.");
}

await main();
