"use client";

import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/section";
import { eyebrow, textLink } from "@/lib/presentation/variants";
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
      containerClassName="grid grid-cols-split-70 gap-3 max-md:grid-cols-1"
    >
      <article className="min-h-140 bg-signal p-[clamp(35px,5vw,70px)] max-md:min-h-0">
        <p className={eyebrow()}>{repairEyebrowLabel}</p>
        <h2 className="mb-home-copy text-balance font-heading text-home-display leading-display-relaxed">
          {repairHeading}
        </h2>
        <p className="mb-prose-paragraph">{repairBody}</p>
        <Link className={textLink()} href={repairLinkHref}>
          {repairLinkLabel}
        </Link>
      </article>
      {article !== undefined ? (
        <article className="grid min-h-140 grid-cols-split-90 bg-surface-subtle p-0 max-md:min-h-0 max-md:grid-cols-1">
          <Image
            className="h-full object-cover max-md:max-h-[55svh]"
            src={article.heroImage.src}
            alt={article.heroImage.alt}
            width={article.heroImage.width}
            height={article.heroImage.height}
            sizes="(min-width: 820px) 45vw, 100vw"
          />
          <div className="self-center p-11.25">
            <p className={eyebrow()}>{journalEyebrowLabel}</p>
            <h2 className="mb-home-copy text-balance font-heading text-home-display leading-display-relaxed">
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
