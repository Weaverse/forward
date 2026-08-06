import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { storefront } from "@/lib/storefront/data-source";

interface StorePageProps {
  params: Promise<{ pageHandle: string }>;
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

/**
 * Store pages — port of the canonical `aboutPage()` (source `app.js:336`),
 * the canonical rich-content surface: split image/dark-copy hero, the premise
 * intro grid, the 12-column staggered `.about-values` blocks, and the origin
 * grid. `about-forward` maps most directly; other normalized pages use the
 * same grammar with their own sections.
 */
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
      <section className="about-hero">
        <div className="about-hero-media">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            width={heroImage.width}
            height={heroImage.height}
            sizes="(min-width: 820px) 58vw, 100vw"
            priority
          />
        </div>
        <div className="about-hero-inner">
          <p className="eyebrow">{page.eyebrow}</p>
          <h1 className="display">{page.title}</h1>
        </div>
      </section>

      <section className="section shell">
        <div className="intro-grid">
          <div>
            <p className="eyebrow">Our premise</p>
            {premise !== undefined ? (
              <h2 className="h2">{premise.heading}</h2>
            ) : null}
          </div>
          <div>
            <p className="lede">{page.intro}</p>
            {premise?.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="muted">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {values.length > 0 ? (
        <section className="shell section-tight">
          <div className="about-values">
            {values.map((section, index) => (
              <article key={section.heading} className="value-block">
                <span className="value-number">
                  {String(index + 1).padStart(2, "0")} / Field standard
                </span>
                <h2 className="h3">{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)} className="muted">
                    {paragraph}
                  </p>
                ))}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section shell">
        <div className="origin-grid">
          <div>
            <p className="eyebrow">Where this goes</p>
            <h2 className="h2">
              A short catalog,
              <br />
              built slowly.
            </h2>
          </div>
          <div>
            <Image
              src={originImage.src}
              alt={originImage.alt}
              width={originImage.width}
              height={originImage.height}
              sizes="(min-width: 820px) 60vw, 100vw"
              loading="lazy"
            />
            <p className="lede">{themeContent.footerTagline}</p>
            <Link className="text-link" href="/shop">
              Shop the catalog
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
