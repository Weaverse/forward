/**
 * Seeds the Weaverse project from the theme's own schemas.
 *
 * A seed file says which sections a page carries and in what order. Everything
 * else — the copy, the nested children, their settings — is expanded from each
 * schema's `presets`, recursively. That matters because sections are trees now:
 * writing the tree out by hand would put the same sentence in two places again,
 * and would go stale the moment a section changes shape.
 *
 * Re-running is the migration path. Item ids are derived from the page and the
 * position in the tree, so a second run rewrites the same items and re-points
 * the root at them. Items the new shape no longer uses are left detached — the
 * Content API has no delete — so they stop rendering but stay in the project
 * until someone removes them in Studio.
 *
 * Safety:
 *
 * - dry run by default; `--apply` is required to write anything;
 * - every section type is checked against the registry before any request;
 * - the API key is read from the environment and never logged or echoed.
 *
 * Usage:
 *
 *   bun run seed:weaverse            # dry run, prints the tree
 *   bun run seed:weaverse --apply    # writes it
 *
 * Requires `WEAVERSE_PROJECT_ID` and, for `--apply`, `WEAVERSE_API_KEY`.
 */

import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { SECTION_SCHEMAS } from "../src/lib/weaverse/section-schemas.ts";

const CONTENT_API_BASE = "https://studio.weaverse.io/api/v1/content";
const SEED_DIR = path.join(import.meta.dirname, "weaverse-seed");
/** The Content API caps a page update at 100 items. */
const MAX_ITEMS_PER_REQUEST = 100;

/**
 * Stands in for a resource-backed template's handle in the request path.
 *
 * The Content API requires a handle segment for `PRODUCT`, `COLLECTION`,
 * `PAGE`, and `ARTICLE` — omitting it answers `400 A handle is required` — but
 * does not resolve by it: every handle returns the one shared default template.
 */
const TEMPLATE_HANDLE = "default";

interface SeedSection {
  type: string;
  /** Settings that differ from the section's own `presets`. */
  data?: Record<string, unknown>;
}

interface SeedPage {
  pageType: string;
  /** Empty for a resource-backed template; only a `CUSTOM` page has its own. */
  handle: string;
  name?: string;
  description?: string;
  sections: SeedSection[];
}

interface PageItem {
  id: string;
  type?: string;
  data: Record<string, unknown>;
  children?: { id: string }[];
}

function fail(message: string): never {
  console.error(`seed:weaverse: ${message}`);
  process.exit(1);
}

function pageRef(page: SeedPage): string {
  return page.handle.length > 0
    ? `${page.pageType}/${page.handle}`
    : page.pageType;
}

function pagePath(page: SeedPage): string {
  const handle = page.handle.length > 0 ? page.handle : TEMPLATE_HANDLE;
  return `${page.pageType}/${handle}`;
}

const SCHEMA_BY_TYPE = new Map(SECTION_SCHEMAS.map((s) => [s.type, s]));

/**
 * A stable UUID-shaped id for one position in one page's tree.
 *
 * The component type is part of the key because the Content API will not
 * change an existing item's `type`: it accepts the new children and keeps the
 * old type, which silently produced a `button` holding two buttons. Keying on
 * the type means a changed component is a new item, and the old one is left
 * detached like any other superseded item.
 */
