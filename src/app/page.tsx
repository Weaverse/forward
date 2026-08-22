import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
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

const EYEBROW_CLASS =
  "mb-[14px] font-field-meta text-[11px] leading-[1.3] font-medium text-signal-strong tracking-field-meta uppercase";
const HEADING_CLASS =
  "m-0 text-balance font-heading text-heading-2 leading-[0.98] font-medium tracking-heading";
const LEDE_CLASS =
  "mb-[1em] max-w-[670px] text-[clamp(17px,1.45vw,22px)] leading-[1.55] text-text-muted";
const TEXT_LINK_CLASS =
  "inline-flex min-h-touch items-center gap-[14px] border-ink border-b font-body text-[11px] font-medium tracking-[0.06em] uppercase after:text-[20px] after:font-normal after:content-['→'] after:transition-transform after:duration-200 after:ease-standard hover:after:translate-x-[5px]";
const BUTTON_CLASS =
  "inline-flex min-h-12 items-center justify-center gap-2.5 border px-[22px] py-3 font-body text-[11px] font-bold tracking-[0.09em] uppercase [transition:background_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),border-color_var(--duration-fast)_var(--ease-standard),box-shadow_120ms_var(--ease-standard),transform_120ms_var(--ease-standard)] hover:translate-[2px] active:translate-1 active:shadow-none focus-visible:outline-[3px] focus-visible:outline-offset-4 motion-reduce:hover:translate-0 motion-reduce:active:translate-0";
