import { isShopifyProductImageUrl } from "../image-source";
import type {
  JournalArticle,
  Policy,
  StorefrontImage,
  StorePage,
} from "../types";
import type { ContentQueryResult } from "./content-client";
import {
  parseArticleHtml,
  parsePageHtml,
  parsePolicyHtml,
} from "./content-html-parser";
import { ShopifyCatalogError } from "./errors";

export interface MappedContentResult {
  articles: readonly JournalArticle[];
  pages: readonly StorePage[];
  policies: readonly Policy[];
}

function fail(message: string): never {
  throw new ShopifyCatalogError(message);
}

function asRecord(value: unknown, context: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(`${context} is not an object.`);
  }
  return value as Record<string, unknown>;
}

function asArray(value: unknown, context: string): readonly unknown[] {
  if (!Array.isArray(value)) {
    fail(`${context} is not an array.`);
  }
  return value;
}

function asText(value: unknown, context: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(`${context} is missing or empty.`);
  }
  return value.trim();
}

function asOptionalText(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function ensureNoPagination(value: unknown, context: string): void {
  const pageInfo = asRecord(value, `${context} pageInfo`);
  if (pageInfo.hasNextPage === true) {
    fail(`${context} hasNextPage exceeded the configured bound.`);
  }
}

function normalizePublishedAt(value: unknown, context: string): string {
  const raw = asText(value, context);
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    fail(`${context} is not a valid date.`);
  }
  return date.toISOString().slice(0, 10);
}

function readData(result: ContentQueryResult): Record<string, unknown> {
  if (result.data == null) {
    fail("Storefront API content response did not contain data.");
  }
  return asRecord(result.data, "content data");
}

/** Nodes keyed by handle; two with one handle is a broken response. */
function uniqueNodes(
  nodes: readonly unknown[],
  context: string,
): readonly Record<string, unknown>[] {
  const seen = new Set<string>();
  return nodes.map((entry, index) => {
    const node = asRecord(entry, `${context} node ${index}`);
    const handle = asText(node.handle, `${context} node ${index} handle`);
    if (seen.has(handle)) {
      fail(`${context} returned duplicate handle "${handle}".`);
    }
    seen.add(handle);
    return node;
  });
}

function readConnection(
  value: unknown,
  context: string,
): readonly Record<string, unknown>[] {
  const connection = asRecord(value, context);
  ensureNoPagination(connection.pageInfo, context);
  return uniqueNodes(asArray(connection.nodes, `${context} nodes`), context);
}

/** An optional `forward.*` metafield's text, or empty when the store set none. */
function metafieldText(value: unknown, context: string): string {
  if (value === null || value === undefined) {
    return "";
  }
  return asOptionalText(asRecord(value, context).value)?.trim() ?? "";
}

/** The article's own image, or `null` when it has none the theme can serve. */
function mapArticleImage(
  value: unknown,
  title: string,
  context: string,
): StorefrontImage | null {
  if (value === null || value === undefined) {
    return null;
  }
  const record = asRecord(value, `${context} image`);
  const src = asText(record.url, `${context} image url`);
  const { width, height, altText } = record;
  if (
    !isShopifyProductImageUrl(src) ||
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    (width as number) <= 0 ||
    (height as number) <= 0
  ) {
    return null;
  }
  return {
    src,
    alt: typeof altText === "string" && altText.length > 0 ? altText : title,
    width: width as number,
    height: height as number,
  };
}

const WORDS_PER_MINUTE = 200;

