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

import {
  arbitraryValues,
  classNameLiterals,
  classNameSites,
  classNameSource,
  standardEquivalent,
} from "../scripts/classname-source.mts";
import { canonicalCssValue, THEME_TOKENS } from "../scripts/theme-tokens.mts";
import { RETIRED_PRESENTATION_CLASSES } from "./retired-presentation-classes";
import { REVIEWED_ARBITRARY_VALUES } from "./reviewed-arbitrary-values";

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
    const simpleRecipe = `const base = "text-link";
export const simple = cva(
  base,
);`;
    const configuredRecipe = `const defaultVariants = {
  tone: "not-a-class-default",
};
const compoundVariants = [
  { tone: "not-a-class-selector", class: "border-[#abc]" },
];
export const configured = cva("", {
  variants: { tone: { retired: "eyebrow" } },
  defaultVariants,
  compoundVariants,
});`;

    assert.match(classNameSource(simpleRecipe), /text-link/);
    const configuredClasses = classNameSource(configuredRecipe);
    assert.match(configuredClasses, /eyebrow/);
    assert.match(configuredClasses, /border-\[#abc\]/);
    assert.doesNotMatch(configuredClasses, /not-a-class-default/);
    assert.doesNotMatch(configuredClasses, /not-a-class-selector/);
  });

  it("extracts a whole className template literal past its interpolations", () => {
    const owner = [
      "export function NotFound() {",
      "  return (",
      "    <a",
      `      href={\`/\${locale}/shop\`}`,
      `      className={\`\${cta()} max-sm:w-full retired-after-interpolation!\`}`,
      "    >",
      "      Shop",
      "    </a>",
      "  );",
      "}",
    ].join("\n");

    const extracted = classNameSource(owner);

    assert.match(extracted, /max-sm:w-full/);
    assert.match(extracted, /retired-after-interpolation!/);
  });

  it("follows only className-reachable identifiers, composition, and spreads", () => {
    const owner = `
const marketingCopy = "text-lede";
const localStyles = { root: "border-[#111]!" };
const className = "ring-offset-[#333]!";
const classes = cn(
  "bg-[#fff]",
  active && "legacy-card!",
  { "ring-[#222]": active },
  localStyles.root,
);
const spreadProps = { ["className"]: "outline-[#000]!" };
const shorthandProps = { className };
export function Card() {
  return (
    <div className={classes} {...spreadProps} {...shorthandProps}>
      {marketingCopy}
    </div>
  );
}`;

    const extracted = classNameSource(owner);

    assert.match(extracted, /bg-\[#fff\]/);
    assert.match(extracted, /legacy-card!/);
    assert.match(extracted, /ring-\[#222\]/);
    assert.match(extracted, /border-\[#111\]!/);
    assert.match(extracted, /outline-\[#000\]!/);
    assert.match(extracted, /ring-offset-\[#333\]!/);
    assert.doesNotMatch(extracted, /text-lede/);
  });

  it("resolves identifiers against their own lexical scope", () => {
    /* Two functions may each declare `classes`. A name-keyed declaration index
     * answers with whichever it saw first, so both the shadowed value and the
     * shadowing one have to come from the binding that is actually in scope. */
    const owner = `
const copy = "text-lede";
function Outer() {
  const classes = "w-[137px]";
  return <div className={classes} />;
}
function Inner() {
  const classes = "bg-[#fff] legacy-card!";
  return <span className={classes} />;
}
function Caption({ copy }) {
  return <p className={copy} />;
}`;

    const extracted = classNameSource(owner);

    assert.match(extracted, /w-\[137px\]/);
    assert.match(extracted, /bg-\[#fff\]/);
    assert.match(extracted, /legacy-card!/);
    assert.doesNotMatch(
      extracted,
      /text-lede/,
      "a parameter must shadow the module constant of the same name",
    );
  });

  it("counts every class owner call site separately", () => {
    const owner = `
const shared = "w-[123px]";
export function Pair() {
  return (
    <div>
      <span className={shared} />
      <span className={shared} />
    </div>
  );
}`;

    const sites = classNameSites(owner);
    const widths = sites.filter((site) => site.classes.includes("w-[123px]"));

    assert.equal(widths.length, 2);
    assert.notEqual(widths[0]?.line, widths[1]?.line);
  });

  it("follows nested property access, dynamic keys, and aliased composers", () => {
    const owner = `
import { cn as cx } from "@/lib/cn";
const RETIRED_KEY = "legacy-card";
const styles = { button: { root: "border-[#111]" } };
const WORDMARKS = {
  header: { className: "w-[155px] max-sm:w-[117px]", src: "/header.svg" },
  footer: { className: "w-[clamp(280px,31vw,480px)]", src: "/footer.svg" },
};
export function Wordmark({ variant, tone }) {
  const wordmark = WORDMARKS[variant];
  return (
    <a
      className={cx("bg-canvas", { [RETIRED_KEY]: tone }, styles.button.root)}
      data-src={wordmark.src}
    >
      <img className={wordmark.className} />
    </a>
  );
}`;

    const extracted = classNameSource(owner);

    assert.match(extracted, /border-\[#111\]/);
    assert.match(extracted, /legacy-card/);
    assert.match(extracted, /bg-canvas/);
    assert.match(extracted, /w-\[155px\]/);
    assert.match(extracted, /max-sm:w-\[117px\]/);
    assert.match(extracted, /w-\[clamp\(280px,31vw,480px\)\]/);
    assert.doesNotMatch(extracted, /header\.svg|footer\.svg/);
  });

  it("reads className out of logical and nested JSX spreads", () => {
    const owner = `
const extra = { className: "outline-[#000]" };
const KEY = "className";
export function Card({ on }) {
  return (
    <div
      {...(on && extra)}
      {...{ ...extra, className: "ring-[#222]" }}
      {...{ [KEY]: "shadow-[#333]" }}
    />
  );
}`;

    const extracted = classNameSource(owner);

    assert.match(extracted, /outline-\[#000\]/);
    assert.match(extracted, /ring-\[#222\]/);
    assert.match(extracted, /shadow-\[#333\]/);
  });

  it("keeps unresolved helper calls from donating unrelated strings", () => {
    const owner = `
const marketingCopy = "text-lede";
export function Card() {
  return <div className={renderCopy(marketingCopy)} />;
}`;

    assert.equal(classNameSource(owner).trim(), "");
  });

  it("respects helper import identity and lexical shadowing", () => {
    assert.equal(
      classNameSource(`
const cn = (copy: string) => copy;
export function Card() { return <div className={cn("not a class sentence")} />; }`),
      "",
    );
    assert.equal(
      classNameSource(`
export function Card({ cn }) { return <div className={cn("not a class sentence")} />; }`),
      "",
    );
    assert.equal(
      classNameSource(`
import { cn as cx } from "copy-library";
export function Card() { return <div className={cx("not a class sentence")} />; }`),
      "",
    );
    assert.equal(
      classNameSource(`
import { cn as cx } from "copy-library/cn";
export function Card() { return <div className={cx("not a class sentence")} />; }`),
      "",
    );
    assert.match(
      classNameSource(`
import { cva as cv } from "class-variance-authority";
export const recipe = cv("bg-[#abc]");`),
      /bg-\[#abc\]/,
    );
    assert.match(
      classNameSource(`
import * as styles from "clsx";
export function Card() { return <div className={styles.default("bg-[#abc]")} />; }`),
      /bg-\[#abc\]/,
    );
  });

  it("resolves static destructuring and computed template class keys", () => {
    const extracted = classNameSource(`
const styles = { root: "bg-[#abc]" };
const { root } = styles;
const kind = "legacy";
export function Card({ on }) {
  return <div className={cn(root, { [\`\${kind}-card\`]: on })} />;
}`);

    assert.match(extracted, /bg-\[#abc\]/);
    assert.match(extracted, /legacy-card/);
  });

  it("extracts compound-variant class shorthand from a cva recipe", () => {
    const className = [
      'const className = "border-[#abc]";',
      'const compoundVariants = [{ tone: "selector-only", className }];',
      'export const badge = cva("bg-canvas", { compoundVariants });',
    ].join("\n");

    const extracted = classNameSource(className, "src/lib/badge.ts");

    assert.match(extracted, /border-\[#abc\]/);
    assert.doesNotMatch(extracted, /selector-only/);
  });

  it("groups an arbitrary value across its variant prefixes", () => {
    assert.deepEqual(arbitraryValues("gap-[5px]"), ["gap-[5px]"]);
    assert.deepEqual(arbitraryValues("max-xl:gap-[5px]"), ["gap-[5px]"]);
    assert.deepEqual(arbitraryValues("md:p-[34px]"), ["p-[34px]"]);
    assert.deepEqual(
      arbitraryValues("data-[open=true]:ps-[calc(var(--a)+10px)]"),
      ["data-[open=true]", "ps-[calc(var(--a)+10px)]"],
    );
    assert.deepEqual(arbitraryValues("group-aria-[current=page]:text-ink"), [
      "aria-[current=page]",
    ]);
    assert.deepEqual(arbitraryValues("[&::-webkit-details-marker]:hidden"), [
      "[&::-webkit-details-marker]",
    ]);
    assert.deepEqual(arbitraryValues("group-open:after:content-['x']"), [
      "content-['x']",
    ]);
    assert.deepEqual(arbitraryValues("text-ui"), []);
  });

  it("recognizes standard fraction and CSS-variable shorthand", () => {
    assert.equal(standardEquivalent("-translate-y-[150%]"), "-translate-y-3/2");
    assert.equal(standardEquivalent("top-[40%]"), "top-2/5");
    assert.equal(
      standardEquivalent("py-[var(--home-viewport-pad)]"),
      "py-(--home-viewport-pad)",
    );
    assert.equal(
      standardEquivalent("h-[var(--home-viewport-media)]"),
      "h-(--home-viewport-media)",
    );
  });

  it("includes exported recipes only in dedicated presentation modules", () => {
    const source = [
      'const marketingCopy = "text-lede";',
      'export const cartLine = "grid bg-[#fff]";',
      `export const cartSummary = \`\${cartLine} legacy-card!\`;`,
    ].join("\n");

    const extracted = classNameSource(source, "src/app/cart/presentation.ts");

    assert.match(extracted, /bg-\[#fff\]/);
    assert.match(extracted, /legacy-card!/);
    assert.doesNotMatch(extracted, /text-lede/);
    assert.equal(classNameSource(source, "src/app/cart/copy.ts"), "");
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
        classNameSource(await read(owner), owner),
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
        : classNameSource(source, owner).trim().length > 0,
    );
    const tailwindUtility =
      /(?:^|[\s"'`])(?:(?:hover|focus|focus-visible|active|disabled|group-hover|motion-reduce|max-(?:xs|sm|md|lg|xl)|min-\[[^\]]+\]):)*(?:sr-only|block|inline-block|inline|flex|inline-flex|grid|contents|hidden|relative|absolute|fixed|sticky|isolate|m-0|[mp][trblxy]?-[^\s"'`}]+|(?:w|h|min-w|min-h|max-w|max-h|size|gap|inset|top|right|bottom|left|z|order|grid-cols|col-start|row-start)-[^\s"'`}]+|(?:text|font|leading|tracking|bg|border|shadow|opacity|overflow|object|place|items|justify|self|whitespace|underline|uppercase|lowercase|antialiased)-?[^\s"'`}]*)(?=$|[\s"'`}])/;

    assert.ok(owners.length > 0);
    for (const [owner, source] of owners) {
      const classes = classNameSource(source, owner);
      assert.match(
        classes,
        tailwindUtility,
        `${owner} className source must contain a Tailwind utility`,
      );
    }
  });

  it("keeps raw hex colours out of presentation class lists", async () => {
    /* Colour is a theme contract. An arbitrary hex utility sits outside
     * `@theme` entirely, so it cannot be renamed, audited, or reused. */
    const rawHexColour = /-\[#[0-9a-fA-F]{3,8}\]/;

    for (const owner of await presentationOwners()) {
      assert.doesNotMatch(
        classNameSource(await read(owner), owner),
        rawHexColour,
        owner,
      );
    }
  });

  it("keeps repeated semantic scales in named tokens", async () => {
    /* The spec allows arbitrary values only for one-off geometry. These values
     * are shared editorial/UI scales, not isolated route geometry. */
    const repeatedSemanticValues =
      /(?:text-\[11px\]|leading-\[1\.55\]|max-w-\[670px\]|text-\[clamp\(\s*17px\s*,\s*1\.45vw\s*,\s*22px\s*\)\])/;

    for (const owner of await presentationOwners()) {
      assert.doesNotMatch(
        classNameSource(await read(owner), owner),
        repeatedSemanticValues,
        owner,
      );
    }
  });

  it("holds every theme token to its exact canonical value", async () => {
    /* Renames such as `text-ui` for `text-[11px]` are only safe while the token
     * still computes to the value it stood in for, so the theme is pinned by
     * value, not by name. `scripts/check-tailwind-theme.mts` proves the same
     * map reaches the production CSS. */
    const globals = await read("src/app/globals.css");
    const theme = globals.slice(
      globals.indexOf("@theme static {"),
      globals.indexOf("@layer base"),
    );
    const declared = Object.fromEntries(
      [...theme.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [
        name ?? "",
        (value ?? "").split(/\s+/).join(" ").trim(),
      ]),
    );

    assert.deepEqual(declared, THEME_TOKENS);
    assert.equal(THEME_TOKENS["--text-ui"], "0.6875rem");
    assert.equal(THEME_TOKENS["--leading-lede"], "1.55");
    assert.equal(THEME_TOKENS["--container-lede"], "670px");
    assert.equal(
      canonicalCssValue("rgba(23, 61, 45, 0.18) 260ms 0.6875rem"),
      canonicalCssValue("#173d2d2e .26s .6875rem"),
    );
    assert.notEqual(
      canonicalCssValue("rgba(23, 61, 45, 0.19)"),
      canonicalCssValue("#173d2d2e"),
    );
  });

  it("keeps repeated typography and container primitives in named tokens", async () => {
    const repeatedTokenCandidate =
      /(?:^|:)(?:text|leading|tracking|max-w|w)-\[[^\]]+\]/;
    const occurrencesByToken = new Map<string, number>();

    for (const owner of await presentationOwners()) {
      const tokens = classNameSource(await read(owner), owner)
        .split(/\s+/)
        .filter((token) => repeatedTokenCandidate.test(token));
      for (const token of tokens) {
        occurrencesByToken.set(token, (occurrencesByToken.get(token) ?? 0) + 1);
      }
    }

    assert.deepEqual(
      [...occurrencesByToken]
        .filter(([, occurrences]) => occurrences > 1)
        .sort(([left], [right]) => left.localeCompare(right)),
      [],
    );
  });

  /**
   * Every arbitrary value the presentation authors, keyed by the underlying
   * arbitrary segment so `gap-[5px]` and `max-xl:gap-[5px]` are one value, and
   * pinned to the exact authored location. A reusable constant is one authored
   * location even when several JSX owners consume it; moving or duplicating it
   * anywhere (including within the same file) changes the inventory.
   */
  async function arbitraryInventory(): Promise<Record<string, string[]>> {
    const byValue = new Map<string, Set<string>>();

    for (const owner of (await presentationOwners()).sort()) {
      for (const literal of classNameLiterals(await read(owner), owner)) {
        const seen = new Set<string>();
        for (const token of literal.classes.split(/\s+/)) {
          for (const value of arbitraryValues(token)) {
            if (seen.has(value)) continue;
            seen.add(value);
            const locations = byValue.get(value) ?? new Set<string>();
            locations.add(`${literal.file}:${literal.line}:${literal.column}`);
            byValue.set(value, locations);
          }
        }
      }
    }

    return Object.fromEntries(
      [...byValue]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([value, locations]) => [
          value,
          [...locations].sort((left, right) => left.localeCompare(right)),
        ]),
    );
  }

  it("accounts for every arbitrary value, one-off ones included", async () => {
    /* No singleton is filtered out before comparison: an unreviewed one-off is
     * exactly the case the spec asks to justify, and moving an occurrence
     * between call sites changes this inventory even when the total does not. */
    assert.deepEqual(await arbitraryInventory(), REVIEWED_ARBITRARY_VALUES);
  });

  it("keeps every repeated arbitrary value to CSS syntax with nothing to name", async () => {
    /* Tailwind has no theme namespace for an attribute-selector variant, a
     * pseudo-element selector, or a `content` string, so these may repeat.
     * Every repeatable *value* — spacing, grids, transitions — must be a named
     * token or a shared recipe instead. */
    const REPEATED_SYNTAX_ONLY = [
      "[&::-webkit-details-marker]",
      "aria-[current=page]",
      "content-['']",
      "content-['+']",
      "content-['\u2192']",
      "content-['\u2212']",
      "content-[attr(data-label)_':_']",
      "data-[active=true]",
    ];
    const inventory = await arbitraryInventory();
    const repeated = Object.entries(inventory)
      .filter(([, locations]) => locations.length > 1)
      .map(([value]) => value);

    assert.deepEqual(repeated.sort(), REPEATED_SYNTAX_ONLY);
  });

  it("keeps arbitrary values out of utilities Tailwind already names", async () => {
    for (const [value] of Object.entries(await arbitraryInventory())) {
      assert.equal(
        standardEquivalent(value),
        undefined,
        `${value} must use its standard utility`,
      );
    }
  });

  it("keeps raw colours out of presentation class lists", async () => {
    /* Colour is a theme contract. An arbitrary colour sits outside `@theme`
     * entirely, so it cannot be renamed, audited, or reused. */
    const rawColour =
      /-\[(?:#[0-9a-fA-F]{3,8}|(?:rgba?|hsla?|oklch|oklab|lab|lch)\([^)]*\))\]/;

    for (const owner of await presentationOwners()) {
      assert.doesNotMatch(
        classNameSource(await read(owner), owner),
        rawColour,
        owner,
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
        classNameSource(await read(owner), owner),
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
