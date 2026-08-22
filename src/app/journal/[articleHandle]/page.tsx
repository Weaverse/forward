import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

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

/**
 * The canonical article alternates measured prose runs with full-width
 * figures (source `app.js:332`). Splitting the normalized block list at every
 * image reproduces that rhythm without inventing content.
 */
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
        <p className="mb-[1.4em]">
          <RichTextRuns runs={block.runs} />
        </p>
      );
    case "heading":
      return (
        <h2 className="mt-[2.5em] mb-[0.8em] text-balance text-[clamp(34px,4vw,52px)] leading-[1.05] font-medium">
          <RichTextRuns runs={block.runs} />
        </h2>
      );
    case "pullquote":
      return (
        <blockquote className="my-[2.4em] mr-[-8vw] ml-[-12vw] border-ink border-y py-[45px] pr-[8vw] pl-[12vw] text-[clamp(34px,5vw,72px)] text-signal-strong italic leading-[1.2] max-md:mx-0 max-md:px-0">
          <RichTextRuns runs={block.runs} />
        </blockquote>
      );
    case "note":
      return (
        <aside className="my-[2em] border-signal border-l-2 py-5 pr-0 pl-6">
          <p className="mb-[1.4em] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase">
            {block.label}
          </p>
          <p className="m-0 font-body text-[14px] leading-[1.7] text-text-muted">
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
      <aside className="text-[12px] text-text-muted max-md:border-border-subtle max-md:border-b max-md:pb-5">
        <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase">
          Route notes
        </p>
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
    <aside className="text-[12px] text-text-muted max-md:border-border-subtle max-md:border-b max-md:pb-5">
      <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase">
        Filed
      </p>
      <p>
        {article.plate}
        <br />
        {formatDate(article.publishedAt)}
      </p>
    </aside>
  );
}

/**
 * Journal article — port of the canonical `articlePage()` (source
 * `app.js:332`): split article hero with the metadata rail, side route notes,
 * the editorial measure with its rule-bound pullquote, and wide images.
 */
export default async function ArticlePage({ params }: ArticlePageProps) {
  const { articleHandle } = await params;
  const article = await storefront.getArticle(articleHandle);
  if (article === null) {
    notFound();
  }
  const runs = splitBody(article.body);

  return (
    <>
      <header className="mt-[22px] mr-7 ml-7 grid min-h-[86svh] grid-cols-[1.35fr_0.65fr] items-stretch bg-ink text-text-inverse max-md:mx-3 max-md:min-h-0 max-md:grid-cols-1">
        <div className="relative min-w-0 overflow-hidden max-md:min-h-[54svh]">
          <Image
            className="absolute inset-0 h-full object-cover object-center saturate-[0.76]"
            src={article.heroImage.src}
            alt={article.heroImage.alt}
            width={article.heroImage.width}
            height={article.heroImage.height}
            sizes="(min-width: 820px) 66vw, 100vw"
            priority
          />
        </div>
        <div className="relative z-[2] flex flex-col justify-center bg-ink p-[clamp(45px,5vw,80px)] max-md:px-page-gutter max-md:pt-12 max-md:pb-[58px]">
          <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-accent-warm tracking-field-meta uppercase">
            <Link href="/journal">Journal</Link> / {article.plate}
          </p>
          <h1 className="m-0 max-w-[1000px] text-balance font-heading text-[clamp(58px,6.8vw,104px)] leading-[0.98] font-medium tracking-heading">
            {article.title}
          </h1>
          <div className="mt-7 flex flex-wrap gap-6 text-[11px] font-bold tracking-[0.09em] uppercase">
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
              <div className="mx-auto grid w-[min(100%,var(--container-page))] grid-cols-[180px_minmax(0,720px)] justify-center gap-[clamp(40px,8vw,120px)] px-page-gutter py-[clamp(70px,9vw,130px)] max-md:grid-cols-1">
                <ArticleAside article={article} index={index} />
                <div className="font-heading text-[clamp(21px,2vw,27px)] leading-[1.7]">
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
              <figure className="mt-5 mb-[70px]">
                <Image
                  className="max-h-[760px] object-cover"
                  src={run.image.image.src}
                  alt={run.image.image.alt}
                  width={run.image.image.width}
                  height={run.image.image.height}
                  sizes="100vw"
                  loading="lazy"
                />
                <figcaption className="mt-2 px-page-gutter font-field-meta text-[12px] font-medium text-text-muted tracking-field-meta uppercase">
                  {run.image.caption}
                </figcaption>
              </figure>
            ) : null}
          </div>
        ))}
        <div className="mx-auto w-[min(100%,var(--container-page))] px-page-gutter py-[clamp(42px,6vw,84px)]">
          <Link
            className="inline-flex min-h-touch items-center gap-[14px] border-ink border-b font-body text-[11px] font-medium tracking-[0.06em] uppercase after:text-[20px] after:font-normal after:content-['→'] after:transition-transform after:duration-200 after:ease-standard hover:after:translate-x-[5px]"
            href="/journal"
          >
            All field notes
          </Link>
        </div>
      </article>
    </>
  );
}
