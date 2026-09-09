/**
 * Seeds the Weaverse project with Forward's current page content.
 *
 * The payloads in `scripts/weaverse-seed/*.json` are transcribed from what the
 * routes render today, so seeding produces a Studio project that matches the
 * live storefront instead of an empty shell a merchant has to rebuild.
 *
 * Two kinds of page are seeded. A `CUSTOM` page is one page per path and is
 * created here if the project has none. The resource-backed templates —
 * `INDEX`, `PRODUCT`, `COLLECTION`, `PAGE`, `ARTICLE` — already exist: the
 * Builder creates one of each with the project, and this script only fills
 * them in. See `TEMPLATE_HANDLE` for how they are addressed.
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
 *   bun run seed:weaverse                  # dry run, prints the plan
 *   bun run seed:weaverse --apply          # writes the pages
 *   bun run seed:weaverse --apply --with-theme
 *
 * Theme settings are skipped unless `--with-theme` is passed. Nothing in the
 * storefront reads them yet — the Header and Footer still take their copy from
 * the storefront data source — so writing them would put values in Studio that
 * a merchant can edit with no visible effect. Seed them in the slice that wires
 * them up.
 *
 * Requires `WEAVERSE_PROJECT_ID` and, for `--apply`, `WEAVERSE_API_KEY`.
 */

import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  SECTION_SCHEMAS,
  WEAVERSE_SECTION_TYPES,
} from "../src/lib/weaverse/section-schemas.ts";

const CONTENT_API_BASE = "https://studio.weaverse.io/api/v1/content";
const SEED_DIR = path.join(import.meta.dirname, "weaverse-seed");
const THEME_FILE = "theme-settings.json";
/** The Content API caps a page update at 100 items. */
const MAX_ITEMS_PER_REQUEST = 100;

interface SeedSection {
  key: string;
  type: string;
  /**
   * Settings that differ from the section's `presets`.
   *
   * A seed file lists which sections a page carries and in what order; the
   * copy itself already lives in each schema's `presets`, which is what Studio
   * inserts when a merchant adds the section. Repeating it here is how the
   * same sentence ends up in two files and drifts. Only overrides belong here
   * — a picked product, an image, a label the template needs to differ on.
   */
  data?: Record<string, unknown>;
}

interface SeedPage {
  pageType: string;
  /**
   * Empty for a resource-backed template.
   *
   * `INDEX`, `PRODUCT`, `COLLECTION`, `PAGE`, and `ARTICLE` are one shared
   * template each, created with the project and addressed by type alone. Only
   * a `CUSTOM` page has a handle of its own.
   */
  handle: string;
  name?: string;
  description?: string;
  sections: SeedSection[];
}

interface SeedTheme {
  description?: string;
  theme: Record<string, unknown>;
}

interface PageItem {
  id: string;
  /** Omitted for the existing root, which must not be retyped. */
  type?: string;
  data: Record<string, unknown>;
  children?: { id: string }[];
}

/** How a page is named in this script's output and in its item ids. */
function pageRef(page: SeedPage): string {
  return page.handle.length > 0
    ? `${page.pageType}/${page.handle}`
    : page.pageType;
}

/**
 * Stands in for a resource-backed template's handle in the request path.
 *
 * The Content API requires a handle segment for `PRODUCT`, `COLLECTION`,
 * `PAGE`, and `ARTICLE` — omitting it answers `400 A handle is required` — but
 * it does not resolve by it: every handle returns the one shared default
 * template, stored with an empty handle, and writes land on that template
 * rather than creating a page under the handle sent. So any value works, and
 * this one says why it is there.
 */
const TEMPLATE_HANDLE = "default";

/** Where a page is addressed in the Content API. */
function pagePath(page: SeedPage): string {
  const handle = page.handle.length > 0 ? page.handle : TEMPLATE_HANDLE;
  return `${page.pageType}/${handle}`;
}

