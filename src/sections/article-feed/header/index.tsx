"use client";

import { Section, type SectionProps } from "@/components/section";

import { IndexHeader } from "../../index-header";
import type { WeaverseElementProps } from "../../weaverse-element";
import { useArticleFeed } from "../context";

interface ArticleFeedHeaderProps extends WeaverseElementProps {
  width?: SectionProps["width"];
  eyebrowLabel?: string;
  heading?: string;
  lede?: string;
}

/**
 * The feed's dark masthead. On a `BLOG` page an empty heading falls back to
 * the blog's title; on `/journal` it hides the masthead.
 */
function ArticleFeedHeader({
  eyebrowLabel = "",
  heading = "",
  lede = "",
  width = "full",
  ...rest
}: ArticleFeedHeaderProps) {
  const feed = useArticleFeed();
  const title = heading || feed?.title || "";
  if (feed === null || title === "") return null;

  return (
    <Section {...rest} verticalPadding="none" width={width}>
      <IndexHeader eyebrowLabel={eyebrowLabel} heading={title} lede={lede} />
    </Section>
  );
}

export default ArticleFeedHeader;

export { schema } from "./schema";
