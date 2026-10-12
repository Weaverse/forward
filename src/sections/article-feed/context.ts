"use client";

import { createContext, useContext } from "react";

import type { JournalArticle } from "@/lib/storefront/types";

export interface ArticleFeedState {
  /** Newest first. */
  articles: readonly JournalArticle[];
  /** The blog's title on a `BLOG` page; the header falls back to it. */
  title?: string;
}

export const ArticleFeedContext = createContext<ArticleFeedState | null>(null);

/**
 * What every `af--*` child renders from: the articles its shell provides —
 * `all-articles` from its loader, `main-blog` from the route. A child outside
 * either shell renders nothing.
 */
export function useArticleFeed(): ArticleFeedState | null {
  return useContext(ArticleFeedContext);
}
