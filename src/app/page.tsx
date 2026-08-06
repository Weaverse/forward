import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/cn";
import { storefront } from "@/lib/storefront/data-source";
import type {
  Collection,
  JournalArticle,
  Product,
  StorefrontImage,
} from "@/lib/storefront/types";

export const metadata: Metadata = {
  title: "Forward — Gear for the way out",
  description:
    "A short catalog of outdoor gear built for weather: shell, pack, and trail shoe. Built slowly, repaired indefinitely.",
};

/** Hero dossier: asymmetric grid, stepped oversized headline, telemetry rail. */
function HeroDossier({
  heroImage,
  metrics,
}: {
  heroImage: StorefrontImage;
  metrics: ReadonlyArray<{ value: string; label: string }>;
}) {
  return (
    <section aria-label="Introduction" className="border-b border-carbon">
      <div className="mx-auto grid max-w-7xl lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="flex flex-col justify-between gap-10 px-5 py-12 sm:px-8 lg:py-16">
          <div>
            <p className="field-label text-slate">
              Forward / High country system · Est. 2026
            </p>
            <h1 className="display-huge mt-6 text-carbon">
              <span className="block">Gear for moving</span>
              <span className="block pl-[0.08em] sm:pl-[1.5em]">
                through weather,
              </span>
              <span className="block italic text-pine">not around it.</span>
            </h1>
            <p className="mt-8 max-w-sm text-base leading-relaxed text-slate">
              Three products. A shell, a pack, and a trail shoe — built slowly,
              specified honestly, and repaired for as long as you keep going
              out.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="field-label inline-flex min-h-11 items-center bg-acid px-6 text-carbon transition-colors hover:bg-carbon hover:text-acid"
              >
                Enter the equipment index
              </Link>
              <Link
                href="/pages/about-forward"
                className="field-label inline-flex min-h-11 items-center border border-carbon px-6 text-carbon transition-colors hover:bg-carbon hover:text-cream"
              >
                The field standard
              </Link>
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-6 border-t border-carbon/20 pt-6">
            {metrics.map((metric) => (
              <div key={metric.label}>
                <dd className="font-display text-4xl leading-none text-carbon">
                  {metric.value}
                </dd>
                <dt className="field-label mt-2 text-slate">{metric.label}</dt>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative border-t border-carbon lg:border-l lg:border-t-0">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            width={heroImage.width}
            height={heroImage.height}
            priority
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="h-full max-h-[34rem] w-full object-cover lg:max-h-none"
          />
          <div className="field-label absolute bottom-0 left-0 right-0 flex flex-wrap justify-between gap-x-6 gap-y-1 bg-carbon/85 px-4 py-3 text-cream/80">
            <span>Conditions — variable, wind over the col</span>
            <span>54.4609° N / 3.0886° W</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Operating premise: ghost plate number, two-tone headline, field-standard link. */
function OperatingPremise() {
  return (
    <section
      aria-labelledby="premise-heading"
      className="relative overflow-hidden border-b border-carbon/20"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 right-2 font-display text-[10rem] leading-none text-carbon/10 sm:text-[16rem]"
      >
        01
      </span>
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <p className="field-label text-clay">Operating premise</p>
        <h2 id="premise-heading" className="display-large mt-4 max-w-3xl">
          <span className="text-carbon">Built to be worn out. </span>
          <span className="italic text-pine">Made to be repaired.</span>
        </h2>
        <p className="mt-6 max-w-md text-base leading-relaxed text-slate">
          Every product answers three questions before it ships: does it work
          when the weather turns, does it carry its weight, and can we fix it
          when you finally wear it out.
        </p>
        <Link
          href="/pages/about-forward"
          className="field-label mt-8 inline-flex min-h-11 items-center gap-2 border-b border-carbon text-carbon hover:text-clay"
        >
          Read the field standard →
        </Link>
      </div>
    </section>
  );
}

/** Overlapping editorial dossier: stacked flow on mobile, offset planes on lg. */
function FieldDossier({
  primary,
  overlay,
  detail,
}: {
  primary: StorefrontImage;
  overlay: StorefrontImage;
  detail: StorefrontImage;
}) {
  return (
    <section
      aria-label="Field imagery"
      className="border-b border-carbon/20 bg-parchment"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:gap-0">
        <div className="relative lg:col-span-8">
          <Image
            src={primary.src}
            alt={primary.alt}
            width={primary.width}
            height={primary.height}
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="aspect-4/3 w-full object-cover"
          />
          <p className="field-label mt-2 text-slate">
            Traverse study / 02 · high route, late season
          </p>
          <div className="mt-6 lg:absolute lg:-right-24 lg:bottom-16 lg:mt-0 lg:w-72">
            <div className="lg:bg-acid lg:p-2">
              <Image
                src={overlay.src}
                alt={overlay.alt}
                width={overlay.width}
                height={overlay.height}
                sizes="(min-width: 1024px) 18rem, 100vw"
                className="aspect-4/3 w-full object-cover"
              />
            </div>
          </div>
          <span
            aria-hidden="true"
            className="field-label absolute left-4 top-4 hidden size-24 items-center justify-center rounded-full border border-cream/80 text-center text-cream lg:flex"
          >
            Field
            <br />
            tested
          </span>
        </div>
        <div className="flex flex-col justify-end gap-8 lg:col-span-4 lg:pl-16">
          <Image
            src={detail.src}
            alt={detail.alt}
            width={detail.width}
            height={detail.height}
            sizes="(min-width: 1024px) 24vw, 100vw"
            className="hidden aspect-3/4 w-2/3 object-cover lg:block"
          />
          <p className="max-w-xs font-display text-2xl leading-snug text-carbon">
            A kit should disappear while moving and become exactly enough when
            the weather turns.
          </p>
        </div>
      </div>
    </section>
  );
}

/** Equipment index: staggered numbered product cards. */
function EquipmentIndex({ products }: { products: readonly Product[] }) {
  return (
    <section
      aria-labelledby="catalog-heading"
      className="border-b border-carbon/20"
    >
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <p className="field-label text-slate">
          Equipment index / 01–{String(products.length).padStart(2, "0")}
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
          <h2 id="catalog-heading" className="display-large max-w-2xl">
            <span className="block text-carbon">The catalog,</span>
            <span className="block italic text-pine">complete.</span>
          </h2>
          <Link
            href="/shop"
            className="field-label inline-flex min-h-11 items-center gap-2 border border-carbon px-5 text-carbon transition-colors hover:bg-carbon hover:text-cream"
          >
            Complete index →
          </Link>
        </div>
        <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <ProductCard
              key={product.handle}
              product={product}
              plate={product.plate}
              stagger={index % 3 === 1}
              priority={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Dark dispatch split from the lead journal article. */
function DispatchSplit({ article }: { article: JournalArticle }) {
  return (
    <section
      aria-labelledby="dispatch-heading"
      data-surface="dark"
      className="relative overflow-hidden bg-carbon text-cream"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 right-0 font-display text-[12rem] leading-none text-cream/5 sm:text-[18rem]"
      >
        {article.plate.replace(/\D/g, "")}
      </span>
      <div className="mx-auto grid max-w-7xl lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <Image
          src={article.heroImage.src}
          alt={article.heroImage.alt}
          width={article.heroImage.width}
          height={article.heroImage.height}
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="h-full max-h-[30rem] w-full object-cover lg:max-h-none"
        />
        <div className="relative flex flex-col justify-center gap-6 px-5 py-14 sm:px-8 lg:py-20">
          <p className="field-label text-clay-light">
            Dispatch {article.plate} / {article.location}
          </p>
          <h2 id="dispatch-heading" className="display-large">
            <span className="text-cream">{article.title.split(" ")[0]} </span>
            <span className="italic text-acid">
              {article.title.split(" ").slice(1).join(" ")}
            </span>
          </h2>
          <p className="max-w-sm font-display text-lg italic leading-relaxed text-cream/80">
            “{article.excerpt}”
          </p>
          <p className="field-label text-cream/60">
            Filed from {article.coordinates} · {article.readingMinutes} min read
          </p>
          <Link
            href={`/journal/${article.handle}`}
            className="field-label inline-flex min-h-11 w-fit items-center border border-cream/60 px-6 text-cream transition-colors hover:bg-acid hover:border-acid hover:text-carbon"
          >
            Open dispatch {article.plate} →
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Movement systems: three staggered dark collection cards. */
function MovementSystems({
  collections,
}: {
  collections: readonly Collection[];
}) {
  return (
    <section aria-labelledby="movement-heading">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <p className="field-label text-slate">
          Movement systems / 01–{String(collections.length).padStart(2, "0")}
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
          <h2 id="movement-heading" className="display-large text-carbon">
            Ways into the kit.
          </h2>
          <Link
            href="/shop"
            className="field-label text-carbon hover:text-clay"
          >
            All products →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {collections.map((collection, index) => (
            <Link
              key={collection.handle}
              href={`/shop/${collection.handle}`}
              data-surface="dark"
              className={cn(
                "group relative block overflow-hidden bg-carbon text-cream",
                index % 2 === 1 && "sm:mt-16",
              )}
            >
              <Image
                src={collection.heroImage.src}
                alt={collection.heroImage.alt}
                width={collection.heroImage.width}
                height={collection.heroImage.height}
                sizes="(min-width: 640px) 30vw, 100vw"
                className="aspect-3/4 w-full object-cover opacity-75 transition-opacity group-hover:opacity-90"
              />
              <span
                aria-hidden="true"
                className="plate-number absolute left-4 top-4 text-cream"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-carbon/90 to-transparent px-4 pb-4 pt-12">
                <span className="block font-display text-2xl">
                  {collection.title}
                </span>
                <span className="field-label mt-1 block text-cream/70">
                  {collection.fieldCode} · {collection.productHandles.length}{" "}
                  products
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [products, collections, articles, themeContent] = await Promise.all([
    storefront.listProducts(),
    storefront.listCollections(),
    storefront.listArticles(),
    storefront.getThemeContent(),
  ]);
  const leadArticle = articles[0];
  const colorwayCount = products.reduce(
    (total, product) => total + product.colorways.length,
    0,
  );
  const metrics = [
    {
      value: String(products.length).padStart(2, "0"),
      label: "Catalog plates",
    },
    {
      value: String(colorwayCount).padStart(2, "0"),
      label: "Colorways",
    },
    {
      value: String(collections.length).padStart(2, "0"),
      label: "Movement systems",
    },
  ];
  const overlayImage = collections[2]?.heroImage ?? themeContent.homeHeroImage;
  const detailImage = collections[1]?.heroImage ?? themeContent.homeHeroImage;

  return (
    <div>
      <HeroDossier heroImage={themeContent.homeHeroImage} metrics={metrics} />
      <OperatingPremise />
      <FieldDossier
        primary={themeContent.standardBandImage}
        overlay={overlayImage}
        detail={detailImage}
      />
      <EquipmentIndex products={products} />
      {leadArticle !== undefined ? (
        <DispatchSplit article={leadArticle} />
      ) : null}
      <MovementSystems collections={collections} />
    </div>
  );
}
