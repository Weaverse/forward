"use client";

import { Section, type SectionProps } from "@/components/section";

import { JournalGrid } from "../../journal-grid";
import type { WeaverseElementProps } from "../../weaverse-element";
import { useArticleFeed } from "../context";

interface ArticleFeedGridProps extends WeaverseElementProps {
  width?: SectionProps["width"];
  verticalPadding?: SectionProps["verticalPadding"];
  eyebrowLabel?: string;
  heading?: string;
  linkLabel?: string;
  skipLatest?: boolean;
}

/**
 * The articles three across. It skips the newest one by default, because the
 * latest-article card above shows it; with that card removed, turn it off.
 */
function ArticleFeedGrid({
  eyebrowLabel = "",
  heading = "",
  linkLabel = "",
  skipLatest = true,
  width = "fixed",
  verticalPadding = "default",
  ...rest
}: ArticleFeedGridProps) {
  const articles = useArticleFeed()?.articles ?? [];
  const shown = skipLatest ? articles.slice(1) : articles;
  if (shown.length === 0) return null;

  return (
    <Section {...rest} verticalPadding={verticalPadding} width={width}>
      <JournalGrid
        articles={shown}
        eyebrowLabel={eyebrowLabel}
        heading={heading}
        linkLabel={linkLabel}
      />
    </Section>
  );
}

export default ArticleFeedGrid;

export { schema } from "./schema";
