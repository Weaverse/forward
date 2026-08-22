/**
 * Compiled Tailwind theme contract.
 *
 * Runs after `next build` and verifies the production CSS artifact, not source
 * strings. The non-rendering meta probe in `app/layout.tsx` keeps these four
 * representative semantic utilities in Tailwind's content graph.
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

for (const utility of [
  ".bg-canvas",
  ".font-heading",
  ".max-w-page",
  ".text-signal",
]) {
  if (!css.includes(utility)) {
    throw new Error(`check:theme: missing compiled utility ${utility}`);
  }
}

for (const token of [
  "--color-canvas:",
  "--color-signal:",
  "--font-heading:",
  "--container-page:",
]) {
  if (!css.includes(token)) {
    throw new Error(`check:theme: missing compiled token ${token}`);
  }
}

console.log(
  `check:theme: ${files.length} CSS artifact(s), 4 semantic utilities, and 4 representative tokens verified.`,
);