/** A section's shipped defaults, which the seed writes unless overridden. */
function presetsFor(type: string): Record<string, unknown> {
  const schema = SECTION_SCHEMAS.find((entry) => entry.type === type);
  const { children, ...presets } = schema?.presets ?? {};
  return presets;
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

/**
 * Builds the flat item list the Content API expects.
 *
 * `rootId` must be the root the Builder already created for this page. Sending
 * an invented root id creates a second, orphaned root: the page keeps pointing
 * at its original one, which still has no children, so the storefront renders
 * an empty page while the Content API shows the sections as present.
 */
function buildItems(page: SeedPage, rootId: string): PageItem[] {
  const sections = page.sections.map((section) => ({
    id: itemId(page.handle, section.key),
    type: section.type,
    data: { ...presetsFor(section.type), ...section.data },
  }));

  return [
    { id: rootId, data: {}, children: sections.map(({ id }) => ({ id })) },
    ...sections,
  ];
}

function validate(pages: SeedPage[]): void {
  const registered = new Set(WEAVERSE_SECTION_TYPES);
  const problems: string[] = [];

  /* Item ids are keyed on the page handle, and every resource-backed template
   * has the same empty one, so a section key reused across two templates would
   * silently write both to one item. */
  const claimed = new Map<string, string>();
  for (const page of pages) {
    const ref = pageRef(page);
    if (page.sections.length === 0) {
      problems.push(`${ref}: no sections`);
    }
    if (page.sections.length + 1 > MAX_ITEMS_PER_REQUEST) {
      problems.push(
        `${ref}: ${page.sections.length + 1} items exceeds the ${MAX_ITEMS_PER_REQUEST}-item request cap`,
      );
    }

    const seen = new Set<string>();
    for (const section of page.sections) {
      if (seen.has(section.key)) {
        problems.push(
          `${ref}: duplicate section key "${section.key}" would collide on one item id`,
        );
      }
      seen.add(section.key);

      const id = itemId(page.handle, section.key);
      const owner = claimed.get(id);
      if (owner !== undefined) {
        problems.push(
          `${ref}: section key "${section.key}" collides with ${owner} on one item id`,
        );
      }
      claimed.set(id, ref);

      if (!registered.has(section.type)) {
        problems.push(
          `${ref}: section type "${section.type}" is not in the component registry`,
        );
      }
    }
  }

  if (problems.length > 0) {
    fail(`seed data is invalid:\n  - ${problems.join("\n  - ")}`);
  }
}

interface RequestResult {
  ok: boolean;
  status: number;
}

async function request(
  apiKey: string,
  method: "POST" | "PATCH",
  endpoint: string,
  body: unknown,
): Promise<RequestResult> {
  const response = await fetch(`${CONTENT_API_BASE}${endpoint}`, {
    method,
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  /* The response body can echo the request, so nothing from it is ever logged;
   * status and endpoint are enough to diagnose and cannot carry the key. */
  return { ok: response.ok, status: response.status };
}

/**
 * Ensures the page exists, then writes its content.
 *
 * Creation and update are separate endpoints, and a project that has never
 * been seeded has neither page. `409` on create means the page is already
 * there, which is the normal second-run case and not an error.
 */
/** Reads the id of the root item the Builder created for this page. */
async function fetchRootId(
  apiKey: string,
  projectId: string,
  page: SeedPage,
): Promise<string> {
  const response = await fetch(
    `${CONTENT_API_BASE}/projects/${projectId}/pages/${pagePath(page)}`,
    { headers: { authorization: `Bearer ${apiKey}` } },
  );
  if (!response.ok) {
    fail(`reading ${pageRef(page)} responded ${response.status}`);
  }

  const body = (await response.json()) as {
    rootId?: string;
    items?: { id: string; type?: string }[];
  };
  const fromItems = body.items?.find(
    (item) => item.type === "main" || item.type === "root",
  );
  const rootId = body.rootId ?? fromItems?.id;
  if (typeof rootId !== "string" || rootId.length === 0) {
    fail(`${pageRef(page)} has no root item to attach to`);
  }
  return rootId;
}

async function seedPage(
  apiKey: string,
  projectId: string,
  page: SeedPage,
): Promise<void> {
  /* A template already exists — the Builder creates one per page type with
   * the project — so only a CUSTOM page is ever created here. */
  if (page.handle.length > 0) {
    const created = await request(
      apiKey,
      "POST",
      `/projects/${projectId}/pages`,
      {
        type: page.pageType,
        handle: page.handle,
        name: page.name ?? page.handle,
      },
    );
    if (!created.ok && created.status !== 409) {
      fail(`creating ${pageRef(page)} responded ${created.status}`);
    }
  }

  const rootId = await fetchRootId(apiKey, projectId, page);
  const updated = await request(
    apiKey,
    "PATCH",
    `/projects/${projectId}/pages/${pagePath(page)}`,
    { items: buildItems(page, rootId) },
  );
  if (!updated.ok) {
    fail(`updating ${pageRef(page)} responded ${updated.status}`);
  }
  console.log(`  wrote ${pageRef(page)}`);
}

async function main(): Promise<void> {
  const apply = process.argv.includes("--apply");
  const withTheme = process.argv.includes("--with-theme");

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
    console.log(
      `  ${pageRef(page)}: ${page.sections.length} sections (+1 root)`,
    );
    for (const section of page.sections) {
      console.log(`    - ${section.type}`);
    }
  }
  console.log(
    withTheme
      ? `  theme settings: ${Object.keys(theme.theme).length} top-level keys`
      : "  theme settings: skipped (nothing reads them yet; pass --with-theme to include)",
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
    await seedPage(apiKey, projectId, page);
  }

  if (withTheme) {
    const themeWrite = await request(
      apiKey,
      "PATCH",
      `/projects/${projectId}/theme-settings`,
      { theme: theme.theme },
    );
    if (!themeWrite.ok) {
      fail(`writing theme settings responded ${themeWrite.status}`);
    }
    console.log("  wrote theme settings");
  }
  console.log("seed:weaverse: done.");
}

await main();
