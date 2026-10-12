"use client";

import { Section, type SectionProps } from "@/components/section";

import { ArticleFeedContext } from "../article-feed/context";
import type { AllArticlesLoaderData } from "./loader";

interface AllArticlesProps extends SectionProps {
  loaderData?: AllArticlesLoaderData | null;
}

/**
 * Every article in the store, across all blogs. Composes `/journal`.
 *
 * The shell reads the articles in its loader and hands them to its `af--*`
 * children, which own the layout of each part. It runs full width by default
 * because the header and the latest-article card are full-bleed.
 */
function AllArticles({
  loaderData,
  width = "full",
  verticalPadding = "none",
  ...rest
}: AllArticlesProps) {
  return (
    <ArticleFeedContext value={{ articles: loaderData?.articles ?? [] }}>
      <Section {...rest} verticalPadding={verticalPadding} width={width} />
    </ArticleFeedContext>
  );
}

export default AllArticles;

export { schema } from "./schema";
