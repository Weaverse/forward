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
    <>
      <header className="flex min-h-[560px] items-end border-border-subtle border-b bg-ink px-page-gutter pt-[100px] pb-[75px] text-text-inverse max-md:min-h-[520px] max-sm:min-h-[430px] max-sm:pt-[70px]">
        <div className="mx-auto grid w-full grid-cols-[1.35fr_0.65fr] items-end gap-[50px] max-md:grid-cols-[minmax(0,1fr)] max-md:gap-7">
          <div>
            <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal tracking-field-meta uppercase">
              The field journal
            </p>
            <h1 className="m-0 max-w-[1050px] text-balance font-heading text-display leading-[0.94] font-medium tracking-heading max-sm:text-[clamp(53px,17vw,80px)]">
              Notes from farther out.
            </h1>
          </div>
          <p className="m-0 max-w-[670px] justify-self-end text-[clamp(17px,1.45vw,22px)] leading-[1.55] text-[#b5b8ae] max-md:max-w-full max-md:justify-self-start">
            Routes, useful skills, working knowledge, and the weather worth
            going out in.
          </p>
        </div>
      </header>

      {lead !== undefined ? (
        <Link
          className="mx-7 grid min-h-[820px] grid-cols-[0.65fr_1.35fr] bg-ink text-text-inverse max-md:mx-3 max-md:grid-cols-1"
          href={`/journal/${lead.handle}`}
        >
          <div className="order-2 m-6 max-md:order-1 max-md:min-h-[60svh]">
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
            <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-accent-warm tracking-field-meta uppercase">
              {lead.plate} · {lead.readingMinutes} min read ·{" "}
              {formatDate(lead.publishedAt)}
            </p>
            <h2 className="m-0 mb-7 text-balance font-heading text-[clamp(58px,7vw,106px)] leading-[0.98] font-medium tracking-heading">
              {lead.title}
            </h2>
            <p>{lead.excerpt}</p>
            <span className="inline-flex min-h-touch items-center gap-[14px] self-start border-text-inverse border-b font-body text-[11px] font-medium tracking-[0.06em] uppercase after:text-[20px] after:font-normal after:content-['→'] after:transition-transform after:duration-200 after:ease-standard hover:after:translate-x-[5px]">
              Read field note
            </span>
          </div>
        </Link>
      ) : null}

      <section className="mx-auto w-[min(100%,var(--container-page))] px-page-gutter py-[clamp(70px,9vw,140px)]">
        <div className="mb-11 flex items-end justify-between gap-[30px] max-sm:flex-col max-sm:items-start">
          <div>
            <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase">
              Latest dispatches
            </p>
            <h2 className="m-0 text-balance font-heading text-heading-2 leading-[0.98] font-medium tracking-heading">
              Read, learn, head out.
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-12 gap-x-[18px] gap-y-20">
          {rest.map((article) => (
            <article
              key={article.handle}
              className="col-span-4 max-md:col-span-6 max-sm:col-span-full"
            >
              <Link href={`/journal/${article.handle}`}>
                <Image
                  className="mb-[18px] aspect-4/3 object-cover"
                  src={article.heroImage.src}
                  alt={article.heroImage.alt}
                  width={article.heroImage.width}
                  height={article.heroImage.height}
                  sizes="(min-width: 820px) 34vw, 100vw"
                  loading="lazy"
                />
                <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-text-muted tracking-field-meta uppercase">
                  {article.plate} · {article.readingMinutes} min read
                </p>
                <h2 className="mt-[7px] mb-3 text-balance font-heading text-[clamp(31px,3vw,47px)] leading-[1.08] font-medium">
                  {article.title}
                </h2>
                <p className="text-text-muted">{article.excerpt}</p>
                <span className="inline-flex min-h-touch items-center gap-[14px] border-ink border-b font-body text-[11px] font-medium tracking-[0.06em] uppercase after:text-[20px] after:font-normal after:content-['→'] after:transition-transform after:duration-200 after:ease-standard hover:after:translate-x-[5px]">
                  Read story
                </span>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
