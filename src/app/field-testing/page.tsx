import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { storefront } from "@/lib/storefront/data-source";

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
      <section className="relative mt-[22px] mr-7 ml-7 min-h-[90svh] overflow-hidden text-text-inverse after:absolute after:inset-0 after:bg-[linear-gradient(90deg,rgba(10,12,9,0.9),rgba(10,12,9,0.08))] after:content-[''] max-md:mx-2.5 max-md:mt-2.5 max-md:min-h-0">
        <Image
          className="absolute inset-0 h-full object-cover"
          src={theme.homeHeroImage.src}
          alt={theme.homeHeroImage.alt}
          width={theme.homeHeroImage.width}
          height={theme.homeHeroImage.height}
          sizes="100vw"
          priority
        />
        <div className="relative z-[1] max-w-[820px] p-[clamp(70px,9vw,150px)] max-md:px-page-gutter max-md:py-[65px]">
          <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase">
            Custom page / Field testing
          </p>
          <h1 className="mt-5 mb-[30px] text-balance font-heading text-[clamp(58px,7vw,112px)] leading-[0.9] tracking-[-0.06em] max-md:text-[clamp(50px,15vw,76px)]">
            Test the system, not the claim.
          </h1>
          <p className="max-w-[560px] text-[20px]">
            Wind, rain, abrasion, repeated packing, and long movement reveal
            more than an isolated specification ever will.
          </p>
        </div>
      </section>
      <section className="mx-auto grid w-[min(100%,var(--container-page))] grid-cols-[0.7fr_1.3fr] gap-20 px-page-gutter py-[clamp(70px,9vw,140px)] max-md:grid-cols-1">
        <header>
          <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase">
            The sequence
          </p>
          <h2 className="m-0 text-balance font-heading text-heading-2 leading-[0.98] font-medium tracking-heading">
            From controlled checks to useful failure.
          </h2>
        </header>
        <ol className="m-0 list-none border-border-subtle border-t p-0">
          <li className="grid grid-cols-[65px_1fr] gap-5 border-border-subtle border-b py-7">
            <span className="font-field-meta">01</span>
            <div>
              <h3 className="m-0 text-balance font-heading text-[30px]">
                Baseline
              </h3>
              <p>
                Confirm construction, fit, range of movement, and every
                functional detail before field use.
              </p>
            </div>
          </li>
          <li className="grid grid-cols-[65px_1fr] gap-5 border-border-subtle border-b py-7">
            <span className="font-field-meta">02</span>
            <div>
              <h3 className="m-0 text-balance font-heading text-[30px]">
                Exposure
              </h3>
              <p>
                Use the product through realistic weather and terrain in
                combination with the complete system.
              </p>
            </div>
          </li>
          <li className="grid grid-cols-[65px_1fr] gap-5 border-border-subtle border-b py-7">
            <span className="font-field-meta">03</span>
            <div>
              <h3 className="m-0 text-balance font-heading text-[30px]">
                Repetition
              </h3>
              <p>
                Pack, wash, adjust, and wear repeatedly to surface friction,
                fatigue, and awkward interactions.
              </p>
            </div>
          </li>
          <li className="grid grid-cols-[65px_1fr] gap-5 border-border-subtle border-b py-7">
            <span className="font-field-meta">04</span>
            <div>
              <h3 className="m-0 text-balance font-heading text-[30px]">
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
        <section className="grid grid-cols-[0.75fr_1.25fr] bg-ink text-text-inverse max-md:grid-cols-1">
          <div className="self-center p-[clamp(50px,7vw,110px)] max-md:order-2">
            <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase">
              Case study / Weatherline
            </p>
            <h2 className="text-balance font-heading text-[clamp(50px,6vw,94px)] leading-[0.92]">
              {shell.title}
            </h2>
            <p>{shell.description}</p>
            <dl className="my-[35px] border-border-dark border-t">
              {shell.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex justify-between border-border-dark border-b py-[13px]"
                >
                  <dt>{spec.label}</dt>
                  <dd>{spec.value}</dd>
                </div>
              ))}
            </dl>
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2.5 border border-text-inverse bg-transparent px-[22px] py-3 font-body text-[11px] font-bold text-text-inverse tracking-[0.09em] uppercase shadow-[4px_4px_0_var(--color-text-inverse)] [transition:background_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),border-color_var(--duration-fast)_var(--ease-standard),box-shadow_120ms_var(--ease-standard),transform_120ms_var(--ease-standard)] hover:translate-[2px] hover:bg-text-inverse hover:text-ink hover:shadow-[2px_2px_0_var(--color-text-inverse)] active:translate-1 active:shadow-none focus-visible:outline-[3px] focus-visible:outline-text-inverse focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0"
              href={`/products/${shell.handle}`}
            >
              View the shell
            </Link>
          </div>
          <Image
            className="h-[760px] object-cover max-md:h-[62svh]"
            src={shellImage.src}
            alt={shellImage.alt}
            width={shellImage.width}
            height={shellImage.height}
            sizes="(min-width: 820px) 55vw, 100vw"
          />
        </section>
      ) : null}
      {testingArticle !== undefined ? (
        <section className="mx-auto grid w-[min(100%,var(--container-page))] grid-cols-[1fr_0.7fr_auto] items-end gap-[45px] px-page-gutter py-[clamp(70px,9vw,140px)] max-md:grid-cols-1">
          <div>
            <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase">
              Field note
            </p>
            <h2 className="m-0 text-balance font-heading text-heading-2 leading-[0.98] font-medium tracking-heading">
              Read the complete shell protocol.
            </h2>
          </div>
          <p>{testingArticle.excerpt}</p>
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2.5 border border-ink bg-ink px-[22px] py-3 font-body text-[11px] font-bold text-text-inverse tracking-[0.09em] uppercase shadow-[4px_4px_0_var(--color-signal)] [transition:background_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),border-color_var(--duration-fast)_var(--ease-standard),box-shadow_120ms_var(--ease-standard),transform_120ms_var(--ease-standard)] hover:translate-[2px] hover:shadow-[2px_2px_0_var(--color-signal)] active:translate-1 active:shadow-none focus-visible:outline-[3px] focus-visible:outline-signal focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0"
            href={`/journal/${testingArticle.handle}`}
          >
            Open field note
          </Link>
        </section>
      ) : null}
    </div>
  );
}
