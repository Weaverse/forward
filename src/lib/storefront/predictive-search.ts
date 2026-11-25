/**
 * Predictive search results as the search combobox renders them.
 *
 * The browser reads Hydrogen's `/api/predictive-search` handler (registered in
 * the proxy), whose JSON is the Storefront API's raw shape. This module is the
 * one place that shape is read: it turns each result into a Forward path and
 * keeps only images the theme's image allowlist accepts. It is safe to import
 * from client code (types only from Hydrogen).
 */

import type { PredictiveSearchData } from "@shopify/hydrogen";

import { isShopifyProductImageUrl } from "./image-source";
import type { Money } from "./types";

/** The handler's path; the browser prefixes it with the page's market. */
export const PREDICTIVE_SEARCH_PATH = "/api/predictive-search";

export type PredictiveSearchKind =
  | "query"
  | "product"
  | "collection"
  | "page"
  | "article";

export interface PredictiveSearchOption {
  kind: PredictiveSearchKind;
  title: string;
  /** Unprefixed Forward path; `Link` adds the market. */
  href: string;
  /** A validated Shopify CDN URL, or `null`. */
  image: string | null;
  price: Money | null;
}

export interface PredictiveSearchGroup {
  kind: PredictiveSearchKind;
  options: PredictiveSearchOption[];
}

type Items = PredictiveSearchData["items"];

/** Appends Shopify's search tracking parameters, which attribute the click. */
function withTracking(
  path: string,
  params: Record<string, string>,
  tracking: string | null | undefined,
): string {
  const query = new URLSearchParams(params);
  for (const [name, value] of new URLSearchParams(tracking ?? "")) {
    query.append(name, value);
  }
  const search = query.toString();
  return search === "" ? path : `${path}?${search}`;
}

function validImage(url: string | null | undefined): string | null {
  return url != null && isShopifyProductImageUrl(url) ? url : null;
}

function money(
  price: { amount: string; currencyCode: string } | null | undefined,
): Money | null {
  const amount = Number(price?.amount);
  return price != null && Number.isFinite(amount)
    ? { amount, currencyCode: price.currencyCode }
    : null;
}

/** The non-empty result groups, suggestions first. */
export function predictiveSearchGroups(items: Items): PredictiveSearchGroup[] {
  const groups: PredictiveSearchGroup[] = [
    {
      kind: "query",
      options: items.queries.map((query) => ({
        kind: "query",
        title: query.text,
        href: withTracking(
          "/search",
          { q: query.text },
          query.trackingParameters,
        ),
        image: null,
        price: null,
      })),
    },
    {
      kind: "product",
      options: items.products.map((product) => ({
        kind: "product",
        title: product.title,
        href: withTracking(
          `/products/${product.handle}`,
          {},
          product.trackingParameters,
        ),
        image: validImage(product.selectedOrFirstAvailableVariant?.image?.url),
        price: money(product.selectedOrFirstAvailableVariant?.price),
      })),
    },
    {
      kind: "collection",
      options: items.collections.map((collection) => ({
        kind: "collection",
        title: collection.title,
        href: withTracking(
          `/shop/${collection.handle}`,
          {},
          collection.trackingParameters,
        ),
        image: validImage(collection.image?.url),
        price: null,
      })),
    },
    {
      kind: "page",
      options: items.pages.map((page) => ({
        kind: "page",
        title: page.title,
        href: withTracking(
          `/pages/${page.handle}`,
          {},
          page.trackingParameters,
        ),
        image: null,
        price: null,
      })),
    },
    {
      kind: "article",
      options: items.articles.map((article) => ({
        kind: "article",
        title: article.title,
        href: withTracking(
          `/journal/${article.handle}`,
          {},
          article.trackingParameters,
        ),
        image: validImage(article.image?.url),
        price: null,
      })),
    },
  ];
  return groups.filter((group) => group.options.length > 0);
}
