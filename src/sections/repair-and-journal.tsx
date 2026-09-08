import { createSchema } from "@weaverse/schema";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  eyebrow,
  SHELL_SECTION_CLASS,
  textLink,
} from "@/lib/presentation/variants";
import type { JournalArticle } from "@/lib/storefront/types";

interface RepairAndJournalProps {
  repairEyebrowLabel: string;
  repairHeading: string;
  repairBody: string;
  repairLinkLabel: string;
  repairLinkHref: string;
  journalEyebrowLabel: string;
  journalLinkLabel: string;
  /** Omitted when no article resolves; the repair card then stands alone. */
  article?: JournalArticle;
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
  article,
}: RepairAndJournalProps) {
  return (
    <section
      className={cn(
        SHELL_SECTION_CLASS,
        "grid grid-cols-split-70 gap-3 max-md:grid-cols-1",
      )}
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
    </section>
  );
}

export default RepairAndJournal;

export const schema = createSchema({
  type: "repair-and-journal",
  title: "Repair and journal",
  settings: [
    {
      group: "Content",
      inputs: [
        {
          type: "text",
          name: "repairEyebrowLabel",
          label: "Repair eyebrow",
        },
        {
          type: "text",
          name: "repairHeading",
          label: "Repair heading",
        },
        {
          type: "textarea",
          name: "repairBody",
          label: "Repair body",
        },
        {
          type: "text",
          name: "repairLinkLabel",
          label: "Repair link label",
        },
        {
          type: "url",
          name: "repairLinkHref",
          label: "Repair link target",
        },
        {
          type: "text",
          name: "journalEyebrowLabel",
          label: "Journal eyebrow",
        },
        {
          type: "text",
          name: "journalLinkLabel",
          label: "Journal link label",
        },
        {
          type: "text",
          name: "articleHandle",
          label: "Article handle, blank for the latest",
        },
      ],
    },
  ],
});
