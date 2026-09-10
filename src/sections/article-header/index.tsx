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
      className="mt-5.5 mr-7 ml-7 grid min-h-article-min grid-cols-page-header items-stretch bg-ink text-text-inverse max-md:mx-3 max-md:min-h-0 max-md:grid-cols-1"
    >
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
