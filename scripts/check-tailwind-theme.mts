/**
 * Compiled Tailwind theme contract.
 *
 * Runs after `next build` and verifies the production CSS artifact.
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

const files = await cssFiles(".next/static");
if (files.length === 0) {
  throw new Error("check:theme: Next emitted no production CSS artifacts");
}

const css = (
  await Promise.all(files.map((file) => readFile(file, "utf8")))
).join("\n");

const representativeUtilities = [
  "bg-canvas",
  "font-heading",
  "text-signal",
  "min-h-touch",
];

for (const utility of representativeUtilities) {
  if (!css.includes(`.${utility}`)) {
    throw new Error(`check:theme: missing compiled utility .${utility}`);
  }
}

const globals = await readFile("src/app/globals.css", "utf8");
const theme = globals.slice(
  globals.indexOf("@theme static {"),
  globals.indexOf("@layer base"),
);
const tokens = [...theme.matchAll(/^\s*(--[\w-]+):/gm)].map(
  ([, token]) => token,
);

if (tokens.length === 0) {
  throw new Error("check:theme: source theme contains no tokens");
}
for (const token of tokens) {
  if (!css.includes(`${token}:`)) {
    throw new Error(`check:theme: missing compiled token ${token}`);
  }
}

console.log(
  `check:theme: ${files.length} CSS artifact(s), ${representativeUtilities.length} semantic utilities, and ${tokens.length} theme tokens verified.`,
);
