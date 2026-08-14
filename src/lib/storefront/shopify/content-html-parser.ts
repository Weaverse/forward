import type {
  ArticleBlock,
  PageSection,
  PolicySection,
  RichTextParagraph,
  RichTextRun,
} from "../types";
import { ShopifyCatalogError } from "./errors";

interface ParsedRichTextBlock {
  type: "heading" | "paragraph" | "pullquote";
  text: string;
  runs: RichTextParagraph;
}

interface ParsedNode {
  tag: string;
  textParts: string[];
  rawParts: string[];
  openRaw: string;
}

const DISALLOWED_TAG_PATTERN =
  /<\s*(script|style|form|iframe|embed|object|svg)\b/i;
const EVENT_HANDLER_PATTERN = /\son[a-z]+\s*=/i;
const LIQUID_PATTERN = /\{\{|\}\}|\{%|%\}/;
const COMMENT_PATTERN = /<!--[\s\S]*?-->/g;
const TAG_PATTERN = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;

const ALLOWED_TAGS = new Set([
  "a",
  "article",
  "b",
  "blockquote",
  "br",
  "div",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "i",
  "li",
  "main",
  "ol",
  "p",
  "section",
  "span",
  "strong",
  "u",
  "ul",
]);

const CANONICAL_INTERNAL_ROUTE_PATTERNS = [
  /^\/$/,
  /^\/shop(?:$|\/)/,
  /^\/products\/[^/?#]+$/,
  /^\/journal(?:$|\/)/,
  /^\/pages\/[^/?#]+$/,
  /^\/policies\/[^/?#]+$/,
  /^\/account(?:$|\/)/,
] as const;

const CANONICAL_COLLECTION_ROUTE_MAP = new Map<string, string>([
  ["/collections/forward", "/shop"],
  ["/collections/outerwear", "/shop/outerwear"],
  ["/collections/packs", "/shop/packs"],
  ["/collections/footwear", "/shop/footwear"],
]);

function normalizeCanonicalHref(href: string): string {
  return CANONICAL_COLLECTION_ROUTE_MAP.get(href) ?? href;
}

function fail(message: string): never {
  throw new ShopifyCatalogError(message);
}

function decodeEntities(text: string): string {
  return text.replace(
    /&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,
    (match, entity: string) => {
      switch (entity.toLowerCase()) {
        case "amp":
          return "&";
        case "lt":
          return "<";
        case "gt":
          return ">";
        case "quot":
          return '"';
        case "apos":
          return "'";
        case "nbsp":
          return " ";
        default:
          if (entity.startsWith("#x")) {
            return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
          }
          if (entity.startsWith("#")) {
            return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
          }
          return match;
      }
    },
  );
}

function normalizeText(text: string): string {
  return decodeEntities(text)
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function validateHref(href: string, context: string): void {
  if (href.startsWith("https://")) {
    let url: URL;
    try {
      url = new URL(href);
    } catch {
      fail(`${context} contains an invalid external link.`);
    }
    if (url.username.length > 0 || url.password.length > 0) {
      fail(`${context} contains an external link with credentials.`);
    }
    return;
  }

  const normalized = normalizeCanonicalHref(href);
  if (
    CANONICAL_INTERNAL_ROUTE_PATTERNS.some((pattern) =>
      pattern.test(normalized),
    )
  ) {
    return;
  }

  fail(`${context} contains a non-canonical link target.`);
}

function validateTagSyntax(raw: string, tag: string, context: string): void {
  if (raw.startsWith("</")) {
    if (!new RegExp(`^</${tag}\\s*>$`, "i").test(raw)) {
      fail(`${context} contains malformed closing tag </${tag}>.`);
    }
    return;
  }

  const inner = raw.slice(1, -1).trim().replace(/\/$/, "").trim();
  const attributes = inner.slice(tag.length).trim();
  if (tag !== "a") {
    if (attributes.length > 0) {
      fail(`${context} contains an unapproved attribute on <${tag}>.`);
    }
    return;
  }

  const href = attributes.match(/^href\s*=\s*(?:"([^"]*)"|'([^']*)')$/i);
  if (href === null) {
    fail(`${context} contains an unapproved or malformed attribute on <a>.`);
  }
  validateHref(href[1] ?? href[2] ?? "", context);
}

function readAnchorHref(raw: string): string {
  const href =
    raw
      .match(/href\s*=\s*(?:"([^"]*)"|'([^']*)')/i)
      ?.slice(1)
      .find(Boolean) ?? "";
  return normalizeCanonicalHref(href);
}

function normalizeRuns(runs: readonly RichTextRun[]): RichTextParagraph {
  const merged: RichTextRun[] = [];
  for (const run of runs) {
    const text = decodeEntities(run.text)
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ");
    if (text.length === 0) {
      continue;
    }
    const previous = merged.at(-1);
    if (previous !== undefined && previous.href === run.href) {
      previous.text += text;
    } else {
      merged.push(run.href ? { text, href: run.href } : { text });
    }
  }
  if (merged[0]) {
    merged[0].text = merged[0].text.trimStart();
  }
  const last = merged.at(-1);
  if (last) {
    last.text = last.text.trimEnd();
  }
  return merged.filter((run) => run.text.length > 0);
}

function parseInlineRuns(html: string): RichTextParagraph {
  const runs: RichTextRun[] = [];
  const hrefStack: string[] = [];
  let cursor = 0;
  for (const match of html.matchAll(TAG_PATTERN)) {
    const index = match.index ?? 0;
    const text = html.slice(cursor, index);
    const href = hrefStack.at(-1);
    if (text.length > 0) {
      runs.push(href ? { text, href } : { text });
    }
    const raw = match[0];
    if (match[1]?.toLowerCase() === "a") {
      if (raw.startsWith("</")) {
        hrefStack.pop();
      } else {
        hrefStack.push(readAnchorHref(raw));
      }
    }
    cursor = index + raw.length;
  }
  const tail = html.slice(cursor);
  const href = hrefStack.at(-1);
  if (tail.length > 0) {
    runs.push(href ? { text: tail, href } : { text: tail });
  }
  return normalizeRuns(runs);
}

function validateHtml(html: string, context: string): string {
  const trimmed = html.trim();
  if (trimmed.length === 0) {
    fail(`${context} HTML is empty.`);
  }
  if (LIQUID_PATTERN.test(trimmed)) {
    fail(`${context} contains Liquid markup, which is rejected.`);
  }
  if (DISALLOWED_TAG_PATTERN.test(trimmed)) {
    const match =
      trimmed.match(DISALLOWED_TAG_PATTERN)?.[0] ?? "disallowed tag";
    fail(`${context} contains unsupported markup (${match}).`);
  }
  if (EVENT_HANDLER_PATTERN.test(trimmed)) {
    fail(`${context} contains an inline event handler attribute.`);
  }
  const withoutComments = trimmed.replace(COMMENT_PATTERN, "");
  for (const match of withoutComments.matchAll(TAG_PATTERN)) {
    const tag = match[1]?.toLowerCase() ?? "";
    if (!ALLOWED_TAGS.has(tag)) {
      fail(`${context} contains unsupported tag <${tag}>.`);
    }
    validateTagSyntax(match[0], tag, context);
  }
  if (/[<>]/.test(withoutComments.replace(TAG_PATTERN, ""))) {
    fail(`${context} contains malformed HTML.`);
  }
  return withoutComments;
}

function appendText(
  target: ParsedNode | null,
  text: string,
  rootText: string[],
): void {
  if (text.length === 0) {
    return;
  }
  if (target === null) {
    rootText.push(text);
    return;
  }
  target.textParts.push(text);
  target.rawParts.push(text);
}

function extractBlocks(
  html: string,
  context: string,
): readonly ParsedRichTextBlock[] {
  const sanitized = validateHtml(html, context);
  const stack: ParsedNode[] = [];
  const blocks: ParsedRichTextBlock[] = [];
  const rootText: string[] = [];
  let cursor = 0;

  for (const match of sanitized.matchAll(TAG_PATTERN)) {
    const index = match.index ?? 0;
    const raw = match[0];
    const tag = match[1]?.toLowerCase() ?? "";

    appendText(stack.at(-1) ?? null, sanitized.slice(cursor, index), rootText);
    cursor = index + raw.length;

    if (!ALLOWED_TAGS.has(tag)) {
      fail(`${context} contains unsupported tag <${tag}>.`);
    }

    const isClosing = raw.startsWith("</");
    if (tag === "br") {
      appendText(stack.at(-1) ?? null, " ", rootText);
      continue;
    }

    if (isClosing) {
      const node = stack.pop();
      if (node === undefined || node.tag !== tag) {
        fail(`${context} contains malformed HTML.`);
      }
      const text = normalizeText(node.textParts.join(""));
      const runs = parseInlineRuns(node.rawParts.join(""));
      const parent = stack.at(-1) ?? null;

      if (["h1", "h2", "h3", "h4"].includes(tag)) {
        if (text.length === 0) {
          fail(`${context} contains an empty heading.`);
        }
        blocks.push({ type: "heading", text, runs });
      } else if (tag === "p" && parent?.tag !== "blockquote") {
        if (text.length > 0) {
          blocks.push({ type: "paragraph", text, runs });
        }
      } else if (tag === "blockquote") {
        if (text.length === 0) {
          fail(`${context} contains an empty blockquote.`);
        }
        blocks.push({ type: "pullquote", text, runs });
      } else if (tag === "li") {
        if (text.length > 0) {
          blocks.push({ type: "paragraph", text, runs });
        }
      } else if (text.length > 0) {
        if (parent === null) {
          rootText.push(text);
        } else {
          parent.textParts.push(node.textParts.join(""));
          parent.rawParts.push(
            `${node.openRaw}${node.rawParts.join("")}${raw}`,
          );
        }
      }
      continue;
    }

    stack.push({ tag, textParts: [], rawParts: [], openRaw: raw });
  }

  appendText(stack.at(-1) ?? null, sanitized.slice(cursor), rootText);

  if (stack.length > 0) {
    fail(`${context} contains malformed HTML.`);
  }

  const looseText = normalizeText(rootText.join(" "));
  if (looseText.length > 0) {
    blocks.unshift({
      type: "paragraph",
      text: looseText,
      runs: [{ text: looseText }],
    });
  }

  if (blocks.length === 0) {
    fail(`${context} did not produce any readable blocks.`);
  }

  return blocks;
}

export function parseArticleHtml(
  html: string,
  context: string,
): readonly ArticleBlock[] {
  return extractBlocks(html, context);
}

function collectSections(
  blocks: readonly ParsedRichTextBlock[],
  fallbackHeading: string,
): readonly PolicySection[] {
  const sections: PolicySection[] = [];
  let current: PolicySection | null = null;

  for (const block of blocks) {
    if (block.type === "heading") {
      current = { heading: block.text, paragraphs: [] };
      sections.push(current);
      continue;
    }

    if (current === null) {
      current = { heading: fallbackHeading, paragraphs: [] };
      sections.push(current);
    }

    current.paragraphs = [...current.paragraphs, block.runs];
  }

  return sections.filter((section) => section.paragraphs.length > 0);
}

export function parsePageHtml(
  body: string,
  bodySummary: string | undefined,
  context: string,
  fallbackHeadings: readonly string[],
): { intro: string; sections: readonly PageSection[] } {
  const blocks = extractBlocks(body, context);
  const introFromSummary = bodySummary?.trim();
  const firstParagraph = blocks.find(
    (block) => block.type === "paragraph",
  )?.text;
  const intro =
    firstParagraph ??
    (introFromSummary && introFromSummary.length > 0
      ? introFromSummary
      : undefined);

  if (intro === undefined || intro.length === 0) {
    fail(`${context} intro is missing.`);
  }

  const sections: PageSection[] = [];
  let current: PageSection | null = null;
  let introConsumed = false;

  for (const block of blocks) {
    if (block.type === "heading") {
      current = { heading: block.text, paragraphs: [] };
      sections.push(current);
      continue;
    }

    if (!introConsumed && firstParagraph === block.text && current === null) {
      introConsumed = true;
      continue;
    }

    if (current !== null) {
      current.paragraphs = [...current.paragraphs, block.runs];
    }
  }

  const populatedSections = sections.filter(
    (section) => section.paragraphs.length > 0,
  );
  if (populatedSections.length > 0) {
    return { intro, sections: populatedSections };
  }

  const remainingParagraphs = blocks
    .filter((block) => block.type !== "heading")
    .slice(1);
  if (remainingParagraphs.length !== fallbackHeadings.length) {
    fail(
      `${context} paragraph structure does not match its presentation profile.`,
    );
  }
  return {
    intro,
    sections: remainingParagraphs.map((paragraph, index) => ({
      heading: fallbackHeadings[index] ?? "",
      paragraphs: [paragraph.runs],
    })),
  };
}

export function parsePolicyHtml(
  html: string,
  title: string,
  context: string,
): readonly PolicySection[] {
  const sections = collectSections(extractBlocks(html, context), title);
  if (sections.length === 0) {
    fail(`${context} did not produce any policy sections.`);
  }
  return sections;
}
