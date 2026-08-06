import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { storefront } from "@/lib/storefront/data-source";
import { formatDate } from "@/lib/storefront/format";
import type { ArticleBlock } from "@/lib/storefront/types";

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

function ArticleBlockView({ block }: { block: ArticleBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="font-display text-lg leading-relaxed text-carbon/90">
          {block.text}
        </p>
      );
    case "heading":
      return (
        <h2 className="pt-6 font-display text-3xl text-carbon sm:text-4xl">
          {block.text}
        </h2>
      );
    case "pullquote":
      return (
        <blockquote className="border-y border-carbon/30 py-8">
          <p className="font-display text-3xl italic leading-snug text-pine sm:text-4xl">
            {block.text}
          </p>
        </blockquote>
      );
    case "note":
      return (
        <aside className="border-l-2 border-acid bg-parchment px-5 py-4">
          <p className="field-label text-carbon">{block.label}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate">
            {block.text}
          </p>
        </aside>
      );
    case "image":
      return (
        <figure>
          <Image
            src={block.image.src}
            alt={block.image.alt}
            width={block.image.width}
            height={block.image.height}
            sizes="(min-width: 768px) 42rem, 100vw"
            className="w-full border border-hairline object-cover"
          />
          <figcaption className="field-label mt-2 text-slate">
            {block.caption}
          </figcaption>
        </figure>
      );
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { articleHandle } = await params;
  const article = await storefront.getArticle(articleHandle);
  if (article === null) {
    notFound();
  }

  return (
    <article>
      {/* Carbon dispatch masthead. */}
      <header
        data-surface="dark"
        className="border-b border-carbon bg-carbon text-cream"
      >
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <p className="field-label text-acid">
            <Link href="/journal" className="hover:text-cream">
              Journal
            </Link>{" "}
            / {article.plate}
          </p>
          <h1 className="display-huge mt-5 max-w-4xl">{article.title}</h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-cream/75">
            {article.excerpt}
          </p>
          <dl className="field-label mt-8 flex flex-wrap gap-x-10 gap-y-2 border-t border-cream/15 pt-5 text-cream/60">
            <div className="flex gap-2">
              <dt>Filed</dt>
              <dd className="text-cream/90">
                {formatDate(article.publishedAt)}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt>From</dt>
              <dd className="text-cream/90">
                {article.location} · {article.coordinates}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt>Read</dt>
              <dd className="text-cream/90">{article.readingMinutes} min</dd>
            </div>
          </dl>
        </div>
      </header>

      <Image
        src={article.heroImage.src}
        alt={article.heroImage.alt}
        width={article.heroImage.width}
        height={article.heroImage.height}
        priority
        sizes="100vw"
        className="max-h-[32rem] w-full border-b border-hairline object-cover"
      />

      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          <aside className="mb-8 lg:col-span-3 lg:mb-0">
            <div className="lg:sticky lg:top-8">
              <p className="field-label text-pine">Route notes</p>
              <dl className="field-label mt-3 space-y-1 normal-case tracking-normal text-slate">
                <div>
                  <dt className="sr-only">Location</dt>
                  <dd>{article.location}</dd>
                </div>
                <div>
                  <dt className="sr-only">Coordinates</dt>
                  <dd>{article.coordinates}</dd>
                </div>
                <div>
                  <dt className="sr-only">Reading time</dt>
                  <dd>{article.readingMinutes} min read</dd>
                </div>
              </dl>
            </div>
          </aside>
          <div className="max-w-2xl space-y-8 lg:col-span-9 lg:col-start-4">
            {article.body.map((block, index) => (
              <ArticleBlockView
                key={`${block.type}-${
                  "text" in block ? block.text.slice(0, 24) : index
                }`}
                block={block}
              />
            ))}
            <footer className="border-t border-carbon/30 pt-6">
              <Link
                href="/journal"
                className="field-label inline-flex min-h-11 items-center gap-2 text-carbon hover:text-pine"
              >
                ← All field notes
              </Link>
            </footer>
          </div>
        </div>
      </div>
    </article>
  );
}
