import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { eyebrow, sectionHeading, textLink } from "@/lib/presentation/variants";
import { storefront } from "@/lib/storefront/data-source";

export const metadata: Metadata = {
  title: "About Forward",
  description: "The product principles and field standard behind Forward.",
};

export default async function AboutCustomPage() {
  const [theme, products, collections] = await Promise.all([
    storefront.getThemeContent(),
    storefront.listProducts(),
    storefront.listCollections(),
  ]);
  return (
    <div>
      <section className="mt-5.5 mr-7 ml-7 grid min-h-page-min grid-cols-split-90 bg-ink text-text-inverse max-md:mx-2.5 max-md:mt-2.5 max-md:min-h-0 max-md:grid-cols-1">
        <div className="flex flex-col justify-center p-panel-wide max-md:px-page-gutter max-md:py-13.75">
          <p className={eyebrow()}>Custom page / About Forward</p>
          <h1 className="mt-5 mb-7.5 text-balance font-heading text-display-wide leading-display-tightest tracking-display-tight max-md:text-display-mobile">
            Make less equipment. Make every piece matter.
          </h1>
          <p className="max-w-lede text-lede leading-lede text-text-muted">
            Forward is built around complete movement systems rather than
            seasonal noise: fewer products, clearer jobs, longer useful lives.
          </p>
        </div>
        <Image
          className="h-full object-cover saturate-72 max-md:h-home-media-mobile"
          src={theme.homeHeroImage.src}
          alt={theme.homeHeroImage.alt}
          width={theme.homeHeroImage.width}
          height={theme.homeHeroImage.height}
          sizes="(min-width: 820px) 55vw, 100vw"
          priority
        />
      </section>
      <section className="mx-auto w-full max-w-page px-page-gutter py-section-block">
        <p className={eyebrow()}>The Forward standard</p>
        <h2 className="max-w-275 text-balance font-heading text-about-statement leading-display-relaxed">
          Useful over novel. Repairable over disposable. Quiet over loud.
        </h2>
        <div className="mt-17.5 grid grid-cols-3 gap-10 text-copy-lg max-md:mt-8.75 max-md:grid-cols-1 max-md:gap-2.5">
          <p>
            We begin with the work a product must do, then remove anything that
            does not improve movement, protection, carry, or recovery.
          </p>
          <p>
            Materials are selected for known performance and honest aging. A
            worn product should carry evidence of use—not become obsolete.
          </p>
          <p>
            Every core object belongs to a system, so layers and equipment earn
            their place together instead of competing for attention.
          </p>
        </div>
      </section>
      <section className="grid grid-cols-3 bg-signal max-md:grid-cols-1">
        <div className="grid gap-1 border-ink border-r p-13.75 max-md:border-b max-md:px-page-gutter max-md:py-8.5">
          <strong className="font-heading text-display-fixed">
            {products.length}
          </strong>
          <span className="font-field-meta text-field-meta uppercase">
            core objects
          </span>
        </div>
        <div className="grid gap-1 border-ink border-r p-13.75 max-md:border-b max-md:px-page-gutter max-md:py-8.5">
          <strong className="font-heading text-display-fixed">
            {collections.length - 1}
          </strong>
          <span className="font-field-meta text-field-meta uppercase">
            movement systems
          </span>
        </div>
        <div className="grid gap-1 border-ink border-r p-13.75 max-md:border-b max-md:px-page-gutter max-md:py-8.5">
          <strong className="font-heading text-display-fixed">01</strong>
          <span className="font-field-meta text-field-meta uppercase">
            repair commitment
          </span>
        </div>
      </section>
      <section className="mx-auto w-full max-w-page px-page-gutter py-section-block">
        <header className="mb-11.25 grid grid-cols-feature-row items-end gap-10 max-md:grid-cols-1 max-md:gap-5">
          <div>
            <p className="m-0 max-w-copy-narrow font-field-meta text-ui leading-meta font-medium text-signal-strong tracking-field-meta uppercase">
              Representative equipment
            </p>
            <h2 className={sectionHeading()}>The standard, made physical.</h2>
          </div>
          <Link className={textLink()} href="/shop">
            Complete catalog
          </Link>
        </header>
        <div className="grid grid-cols-4 gap-4.5 max-lg:grid-cols-2 max-sm:grid-cols-2 max-sm:gap-2.5">
          {products.slice(0, 3).map((product) => (
            <ProductCard key={product.handle} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
