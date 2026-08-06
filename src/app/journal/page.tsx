import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { storefront } from "@/lib/storefront/data-source";
import { formatDate } from "@/lib/storefront/format";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Field notes from the Forward journal: trips, gear arguments, and weather worth going out in.",
};

/**
 * Journal index — port of the canonical `journalPage()` (source
 * `app.js:328`): dark page hero, the reversed `.journal-feature` lead, and the
 * 12-column staggered `.journal-grid`.
 */
export default async function JournalPage() {
  const articles = await storefront.listArticles();
  const [lead, ...rest] = articles;

  return (
    <>
      <header className="page-hero">
        <div className="page-hero-inner">
          <div>
            <p className="eyebrow">The field journal</p>
            <h1 className="h1">Notes from farther out.</h1>
          </div>
          <p className="lede">
            Routes, useful skills, working knowledge, and the weather worth
            going out in.
          </p>
        </div>
      </header>

      {lead !== undefined ? (
        <Link className="journal-feature" href={`/journal/${lead.handle}`}>
          <div className="journal-feature-image">
            <Image
              src={lead.heroImage.src}
              alt={lead.heroImage.alt}
              width={lead.heroImage.width}
              height={lead.heroImage.height}
              sizes="(min-width: 820px) 66vw, 100vw"
              priority
            />
          </div>
          <div className="journal-feature-copy">
            <p className="eyebrow">
              {lead.plate} · {lead.readingMinutes} min read ·{" "}
              {formatDate(lead.publishedAt)}
            </p>
            <h2 className="h2">{lead.title}</h2>
            <p>{lead.excerpt}</p>
            <span className="text-link">Read field note</span>
          </div>
        </Link>
      ) : null}

      <section className="section shell">
        <div className="section-head">
          <div>
            <p className="eyebrow">Latest dispatches</p>
            <h2 className="h2">Read, learn, head out.</h2>
          </div>
        </div>
        <div className="journal-grid">
          {rest.map((article) => (
            <article key={article.handle} className="article-card">
              <Link href={`/journal/${article.handle}`}>
                <Image
                  src={article.heroImage.src}
                  alt={article.heroImage.alt}
                  width={article.heroImage.width}
                  height={article.heroImage.height}
                  sizes="(min-width: 820px) 34vw, 100vw"
                  loading="lazy"
                />
                <p className="eyebrow">
                  {article.plate} · {article.readingMinutes} min read
                </p>
                <h2>{article.title}</h2>
                <p>{article.excerpt}</p>
                <span className="text-link">Read story</span>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
