import Image from "next/image";
import Link from "next/link";

import { eyebrow } from "@/lib/presentation/variants";
import { formatDate } from "@/lib/storefront/format";
import type { JournalArticle } from "@/lib/storefront/types";

interface ArticleHeaderProps {
  breadcrumbLabel: string;
  breadcrumbHref: string;
  article: JournalArticle;
}

/** Article masthead: cover image beside the title and its publication meta. */
export function ArticleHeader({
  breadcrumbLabel,
  breadcrumbHref,
  article,
}: ArticleHeaderProps) {
  return (
    <header className="mt-5.5 mr-7 ml-7 grid min-h-article-min grid-cols-page-header items-stretch bg-ink text-text-inverse max-md:mx-3 max-md:min-h-0 max-md:grid-cols-1">
      <div className="relative min-w-0 overflow-hidden max-md:min-h-route-media-min">
        <Image
          className="absolute inset-0 h-full object-cover object-center saturate-76"
          src={article.heroImage.src}
          alt={article.heroImage.alt}
          width={article.heroImage.width}
          height={article.heroImage.height}
          sizes="(min-width: 820px) 66vw, 100vw"
          priority
        />
      </div>
      <div className="relative z-2 flex flex-col justify-center bg-ink p-panel max-md:px-page-gutter max-md:pt-12 max-md:pb-14.5">
        <p className={eyebrow({ tone: "warm" })}>
          <Link href={breadcrumbHref}>{breadcrumbLabel}</Link> {"/"}{" "}
          {article.plate}
        </p>
        <h1 className="m-0 max-w-250 text-balance font-heading text-article-display leading-heading font-medium tracking-heading">
          {article.title}
        </h1>
        <div className="mt-7 flex flex-wrap gap-6 text-ui font-bold tracking-button uppercase">
          <span>{formatDate(article.publishedAt)}</span>
          <span>{article.location}</span>
          <span>{article.readingMinutes} minute read</span>
        </div>
      </div>
    </header>
  );
}
