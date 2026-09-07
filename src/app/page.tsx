import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/cn";
import {
  cta,
  eyebrow,
  sectionHeading,
  textLink,
} from "@/lib/presentation/variants";
import { storefront } from "@/lib/storefront/data-source";
import type { Collection, Product } from "@/lib/storefront/types";

export const revalidate = 3600;

const FEATURED_HANDLES = [
  "weatherline-shell",
  "traverse-grid-fleece",
  "ridge-30-field-pack",
  "talus-trail-shoe",
] as const;

const CATEGORY_HANDLES = ["outerwear", "packs", "footwear"] as const;

const LEDE_CLASS =
  "mb-prose-paragraph max-w-lede text-lede leading-lede text-text-muted";
const SHELL_SECTION_CLASS =
  "mx-auto w-full max-w-page px-page-gutter py-section-block";
const VIEWPORT_SECTION_CLASS =
  "md-up:[--home-viewport-pad:clamp(48px,5vw,96px)] md-up:[--home-viewport-media:calc(100svh_-_2_*_var(--home-viewport-pad))] md-up:py-(--home-viewport-pad) short-desktop:[--home-viewport-pad:clamp(8px,2svh,16px)]";

export default async function HomePage() {
  const [themeContent, products, collections, articles] = await Promise.all([
    storefront.getThemeContent(),
    storefront.listProducts(),
    storefront.listCollections(),
    storefront.listArticles(),
  ]);
  const productsByHandle = new Map<string, Product>(
    products.map((product) => [product.handle, product]),
  );
  const collectionsByHandle = new Map<string, Collection>(
    collections.map((collection) => [collection.handle, collection]),
  );
  const featured = FEATURED_HANDLES.map((handle) =>
    productsByHandle.get(handle),
  ).filter((product): product is Product => product !== undefined);
  const categories = CATEGORY_HANDLES.map((handle) =>
    collectionsByHandle.get(handle),
  ).filter((collection): collection is Collection => collection !== undefined);
  /* Editorial copy here uses `subtitle` — the theme-owned one-sentence summary
   * keyed by canonical handle in `catalog-presentation.ts` — because the full
   * Shopify `description` is a product-page body, not a Home teaser. */
  const spotlight = productsByHandle.get("drift-insulated-vest") ?? featured[0];
  const pack = productsByHandle.get("approach-18-day-pack") ?? featured[1];
  const dispatch = articles[0];
  const spotlightImage = spotlight?.colorways[0]?.images.context;
  const kitProducts = featured.slice(0, 3).flatMap((product) => {
    const image = product.colorways[0]?.images.primary;
    return image === undefined ? [] : [{ product, image }];
  });

  return (
    <div className="bg-text-inverse">
      <section
        aria-labelledby="home-hero-title"
        className="grid min-h-[calc(100svh_-_var(--spacing-header))] grid-cols-[minmax(390px,0.78fr)_minmax(0,1.22fr)] bg-ink text-text-inverse max-md:min-h-[calc(100svh_-_var(--spacing-header-compact))] max-md:grid-cols-1"
      >
        <div className="flex flex-col justify-center p-[clamp(48px,6vw,100px)] max-md:px-page-gutter max-md:py-13.75">
          <p className={eyebrow()}>Forward / Field equipment 2026</p>
          <h1
            className="mt-5.5 mb-7 max-w-190 text-balance font-heading text-home-hero leading-home-hero font-medium tracking-home-hero max-md:text-home-hero-mobile"
            id="home-hero-title"
          >
            Equipment for weather that changes the plan.
          </h1>
          <p className={cn(LEDE_CLASS, "max-w-142.5 text-text-dark-subtle")}>
            Layerable apparel, precise footwear, and low-profile carry systems
            made to move together.
          </p>
          <div className="mt-8.5 flex flex-wrap items-center gap-6">
            <Link className={cta({ intent: "signal" })} href="/shop">
              Shop all equipment
            </Link>
            <Link className={textLink()} href="/field-testing">
              How we test
            </Link>
          </div>
          <dl className="mt-auto grid grid-cols-3 border-border-dark-subtle border-t pt-9 max-md:mt-11.25">
            <div className="grid gap-1.5">
              <dt className="m-0 font-field-meta text-micro text-text-dark-meta uppercase">
                Systems
              </dt>
              <dd className="m-0 font-heading text-heading-4">
                {categories.length}
              </dd>
            </div>
            <div className="grid gap-1.5">
              <dt className="m-0 font-field-meta text-micro text-text-dark-meta uppercase">
                Core objects
              </dt>
              <dd className="m-0 font-heading text-heading-4">
                {products.length}
              </dd>
            </div>
            <div className="grid gap-1.5">
              <dt className="m-0 font-field-meta text-micro text-text-dark-meta uppercase">
                Repair
              </dt>
              <dd className="m-0 font-heading text-heading-4">For life</dd>
            </div>
          </dl>
        </div>
        <div className="relative m-5 min-h-190 overflow-hidden max-md:mx-2.5 max-md:mt-0 max-md:mb-2.5 max-md:min-h-[68svh]">
          <Image
            className="absolute inset-0 h-full object-cover saturate-78 contrast-105"
            src={themeContent.homeHeroImage.src}
            alt={themeContent.homeHeroImage.alt}
            width={themeContent.homeHeroImage.width}
            height={themeContent.homeHeroImage.height}
            sizes="(min-width: 820px) 58vw, 100vw"
            priority
          />
          {featured[0] !== undefined ? (
            <Link
              className="absolute right-4.5 bottom-4.5 grid w-[min(330px,calc(100%_-_36px))] gap-2 bg-signal p-5 text-ink"
              href={`/products/${featured[0].handle}`}
            >
              <span className="font-field-meta text-micro uppercase">
                Featured system
              </span>
              <strong className="font-heading text-home-feature-title">
                {featured[0].title}
              </strong>
              <span className="font-field-meta text-micro uppercase">
                View product →
              </span>
            </Link>
          ) : null}
        </div>
      </section>

      <section
        aria-labelledby="home-featured-title"
        className={SHELL_SECTION_CLASS}
      >
        <header className="mb-11.25 grid grid-cols-feature-row items-end gap-10 max-md:grid-cols-1 max-md:gap-5">
          <div>
            <p className={eyebrow()}>New field rotation</p>
            <h2 className={sectionHeading()} id="home-featured-title">
              Start with the core four.
            </h2>
          </div>
          <p className="m-0 max-w-copy-narrow">
            A weather layer, breathable midlayer, close-body carry, and trail
            shoe form the shortest route to a complete Forward system.
          </p>
          <Link className={textLink()} href="/shop">
            Shop all {products.length}
          </Link>
        </header>
        <div className="grid grid-cols-4 gap-4.5 max-md:grid-cols-2 max-sm:gap-2.5">
          {featured.map((product, index) => (
            <ProductCard
              key={product.handle}
              product={product}
              priority={index < 2}
            />
          ))}
        </div>
      </section>

      <section className="bg-ink pt-20 text-text-inverse">
        <header className="mx-auto w-full max-w-page px-page-gutter pb-11">
          <p className={eyebrow()}>Shop by system</p>
          <h2 className={sectionHeading()}>
            Built separately. Better together.
          </h2>
        </header>
        <div className="grid grid-cols-3 max-md:grid-cols-1">
          {categories.map((collection) => (
            <Link
              className="group relative min-h-177.5 overflow-hidden border-border-dark-divider border-r text-text-inverse after:absolute after:inset-x-0 after:top-2/5 after:bottom-0 after:bg-system-card-overlay after:content-[''] max-md:min-h-150"
              href={`/shop/${collection.handle}`}
              key={collection.handle}
            >
              <Image
                className="h-full object-cover saturate-72 transition-transform duration-500 ease-standard group-hover:scale-102.5"
                src={collection.heroImage.src}
                alt={collection.heroImage.alt}
                width={collection.heroImage.width}
                height={collection.heroImage.height}
                sizes="(min-width: 820px) 34vw, 100vw"
              />
              <div className="absolute right-0 bottom-0 left-0 z-1 p-8.5">
                <span className={eyebrow()}>{collection.fieldCode}</span>
                <h3 className="mt-2 mb-4 font-heading text-system-title leading-display-relaxed">
                  {collection.title}
                </h3>
                <p className="mb-prose-paragraph max-w-105 text-text-dark-subtle">
                  {collection.description}
                </p>
                <span className="mt-6 block font-body text-ui uppercase">
                  Shop system →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {spotlight !== undefined && spotlightImage !== undefined ? (
        <section
          className={cn(
            SHELL_SECTION_CLASS,
            "grid grid-cols-[minmax(0,1.25fr)_minmax(380px,0.75fr)] gap-0 max-md:grid-cols-1",
            VIEWPORT_SECTION_CLASS,
          )}
        >
          <div>
            <Image
              className="min-h-0 aspect-4/5 object-cover md-up:h-(--home-viewport-media) md-up:aspect-auto"
              src={spotlightImage.src}
              alt={spotlightImage.alt}
              width={spotlightImage.width}
              height={spotlightImage.height}
              sizes="(min-width: 820px) 60vw, 100vw"
            />
          </div>
          <div className="flex flex-col justify-center bg-surface-subtle p-[clamp(42px,6vw,92px)] md-up:px-[clamp(28px,4vw,60px)] md-up:py-[clamp(24px,4svh,48px)] short-desktop:px-[clamp(20px,3vw,36px)] short-desktop:py-2">
            <p className={cn(eyebrow(), "short-desktop:mb-1")}>
              Layer focus / {spotlight.category}
            </p>
            <h2
              className={cn(
                sectionHeading(),
                "md-up:text-spotlight-title short-desktop:mb-1 short-desktop:text-spotlight-title-short short-desktop:leading-display-relaxed",
              )}
            >
              {spotlight.title}
            </h2>
            <p
              className={cn(
                LEDE_CLASS,
                "md-up:mb-[clamp(10px,2svh,18px)] md-up:text-spotlight-copy md-up:leading-spotlight-copy short-desktop:mb-1 short-desktop:text-spotlight-copy-short short-desktop:leading-spotlight-copy-short",
              )}
            >
              {spotlight.subtitle}
            </p>
            <ul className="my-7.5 list-none border-border-subtle border-t p-0 md-up:my-[clamp(14px,2.5svh,24px)] short-desktop:my-1">
              {spotlight.specs.slice(0, 3).map((spec) => (
                <li
                  key={spec.label}
                  className="flex justify-between gap-5 border-border-subtle border-b py-3.5 text-caption md-up:py-[clamp(8px,1.7svh,14px)] short-desktop:py-[clamp(3px,1svh,6px)] short-desktop:text-ui"
                >
                  <span>{spec.label}</span>
                  <strong>{spec.value}</strong>
                </li>
              ))}
            </ul>
            <Link
              className={cn(
                cta(),
                "self-start short-desktop:min-h-10 short-desktop:py-2",
              )}
              href={`/products/${spotlight.handle}`}
            >
              Explore the layer
            </Link>
          </div>
        </section>
      ) : null}

      <section className="grid grid-cols-split-85 bg-ink text-text-inverse max-md:grid-cols-1">
        <div className="flex flex-col justify-center p-[clamp(48px,7vw,110px)]">
          <p className={eyebrow()}>Material standard</p>
          <h2 className={sectionHeading()}>
            Fewer materials. Better understood.
          </h2>
          <p className="mb-prose-paragraph max-w-state text-copy-lg text-text-dark-subtle">
            Every fabric, foam, buckle, and compound is selected around useful
            life, field repair, and performance you can actually feel.
          </p>
          <div className="mt-8.5 flex flex-wrap items-center gap-6">
            <Link className={cta({ intent: "light" })} href="/materials">
              Explore materials
            </Link>
            <Link className={textLink()} href="/about">
              About Forward
            </Link>
          </div>
        </div>
        <Image
          className="h-175 object-cover saturate-70 max-md:h-[58svh]"
          src={themeContent.standardBandImage.src}
          alt={themeContent.standardBandImage.alt}
          width={themeContent.standardBandImage.width}
          height={themeContent.standardBandImage.height}
          sizes="(min-width: 820px) 55vw, 100vw"
        />
      </section>

      {pack !== undefined ? (
        <section
          className={cn(
            SHELL_SECTION_CLASS,
            "grid grid-cols-[0.55fr_1.45fr] items-end gap-15 max-md:grid-cols-1",
            VIEWPORT_SECTION_CLASS,
          )}
        >
          <div className="pb-7.5">
            <p className={eyebrow()}>One-day kit</p>
            <h2 className={sectionHeading()}>Carry the day, not the doubt.</h2>
            <p className="mb-prose-paragraph">{pack.subtitle}</p>
            <Link className={textLink()} href={`/products/${pack.handle}`}>
              View {pack.title}
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 max-md:gap-1.75">
            {kitProducts.map(({ product, image }) => (
              <Link href={`/products/${product.handle}`} key={product.handle}>
                <Image
                  className="aspect-4/5 object-cover md-up:max-h-[calc(var(--home-viewport-media)_-_44px)] short-desktop:max-h-[calc(var(--home-viewport-media)_-_32px)]"
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  sizes="(min-width: 820px) 20vw, 45vw"
                />
                <span className="mt-2.5 block text-caption font-bold short-desktop:mt-1 short-desktop:text-ui">
                  {product.title}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section
        className={cn(
          SHELL_SECTION_CLASS,
          "grid grid-cols-split-70 gap-3 max-md:grid-cols-1",
        )}
      >
        <article className="min-h-140 bg-signal p-[clamp(35px,5vw,70px)] max-md:min-h-0">
          <p className={eyebrow()}>Repair, not replace</p>
          <h2 className="mb-home-copy text-balance font-heading text-home-display leading-display-relaxed">
            Keep equipment in motion.
          </h2>
          <p className="mb-prose-paragraph">
            Product defects are repaired free. Wear, accidents, and hard-earned
            damage are assessed honestly before work begins.
          </p>
          <Link className={textLink()} href="/pages/field-repair">
            Visit the repair desk
          </Link>
        </article>
        {dispatch !== undefined ? (
          <article className="grid min-h-140 grid-cols-split-90 bg-surface-subtle p-0 max-md:min-h-0 max-md:grid-cols-1">
            <Image
              className="h-full object-cover max-md:max-h-[55svh]"
              src={dispatch.heroImage.src}
              alt={dispatch.heroImage.alt}
              width={dispatch.heroImage.width}
              height={dispatch.heroImage.height}
              sizes="(min-width: 820px) 45vw, 100vw"
            />
            <div className="self-center p-11.25">
              <p className={eyebrow()}>Latest field note</p>
              <h2 className="mb-home-copy text-balance font-heading text-home-display leading-display-relaxed">
                {dispatch.title}
              </h2>
              <p className="mb-prose-paragraph">{dispatch.excerpt}</p>
              <Link className={textLink()} href={`/journal/${dispatch.handle}`}>
                Read the dispatch
              </Link>
            </div>
          </article>
        ) : null}
      </section>
    </div>
  );
}
