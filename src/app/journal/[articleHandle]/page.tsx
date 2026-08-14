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
        <p>
          <RichTextRuns runs={block.runs} />
        </p>
      );
    case "heading":
      return (
        <h2>
          <RichTextRuns runs={block.runs} />
        </h2>
      );
    case "pullquote":
      return (
        <blockquote>
          <RichTextRuns runs={block.runs} />
        </blockquote>
      );
    case "note":
      return (
        <aside className="article-note">
          <p className="eyebrow">{block.label}</p>
          <p>{block.text}</p>
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
      <aside className="article-aside">
        <p className="eyebrow">Route notes</p>
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
    <aside className="article-aside">
      <p className="eyebrow">Filed</p>
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
      <header className="article-hero">
        <div className="article-hero-media">
          <Image
            src={article.heroImage.src}
            alt={article.heroImage.alt}
            width={article.heroImage.width}
            height={article.heroImage.height}
            sizes="(min-width: 820px) 66vw, 100vw"
            priority
          />
        </div>
        <div className="article-hero-inner">
          <p className="eyebrow">
            <Link href="/journal">Journal</Link> / {article.plate}
          </p>
          <h1 className="h1">{article.title}</h1>
          <div className="article-meta">
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
              <div className="shell article-body">
                <ArticleAside article={article} index={index} />
                <div className="article-content">
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
              <figure className="article-wide-image">
                <Image
                  src={run.image.image.src}
                  alt={run.image.image.alt}
                  width={run.image.image.width}
                  height={run.image.image.height}
                  sizes="100vw"
                  loading="lazy"
                />
                <figcaption className="meta">{run.image.caption}</figcaption>
              </figure>
            ) : null}
          </div>
        ))}
        <div className="shell section-tight">
          <Link className="text-link" href="/journal">
            All field notes
          </Link>
        </div>
      </article>
    </>
  );
}
