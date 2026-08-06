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

export default async function JournalPage() {
  const articles = await storefront.listArticles();
  const [lead, ...rest] = articles;

  return (
    <div>
      {/* Dark journal masthead with the lead dispatch. */}
      <section
        data-surface="dark"
        aria-label="Journal masthead"
        className="border-b border-carbon bg-carbon text-cream"
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-5 pb-10 pt-10 sm:px-8 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:items-end">
          <div>
            <p className="field-label text-acid">The Forward journal</p>
            <h1 className="display-huge mt-4">
              <span className="block">Notes from</span>
              <span className="block italic">farther out.</span>
            </h1>
          </div>
          <p className="max-w-sm text-base leading-relaxed text-cream/75">
            Dispatches, gear arguments, and weather worth going out in — filed
            from the routes the equipment is built for.
          </p>
        </div>

        {lead !== undefined ? (
          <div className="border-t border-cream/15">
            <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center">
              <div>
                <p className="field-label text-acid">
                  Field notes · {lead.readingMinutes} min read
                </p>
                <h2 className="display-large mt-4">
                  <Link
                    href={`/journal/${lead.handle}`}
                    className="hover:text-acid"
                  >
                    {lead.title}
                  </Link>
                </h2>
                <p className="mt-4 max-w-sm text-base leading-relaxed text-cream/75">
                  {lead.excerpt}
                </p>
                <p className="field-label mt-4 text-cream/60">
                  {lead.plate} · {lead.location} ·{" "}
                  {formatDate(lead.publishedAt)}
                </p>
                <Link
                  href={`/journal/${lead.handle}`}
                  className="field-label mt-6 inline-flex min-h-11 items-center gap-2 border-b border-cream/60 text-cream transition-colors hover:border-acid hover:text-acid"
                >
                  Read field note →
                </Link>
              </div>
              <Link href={`/journal/${lead.handle}`} className="block">
                <Image
                  src={lead.heroImage.src}
                  alt={lead.heroImage.alt}
                  width={lead.heroImage.width}
                  height={lead.heroImage.height}
                  priority
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="aspect-3/2 w-full object-cover"
                />
              </Link>
            </div>
          </div>
        ) : null}
      </section>

      {/* Latest dispatches grid. */}
      <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8">
        <p className="field-label text-clay">Latest dispatches</p>
        <h2 className="display-large mt-3 text-carbon">
          Read, learn, head out.
        </h2>
        <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((article, index) => (
            <article
              key={article.handle}
              className={index % 3 === 1 ? "lg:mt-14" : undefined}
            >
              <Link href={`/journal/${article.handle}`} className="block">
                <Image
                  src={article.heroImage.src}
                  alt={article.heroImage.alt}
                  width={article.heroImage.width}
                  height={article.heroImage.height}
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                  className="aspect-4/3 w-full border border-hairline object-cover"
                />
              </Link>
              <p className="field-label mt-4 text-slate">
                {article.plate} · {article.readingMinutes} min read
              </p>
              <h3 className="mt-2 font-display text-3xl leading-tight text-carbon">
                <Link
                  href={`/journal/${article.handle}`}
                  className="hover:text-pine"
                >
                  {article.title}
                </Link>
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-slate">
                {article.excerpt}
              </p>
              <Link
                href={`/journal/${article.handle}`}
                className="field-label mt-4 inline-flex min-h-11 items-center gap-2 border-b border-carbon text-carbon transition-colors hover:text-pine"
              >
                Read story →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
