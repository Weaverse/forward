import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { cn } from "@/lib/cn";
import { eyebrow, sectionHeading, textLink } from "@/lib/presentation/variants";
import { storefront } from "@/lib/storefront/data-source";
import type { RichTextParagraph } from "@/lib/storefront/types";

interface StorePageProps {
  params: Promise<{ pageHandle: string }>;
}

function paragraphKey(paragraph: RichTextParagraph): string {
  return paragraph.map((run) => `${run.href ?? "text"}:${run.text}`).join("|");
}

function PageParagraph({ paragraph }: { paragraph: RichTextParagraph }) {
  return (
    <>
      {paragraph.map((run) => {
        const key = `${run.href ?? "text"}:${run.text}`;
        return run.href?.startsWith("/") ? (
          <Link href={run.href} key={key}>
            {run.text}
          </Link>
        ) : run.href ? (
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

export const dynamicParams = false;

export async function generateStaticParams() {
  const pages = await storefront.listPages();
  return pages.map((page) => ({ pageHandle: page.handle }));
}

export async function generateMetadata({
  params,
}: StorePageProps): Promise<Metadata> {
  const { pageHandle } = await params;
  const page = await storefront.getPage(pageHandle);
  if (page === null) {
    return { title: "Page not found" };
  }
  return { title: page.title, description: page.intro };
}

/** Rich-content surface shared by normalized Shopify pages. */
export default async function StorePageRoute({ params }: StorePageProps) {
  const { pageHandle } = await params;
  const [page, themeContent, collections] = await Promise.all([
    storefront.getPage(pageHandle),
    storefront.getThemeContent(),
    storefront.listCollections(),
  ]);
  if (page === null) {
    notFound();
  }
  const heroImage = page.heroImage ?? themeContent.standardBandImage;
  const originImage = collections[0]?.heroImage ?? themeContent.homeHeroImage;
  const [premise, ...values] = page.sections;

  return (
    <>
      <section className="mt-5.5 mr-7 ml-7 grid min-h-article-min grid-cols-[1.15fr_0.85fr] place-items-stretch bg-ink text-left text-text-inverse max-md:mx-3 max-md:min-h-0 max-md:grid-cols-1">
        <div className="relative min-w-0 overflow-hidden max-md:min-h-route-media-min">
          <Image
            className="absolute inset-0 h-full object-cover object-[56%_center] saturate-76"
            src={heroImage.src}
            alt={heroImage.alt}
            width={heroImage.width}
            height={heroImage.height}
            sizes="(min-width: 820px) 58vw, 100vw"
            priority
          />
        </div>
        <div className="relative z-2 flex flex-col justify-center bg-ink p-[clamp(45px,6vw,96px)] max-md:px-page-gutter max-md:pt-12 max-md:pb-14.5">
          <p className={eyebrow({ tone: "warm" })}>{page.eyebrow}</p>
          <h1 className="m-0 max-w-162.5 text-balance font-heading text-page-display leading-heading font-medium tracking-heading max-md:text-page-display-mobile">
            {page.title}
          </h1>
        </div>
      </section>

      <section className="mx-auto w-full max-w-page px-page-gutter py-section-block">
        <div className="grid grid-cols-split-85 items-start gap-page-gap max-md:grid-cols-1">
          <div>
            <p className={eyebrow()}>Our premise</p>
            {premise !== undefined ? (
              <h2 className={sectionHeading()}>{premise.heading}</h2>
            ) : null}
          </div>
          <div>
            <p className="max-w-lede text-lede leading-lede text-text-muted">
              {page.intro}
            </p>
            {premise?.paragraphs.map((paragraph) => (
              <p
                key={`${premise.heading}:${paragraphKey(paragraph)}`}
                className="text-text-muted"
              >
                <PageParagraph paragraph={paragraph} />
              </p>
            ))}
          </div>
        </div>
      </section>

      {values.length > 0 ? (
        <section className="mx-auto w-full max-w-page px-page-gutter py-section-block-compact">
          <div className="grid grid-cols-12 gap-3 max-sm:grid-cols-1">
            {values.map((section, index) => (
              <article
                key={section.heading}
                className={cn(
                  "col-span-6 min-h-82.5 border border-ink bg-transparent p-[clamp(34px,5vw,70px)] max-sm:col-auto",
                  index % 2 === 1 &&
                    "translate-y-17.5 bg-surface-subtle max-sm:translate-y-0",
                )}
              >
                <span className="font-field-meta text-ui font-medium text-signal-strong tracking-field-meta">
                  {String(index + 1).padStart(2, "0")} / Field standard
                </span>
                <h2 className="mt-12.5 mb-4.5 text-balance font-heading text-heading-3 leading-subheading font-medium tracking-heading">
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={`${section.heading}:${paragraphKey(paragraph)}`}
                    className="text-text-muted"
                  >
                    <PageParagraph paragraph={paragraph} />
                  </p>
                ))}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto w-full max-w-page px-page-gutter py-section-block">
        <div className="grid grid-cols-split-75 items-start gap-20 max-md:grid-cols-1">
          <div>
            <p className={eyebrow()}>Where this goes</p>
            <h2 className={sectionHeading()}>
              A short catalog,
              <br />
              built slowly.
            </h2>
          </div>
          <div>
            <Image
              className="aspect-5/4 object-cover"
              src={originImage.src}
              alt={originImage.alt}
              width={originImage.width}
              height={originImage.height}
              sizes="(min-width: 820px) 60vw, 100vw"
              loading="lazy"
            />
            <p className="max-w-lede text-lede leading-lede text-text-muted">
              {themeContent.footerTagline}
            </p>
            <Link className={textLink()} href="/shop">
              Shop the catalog
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
