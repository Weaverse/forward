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
    <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8">
      <header className="border-b-2 border-pine pb-6">
        <p className="field-label text-clay">The Forward journal</p>
        <h1 className="mt-3 font-display text-4xl text-pine sm:text-6xl">
          Field Notes
        </h1>
        <p className="field-label mt-4 text-slate">
          Dispatches · gear arguments · weather worth going out in
        </p>
      </header>

      {lead !== undefined ? (
        <article className="grid gap-8 border-b border-mist py-10 lg:grid-cols-12">
          <Link
            href={`/journal/${lead.handle}`}
            className="block lg:col-span-7"
          >
            <Image
              src={lead.heroImage.src}
              alt={lead.heroImage.alt}
              width={lead.heroImage.width}
              height={lead.heroImage.height}
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="aspect-3/2 w-full border border-mist object-cover"
            />
          </Link>
          <div className="flex flex-col justify-center gap-3 lg:col-span-5">
            <p className="field-label text-clay">
              {lead.plate} · {lead.location}
            </p>
            <h2 className="font-display text-3xl leading-tight text-pine sm:text-4xl">
              <Link
                href={`/journal/${lead.handle}`}
                className="hover:text-clay"
              >
                {lead.title}
              </Link>
            </h2>
            <p className="max-w-md text-base leading-relaxed text-slate">
              {lead.excerpt}
            </p>
            <p className="field-label text-slate">
              {formatDate(lead.publishedAt)} · {lead.readingMinutes} min read ·{" "}
              {lead.coordinates}
            </p>
            <Link
              href={`/journal/${lead.handle}`}
              className="field-label mt-2 inline-flex min-h-11 w-fit items-center border border-pine px-5 text-pine transition-colors hover:bg-pine hover:text-bone"
            >
              Read the dispatch
            </Link>
          </div>
        </article>
      ) : null}

      <div className="divide-y divide-mist">
        {rest.map((article) => (
          <article
            key={article.handle}
            className="grid gap-6 py-10 sm:grid-cols-12"
          >
            <Link
              href={`/journal/${article.handle}`}
              className="block sm:col-span-4"
            >
              <Image
                src={article.heroImage.src}
                alt={article.heroImage.alt}
                width={article.heroImage.width}
                height={article.heroImage.height}
                sizes="(min-width: 640px) 30vw, 100vw"
                className="aspect-3/2 w-full border border-mist object-cover"
              />
            </Link>
            <div className="flex flex-col justify-center gap-2 sm:col-span-8">
              <p className="field-label text-clay">
                {article.plate} · {article.location}
              </p>
              <h2 className="font-display text-2xl text-pine sm:text-3xl">
                <Link
                  href={`/journal/${article.handle}`}
                  className="hover:text-clay"
                >
                  {article.title}
                </Link>
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-slate">
                {article.excerpt}
              </p>
              <p className="field-label text-slate">
                {formatDate(article.publishedAt)} · {article.readingMinutes} min
                read
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