const SHELL_SECTION_CLASS =
  "mx-auto w-[min(100%,var(--container-page))] px-page-gutter py-[clamp(70px,9vw,140px)]";

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
      <section className="commerce-hero grid min-h-[calc(100svh_-_var(--spacing-header))] grid-cols-[minmax(390px,0.78fr)_minmax(0,1.22fr)] bg-ink text-text-inverse max-md:min-h-[calc(100svh_-_var(--spacing-header-compact))] max-md:grid-cols-[minmax(0,1fr)]">
        <div className="commerce-hero-copy flex flex-col justify-center p-[clamp(48px,6vw,100px)] max-md:px-page-gutter max-md:py-[55px]">
          <p className={`eyebrow ${EYEBROW_CLASS}`}>
            Forward / Field equipment 2026
          </p>
          <h1 className="mt-[22px]! mb-7 max-w-[760px] text-balance font-heading text-[clamp(58px,6.7vw,112px)] leading-[0.88] font-medium tracking-[-0.065em] max-md:text-[clamp(52px,16vw,78px)]">
            Equipment for weather that changes the plan.
          </h1>
          <p className={`${LEDE_CLASS} max-w-[570px] text-text-dark-subtle`}>
            Layerable apparel, precise footwear, and low-profile carry systems
            made to move together.
          </p>
          <div className="mt-[34px] flex flex-wrap items-center gap-6">
            <Link
              className={`${BUTTON_CLASS} border-signal bg-signal text-ink shadow-button hover:border-ink hover:bg-ink hover:text-signal hover:shadow-button-hover focus-visible:outline-ink`}
              href="/shop"
            >
              Shop all equipment
            </Link>
            <Link className={TEXT_LINK_CLASS} href="/field-testing">
              How we test
            </Link>
          </div>
          <dl className="mt-auto grid grid-cols-3 border-[#474b43] border-t pt-9 max-md:mt-[45px]">
            <div className="grid gap-1.5">
              <dt className="m-0 font-field-meta text-[9px] text-[#9ea298] uppercase">
                Systems
              </dt>
              <dd className="m-0 font-heading text-[27px]">
                {categories.length}
              </dd>
            </div>
            <div className="grid gap-1.5">
              <dt className="m-0 font-field-meta text-[9px] text-[#9ea298] uppercase">
                Core objects
              </dt>
              <dd className="m-0 font-heading text-[27px]">
                {products.length}
              </dd>
            </div>
            <div className="grid gap-1.5">
              <dt className="m-0 font-field-meta text-[9px] text-[#9ea298] uppercase">
                Repair
              </dt>
              <dd className="m-0 font-heading text-[27px]">For life</dd>
            </div>
          </dl>
        </div>
        <div className="commerce-hero-media relative m-5 min-h-[760px] overflow-hidden max-md:mx-2.5 max-md:mt-0 max-md:mb-2.5 max-md:min-h-[68svh]">
          <Image
            className="absolute inset-0 h-full object-cover saturate-[0.78] contrast-[1.05]"
            src={themeContent.homeHeroImage.src}
            alt={themeContent.homeHeroImage.alt}
            width={themeContent.homeHeroImage.width}
            height={themeContent.homeHeroImage.height}
            sizes="(min-width: 820px) 58vw, 100vw"
            priority
          />
          {featured[0] !== undefined ? (
            <Link
              className="absolute right-[18px] bottom-[18px] grid w-[min(330px,calc(100%_-_36px))] gap-2 bg-signal p-5 text-ink"
              href={`/products/${featured[0].handle}`}
            >
              <span className="font-field-meta text-[9px] uppercase">
                Featured system
              </span>
              <strong className="font-heading text-[25px]">
                {featured[0].title}
              </strong>
              <span className="font-field-meta text-[9px] uppercase">
                View product →
              </span>
            </Link>
          ) : null}
        </div>
      </section>

      <section className={SHELL_SECTION_CLASS}>
        <header className="mb-[45px] grid grid-cols-[minmax(0,1fr)_minmax(260px,0.42fr)_auto] items-end gap-10 max-md:grid-cols-1 max-md:gap-5">
          <div>
            <p className={EYEBROW_CLASS}>New field rotation</p>
            <h2 className={HEADING_CLASS}>Start with the core four.</h2>
          </div>
          <p className="m-0 max-w-[460px]">
            A weather layer, breathable midlayer, close-body carry, and trail
            shoe form the shortest route to a complete Forward system.
          </p>
          <Link className={TEXT_LINK_CLASS} href="/shop">
            Shop all {products.length}
          </Link>
        </header>
        <div className="home-featured-grid grid grid-cols-4 gap-[18px] max-md:grid-cols-2 max-sm:gap-2.5">
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
        <header className="mx-auto w-[min(100%,var(--container-page))] px-page-gutter pb-11">
          <p className={EYEBROW_CLASS}>Shop by system</p>
          <h2 className={HEADING_CLASS}>Built separately. Better together.</h2>
        </header>
        <div className="grid grid-cols-3 max-md:grid-cols-1">
          {categories.map((collection) => (
            <Link
              className="group relative min-h-[710px] overflow-hidden border-[#52554e] border-r text-text-inverse after:absolute after:inset-x-0 after:top-[40%] after:bottom-0 after:bg-[linear-gradient(transparent,rgba(5,8,6,0.94))] after:content-[''] max-md:min-h-[600px]"
              href={`/shop/${collection.handle}`}
              key={collection.handle}
            >
              <Image
                className="h-full object-cover saturate-[0.72] transition-transform duration-500 ease-standard group-hover:scale-[1.025]"
                src={collection.heroImage.src}
                alt={collection.heroImage.alt}
                width={collection.heroImage.width}
                height={collection.heroImage.height}
                sizes="(min-width: 820px) 34vw, 100vw"
              />
              <div className="absolute right-0 bottom-0 left-0 z-[1] p-[34px]">
                <span className={EYEBROW_CLASS}>{collection.fieldCode}</span>
                <h3 className="mt-2! mb-4 font-heading text-[clamp(42px,4vw,68px)] leading-[0.95]">
                  {collection.title}
                </h3>
                <p className="mb-[1em] max-w-[420px] text-text-dark-subtle">
                  {collection.description}
                </p>
                <span className="mt-6 block font-body text-[11px] uppercase">
                  Shop system →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {spotlight !== undefined && spotlightImage !== undefined ? (
        <section
          className={`${SHELL_SECTION_CLASS} grid grid-cols-[minmax(0,1.25fr)_minmax(380px,0.75fr)] gap-0 max-md:grid-cols-[minmax(0,1fr)] min-[821px]:[--home-viewport-pad:clamp(48px,5vw,96px)] min-[821px]:[--home-viewport-media:calc(100svh_-_2_*_var(--home-viewport-pad))] min-[821px]:py-[var(--home-viewport-pad)] [@media(min-width:821px)_and_(max-height:600px)]:[--home-viewport-pad:clamp(8px,2svh,16px)]`}
        >
          <div>
            <Image
              className="min-h-0 aspect-4/5 object-cover min-[821px]:h-[var(--home-viewport-media)] min-[821px]:aspect-auto"
              src={spotlightImage.src}
              alt={spotlightImage.alt}
              width={spotlightImage.width}
              height={spotlightImage.height}
              sizes="(min-width: 820px) 60vw, 100vw"
            />
          </div>
          <div className="flex flex-col justify-center bg-surface-subtle p-[clamp(42px,6vw,92px)] min-[821px]:px-[clamp(28px,4vw,60px)] min-[821px]:py-[clamp(24px,4svh,48px)] [@media(min-width:821px)_and_(max-height:600px)]:px-[clamp(20px,3vw,36px)] [@media(min-width:821px)_and_(max-height:600px)]:py-2">
            <p
              className={`${EYEBROW_CLASS} [@media(min-width:821px)_and_(max-height:600px)]:mb-1`}
            >
              Layer focus / {spotlight.category}
            </p>
            <h2
              className={`${HEADING_CLASS} min-[821px]:text-[clamp(40px,min(5.6vw,8svh),72px)] [@media(min-width:821px)_and_(max-height:600px)]:mb-1 [@media(min-width:821px)_and_(max-height:600px)]:text-[clamp(26px,7svh,40px)] [@media(min-width:821px)_and_(max-height:600px)]:leading-[0.95]`}
            >
              {spotlight.title}
            </h2>
            <p
              className={`${LEDE_CLASS} min-[821px]:mb-[clamp(10px,2svh,18px)] min-[821px]:text-[clamp(16px,2.5svh,19px)] min-[821px]:leading-[1.45] [@media(min-width:821px)_and_(max-height:600px)]:mb-1 [@media(min-width:821px)_and_(max-height:600px)]:text-[clamp(12px,3.2svh,15px)] [@media(min-width:821px)_and_(max-height:600px)]:leading-[1.25]`}
            >
              {spotlight.subtitle}
            </p>
            <ul className="my-[30px] list-none border-border-subtle border-t p-0 min-[821px]:my-[clamp(14px,2.5svh,24px)] [@media(min-width:821px)_and_(max-height:600px)]:my-1">
              {spotlight.specs.slice(0, 3).map((spec) => (
                <li
                  key={spec.label}
                  className="flex justify-between gap-5 border-border-subtle border-b py-3.5 text-[12px] min-[821px]:py-[clamp(8px,1.7svh,14px)] [@media(min-width:821px)_and_(max-height:600px)]:py-[clamp(3px,1svh,6px)] [@media(min-width:821px)_and_(max-height:600px)]:text-[11px]"
                >
                  <span>{spec.label}</span>
                  <strong>{spec.value}</strong>
                </li>
              ))}
            </ul>
            <Link
              className={`${BUTTON_CLASS} self-start border-ink bg-ink text-text-inverse shadow-[4px_4px_0_var(--color-signal)] hover:bg-ink hover:shadow-[2px_2px_0_var(--color-signal)] focus-visible:outline-signal [@media(min-width:821px)_and_(max-height:600px)]:min-h-10 [@media(min-width:821px)_and_(max-height:600px)]:py-2`}
              href={`/products/${spotlight.handle}`}
            >
              Explore the layer
            </Link>
          </div>
        </section>
      ) : null}

      <section className="grid grid-cols-[0.85fr_1.15fr] bg-ink text-text-inverse max-md:grid-cols-[minmax(0,1fr)]">
        <div className="flex flex-col justify-center p-[clamp(48px,7vw,110px)]">
          <p className={EYEBROW_CLASS}>Material standard</p>
          <h2 className={HEADING_CLASS}>Fewer materials. Better understood.</h2>
          <p className="mb-[1em] max-w-[560px] text-[18px] text-text-dark-subtle">
            Every fabric, foam, buckle, and compound is selected around useful
            life, field repair, and performance you can actually feel.
          </p>
          <div className="mt-[34px] flex flex-wrap items-center gap-6">
            <Link
              className={`${BUTTON_CLASS} border-text-inverse bg-transparent text-text-inverse shadow-[4px_4px_0_var(--color-text-inverse)] hover:bg-text-inverse hover:text-ink hover:shadow-[2px_2px_0_var(--color-text-inverse)] focus-visible:outline-text-inverse`}
              href="/materials"
            >
              Explore materials
            </Link>
            <Link className={TEXT_LINK_CLASS} href="/about">
              About Forward
            </Link>
          </div>
        </div>
        <Image
          className="h-[700px] object-cover saturate-[0.7] max-md:h-[58svh]"
          src={themeContent.standardBandImage.src}
          alt={themeContent.standardBandImage.alt}
          width={themeContent.standardBandImage.width}
          height={themeContent.standardBandImage.height}
          sizes="(min-width: 820px) 55vw, 100vw"
        />
      </section>

      {pack !== undefined ? (
        <section
          className={`${SHELL_SECTION_CLASS} grid grid-cols-[0.55fr_1.45fr] items-end gap-[60px] max-md:grid-cols-[minmax(0,1fr)] min-[821px]:[--home-viewport-pad:clamp(48px,5vw,96px)] min-[821px]:[--home-viewport-media:calc(100svh_-_2_*_var(--home-viewport-pad))] min-[821px]:py-[var(--home-viewport-pad)] [@media(min-width:821px)_and_(max-height:600px)]:[--home-viewport-pad:clamp(8px,2svh,16px)]`}
        >
          <div className="pb-[30px]">
            <p className={EYEBROW_CLASS}>One-day kit</p>
            <h2 className={HEADING_CLASS}>Carry the day, not the doubt.</h2>
            <p className="mb-[1em]">{pack.subtitle}</p>
            <Link className={TEXT_LINK_CLASS} href={`/products/${pack.handle}`}>
              View {pack.title}
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 max-md:gap-[7px]">
            {kitProducts.map(({ product, image }) => (
              <Link href={`/products/${product.handle}`} key={product.handle}>
                <Image
                  className="aspect-4/5 object-cover min-[821px]:max-h-[calc(var(--home-viewport-media)_-_44px)] [@media(min-width:821px)_and_(max-height:600px)]:max-h-[calc(var(--home-viewport-media)_-_32px)]"
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  sizes="(min-width: 820px) 20vw, 45vw"
                />
                <span className="mt-2.5 block text-[12px] font-bold [@media(min-width:821px)_and_(max-height:600px)]:mt-1 [@media(min-width:821px)_and_(max-height:600px)]:text-[11px]">
                  {product.title}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section
        className={`${SHELL_SECTION_CLASS} grid grid-cols-[0.7fr_1.3fr] gap-3 max-md:grid-cols-[minmax(0,1fr)]`}
      >
        <article className="min-h-[560px] bg-signal p-[clamp(35px,5vw,70px)] max-md:min-h-0">
          <p className={EYEBROW_CLASS}>Repair, not replace</p>
          <h2 className="mb-[0.83em] text-balance font-heading text-[clamp(44px,5vw,78px)] leading-[0.95]">
            Keep equipment in motion.
          </h2>
          <p className="mb-[1em]">
            Product defects are repaired free. Wear, accidents, and hard-earned
            damage are assessed honestly before work begins.
          </p>
          <Link className={TEXT_LINK_CLASS} href="/pages/field-repair">
            Visit the repair desk
          </Link>
        </article>
        {dispatch !== undefined ? (
          <article className="grid min-h-[560px] grid-cols-[0.9fr_1.1fr] bg-surface-subtle p-0 max-md:min-h-0 max-md:grid-cols-[minmax(0,1fr)]">
            <Image
              className="h-full object-cover max-md:max-h-[55svh]"
              src={dispatch.heroImage.src}
              alt={dispatch.heroImage.alt}
              width={dispatch.heroImage.width}
              height={dispatch.heroImage.height}
              sizes="(min-width: 820px) 45vw, 100vw"
            />
            <div className="self-center p-[45px]">
              <p className={EYEBROW_CLASS}>Latest field note</p>
              <h2 className="mb-[0.83em] text-balance font-heading text-[clamp(44px,5vw,78px)] leading-[0.95]">
                {dispatch.title}
              </h2>
              <p className="mb-[1em]">{dispatch.excerpt}</p>
              <Link
                className={TEXT_LINK_CLASS}
                href={`/journal/${dispatch.handle}`}
              >
                Read the dispatch
              </Link>
            </div>
          </article>
        ) : null}
      </section>
    </div>
  );
}
