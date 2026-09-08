import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";

import { WEAVERSE_SECTION_TYPES } from "../src/lib/weaverse/section-types.ts";

const CLIENT_REGISTRY = "src/lib/weaverse/components.ts";
const SERVER_REGISTRY = "src/lib/weaverse/server-components.ts";

async function read(file: string): Promise<string> {
  return await readFile(file, "utf8");
}

/** Schema module paths named by a registry file, in import order. */
function schemaImports(source: string): string[] {
  return [
    ...source.matchAll(/from "@\/((?:sections|components)\/[\w-]+\/[\w-]+)"/g),
  ].map((match) => match[1] as string);
}

describe("Weaverse registry split", () => {
  it("keeps the client registry free of server-only modules", async () => {
    const source = await read(CLIENT_REGISTRY);

    assert.equal(
      /^import "server-only";/m.test(source),
      false,
      "the client registry must not import server-only code",
    );
    assert.match(
      source,
      /^"use client";/,
      "the renderer is a Client Component, so its registry must be one too",
    );
  });

  it("keeps the server registry off the client component modules", async () => {
    const source = await read(SERVER_REGISTRY);

    assert.match(source, /import "server-only";/);
    assert.equal(
      source.includes('from "./components"'),
      false,
      "importing the client registry would drag every section into the server graph",
    );
    for (const module of schemaImports(source)) {
      assert.ok(
        module.endsWith("/schema") || module.endsWith("/loader"),
        `${module} must be a schema or loader module, never a component module`,
      );
    }
  });

  it("registers the same component types on both sides", async () => {
    const [client, server] = await Promise.all([
      read(CLIENT_REGISTRY),
      read(SERVER_REGISTRY),
    ]);

    const clientEntries = [...client.matchAll(/entry\((\w+)\)/g)].length;
    const serverEntries = [...server.matchAll(/schema: (\w+)Schema/g)].length;

    assert.equal(
      clientEntries,
      WEAVERSE_SECTION_TYPES.length,
      "a component in the type list is missing from the client registry",
    );
    assert.equal(
      serverEntries,
      WEAVERSE_SECTION_TYPES.length,
      "a component in the type list is missing from the server registry",
    );
  });

  it("declares no duplicate component types", () => {
    assert.equal(
      new Set(WEAVERSE_SECTION_TYPES).size,
      WEAVERSE_SECTION_TYPES.length,
      "two components share one type; Builder would render the wrong one",
    );
  });
});

describe("section loaders", () => {
  it("never lets a loader reach Shopify outside the storefront seam", async () => {
    const roots = ["src/sections", "src/components"];
    const loaders: string[] = [];

    for (const root of roots) {
      for (const item of await readdir(root, { withFileTypes: true })) {
        if (!item.isDirectory()) continue;
        const file = path.join(root, item.name, "loader.ts");
        try {
          loaders.push(await read(file));
        } catch {
          /* Most sections have no loader; that is the common case. */
        }
      }
    }

    assert.ok(loaders.length > 0, "expected at least one section loader");
    for (const source of loaders) {
      assert.equal(
        /storefront\/shopify|gql\(|graphql/i.test(source),
        false,
        "a loader must resolve through the storefront data source, not Shopify directly",
      );
    }
  });
});

describe("Studio integration surface", () => {
  /* Every one of these is a file or export the Studio bridge needs and the
   * storefront never touches, so nothing storefront-facing notices it going
   * missing. They are asserted here rather than added to the route contract
   * because that contract tracks no API routes at all — `/api/cart` is absent
   * too — and widening it would change the `20 + 4` counts other suites pin. */

  it("mounts the per-item revalidation route", async () => {
    const source = await read("src/app/api/weaverse/revalidate/route.ts");

    assert.match(
      source,
      /createWeaverseNextRevalidateHandler/,
      "without this route a Studio edit shows stale loader data until a full reload",
    );
    assert.match(source, /export const \{ POST \}/);
  });

  it("mounts the Studio bridge script in the document body", async () => {
    const layout = await read("src/app/layout.tsx");

    assert.match(layout, /<StudioConnect \/>/);
    const bodyIndex = layout.indexOf("<body");
    const connectIndex = layout.indexOf("<StudioConnect />");
    assert.ok(
      bodyIndex !== -1 && connectIndex > bodyIndex,
      "StudioConnect is a Client Component and must render inside <body>",
    );
  });

  it("forwards searchParams from every composed route", async () => {
    /* Design mode is detected from the query Studio puts on the iframe URL. A
     * route that does not forward it silently renders published mode. */
    for (const route of ["about", "materials", "field-testing"]) {
      const source = await read(`src/app/${route}/page.tsx`);

      assert.match(
        source,
        /searchParams: await props\.searchParams/,
        `${route} does not forward searchParams, so design mode is undetectable`,
      );
    }
  });
});
