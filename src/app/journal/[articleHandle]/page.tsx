import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { eyebrow, textLink } from "@/lib/presentation/variants";
import { storefront } from "@/lib/storefront/data-source";
import { formatDate } from "@/lib/storefront/format";
import type {
  ArticleBlock,
  JournalArticle,
  RichTextParagraph,
} from "@/lib/storefront/types";

interface ArticlePageProps {
  params: Promise<{ articleHandle: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const articles = await storefront.listArticles();
  return articles.map((article) => ({ articleHandle: article.handle }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { articleHandle } = await params;
  const article = await storefront.getArticle(articleHandle);
  if (article === null) {
    return { title: "Article not found" };
  }
  return { title: `${article.title} · Journal`, description: article.excerpt };
}

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
        <blockquote className="my-[2.4em] mr-[-8vw] ml-[-12vw] border-ink border-y py-11.25 pr-[8vw] pl-[12vw] text-article-pullquote text-signal-strong italic leading-copy max-md:mx-0 max-md:px-0">
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
      <aside className="text-caption text-text-muted max-md:border-border-subtle max-md:border-b max-md:pb-5">
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
    <aside className="text-caption text-text-muted max-md:border-border-subtle max-md:border-b max-md:pb-5">
      <p className={eyebrow()}>Filed</p>
      <p>
        {article.plate}
        <br />
        {formatDate(article.publishedAt)}
      </p>
    </aside>
  );
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { articleHandle } = await params;
  const article = await storefront.getArticle(articleHandle);
  if (article === null) {
    notFound();
  }
  const runs = splitBody(article.body);

  return (
    <>
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
            <Link href="/journal">Journal</Link> / {article.plate}
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

      <article>
        {runs.map((run, index) => (
          <div key={runKey(run)}>
            {run.prose.length > 0 ? (
              <div className="mx-auto grid w-full max-w-page grid-cols-article-body justify-center gap-article-gap px-page-gutter py-section-block-short max-md:grid-cols-1">
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
          <Link className={textLink()} href="/journal">
            All field notes
          </Link>
        </div>
      </article>
    </>
  );
}
