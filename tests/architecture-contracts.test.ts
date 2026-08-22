/**
 * Architecture, deployment, and GraphQL contracts.
 *
 * These checks intentionally read source text because their requirements are
 * about source or build inputs rather than shopper-visible behavior. No
 * assertion here may stand in for rendered UI: that belongs to `tests/dom/`
 * and `tests/browser/`.
 */

import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import { describe, it } from "node:test";

const read = (path: string) => readFile(path, "utf8");

async function testFiles(path = "tests"): Promise<string[]> {
  const entries = await readdir(path, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const child = `${path}/${entry.name}`;
      return entry.isDirectory()
        ? testFiles(child)
        : Promise.resolve(
            /(?:\.test\.tsx?|\.pw\.ts)$/.test(entry.name) ? [child] : [],
          );
    }),
  );
  return nested.flat();
}

describe("test-layer separation", () => {
  it("keeps legacy CSS out of shopper-behavior source assertions", async () => {
    for (const path of await testFiles()) {
      if (path === "tests/architecture-contracts.test.ts") continue;
      const source = await read(path);
      assert.doesNotMatch(
        source,
        /src\/app\/(?:canonical-source|site-header|production-polish|globals)\.css/,
        path,
      );
    }
  });

  it("keeps behavior suites from asserting presentation source text", async () => {
    const behaviorSuites = (await testFiles()).filter(
      (path) =>
        path.startsWith("tests/dom/") ||
        path.startsWith("tests/browser/") ||
        /tests\/(?:production-polish-(?:home|pdp|shell)|site-header)\.test\.ts$/.test(
          path,
        ),
    );

    assert.ok(behaviorSuites.length > 0);
    for (const path of behaviorSuites) {
      assert.doesNotMatch(
        await read(path),
        /from\s+["']node:fs(?:\/promises)?["']|Bun\.file|readFile(?:Sync)?|readSource/,
        `${path} must render behavior instead of reading presentation source`,
      );
    }
  });

  it("keeps the server suite free of browser globals", () => {
    /* `shopify/env.ts` and `account/env.ts` refuse to read credentials once a
     * browser global exists, so `test:node` must never see a DOM. The DOM
     * suite gets its document from its own scoped preload instead. */
    assert.equal(typeof document, "undefined");
    assert.equal(typeof window, "undefined");
  });

  it("never lets a DOM test import the server-only storefront seam", async () => {
    const sources = await Promise.all(
      [
        "tests/dom/preload.ts",
        "tests/dom/harness.tsx",
        "tests/dom/mini-cart.test.tsx",
        "tests/dom/product-card.test.tsx",
        "tests/dom/product-detail.test.tsx",
        "tests/dom/shell-chrome.test.tsx",
        "tests/dom/site-header.test.tsx",
      ].map(read),
    );

    for (const source of sources) {
      assert.doesNotMatch(
        source,
        /^import[^\n]*(?:storefront\/data-source|account\/customer-account)/m,
      );
    }
  });

  it("names browser specs so the Bun runner cannot pick them up", async () => {
    const { readdir } = await import("node:fs/promises");
    const entries = await readdir("tests/browser");
    const specs = entries.filter((entry) => entry.endsWith(".ts"));

    assert.ok(specs.length > 0);
    for (const spec of specs) {
      assert.doesNotMatch(
        spec,
        /\.(?:test|spec)\.tsx?$/,
        `${spec} would be discovered by \`bun test\``,
      );
    }
  });
});

describe("Tailwind presentation ownership", () => {
  const legacyStylesheets = [
    "src/app/canonical-source.css",
    "src/app/site-header.css",
    "src/app/production-polish.css",
  ];

  it("keeps retired presentation stylesheets absent", async () => {
    await Promise.all(
      legacyStylesheets.map((legacyPath) => assert.rejects(access(legacyPath))),
    );
  });

  it("loads only the Tailwind global stylesheet from the root layout", async () => {
    const layout = await read("src/app/layout.tsx");
    const stylesheets = [
      ...layout.matchAll(/import\s+["'](\.\/[^"']+\.css)["']/g),
    ].map(([, stylesheet]) => stylesheet);

    assert.deepEqual(stylesheets, ["./globals.css"]);
    for (const legacyPath of legacyStylesheets) {
      assert.ok(!layout.includes(legacyPath.split("/").at(-1) ?? legacyPath));
    }
  });

  it("keeps globals.css limited to the semantic theme and document policy", async () => {
    const globals = await read("src/app/globals.css");

    assert.equal(globals.match(/@import\s+["']tailwindcss["']/g)?.length, 1);
    assert.equal(globals.match(/@theme\b/g)?.length, 1);
    assert.doesNotMatch(globals, /@apply\b/);
    assert.doesNotMatch(
      globals,
      /^\s*(?:[.#][\w-]+|[a-z][\w-]*[.#][\w-]+|\[data-[\w-]+)/m,
      "globals.css must not regain a component compatibility selector",
    );
    assert.deepEqual(
      [...globals.matchAll(/@keyframes\s+([\w-]+)/g)].map(([, name]) => name),
      ["shell-panel-enter", "shell-mobile-enter", "shell-image-enter"],
    );
  });
});

describe("catalog GraphQL contract", () => {
  it("asks Shopify for compare-at money on every variant", async () => {
    const queries = await read("src/lib/storefront/shopify/queries.ts");

    assert.match(
      queries,
      /compareAtPrice \{\s*amount\s*currencyCode\s*\}/,
      "the catalog query must request compare-at money for each variant",
    );
  });
});

describe("icon dependency boundary", () => {
  it("keeps the icon family local instead of adding an icon runtime", async () => {
    const packageJson = await read("package.json");

    assert.doesNotMatch(packageJson, /phosphor|react-icons|lucide|heroicons/i);
  });
});

describe("header ownership", () => {
  it("keeps no superseded header implementation on disk", async () => {
    await Promise.all(
      ["src/components/header-nav.tsx", "src/components/mobile-menu.tsx"].map(
        (legacyPath) => assert.rejects(access(legacyPath)),
      ),
    );
  });

  it("routes header navigation through one query-preserving wrapper", async () => {
    const [shell, wrapper] = await Promise.all([
      read("src/components/site-header/site-header.tsx"),
      read(
        "src/components/site-header/query-preserving-field-index-header.tsx",
      ),
    ]);

    assert.ok(shell.includes("<Suspense"));
    assert.ok(shell.includes("<QueryPreservingFieldIndexHeader"));
    assert.ok(wrapper.includes("useSearchParams"));
  });
});

describe("approved brand assets", () => {
  it("ships the moss and reversed horizontal lockups the shell renders", async () => {
    const [header, footer] = await Promise.all([
      read("public/images/brand/forward-wordmark-horizontal-moss.svg"),
      read("public/images/brand/forward-wordmark-horizontal-reversed.svg"),
    ]);

    assert.ok(header.includes('viewBox="0 0 480 96"'));
    assert.ok(header.includes('fill="#20231f"'));
    assert.ok(header.includes('fill="#74805d"'));
    assert.ok(footer.includes('viewBox="0 0 480 96"'));
    assert.ok(footer.includes('fill="#f2ede3"'));
    assert.ok(footer.includes('fill="#a6ad8b"'));
  });
});

describe("preview deployment hygiene", () => {
  it("excludes local editor, secret, build, and QA artifacts", async () => {
    const ignore = await read(".vercelignore");
    const patterns = ignore.split("\n");

    for (const pattern of [
      ".env",
      ".env.*",
      ".vscode",
      ".vercel/",
      ".next/",
      "node_modules/",
      "*.tsbuildinfo",
      "coverage/",
      "test-results/",
      "playwright-report/",
      "tests",
      "tests/",
      ".forward-browser/",
    ]) {
      assert.ok(patterns.includes(pattern), `missing ignore: ${pattern}`);
    }
  });

  it("keeps generated browser output out of Git", async () => {
    const ignore = await read(".gitignore");
    const patterns = ignore.split("\n");

    for (const pattern of [
      "test-results/",
      "playwright-report/",
      ".forward-browser/",
    ]) {
      assert.ok(patterns.includes(pattern), `missing gitignore: ${pattern}`);
    }
  });
});
