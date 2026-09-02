/**
 * Compiled Tailwind theme contract.
 *
 * Runs after `next build` and verifies the production CSS artifact, not source
 * strings. Each representative utility must also be consumed by production
 * storefront markup, so a synthetic content hook cannot satisfy this check.
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

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
const productionMarkup = (
  await Promise.all(sourceFiles.map((file) => readFile(file, "utf8")))
).join("\n");
const productionClassNames = [
  ...productionMarkup.matchAll(
    /className\s*=\s*(?:"[^"]*"|'[^']*'|{[\s\S]*?})/g,
  ),
]
  .map(([className]) => className)
  .join("\n");

for (const utility of [
  "bg-canvas",
  "font-heading",
  "text-signal",
  "min-h-touch",
]) {
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

for (const token of [
  "--color-canvas:",
  "--color-signal:",
  "--font-heading:",
  "--spacing-touch:",
]) {
  if (!css.includes(token)) {
    throw new Error(`check:theme: missing compiled token ${token}`);
  }
}

console.log(
  `check:theme: ${files.length} CSS artifact(s), 4 semantic utilities, and 4 representative tokens verified.`,
);
