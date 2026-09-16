"use client";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";
import { eyebrow, sectionHeading } from "@/lib/presentation/variants";
import { formatDate } from "@/lib/storefront/format";
import { useStorefrontContext } from "@/lib/weaverse/data-context";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";

interface ArticleHeaderProps extends WeaverseElementProps {
  breadcrumbLabel: string;
  breadcrumbHref: string;
}

/**
 * Article masthead: cover image beside the title and its publication meta.
 *
 * The article is the route's decision, so it arrives through the shared data
 * context; only the breadcrumb is a template setting.
 */
function ArticleHeader({
  breadcrumbLabel,
  breadcrumbHref,
  ...rest
}: ArticleHeaderProps) {
  const { article } = useStorefrontContext();
  if (article === undefined) return null;
  return (
    <header
      {...elementAttributes(rest)}
      className="mx-3 mt-5.5 grid min-h-0 grid-cols-1 items-stretch bg-ink text-text-inverse md:mx-7 md:min-h-article-min md:grid-cols-page-header"
    >
      <div className="relative min-h-route-media-min min-w-0 overflow-hidden md:min-h-auto">
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
      <div className="relative z-2 flex flex-col justify-center bg-ink px-page-gutter pt-12 pb-14.5 md:p-panel">
        <p className={eyebrow({ tone: "warm" })}>
          <Link href={breadcrumbHref}>{breadcrumbLabel}</Link> {"/"}{" "}
          {article.plate}
        </p>
        <h1 className={cn(sectionHeading({ size: "article" }), "max-w-250")}>
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

export default ArticleHeader;

export { schema } from "./schema";
