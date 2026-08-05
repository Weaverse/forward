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
        <p className="text-base leading-relaxed text-ink/90">{block.text}</p>
      );
    case "heading":
      return (
        <h2 className="pt-4 font-display text-2xl text-pine sm:text-3xl">
          {block.text}
        </h2>
      );
    case "pullquote":
      return (
        <blockquote className="border-l-2 border-clay py-1 pl-6 font-display text-2xl leading-snug text-pine">
          {block.text}
        </blockquote>
      );
    case "note":
      return (
        <aside className="border-l-2 border-moss bg-parchment px-5 py-4">
          <p className="field-label text-moss">{block.label}</p>
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
            className="w-full border border-mist object-cover"
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
      <header className="border-b border-mist bg-parchment">
        <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
          <p className="field-label text-clay">
            <Link href="/journal" className="hover:text-clay-deep">
              Journal
            </Link>{" "}
            · {article.plate}
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-pine sm:text-5xl">
            {article.title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate">
            {article.excerpt}
          </p>
          <dl className="field-label mt-6 flex flex-wrap gap-x-6 gap-y-1 text-slate">
            <div className="flex gap-2">
              <dt>Filed</dt>
              <dd>{formatDate(article.publishedAt)}</dd>
            </div>
            <div className="flex gap-2">
              <dt>From</dt>
              <dd>
                {article.location} · {article.coordinates}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt>Read</dt>
              <dd>{article.readingMinutes} min</dd>
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
        className="max-h-[30rem] w-full border-b border-mist object-cover"
      />

      <div className="mx-auto max-w-2xl space-y-6 px-5 py-12 sm:px-8">
        {article.body.map((block, index) => (
          <ArticleBlockView
            key={`${block.type}-${
              "text" in block ? block.text.slice(0, 24) : index
            }`}
            block={block}
          />
        ))}
        <footer className="border-t border-mist pt-6">
          <Link
            href="/journal"
            className="field-label inline-flex min-h-11 items-center text-clay hover:text-clay-deep"
          >
            ← All field notes
          </Link>
        </footer>
      </div>
    </article>
  );
}
