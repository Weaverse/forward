import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
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
      <section className="mt-[22px] mr-7 ml-7 grid min-h-[82svh] grid-cols-[0.9fr_1.1fr] bg-ink text-text-inverse max-md:mx-2.5 max-md:mt-2.5 max-md:min-h-0 max-md:grid-cols-1">
        <div className="flex flex-col justify-center p-[clamp(45px,6vw,95px)] max-md:px-page-gutter max-md:py-[55px]">
          <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase">
            Custom page / About Forward
          </p>
          <h1 className="mt-5 mb-[30px] text-balance font-heading text-[clamp(58px,7vw,112px)] leading-[0.9] tracking-[-0.06em] max-md:text-[clamp(50px,15vw,76px)]">
            Make less equipment. Make every piece matter.
          </h1>
          <p className="max-w-[670px] text-[clamp(17px,1.45vw,22px)] leading-[1.55] text-text-muted">
            Forward is built around complete movement systems rather than
            seasonal noise: fewer products, clearer jobs, longer useful lives.
          </p>
        </div>
        <Image
          className="h-full object-cover saturate-[0.72] max-md:h-[60svh]"
          src={theme.homeHeroImage.src}
          alt={theme.homeHeroImage.alt}
          width={theme.homeHeroImage.width}
          height={theme.homeHeroImage.height}
          sizes="(min-width: 820px) 55vw, 100vw"
          priority
        />
      </section>
      <section className="mx-auto w-[min(100%,var(--container-page))] px-page-gutter py-[clamp(70px,9vw,140px)]">
        <p className="mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase">
          The Forward standard
        </p>
        <h2 className="max-w-[1100px] text-balance font-heading text-[clamp(48px,7vw,100px)] leading-[0.95]">
          Useful over novel. Repairable over disposable. Quiet over loud.
        </h2>
        <div className="mt-[70px] grid grid-cols-3 gap-10 text-[18px] max-md:mt-[35px] max-md:grid-cols-1 max-md:gap-2.5">
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
        <div className="grid gap-1 border-ink border-r p-[55px] max-md:border-b max-md:px-page-gutter max-md:py-[34px]">
          <strong className="font-heading text-[72px]">
            {products.length}
          </strong>
          <span className="font-field-meta text-[10px] uppercase">
            core objects
          </span>
        </div>
        <div className="grid gap-1 border-ink border-r p-[55px] max-md:border-b max-md:px-page-gutter max-md:py-[34px]">
          <strong className="font-heading text-[72px]">
            {collections.length - 1}
          </strong>
          <span className="font-field-meta text-[10px] uppercase">
            movement systems
          </span>
        </div>
        <div className="grid gap-1 border-ink border-r p-[55px] max-md:border-b max-md:px-page-gutter max-md:py-[34px]">
          <strong className="font-heading text-[72px]">01</strong>
          <span className="font-field-meta text-[10px] uppercase">
            repair commitment
          </span>
        </div>
      </section>
      <section className="mx-auto w-[min(100%,var(--container-page))] px-page-gutter py-[clamp(70px,9vw,140px)]">
        <header className="mb-[45px] grid grid-cols-[minmax(0,1fr)_minmax(260px,0.42fr)_auto] items-end gap-10 max-md:grid-cols-1 max-md:gap-5">
          <div>
            <p className="m-0 max-w-[460px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase">
              Representative equipment
            </p>
            <h2 className="m-0 text-balance font-heading text-heading-2 leading-[0.98] font-medium tracking-heading">
              The standard, made physical.
            </h2>
          </div>
          <Link
            className="inline-flex min-h-touch items-center gap-[14px] border-ink border-b font-body text-[11px] font-medium tracking-[0.06em] uppercase after:text-[20px] after:font-normal after:content-['→'] after:transition-transform after:duration-200 after:ease-standard hover:after:translate-x-[5px]"
            href="/shop"
          >
            Complete catalog
          </Link>
        </header>
        <div className="grid grid-cols-4 gap-[18px] max-lg:grid-cols-2 max-sm:grid-cols-2 max-sm:gap-2.5">
          {products.slice(0, 3).map((product) => (
            <ProductCard key={product.handle} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
