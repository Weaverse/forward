"use client";

import Image from "next/image";
import Link from "next/link";

import { eyebrow, textLink } from "@/lib/presentation/variants";
import { formatDate } from "@/lib/storefront/format";
import type {
  ArticleBlock,
  JournalArticle,
  RichTextParagraph,
} from "@/lib/storefront/types";
import { useStorefrontContext } from "@/lib/weaverse/data-context";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";

type ProseBlock = Exclude<ArticleBlock, { type: "image" }>;
type ImageBlock = Extract<ArticleBlock, { type: "image" }>;

/** Split normalized article blocks at images without inventing content. */
function splitBody(
  body: readonly ArticleBlock[],
): Array<{ prose: ProseBlock[]; image?: ImageBlock }> {
  const runs: Array<{ prose: ProseBlock[]; image?: ImageBlock }> = [
    { prose: [] },
  ];
  for (const block of body) {
    const current = runs[runs.length - 1];
    if (current === undefined) {
      continue;
    }
    if (block.type === "image") {
      current.image = block;
      runs.push({ prose: [] });
      continue;
    }
    current.prose.push(block);
  }
  return runs.filter((run) => run.prose.length > 0 || run.image !== undefined);
}

/** Stable key for a prose/figure run, derived from its first content. */
function runKey(run: { prose: ProseBlock[]; image?: ImageBlock }): string {
  return run.prose[0]?.text ?? run.image?.image.src ?? "run";
}

function RichTextRuns({ runs }: { runs: RichTextParagraph }) {
  return (
    <>
      {runs.map((run) => {
        const key = `${run.href ?? "text"}:${run.text}`;
        return run.href?.startsWith("/") ? (
          <Link href={run.href} key={key}>
            {run.text}
          </Link>
        ) : run.href !== undefined ? (
          <a href={run.href} key={key}>
            {run.text}
          </a>
        ) : (
          run.text
        );
      })}
    </>
  );
}

function ProseBlockView({ block }: { block: ProseBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="mb-prose-block">
          <RichTextRuns runs={block.runs} />
        </p>
      );
    case "heading":
      return (
        <h2 className="mt-prose-section mb-prose-subhead text-balance text-article-heading leading-copy-tight font-medium">
          <RichTextRuns runs={block.runs} />
        </h2>
      );
    case "pullquote":
      return (
        <blockquote className="mx-0 my-[2.4em] border-ink border-y px-0 py-11.25 text-article-pullquote text-signal-strong italic leading-copy md:mr-[-8vw] md:ml-[-12vw] md:pr-[8vw] md:pl-[12vw]">
          <RichTextRuns runs={block.runs} />
        </blockquote>
      );
    case "note":
      return (
        <aside className="my-[2em] border-signal border-l-2 py-5 pr-0 pl-6">
          <p className="mb-prose-block font-field-meta text-ui leading-meta font-medium text-signal-strong tracking-field-meta uppercase">
            {block.label}
          </p>
          <p className="m-0 font-body text-copy-sm leading-rich-copy text-text-muted">
            {block.text}
          </p>
        </aside>
      );
  }
}

/** Canonical `.article-aside` rails: route notes first, then the filing record. */
function ArticleAside({
  article,
  index,
}: {
  article: JournalArticle;
  index: number;
}) {
  if (index === 0) {
    return (
      <aside className="border-border-subtle border-b pb-5 text-caption text-text-muted md:border-b-0 md:pb-0">
        <p className={eyebrow()}>Route notes</p>
        <p>
          {article.location}
          <br />
          {article.coordinates}
          <br />
          {article.readingMinutes} minute read
        </p>
      </aside>
    );
  }
  return (
    <aside className="border-border-subtle border-b pb-5 text-caption text-text-muted md:border-b-0 md:pb-0">
      <p className={eyebrow()}>Filed</p>
      <p>
        {article.plate}
        <br />
        {formatDate(article.publishedAt)}
      </p>
    </aside>
  );
}

interface ArticleBodyProps extends WeaverseElementProps {
  backLinkLabel: string;
  backLinkHref: string;
}

/**
 * Normalized article blocks rendered verbatim, split into prose runs and
 * full-width figures, with the route/filing rails alongside.
 *
 * The blocks are the article's own content, edited in Shopify and rendered
 * as-is; the template only owns the back link.
 */
function ArticleBody({
  backLinkLabel,
  backLinkHref,
  ...rest
}: ArticleBodyProps) {
  const { article } = useStorefrontContext();
  if (article === undefined) return null;
  const runs = splitBody(article.body);
  return (
    <article {...elementAttributes(rest)}>
      {runs.map((run, index) => (
        <div key={runKey(run)}>
          {run.prose.length > 0 ? (
            <div className="mx-auto grid w-full max-w-page grid-cols-1 justify-center gap-article-gap px-page-gutter py-section-block-short md:grid-cols-article-body">
              <ArticleAside article={article} index={index} />
              <div className="font-heading text-article-subheading leading-rich-copy">
                {run.prose.map((block) => (
                  <ProseBlockView
                    key={`${block.type}-${block.text}`}
                    block={block}
                  />
                ))}
              </div>
            </div>
          ) : null}
          {run.image !== undefined ? (
            <figure className="mt-5 mb-17.5">
              <Image
                className="max-h-190 object-cover"
                src={run.image.image.src}
                alt={run.image.image.alt}
                width={run.image.image.width}
                height={run.image.image.height}
                sizes="100vw"
                loading="lazy"
              />
              <figcaption className="mt-2 px-page-gutter font-field-meta text-caption font-medium text-text-muted tracking-field-meta uppercase">
                {run.image.caption}
              </figcaption>
            </figure>
          ) : null}
        </div>
      ))}
      <div className="mx-auto w-full max-w-page px-page-gutter py-section-block-compact">
        <Link className={textLink()} href={backLinkHref}>
          {backLinkLabel}
        </Link>
      </div>
    </article>
  );
}

export default ArticleBody;

export { schema } from "./schema";
