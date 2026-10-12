"use client";

import { Section, type SectionProps } from "@/components/section";
import { useLocale } from "@/lib/i18n/locale-context";

import { JournalLead } from "../../journal-lead";
import type { WeaverseElementProps } from "../../weaverse-element";
import { useArticleFeed } from "../context";

interface ArticleFeedLeadProps extends WeaverseElementProps {
  width?: SectionProps["width"];
  linkLabel?: string;
}

/** The newest article as one full-width card. */
function ArticleFeedLead({
  linkLabel = "",
  width = "full",
  ...rest
}: ArticleFeedLeadProps) {
  const locale = useLocale();
  const lead = useArticleFeed()?.articles[0];
  if (lead === undefined) return null;

  return (
    <Section {...rest} verticalPadding="none" width={width}>
      <JournalLead article={lead} linkLabel={linkLabel} locale={locale} />
    </Section>
  );
}

export default ArticleFeedLead;

export { schema } from "./schema";
