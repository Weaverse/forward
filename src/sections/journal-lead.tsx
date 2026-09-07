import Image from "next/image";
import Link from "next/link";

import { eyebrow } from "@/lib/presentation/variants";
import { formatDate } from "@/lib/storefront/format";
import type { JournalArticle } from "@/lib/storefront/types";

interface JournalLeadProps {
  linkLabel: string;
  article: JournalArticle;
}

/** The lead field note, rendered as one full-width link card. */
export function JournalLead({ linkLabel, article }: JournalLeadProps) {
  return (
    <Link
      className="mx-7 grid min-h-205 grid-cols-split-65 bg-ink text-text-inverse max-md:mx-3 max-md:grid-cols-1"
      href={`/journal/${article.handle}`}
    >
      <div className="order-2 m-6 max-md:order-1 max-md:min-h-state-min">
        <Image
          className="h-full object-cover"
          src={article.heroImage.src}
          alt={article.heroImage.alt}
          width={article.heroImage.width}
          height={article.heroImage.height}
          sizes="(min-width: 820px) 66vw, 100vw"
          priority
        />
      </div>
      <div className="order-1 flex flex-col justify-center p-[clamp(36px,6vw,90px)] max-md:order-2">
        <p className={eyebrow({ tone: "warm" })}>
          {article.plate} · {article.readingMinutes} min read ·{" "}
          {formatDate(article.publishedAt)}
        </p>
        <h2 className="m-0 mb-7 text-balance font-heading text-journal-display leading-heading font-medium tracking-heading">
          {article.title}
        </h2>
        <p>{article.excerpt}</p>
        <span className="inline-flex min-h-touch items-center gap-3.5 self-start border-text-inverse border-b font-body text-ui font-medium tracking-link uppercase after:text-control-lg after:font-normal after:content-['→'] after:transition-transform after:duration-200 after:ease-standard hover:after:translate-x-1.25">
          {linkLabel}
        </span>
      </div>
    </Link>
  );
}
