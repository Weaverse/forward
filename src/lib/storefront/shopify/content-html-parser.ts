import {
  type DefaultTreeAdapterTypes,
  defaultTreeAdapter,
  html as parse5Html,
  parseFragment,
} from "parse5";

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

interface ParsedNodeContent {
  textParts: string[];
  runs: RichTextRun[];
}

interface SourceSpan {
  start: number;
  end: number;
}

const LIQUID_PATTERN = /\{\{|\}\}|\{%|%\}/;

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

function normalizeText(text: string): string {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function validateHref(href: string, context: string): void {
  if (href.includes("\\")) {
    fail(`${context} contains a non-canonical link target.`);
  }

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

function hasQuotedAttributeValue(source: string): boolean {
  const equalsIndex = source.indexOf("=");
  if (equalsIndex === -1) {
    return false;
  }
  const value = source.slice(equalsIndex + 1).trim();
  const quote = value[0];
  return (
    value.length >= 2 &&
    (quote === '"' || quote === "'") &&
    value.at(-1) === quote
  );
}

function addSpan(
  location: { startOffset: number; endOffset: number } | null | undefined,
  spans: SourceSpan[],
  context: string,
): void {
  if (location === null || location === undefined) {
    fail(`${context} contains malformed HTML.`);
  }
  spans.push({ start: location.startOffset, end: location.endOffset });
}

function validateElement(
  element: DefaultTreeAdapterTypes.Element,
  html: string,
  spans: SourceSpan[],
  context: string,
): void {
  const tag = element.tagName;
  if (element.namespaceURI !== parse5Html.NS.HTML || !ALLOWED_TAGS.has(tag)) {
    fail(`${context} contains unsupported markup.`);
  }

  const location = element.sourceCodeLocation;
  addSpan(location?.startTag, spans, context);
  if (tag === "br") {
    if (location?.endTag !== undefined || element.childNodes.length > 0) {
      fail(`${context} contains malformed HTML.`);
    }
  } else {
    addSpan(location?.endTag, spans, context);
  }

  if (element.attrs.some((attribute) => attribute.name.startsWith("on"))) {
    fail(`${context} contains an inline event handler attribute.`);
  }

  if (tag === "a") {
    const attribute = element.attrs[0];
    if (
      element.attrs.length !== 1 ||
      attribute?.name !== "href" ||
      attribute.namespace !== undefined ||
      attribute.prefix !== undefined
    ) {
      fail(`${context} contains an unapproved attribute on <a>.`);
    }
    const attributeLocation = location?.attrs?.href;
    if (
      attributeLocation === undefined ||
      !hasQuotedAttributeValue(
        html.slice(attributeLocation.startOffset, attributeLocation.endOffset),
      )
    ) {
      fail(`${context} contains an unapproved or malformed attribute on <a>.`);
    }
    validateHref(attribute.value, context);
  } else if (element.attrs.length > 0) {
    fail(`${context} contains an unapproved attribute on <${tag}>.`);
  }

  for (const child of element.childNodes) {
    validateNode(child, html, spans, context);
  }
}

function validateNode(
  node: DefaultTreeAdapterTypes.ChildNode,
  html: string,
  spans: SourceSpan[],
  context: string,
): void {
  if (
    defaultTreeAdapter.isTextNode(node) ||
    defaultTreeAdapter.isCommentNode(node)
  ) {
    addSpan(node.sourceCodeLocation, spans, context);
    return;
  }
  if (defaultTreeAdapter.isDocumentTypeNode(node)) {
    fail(`${context} contains unsupported markup.`);
  }
  validateElement(node, html, spans, context);
}

function parseHtmlFragment(
  html: string,
  context: string,
): DefaultTreeAdapterTypes.DocumentFragment {
  const trimmed = html.trim();
  if (trimmed.length === 0) {
    fail(`${context} HTML is empty.`);
  }
  if (LIQUID_PATTERN.test(trimmed)) {
    fail(`${context} contains Liquid markup, which is rejected.`);
  }

  const parseErrors: string[] = [];
  const fragment = parseFragment(trimmed, {
    sourceCodeLocationInfo: true,
    onParseError: (error) => parseErrors.push(error.code),
  });
  if (parseErrors.length > 0) {
    fail(`${context} contains malformed HTML.`);
  }

  const spans: SourceSpan[] = [];
  for (const child of fragment.childNodes) {
    validateNode(child, trimmed, spans, context);
  }
  // parse5 can recover without reporting an error; every source token must
  // still belong to an explicitly located node in the accepted tree.
  spans.sort((left, right) => left.start - right.start);
  let cursor = 0;
  for (const span of spans) {
    if (span.start !== cursor || span.end <= span.start) {
      fail(`${context} contains malformed HTML.`);
    }
    cursor = span.end;
  }
  if (cursor !== trimmed.length) {
    fail(`${context} contains malformed HTML.`);
  }
  return fragment;
}

function normalizeRuns(runs: readonly RichTextRun[]): RichTextParagraph {
  const merged: RichTextRun[] = [];
  for (const run of runs) {
    const text = run.text.replace(/\u00a0/g, " ").replace(/\s+/g, " ");
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

function appendContent(
  target: ParsedNodeContent,
  source: ParsedNodeContent,
): void {
  target.textParts.push(...source.textParts);
  target.runs.push(...source.runs);
}

function extractNodeContent(
  node: DefaultTreeAdapterTypes.ChildNode,
  parentTag: string | undefined,
  blocks: ParsedRichTextBlock[],
  context: string,
): ParsedNodeContent {
  if (defaultTreeAdapter.isTextNode(node)) {
    return { textParts: [node.value], runs: [{ text: node.value }] };
  }
  if (
    defaultTreeAdapter.isCommentNode(node) ||
    defaultTreeAdapter.isDocumentTypeNode(node)
  ) {
    return { textParts: [], runs: [] };
  }

  const tag = node.tagName;
  if (tag === "br") {
    return { textParts: [" "], runs: [{ text: " " }] };
  }

  const content: ParsedNodeContent = { textParts: [], runs: [] };
  for (const child of node.childNodes) {
    appendContent(content, extractNodeContent(child, tag, blocks, context));
  }

  if (tag === "a") {
    const href = normalizeCanonicalHref(node.attrs[0]?.value ?? "");
    content.runs = content.runs.map((run) => ({ ...run, href }));
  }

  const text = normalizeText(content.textParts.join(""));
  const runs = normalizeRuns(content.runs);
  if (["h1", "h2", "h3", "h4"].includes(tag)) {
    if (text.length === 0) {
      fail(`${context} contains an empty heading.`);
    }
    blocks.push({ type: "heading", text, runs });
    return { textParts: [], runs: [] };
  }
  if (tag === "p" && parentTag !== "blockquote") {
    if (text.length > 0) {
      blocks.push({ type: "paragraph", text, runs });
    }
    return { textParts: [], runs: [] };
  }
  if (tag === "blockquote") {
    if (text.length === 0) {
      fail(`${context} contains an empty blockquote.`);
    }
    blocks.push({ type: "pullquote", text, runs });
    return { textParts: [], runs: [] };
  }
  if (tag === "li") {
    if (text.length > 0) {
      blocks.push({ type: "paragraph", text, runs });
    }
    return { textParts: [], runs: [] };
  }
  return content;
}

function extractBlocks(
  html: string,
  context: string,
): readonly ParsedRichTextBlock[] {
  const fragment = parseHtmlFragment(html, context);
  const blocks: ParsedRichTextBlock[] = [];
  const rootContent: ParsedNodeContent = { textParts: [], runs: [] };

  for (const child of fragment.childNodes) {
    appendContent(
      rootContent,
      extractNodeContent(child, undefined, blocks, context),
    );
  }

  const looseText = normalizeText(rootContent.textParts.join(" "));
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