function readingMinutes(html: string): number {
  const words = html
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/**
 * A body the theme cannot render safely leaves its one entry out — its route
 * answers 404 — rather than taking every other page down with it. The parser
 * still refuses the markup; nothing unsafe is ever rendered.
 */
function renderable<T>(parse: () => T): T | null {
  try {
    return parse();
  } catch (error) {
    if (error instanceof ShopifyCatalogError) {
      return null;
    }
    throw error;
  }
}

function isPresent<T>(value: T | null): value is T {
  return value !== null;
}

/**
 * Every article the store publishes, newest first.
 *
 * The plate is the article's place in the journal, counted from the oldest,
 * and the reading time is its length at an average pace — both derived from
 * the store rather than kept in a table the theme would have to maintain.
 */
export function mapContentArticles(
  result: ContentQueryResult,
): readonly JournalArticle[] {
  const nodes = readConnection(readData(result).articles, "content articles");
  return nodes
    .map((node, index) => {
      const handle = asText(node.handle, "content article handle");
      const title = asText(node.title, `${handle} title`);
      const html = asOptionalText(node.contentHtml)?.trim() ?? "";
      const body = renderable(() =>
        html.length === 0 ? [] : parseArticleHtml(html, handle),
      );
      if (body === null) {
        return null;
      }
      return {
        handle,
        title,
        excerpt: asOptionalText(node.excerpt)?.trim() ?? "",
        plate: `No. ${String(nodes.length - index).padStart(2, "0")}`,
        publishedAt: normalizePublishedAt(
          node.publishedAt,
          `${handle} publishedAt`,
        ),
        readingMinutes: readingMinutes(html),
        location: metafieldText(node.location, `${handle} location`),
        coordinates: metafieldText(node.coordinates, `${handle} coordinates`),
        heroImage: mapArticleImage(node.image, title, handle),
        body,
      } satisfies JournalArticle;
    })
    .filter(isPresent);
}

/**
 * Every page the store publishes. A page has no eyebrow or image of its own
 * in Shopify, so the page hero falls back to its section settings.
 */
export function mapContentPages(
  result: ContentQueryResult,
): readonly StorePage[] {
  return readConnection(readData(result).pages, "content pages")
    .map((node) => {
      const handle = asText(node.handle, "content page handle");
      const title = asText(node.title, `${handle} title`);
      const mapped = renderable(() =>
        parsePageHtml(
          asOptionalText(node.body) ?? "",
          asOptionalText(node.bodySummary),
          handle,
        ),
      );
      if (mapped === null) {
        return null;
      }
      return {
        handle,
        title,
        eyebrow: "",
        intro: mapped.intro,
        sections: mapped.sections,
      } satisfies StorePage;
    })
    .filter(isPresent);
}

/** The store's policies; one it has not written is simply absent. */
function readPolicyNodes(
  data: Record<string, unknown>,
): readonly Record<string, unknown>[] {
  const shop = asRecord(data.shop, "content shop");
  return uniqueNodes(
    [
      shop.privacyPolicy,
      shop.refundPolicy,
      shop.shippingPolicy,
      shop.termsOfService,
    ].filter((entry) => entry !== null && entry !== undefined),
    "shop policies",
  );
}

export function mapContentPolicies(
  result: ContentQueryResult,
): readonly Policy[] {
  return readPolicyNodes(readData(result)).map(mapPolicyNode).filter(isPresent);
}

function mapPolicyNode(node: Record<string, unknown>): Policy | null {
  const handle = asText(node.handle, "policy handle");
  const title = asText(node.title, `${handle} title`);
  const body = asText(node.body, `${handle} body`);
  const sections = renderable(() => parsePolicyHtml(body, title, handle));
  if (sections === null) {
    return null;
  }
  return {
    handle,
    title,
    summary: "",
    updatedAt: undefined,
    sections,
  } satisfies Policy;
}

export function mapContentPolicy(
  result: ContentQueryResult,
  handle: string,
): Policy | null {
  const node = readPolicyNodes(readData(result)).find(
    (entry) => asText(entry.handle, "policy handle") === handle,
  );
  return node === undefined ? null : mapPolicyNode(node);
}

export function validateContentResult(result: ContentQueryResult): void {
  mapContentResult(result);
}

export function mapContentResult(
  result: ContentQueryResult,
): MappedContentResult {
  return {
    articles: mapContentArticles(result),
    pages: mapContentPages(result),
    policies: mapContentPolicies(result),
  };
}
