/**
 * Compiled Tailwind theme contract.
 *
 * Runs after `next build` and verifies the production CSS artifact, not source
 * strings. Each representative utility must also be consumed by production
 * storefront markup, so a synthetic content hook cannot satisfy this check.
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { classNameSource } from "./classname-source.mts";
import { canonicalCssValue, THEME_TOKENS } from "./theme-tokens.mts";

async function cssFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const child = path.join(directory, entry.name);
      if (entry.isDirectory()) return cssFiles(child);
      return Promise.resolve(entry.name.endsWith(".css") ? [child] : []);
    }),
  );
  return nested.flat();
}

async function tsxFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const child = path.join(directory, entry.name);
      if (entry.isDirectory()) return tsxFiles(child);
      return Promise.resolve(entry.name.endsWith(".tsx") ? [child] : []);
    }),
  );
  return nested.flat();
}

const files = await cssFiles(".next/static");
if (files.length === 0) {
  throw new Error("check:theme: Next emitted no production CSS artifacts");
}

const css = (
  await Promise.all(files.map((file) => readFile(file, "utf8")))
).join("\n");

const productionOwners = ["src/app", "src/components"];
const sourceFiles = (
  await Promise.all(productionOwners.map((directory) => tsxFiles(directory)))
).flat();
const productionClassNames = (
  await Promise.all(
    sourceFiles.map(async (file) =>
      classNameSource(await readFile(file, "utf8"), file),
    ),
  )
).join("\n");

const representativeUtilities = [
  "bg-canvas",
  "font-heading",
  "font-title",
  "text-signal",
  "min-h-touch",
  "text-nano",
  "text-micro",
  "text-field-meta",
  "text-ui",
  "text-caption",
  "text-label",
  "text-copy-sm",
  "text-copy",
  "text-copy-lg",
  "text-card-title",
  "text-control-lg",
  "text-heading-4",
  "text-heading-3-fixed",
  "text-article-subheading",
  "text-article-heading",
  "text-display-wide",
  "text-home-display",
  "text-display-fixed",
  "text-feature-stat",
  "text-account-title",
  "text-product-price",
  "text-lede",
  "leading-display-tightest",
  "leading-display",
  "leading-display-relaxed",
  "leading-heading",
  "leading-subheading",
  "leading-copy-tight",
  "leading-copy",
  "leading-meta",
  "leading-lede",
  "leading-rich-copy",
  "tracking-display-tight",
  "tracking-link",
  "tracking-control",
  "tracking-button",
  "tracking-label",
  "max-w-feature",
  "max-w-lede",
  "max-w-state",
  "max-w-form",
  "max-w-copy-narrow",
  "py-section-block",
  "py-section-block-compact",
  "py-section-block-short",
  "pb-section-block-bottom",
  "gap-feature-gap",
  "gap-article-gap",
  "gap-page-gap",
  "p-panel",
  "p-panel-wide",
  "mb-prose-block",
  "mb-prose-subhead",
  "mb-prose-paragraph",
  "mt-prose-section",
  "mb-home-copy",
  "animate-shell-panel",
  "min-h-page-min",
  "min-h-article-min",
  "shadow-button-inverse",
  "bg-media-card",
  "text-text-dark-lede",
  "text-text-dark-meta",
  "border-border-dark-subtle",
  "border-border-dark-divider",
  "border-border-field",
];

for (const utility of representativeUtilities) {
  if (
    !new RegExp(`(?:^|[\\s"':{])${utility}(?![\\w-])`).test(
      productionClassNames,
    )
  ) {
    throw new Error(
      `check:theme: production storefront markup does not consume ${utility}`,
    );
  }
  if (!css.includes(`.${utility}`)) {
    throw new Error(`check:theme: missing compiled utility .${utility}`);
  }
}

/* Compare semantic values because production minification removes leading
 * zeros, rewrites milliseconds as seconds, and converts alpha colours to hex. */
for (const [token, expected] of Object.entries(THEME_TOKENS)) {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const actual = new RegExp(`${escaped}:([^;}]+)`).exec(css)?.[1];
  if (actual === undefined) {
    throw new Error(`check:theme: missing compiled token ${token}`);
  }
  if (canonicalCssValue(actual) !== canonicalCssValue(expected)) {
    throw new Error(`check:theme: compiled token value drifted for ${token}`);
  }
}

console.log(
  `check:theme: ${files.length} CSS artifact(s), ${representativeUtilities.length} semantic utilities, and ${Object.keys(THEME_TOKENS).length} exact token values verified.`,
);
