"use client";

import { Section, type SectionProps } from "@/components/section";
import { useStorefrontContext } from "@/lib/weaverse/data-context";

import { ArticleFeedContext } from "../article-feed/context";

/**
 * One blog's articles. The blog is decided by the route, not by a merchant,
 * so it arrives through the shared data context and is handed to the `af--*`
 * children with its title, which the header falls back to.
 */
function MainBlog({
  width = "full",
  verticalPadding = "none",
  ...rest
}: SectionProps) {
  const { blog } = useStorefrontContext();
  if (blog === undefined) return null;

  return (
    <ArticleFeedContext value={{ articles: blog.articles, title: blog.title }}>
      <Section {...rest} verticalPadding={verticalPadding} width={width} />
    </ArticleFeedContext>
  );
}

export default MainBlog;

export { schema } from "./schema";
