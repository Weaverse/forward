import Image from "next/image";
import Link from "next/link";

import {
  eyebrow,
  SHELL_SECTION_CLASS,
  sectionHeading,
  textLink,
} from "@/lib/presentation/variants";
import type { JournalArticle } from "@/lib/storefront/types";

interface JournalGridProps {
  eyebrowLabel: string;
  heading: string;
  linkLabel: string;
  articles: readonly JournalArticle[];
}

/** The remaining field notes, three across. */
export function JournalGrid({
  eyebrowLabel,
  heading,
  linkLabel,
  articles,
}: JournalGridProps) {
  return (
    <section className={SHELL_SECTION_CLASS}>
      <div className="mb-11 flex flex-col items-start justify-between gap-7.5 sm:flex-row sm:items-end">
        <div>
          <p className={eyebrow()}>{eyebrowLabel}</p>
          <h2 className={sectionHeading()}>{heading}</h2>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-x-4.5 gap-y-20">
        {articles.map((article) => (
          <article
            key={article.handle}
            className="col-span-full sm:col-span-6 md:col-span-4"
          >
            <Link href={`/journal/${article.handle}`}>
              <Image
                className="mb-4.5 aspect-4/3 object-cover"
                src={article.heroImage.src}
                alt={article.heroImage.alt}
                width={article.heroImage.width}
                height={article.heroImage.height}
                sizes="(min-width: 820px) 34vw, 100vw"
                loading="lazy"
              />
              <p className="mb-3.5 font-field-meta text-ui leading-meta font-medium text-text-muted tracking-field-meta uppercase">
                {article.plate} · {article.readingMinutes} min read
              </p>
              <h2 className="mt-1.75 mb-3 text-balance font-heading text-journal-card leading-journal-card font-medium">
                {article.title}
              </h2>
              <p className="text-text-muted">{article.excerpt}</p>
              <span className={textLink()}>{linkLabel}</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
