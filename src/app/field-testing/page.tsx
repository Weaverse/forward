import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { cta, eyebrow, sectionHeading } from "@/lib/presentation/variants";
import { storefront } from "@/lib/storefront/data-source";

/** One numbered sequence step: index column, then the step description. */
const SEQUENCE_STEP_CLASS =
  "grid grid-cols-[65px_1fr] gap-5 border-border-subtle border-b py-7";

export const metadata: Metadata = {
  title: "Field Testing",
  description: "How Forward evaluates products before they enter the catalog.",
};

export default async function FieldTestingCustomPage() {
  const [theme, products, articles] = await Promise.all([
    storefront.getThemeContent(),
    storefront.listProducts(),
    storefront.listArticles(),
  ]);
  const shell = products.find(
    (product) => product.handle === "weatherline-shell",
  );
  const shellImage = shell?.colorways[0]?.images.context;
  const testingArticle = articles.find(
    (article) =>
      article.handle === "how-we-test-a-shell-before-calling-it-weatherproof",
  );
  return (
    <div>
      <section className="relative mt-5.5 mr-7 ml-7 min-h-[90svh] overflow-hidden text-text-inverse after:absolute after:inset-0 after:bg-field-testing-overlay after:content-[''] max-md:mx-2.5 max-md:mt-2.5 max-md:min-h-0">
        <Image
          className="absolute inset-0 h-full object-cover"
          src={theme.homeHeroImage.src}
          alt={theme.homeHeroImage.alt}
          width={theme.homeHeroImage.width}
          height={theme.homeHeroImage.height}
          sizes="100vw"
          priority
        />
        <div className="relative z-1 max-w-205 p-[clamp(70px,9vw,150px)] max-md:px-page-gutter max-md:py-16.25">
          <p className={eyebrow()}>Custom page / Field testing</p>
          <h1 className="mt-5 mb-7.5 text-balance font-heading text-display-wide leading-display-tightest tracking-display-tight max-md:text-display-mobile">
            Test the system, not the claim.
          </h1>
          <p className="max-w-state text-control-lg">
            Wind, rain, abrasion, repeated packing, and long movement reveal
            more than an isolated specification ever will.
          </p>
        </div>
      </section>
      <section className="mx-auto grid w-full max-w-page grid-cols-split-70 gap-20 px-page-gutter py-section-block max-md:grid-cols-1">
        <header>
          <p className={eyebrow()}>The sequence</p>
          <h2 className={sectionHeading()}>
            From controlled checks to useful failure.
          </h2>
        </header>
        <ol className="m-0 list-none border-border-subtle border-t p-0">
          <li className={SEQUENCE_STEP_CLASS}>
            <span className="font-field-meta">01</span>
            <div>
              <h3 className="m-0 text-balance font-heading text-feature-stat">
                Baseline
              </h3>
              <p>
                Confirm construction, fit, range of movement, and every
                functional detail before field use.
              </p>
            </div>
          </li>
          <li className={SEQUENCE_STEP_CLASS}>
            <span className="font-field-meta">02</span>
            <div>
              <h3 className="m-0 text-balance font-heading text-feature-stat">
                Exposure
              </h3>
              <p>
                Use the product through realistic weather and terrain in
                combination with the complete system.
              </p>
            </div>
          </li>
          <li className={SEQUENCE_STEP_CLASS}>
            <span className="font-field-meta">03</span>
            <div>
              <h3 className="m-0 text-balance font-heading text-feature-stat">
                Repetition
              </h3>
              <p>
                Pack, wash, adjust, and wear repeatedly to surface friction,
                fatigue, and awkward interactions.
              </p>
            </div>
          </li>
          <li className={SEQUENCE_STEP_CLASS}>
            <span className="font-field-meta">04</span>
            <div>
              <h3 className="m-0 text-balance font-heading text-feature-stat">
                Repair review
              </h3>
              <p>
                Evaluate how failure can be diagnosed and repaired before a
                product earns a permanent place.
              </p>
            </div>
          </li>
        </ol>
      </section>
      {shell !== undefined && shellImage !== undefined ? (
        <section className="grid grid-cols-split-75 bg-ink text-text-inverse max-md:grid-cols-1">
          <div className="self-center p-[clamp(50px,7vw,110px)] max-md:order-2">
            <p className={eyebrow()}>Case study / Weatherline</p>
            <h2 className="text-balance font-heading text-field-case-title leading-field-case">
              {shell.title}
            </h2>
            <p>{shell.description}</p>
            <dl className="my-8.75 border-border-dark border-t">
              {shell.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex justify-between border-border-dark border-b py-3.25"
                >
                  <dt>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>
            <Link
              className={cta({ intent: "light" })}
              href={`/products/${shell.handle}`}
            >
              View the shell
            </Link>
          </div>
          <Image
            className="h-190 object-cover max-md:h-[62svh]"
            src={shellImage.src}
            alt={shellImage.alt}
            width={shellImage.width}
            height={shellImage.height}
            sizes="(min-width: 820px) 55vw, 100vw"
          />
        </section>
      ) : null}
      {testingArticle !== undefined ? (
        <section className="mx-auto grid w-full max-w-page grid-cols-spec-row items-end gap-11.25 px-page-gutter py-section-block max-md:grid-cols-1">
          <div>
            <p className={eyebrow()}>Field note</p>
            <h2 className={sectionHeading()}>
              Read the complete shell protocol.
            </h2>
          </div>
          <p>{testingArticle.excerpt}</p>
          <Link className={cta()} href={`/journal/${testingArticle.handle}`}>
            Open field note
          </Link>
        </section>
      ) : null}
    </div>
  );
}
