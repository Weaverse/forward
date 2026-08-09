import {
  getArticlePresentationProfile,
  getPagePresentationProfile,
  getPolicyPresentationProfile,
} from "../content-presentation";
import type { JournalArticle, Policy, StorePage } from "../types";
import { ShopifyCatalogError } from "./errors";
import {
  parseArticleHtml,
  parsePageHtml,
  parsePolicyHtml,
} from "./content-html-parser";
import {
  CONTENT_ARTICLE_HANDLES,
  CONTENT_BLOG_HANDLE,
  CONTENT_PAGE_HANDLES,
  CONTENT_POLICY_HANDLES,
} from "./content-query";
import type { ContentQueryResult } from "./content-client";

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

function readRequiredHandleSet<T>(
  nodes: readonly unknown[],
  expectedHandles: readonly string[],
  context: string,
  mapNode: (node: Record<string, unknown>, handle: string) => T,
): readonly T[] {
  const byHandle = new Map<string, T>();

  for (const [index, entry] of nodes.entries()) {
    const node = asRecord(entry, `${context} node ${index}`);
    const handle = asText(node.handle, `${context} node ${index} handle`);
    if (!expectedHandles.includes(handle)) {
      fail(`${context} returned unexpected handle "${handle}".`);
    }
    if (handle === "data-sharing-opt-out") {
      fail(`${context} returned excluded handle "data-sharing-opt-out".`);
    }
    if (byHandle.has(handle)) {
      fail(`${context} returned duplicate handle "${handle}".`);
    }
    byHandle.set(handle, mapNode(node, handle));
  }

  for (const handle of expectedHandles) {
    if (!byHandle.has(handle)) {
      fail(`${context} is missing required handle "${handle}".`);
    }
  }

  return expectedHandles.map((handle) => {
    const value = byHandle.get(handle);
    if (value === undefined) {
      fail(`${context} is missing required handle "${handle}".`);
    }
    return value;
  });
}

function readArticleNodes(
  data: Record<string, unknown>,
): readonly Record<string, unknown>[] {
  const blog = data.blog;
  if (blog === null || blog === undefined) {
    fail("content blog is missing.");
  }
  const blogRecord = asRecord(blog, "content blog");
  if (
    asText(blogRecord.handle, "content blog handle") !== CONTENT_BLOG_HANDLE
  ) {
    fail("content blog handle did not match the approved handle.");
  }
  const articlesConnection = asRecord(
    blogRecord.articles,
    "content blog articles",
  );
  ensureNoPagination(articlesConnection.pageInfo, "content blog articles");
  return readRequiredHandleSet(
    asArray(articlesConnection.nodes, "content blog article nodes"),
    CONTENT_ARTICLE_HANDLES,
    "content blog articles",
    (node) => node,
  );
}

function readPageNodes(
  data: Record<string, unknown>,
): readonly Record<string, unknown>[] {
  return readRequiredHandleSet(
    [data.aboutForward, data.fieldRepair, data.shippingReturns, data.contact],
    CONTENT_PAGE_HANDLES,
    "content pages",
    (node) => node,
  );
}

function readPolicyNodes(
  data: Record<string, unknown>,
): readonly Record<string, unknown>[] {
  const shop = asRecord(data.shop, "content shop");
  return readRequiredHandleSet(
    [
      shop.privacyPolicy,
      shop.refundPolicy,
      shop.shippingPolicy,
      shop.termsOfService,
    ],
    CONTENT_POLICY_HANDLES,
    "shop policies",
    (entry, handle) => {
      asText(entry.title, `${handle} title`);
      asText(entry.body, `${handle} body`);
      return entry;
    },
  );
}

export function mapContentArticles(
  result: ContentQueryResult,
): readonly JournalArticle[] {
  const data = readData(result);
  return readArticleNodes(data).map((node) => {
    const handle = asText(node.handle, "content article handle");
    const presentation = getArticlePresentationProfile(handle);
    if (presentation === null) {
      fail(`content article "${handle}" has no presentation profile.`);
    }
    return {
      handle,
      title: asText(node.title, `${handle} title`),
      excerpt: asText(node.excerpt, `${handle} excerpt`),
      plate: presentation.plate,
      publishedAt: normalizePublishedAt(
        node.publishedAt,
        `${handle} publishedAt`,
      ),
      readingMinutes: presentation.readingMinutes,
      location: presentation.location,
      coordinates: presentation.coordinates,
      heroImage: presentation.heroImage,
      body: parseArticleHtml(
        asText(node.contentHtml, `${handle} contentHtml`),
        handle,
      ),
    } satisfies JournalArticle;
  });
}

export function mapContentPages(
  result: ContentQueryResult,
): readonly StorePage[] {
  const data = readData(result);
  return readPageNodes(data).map((node) => {
    const handle = asText(node.handle, "content page handle");
    const presentation = getPagePresentationProfile(handle);
    if (presentation === null) {
      fail(`content page "${handle}" has no presentation profile.`);
    }
    const mapped = parsePageHtml(
      asText(node.body, `${handle} body`),
      asOptionalText(node.bodySummary),
      handle,
      presentation.sectionHeadings,
    );
    return {
      handle,
      title: asText(node.title, `${handle} title`),
      eyebrow: presentation.eyebrow,
      intro: mapped.intro,
      heroImage: presentation.heroImage,
      sections: mapped.sections,
    } satisfies StorePage;
  });
}

export function mapContentPolicies(
  result: ContentQueryResult,
): readonly Policy[] {
  const data = readData(result);
  return readPolicyNodes(data).map((node) => mapPolicyNode(node));
}

function mapPolicyNode(node: Record<string, unknown>): Policy {
  const handle = asText(node.handle, "policy handle");
  const title = asText(node.title, `${handle} title`);
  const presentation = getPolicyPresentationProfile(handle);
  if (presentation === null) {
    fail(`policy "${handle}" has no presentation profile.`);
  }
  return {
    handle,
    title,
    summary: presentation.summary,
    updatedAt: undefined,
    sections: parsePolicyHtml(
      asText(node.body, `${handle} body`),
      title,
      handle,
    ),
  } satisfies Policy;
}

export function mapContentPolicy(
  result: ContentQueryResult,
  handle: string,
): Policy | null {
  const data = readData(result);
  const node = readPolicyNodes(data).find(
    (entry) => asText(entry.handle, "policy handle") === handle,
  );
  if (node === undefined) {
    return null;
  }
  return mapPolicyNode(node);
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
