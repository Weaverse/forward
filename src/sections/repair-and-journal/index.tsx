"use client";

import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/section";
import { cn } from "@/lib/cn";
import { eyebrow, sectionHeading, textLink } from "@/lib/presentation/variants";
import type { JournalArticle } from "@/lib/storefront/types";
import type { WeaverseElementProps } from "../weaverse-element";

interface RepairAndJournalProps extends WeaverseElementProps {
  repairEyebrowLabel: string;
  repairHeading: string;
  repairBody: string;
  repairLinkLabel: string;
  repairLinkHref: string;
  journalEyebrowLabel: string;
  journalLinkLabel: string;
  /** Resolved by `./loader`; the repair card stands alone when absent. */
  loaderData?: { article: JournalArticle | null };
}

/** Paired cards: the repair commitment beside the most recent field note. */
function RepairAndJournal({
  repairEyebrowLabel,
  repairHeading,
  repairBody,
  repairLinkLabel,
  repairLinkHref,
  journalEyebrowLabel,
  journalLinkLabel,
  loaderData,
  ...rest
}: RepairAndJournalProps) {
  const article = loaderData?.article ?? undefined;
  return (
    <Section
      {...rest}
      containerClassName="grid grid-cols-1 gap-3 md:grid-cols-split-70"
    >
      <article className="min-h-0 bg-signal p-[clamp(35px,5vw,70px)] md:min-h-140">
        <p className={eyebrow()}>{repairEyebrowLabel}</p>
        <h2 className={cn(sectionHeading({ size: "feature" }), "mb-home-copy")}>
          {repairHeading}
        </h2>
        <p className="mb-prose-paragraph">{repairBody}</p>
        <Link className={textLink()} href={repairLinkHref}>
          {repairLinkLabel}
        </Link>
      </article>
      {article !== undefined ? (
        <article className="grid min-h-0 grid-cols-1 bg-surface-subtle p-0 md:min-h-140 md:grid-cols-split-90">
          <Image
            className="h-full max-h-[55svh] object-cover md:max-h-none"
            src={article.heroImage.src}
            alt={article.heroImage.alt}
            width={article.heroImage.width}
            height={article.heroImage.height}
            sizes="(min-width: 820px) 45vw, 100vw"
          />
          <div className="self-center p-11.25">
            <p className={eyebrow()}>{journalEyebrowLabel}</p>
            <h2
              className={cn(
                sectionHeading({ size: "feature" }),
                "mb-home-copy",
              )}
            >
              {article.title}
            </h2>
            <p className="mb-prose-paragraph">{article.excerpt}</p>
            <Link className={textLink()} href={`/journal/${article.handle}`}>
              {journalLinkLabel}
            </Link>
          </div>
        </article>
      ) : null}
    </Section>
  );
}

export default RepairAndJournal;

export { schema } from "./schema";