function itemId(pageKey: string, treePath: string, type: string): string {
  const digest = createHash("sha256")
    .update(`forward:${pageKey}:${treePath}:${type}`)
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

interface PresetChild {
  type: string;
  [key: string]: unknown;
}

/**
 * Expands one section, and everything under it, into flat items.
 *
 * A parent's `presets.children` wins over the child schema's own: a two-column
 * band says what belongs in each column, and the column's generic preset is
 * only the fallback for a column placed by hand in Studio.
 */
function expand(
  pageKey: string,
  treePath: string,
  type: string,
  overrides: Record<string, unknown>,
  into: PageItem[],
  childrenOverride?: PresetChild[],
): string {
  const schema = SCHEMA_BY_TYPE.get(type);
  const { children: schemaChildren = [], ...presets } = (schema?.presets ??
    {}) as {
    children?: PresetChild[];
  } & Record<string, unknown>;
  const children = childrenOverride ?? schemaChildren;

  const id = itemId(pageKey, treePath, type);
  const childIds = children.map((child, index) => {
    const {
      type: childType,
      children: grandchildren,
      ...childOverrides
    } = child as PresetChild & { children?: PresetChild[] };
    return expand(
      pageKey,
      `${treePath}/${index}`,
      childType,
      childOverrides,
      into,
      grandchildren,
    );
  });

  into.push({
    id,
    type,
    data: { ...presets, ...overrides },
    ...(childIds.length > 0
      ? { children: childIds.map((childId) => ({ id: childId })) }
      : {}),
  });
  return id;
}

function buildItems(page: SeedPage, rootId: string): PageItem[] {
  const items: PageItem[] = [];
  const sectionIds = page.sections.map((section, index) =>
    expand(
      pageRef(page),
      `${index}-${section.type}`,
      section.type,
      section.data ?? {},
      items,
    ),
  );
  return [
    { id: rootId, data: {}, children: sectionIds.map((id) => ({ id })) },
    ...items,
  ];
}

function validate(pages: SeedPage[]): void {
  const problems: string[] = [];
  const claimed = new Map<string, string>();

  for (const page of pages) {
    const ref = pageRef(page);
    if (page.sections.length === 0) {
      problems.push(`${ref}: no sections`);
    }

    const items = buildItems(page, "root-placeholder");
    if (items.length > MAX_ITEMS_PER_REQUEST) {
      problems.push(
        `${ref}: ${items.length} items exceeds the ${MAX_ITEMS_PER_REQUEST}-item request cap`,
      );
    }
    for (const item of items.slice(1)) {
      if (item.type !== undefined && !SCHEMA_BY_TYPE.has(item.type)) {
        problems.push(`${ref}: "${item.type}" is not a registered component`);
      }
      /* Item ids are keyed on the page handle, and every template shares the
       * same empty one, so a collision across templates would write both to
       * one item. */
      const owner = claimed.get(item.id);
      if (owner !== undefined && owner !== ref) {
        problems.push(`${ref}: an item id collides with ${owner}`);
      }
      claimed.set(item.id, ref);
    }
  }

  if (problems.length > 0) {
    fail(`seed data is invalid:\n  - ${problems.join("\n  - ")}`);
  }
}

async function request(
  apiKey: string,
  method: "POST" | "PATCH",
  endpoint: string,
  body: unknown,
): Promise<{ ok: boolean; status: number }> {
  const response = await fetch(`${CONTENT_API_BASE}${endpoint}`, {
    method,
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  /* The response can echo the request, so only the status is ever read. */
  return { ok: response.ok, status: response.status };
}

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
  const rootId =
    body.rootId ??
    body.items?.find((item) => item.type === "main" || item.type === "root")
      ?.id;
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
  /* A template already exists — the Builder creates one per page type with the
   * project — so only a CUSTOM page is ever created here. */
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
  const items = buildItems(page, rootId);
  const updated = await request(
    apiKey,
    "PATCH",
    `/projects/${projectId}/pages/${pagePath(page)}`,
    { items },
  );
  if (!updated.ok) {
    fail(`updating ${pageRef(page)} responded ${updated.status}`);
  }
  console.log(`  wrote ${pageRef(page)} (${items.length} items)`);
}

function describe(page: SeedPage): void {
  const items = buildItems(page, "root");
  console.log(`  ${pageRef(page)}: ${items.length} items`);
  const byId = new Map(items.map((item) => [item.id, item]));
  const walk = (id: string, depth: number) => {
    const item = byId.get(id);
    if (item === undefined) return;
    if (depth > 0) {
      console.log(`  ${"  ".repeat(depth)}- ${item.type}`);
    }
    for (const child of item.children ?? []) walk(child.id, depth + 1);
  };
  walk("root", 0);
}

async function main(): Promise<void> {
  const apply = process.argv.includes("--apply");
  const projectId = process.env.WEAVERSE_PROJECT_ID?.trim();
  if (projectId === undefined || projectId.length === 0) {
    fail("WEAVERSE_PROJECT_ID is not configured.");
  }

  const files = (await readdir(SEED_DIR))
    .filter((file) => file.endsWith(".json"))
    .sort();
  const pages: SeedPage[] = [];
  for (const file of files) {
    const source = await readFile(path.join(SEED_DIR, file), "utf8");
    try {
      pages.push(JSON.parse(source) as SeedPage);
    } catch (error) {
      fail(`${file} is not valid JSON: ${(error as Error).message}`);
    }
  }

  validate(pages);

  console.log(
    `seed:weaverse: ${apply ? "APPLYING to" : "dry run against"} project ${projectId}`,
  );
  for (const page of pages) describe(page);

  if (!apply) {
    console.log(
      "seed:weaverse: dry run complete. Nothing was written. Re-run with --apply.",
    );
    return;
  }

  const apiKey = process.env.WEAVERSE_API_KEY?.trim();
  if (apiKey === undefined || apiKey.length === 0) {
    fail("WEAVERSE_API_KEY is required for --apply.");
  }
  for (const page of pages) await seedPage(apiKey, projectId, page);
  console.log("seed:weaverse: done.");
}

await main();
