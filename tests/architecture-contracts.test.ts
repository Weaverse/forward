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
import path from "node:path";
import { describe, it } from "node:test";

import { RETIRED_PRESENTATION_CLASSES } from "./retired-presentation-classes";

const read = (path: string) => readFile(path, "utf8");

async function filesMatching(
  directory: string,
  matches: (file: string) => boolean,
): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const child = `${directory}/${entry.name}`;
      return entry.isDirectory()
        ? filesMatching(child, matches)
        : Promise.resolve(matches(child) ? [child] : []);
    }),
  );
  return nested.flat();
}

const testFiles = () =>
  filesMatching("tests", (file) => /(?:\.test\.tsx?|\.pw\.ts)$/.test(file));
const typescriptFiles = (directory: string) =>
  filesMatching(directory, (file) => /\.tsx?$/.test(file));
async function presentationOwners(): Promise<string[]> {
  const files = await typescriptFiles("src");
  const sources = await Promise.all(
    files.map(async (file) => [file, await read(file)] as const),
  );
  return sources
    .filter(
      ([file, source]) =>
        file.endsWith(".tsx") ||
        file.endsWith("/presentation.ts") ||
        source.includes('from "class-variance-authority"'),
    )
    .map(([file]) => file);
}

function classNameSource(source: string): string {
  const attributes = [
    ...source.matchAll(/className\s*=\s*(?:"[^"]*"|'[^']*'|{[\s\S]*?})/g),
  ].map(([match]) => match);
  const properties = [
    ...source.matchAll(
      /className\s*:\s*(?:cn\(\s*)?(?:"[^"]*"|'[^']*'|`[^`]*`)/g,
    ),
  ].map(([match]) => match);
  const recipes = [
    ...source.matchAll(
      /(?:export\s+)?const\s+[A-Za-z_$][\w$]*\s*=\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`)/g,
    ),
  ].map((match) => match.slice(1).find(Boolean) ?? "");
  const cvaRecipes = [...source.matchAll(/\bcva\([\s\S]*?\n\s*\}?\);/g)].map(
    ([match]) => match,
  );
  return [...attributes, ...properties, ...recipes, ...cvaRecipes].join("\n");
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
    const domFiles = await typescriptFiles("tests/dom");
    assert.ok(domFiles.length > 0);

    for (const file of domFiles) {
      assert.doesNotMatch(
        await read(file),
        /^import[^\n]*(?:storefront\/data-source|account\/customer-account)/m,
        file,
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

  it("extracts simple and configured cva recipes for architecture checks", () => {
    const simpleRecipe = `export const simple = cva(
  "text-link",
);`;
    const configuredRecipe = `export const configured = cva("", {
  variants: { tone: { retired: "eyebrow" } },
});`;

    assert.match(classNameSource(simpleRecipe), /text-link/);
    assert.match(classNameSource(configuredRecipe), /eyebrow/);
  });

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
    assert.doesNotMatch(layout, /forward-tailwind-theme/);
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

    assert.ok(
      globals.includes("global accessibility override"),
      "the three reduced-motion overrides must document their accessibility purpose",
    );
    assert.deepEqual(
      [...globals.matchAll(/^\s*([\w-]+):\s*([^;!\n]+)\s*!important;/gm)].map(
        ([, property, value]) =>
          `${property ?? ""}: ${(value ?? "").trim()} !important`,
      ),
      [
        "animation-duration: 0.01ms !important",
        "animation-iteration-count: 1 !important",
        "transition-duration: 0.01ms !important",
      ],
    );
  });

  it("keeps Tailwind important modifiers out of presentation source", async () => {
    const importantModifier = /(?:^|[\s"'`])[\w@:[\].()/-]+!(?=$|[\s"'`}])/;

    for (const owner of await presentationOwners()) {
      assert.doesNotMatch(
        classNameSource(await read(owner)),
        importantModifier,
        owner,
      );
    }
  });

  it("finds Tailwind utilities in every presentation owner", async () => {
    const candidates = await presentationOwners();
    const sources = await Promise.all(
      candidates.map(async (owner) => [owner, await read(owner)] as const),
    );
    const owners = sources.filter(([owner, source]) =>
      owner.endsWith(".tsx")
        ? source.includes("className")
        : classNameSource(source).trim().length > 0,
    );
    const tailwindUtility =
      /(?:^|[\s"'`])(?:(?:hover|focus|focus-visible|active|disabled|group-hover|motion-reduce|max-(?:xs|sm|md|lg|xl)|min-\[[^\]]+\]):)*(?:sr-only|block|inline-block|inline|flex|inline-flex|grid|contents|hidden|relative|absolute|fixed|sticky|isolate|m-0|[mp][trblxy]?-[^\s"'`}]+|(?:w|h|min-w|min-h|max-w|max-h|size|gap|inset|top|right|bottom|left|z|order|grid-cols|col-start|row-start)-[^\s"'`}]+|(?:text|font|leading|tracking|bg|border|shadow|opacity|overflow|object|place|items|justify|self|whitespace|underline|uppercase|lowercase|antialiased)-?[^\s"'`}]*)(?=$|[\s"'`}])/;

    assert.ok(owners.length > 0);
    for (const [owner, source] of owners) {
      const classes = classNameSource(source);
      assert.match(
        classes,
        tailwindUtility,
        `${owner} className source must contain a Tailwind utility`,
      );
    }
  });

  it("keeps retired semantic class namespaces out of presentation source", async () => {
    assert.equal(RETIRED_PRESENTATION_CLASSES.length, 261);
    const retiredLegacyClass = new RegExp(
      `(?:^|[\\s"'\\x60])(?:${RETIRED_PRESENTATION_CLASSES.map((className) =>
        className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      ).join("|")})(?=$|[\\s"'\\x60}])`,
    );

    for (const owner of await presentationOwners()) {
      assert.doesNotMatch(
        classNameSource(await read(owner)),
        retiredLegacyClass,
        owner,
      );
    }
  });
});

describe("storefront source boundaries", () => {
  const movedOwners = [
    "src/components/address-form.tsx",
    "src/components/cart-view.tsx",
    "src/components/shopify-cart-view.tsx",
    "src/components/add-to-cart-form.tsx",
    "src/components/cart-count.tsx",
    "src/components/country-control.tsx",
    "src/components/field-index-header.tsx",
    "src/lib/header-navigation.ts",
    "src/components/mini-cart.tsx",
    "src/components/query-preserving-field-index-header.tsx",
    "src/components/site-header.tsx",
  ];

  it("keeps routes and components behind the normalized storefront boundary", async () => {
    const owners = [
      ...(await typescriptFiles("src/app")),
      ...(await typescriptFiles("src/components")),
    ];

    for (const owner of owners) {
      assert.doesNotMatch(
        await read(owner),
        /(?:\bfrom\s+|\bimport\s*\(\s*|\brequire\s*\(\s*)["'][^"']*storefront\/(?:catalog-query|fixtures\/|shopify\/)/,
        `${owner} must use normalized storefront/cart/account/runtime seams`,
      );
    }
  });

  it("keeps all moved component and library owners absent and unreferenced", async () => {
    await Promise.all(
      movedOwners.map((movedOwner) => assert.rejects(access(movedOwner))),
    );

    const oldModules = new Set(
      movedOwners.map((movedOwner) => movedOwner.replace(/\.tsx?$/, "")),
    );
    const sources = [
      ...(await typescriptFiles("src")),
      ...(await typescriptFiles("tests")),
    ];

    for (const sourcePath of sources) {
      const source = await read(sourcePath);
      const specifiers = [
        ...source.matchAll(
          /(?:\bfrom\s+|\bimport\s*(?:\(\s*)?)["']([^"']+)["']/g,
        ),
      ].flatMap((match) => (match[1] === undefined ? [] : [match[1]]));

      for (const specifier of specifiers) {
        const resolved = specifier.startsWith("@/")
          ? `src/${specifier.slice(2)}`
          : specifier.startsWith(".")
            ? path.relative(
                ".",
                path.resolve(path.dirname(sourcePath), specifier),
              )
            : null;
        if (resolved !== null) {
          assert.ok(
            !oldModules.has(resolved.replace(/\.tsx?$/, "")),
            `${sourcePath} imports retired module ${specifier}`,
          );
        }
      }
    }
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
