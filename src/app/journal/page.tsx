import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { eyebrow, sectionHeading, textLink } from "@/lib/presentation/variants";
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
    <>
      <header className="flex min-h-140 items-end border-border-subtle border-b bg-ink px-page-gutter pt-25 pb-18.75 text-text-inverse max-md:min-h-130 max-sm:min-h-107.5 max-sm:pt-17.5">
        <div className="mx-auto grid w-full grid-cols-page-header items-end gap-12.5 max-md:grid-cols-1 max-md:gap-7">
          <div>
            <p className={eyebrow({ tone: "signal" })}>The field journal</p>
            <h1 className="m-0 max-w-feature text-balance font-heading text-display leading-display font-medium tracking-heading max-sm:text-index-display-mobile">
              Notes from farther out.
            </h1>
          </div>
          <p className="m-0 max-w-lede justify-self-end text-lede leading-lede text-text-dark-lede max-md:max-w-full max-md:justify-self-start">
            Routes, useful skills, working knowledge, and the weather worth
            going out in.
          </p>
        </div>
      </header>

      {lead !== undefined ? (
        <Link
          className="mx-7 grid min-h-205 grid-cols-split-65 bg-ink text-text-inverse max-md:mx-3 max-md:grid-cols-1"
          href={`/journal/${lead.handle}`}
        >
          <div className="order-2 m-6 max-md:order-1 max-md:min-h-state-min">
            <Image
              className="h-full object-cover"
              src={lead.heroImage.src}
              alt={lead.heroImage.alt}
              width={lead.heroImage.width}
              height={lead.heroImage.height}
              sizes="(min-width: 820px) 66vw, 100vw"
              priority
            />
          </div>
          <div className="order-1 flex flex-col justify-center p-[clamp(36px,6vw,90px)] max-md:order-2">
            <p className={eyebrow({ tone: "warm" })}>
              {lead.plate} · {lead.readingMinutes} min read ·{" "}
              {formatDate(lead.publishedAt)}
            </p>
            <h2 className="m-0 mb-7 text-balance font-heading text-journal-display leading-heading font-medium tracking-heading">
              {lead.title}
            </h2>
            <p>{lead.excerpt}</p>
            <span className="inline-flex min-h-touch items-center gap-3.5 self-start border-text-inverse border-b font-body text-ui font-medium tracking-link uppercase after:text-control-lg after:font-normal after:content-['→'] after:transition-transform after:duration-200 after:ease-standard hover:after:translate-x-1.25">
              Read field note
            </span>
          </div>
        </Link>
      ) : null}

      <section className="mx-auto w-full max-w-page px-page-gutter py-section-block">
        <div className="mb-11 flex items-end justify-between gap-7.5 max-sm:flex-col max-sm:items-start">
          <div>
            <p className={eyebrow()}>Latest dispatches</p>
            <h2 className={sectionHeading()}>Read, learn, head out.</h2>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-x-4.5 gap-y-20">
          {rest.map((article) => (
            <article
              key={article.handle}
              className="col-span-4 max-md:col-span-6 max-sm:col-span-full"
            >
              <Link href={`/journal/${article.handle}`}>
                <Image
                  className="mb-4.5 aspect-4/3 object-cover"
                  src={article.heroImage.src}
                  alt={article.heroImage.alt}
                  width={article.heroImage.width}
                  height={article.heroImage.height}
                  sizes="(min-width: 820px) 34vw, 100vw"
                  loading="lazy"
                />
                <p className="mb-3.5 font-field-meta text-ui leading-meta font-medium text-text-muted tracking-field-meta uppercase">
                  {article.plate} · {article.readingMinutes} min read
                </p>
                <h2 className="mt-1.75 mb-3 text-balance font-heading text-journal-card leading-journal-card font-medium">
                  {article.title}
                </h2>
                <p className="text-text-muted">{article.excerpt}</p>
                <span className={textLink()}>Read story</span>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
