import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { HomeEquipmentPlate } from "@/components/home-equipment-plate";
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

interface HomeMetric {
  value: string;
  label: string;
}

/** First sentence of a normalized description, used for card captions. */
function firstSentence(text: string): string {
  const end = text.indexOf(". ");
  return end === -1 ? text : text.slice(0, end + 1);
}

/**
 * Hero canvas: near-viewport editorial plate. The image dominates the right
 * two thirds while the headline crosses it on a cream strip; the left rail
 * carries the field-report marks.
 */
function HeroDossier({ heroImage }: { heroImage: StorefrontImage }) {
  return (
    <section
      aria-label="Introduction"
      className="relative overflow-hidden border-b border-carbon/15 bg-parchment"
    >
      <span
        aria-hidden="true"
        className="absolute left-7 top-28 hidden h-[28rem] w-px bg-carbon/25 lg:block"
      />
      <span
        aria-hidden="true"
        className="field-label absolute left-9 top-32 hidden origin-top-left rotate-90 text-slate/70 lg:block"
      >
        Forward — advanced field system
      </span>
      <div className="mx-auto max-w-[150rem] px-5 pb-16 pt-10 sm:px-8 lg:px-16 lg:pb-28 lg:pt-14">
        <div className="lg:grid lg:grid-cols-12 lg:items-start">
          <div className="relative z-10 lg:col-span-7 lg:col-start-1 lg:row-start-1 lg:min-w-0 lg:pt-20">
            <p className="field-label text-slate">
              Forward / High country system
            </p>
            <h1 className="display-mega mt-8 text-carbon lg:mt-10">
              <span className="block">Move until</span>
              {/*
               * Desktop keeps the second line unbroken so it crosses the image
               * as one cream strip; `min-w-0` on the column stops the nowrap
               * line from widening the grid track. Mobile still wraps.
               */}
              <span className="mt-2 block lg:whitespace-nowrap lg:pl-[2.2em]">
                <span className="box-decoration-clone bg-cream px-3 py-1">
                  the map runs out.
                </span>
              </span>
            </h1>
            <p className="mt-12 max-w-xs border-l border-carbon/30 pl-5 text-sm leading-relaxed text-slate lg:mt-20">
              Purposeful layers and field equipment for uncertain weather,
              useful distance, and the quiet beyond the marked route.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Link
                href="/shop"
                className="field-label inline-flex min-h-11 items-center bg-acid px-6 text-carbon transition-colors hover:bg-carbon hover:text-acid"
              >
                Enter the equipment index
              </Link>
              <Link
                href="/pages/about-forward"
                className="field-label inline-flex min-h-11 items-center gap-2 text-carbon hover:text-clay"
              >
                The field standard →
              </Link>
            </div>
          </div>
          <div className="relative mt-10 lg:col-span-8 lg:col-start-5 lg:row-start-1 lg:mt-0">
            <Image
              src={heroImage.src}
              alt={heroImage.alt}
              width={heroImage.width}
              height={heroImage.height}
              priority
              sizes="(min-width: 1024px) 66vw, 100vw"
              className="aspect-4/3 w-full object-cover lg:aspect-7/5"
            />
            <dl className="field-label absolute bottom-0 right-0 hidden w-72 bg-carbon/90 px-4 py-3 text-cream/70 lg:block">
              <dt className="sr-only">Current field conditions</dt>
              <dd className="text-cream/90">Current field conditions</dd>
              <dt className="sr-only">Wind</dt>
              <dd className="mt-2 border-t border-cream/15 pt-2">
                Wind — variable, over the col
              </dd>
              <dt className="sr-only">Position</dt>
              <dd className="mt-2 border-t border-cream/15 pt-2">
                54.4609° N / 3.0886° W
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Operating premise: ghost plate number, three-column premise grid, metrics. */
function OperatingPremise({ metrics }: { metrics: ReadonlyArray<HomeMetric> }) {
  return (
    <section
      aria-labelledby="premise-heading"
      className="border-b border-carbon/15"
    >
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-36">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
          <span
            aria-hidden="true"
            className="plate-ghost block text-carbon/15 lg:col-span-2"
          >
            01
          </span>
          <div className="lg:col-span-5">
            <p className="field-label text-slate">Operating premise</p>
            <h2 id="premise-heading" className="display-section mt-5">
              <span className="block text-carbon">Carry less.</span>
              <span className="block text-moss">Notice more.</span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="max-w-md text-base leading-relaxed text-slate">
              We build adaptable outdoor goods around a strict premise: every
              piece must earn its weight, survive a change of plan, and become
              quieter with use.
            </p>
            <dl className="mt-12 grid grid-cols-3 gap-6 border-y border-carbon/20 py-7">
              {metrics.map((metric) => (
                <div key={metric.label}>
                  <dd className="font-display text-4xl leading-none text-carbon lg:text-5xl">
                    {metric.value}
                  </dd>
                  <dt className="field-label mt-3 text-slate">
                    {metric.label}
                  </dt>
                </div>
              ))}
            </dl>
            <Link
              href="/pages/about-forward"
              className="field-label mt-10 inline-flex min-h-11 items-center gap-2 border-b border-carbon text-carbon hover:text-clay"
            >
              Read the field standard →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Field dossier: a large landscape plate with a circular altitude mark, an
 * acid-edged detail plate overlapping it, and the pull quote below the overlap.
 */
function FieldDossier({
  primary,
  overlay,
}: {
  primary: StorefrontImage;
  overlay: StorefrontImage;
}) {
  return (
    <section
      aria-label="Field imagery"
      className="border-b border-carbon/15 bg-parchment"
    >
      <div className="mx-auto max-w-[90rem] px-5 py-24 sm:px-8 lg:py-36">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-0">
          <div className="relative lg:col-span-7">
            <Image
              src={primary.src}
              alt={primary.alt}
              width={primary.width}
              height={primary.height}
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="aspect-4/3 w-full object-cover lg:aspect-9/8"
            />
            <span
              aria-hidden="true"
              className="absolute -right-14 top-12 hidden size-36 flex-col items-center justify-center rounded-full border border-carbon/40 bg-cream/85 text-center text-carbon lg:flex"
            >
              <span className="field-label text-slate">Field tested</span>
              <span className="mt-1 font-display text-2xl leading-none">
                4,000 ft
              </span>
            </span>
            <p className="field-label mt-3 text-slate">
              Traverse study / 03 · high route, late season
            </p>
          </div>
          <div className="lg:col-span-5 lg:pt-44">
            <div className="lg:-ml-32 lg:w-[27rem] lg:bg-acid lg:pb-3 lg:pl-3">
              <Image
                src={overlay.src}
                alt={overlay.alt}
                width={overlay.width}
                height={overlay.height}
                sizes="(min-width: 1024px) 27rem, 100vw"
                className="aspect-4/3 w-full object-cover"
              />
            </div>
            <p className="mt-8 max-w-sm font-display text-2xl leading-snug text-carbon lg:mt-12 lg:pl-6 lg:text-4xl">
              A clothing system should disappear while moving and become exactly
              enough when the weather turns.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Equipment index: three real products staged as differently scaled plates. */
function EquipmentIndex({ products }: { products: readonly Product[] }) {
  const [lead, middle, trailing] = products;

  return (
    <section
      aria-labelledby="catalog-heading"
      className="border-b border-carbon/15"
    >
      <div className="mx-auto max-w-[90rem] px-5 py-24 sm:px-8 lg:py-36">
        <p className="field-label text-slate">
          Equipment index / 01–{String(products.length).padStart(2, "0")}
        </p>
        <div className="mt-5 grid gap-8 lg:grid-cols-12 lg:items-end">
          <h2 id="catalog-heading" className="display-section lg:col-span-6">
            <span className="block text-carbon">Objects for</span>
            <span className="block text-moss">going farther.</span>
          </h2>
          <p className="field-label text-slate lg:col-span-3">
            Three pieces, one system. Built to layer, carry, and repair.
          </p>
          <div className="lg:col-span-3 lg:text-right">
            <Link
              href="/shop"
              className="field-label inline-flex min-h-11 items-center gap-2 border border-carbon px-5 text-carbon transition-colors hover:bg-carbon hover:text-cream"
            >
              Complete index →
            </Link>
          </div>
        </div>
        <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:mt-24 lg:grid-cols-12 lg:items-start">
          {lead !== undefined ? (
            <HomeEquipmentPlate
              product={lead}
              tag={lead.activities[0] ?? "Field tested"}
              aspect="aspect-3/4"
              priority
              className="lg:col-span-5"
            />
          ) : null}
          {middle !== undefined ? (
            <HomeEquipmentPlate
              product={middle}
              tag={middle.activities[0] ?? "Field tested"}
              aspect="aspect-4/5"
              withContext
              className="lg:col-span-3 lg:mt-28"
            />
          ) : null}
          {trailing !== undefined ? (
            <HomeEquipmentPlate
              product={trailing}
              tag={trailing.activities[0] ?? "Field tested"}
              aspect="aspect-4/5"
              className="lg:col-span-4 lg:mt-10"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}

/**
 * Dark dispatch: near-viewport split of a dominant image and an editorial
 * panel. The dominant frame is the wide mountain panorama band rather than the
 * article's own trail frame, which the field dossier carries instead.
 */
function DispatchSplit({
  article,
  image,
}: {
  article: JournalArticle;
  image: StorefrontImage;
}) {
  const [firstWord, ...restWords] = article.title.split(" ");
  const note = article.body.find((block) => block.type === "paragraph");

  return (
    <section
      aria-labelledby="dispatch-heading"
      data-surface="dark"
      className="relative overflow-hidden bg-carbon text-cream"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 right-4 font-display text-[14rem] leading-none text-cream/5 sm:text-[22rem]"
      >
        {article.plate.replace(/\D/g, "")}
      </span>
      <div className="grid lg:min-h-[85vh] lg:grid-cols-[minmax(0,62fr)_minmax(0,38fr)]">
        <div className="relative aspect-4/3 lg:aspect-auto">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 62vw, 100vw"
            className="object-cover"
          />
          <p className="field-label absolute bottom-0 left-0 bg-acid px-3 py-2 text-carbon">
            {article.location} · {article.readingMinutes} min read
          </p>
        </div>
        <div className="relative flex flex-col justify-center gap-7 px-5 py-16 sm:px-8 lg:py-24 lg:pl-16 lg:pr-14">
          <p className="field-label text-clay-light">
            Dispatch {article.plate} / {article.location}
          </p>
          <h2 id="dispatch-heading" className="display-section">
            <span className="block text-cream">{firstWord}</span>
            <span className="block text-acid">{restWords.join(" ")}</span>
          </h2>
          <p className="max-w-md font-display text-xl italic leading-relaxed text-cream/90 lg:text-2xl">
            “{article.excerpt}”
          </p>
          {note !== undefined ? (
            <p className="max-w-md text-sm leading-relaxed text-cream/60">
              {note.text}
            </p>
          ) : null}
          <Link
            href={`/journal/${article.handle}`}
            className="field-label mt-2 inline-flex min-h-12 items-center justify-center border border-cream/50 px-6 text-cream transition-colors hover:border-acid hover:bg-acid hover:text-carbon"
          >
            Open dispatch {article.plate} →
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Movement systems: staggered collection plates over dark caption blocks. */
function MovementSystems({
  collections,
}: {
  collections: readonly Collection[];
}) {
  const layouts = [
    { span: "lg:col-span-3 lg:mt-16", aspect: "aspect-3/4" },
    { span: "lg:col-span-5", aspect: "aspect-4/5" },
    { span: "lg:col-span-4 lg:mt-28", aspect: "aspect-square" },
  ];

  return (
    <section aria-labelledby="movement-heading">
      <div className="mx-auto max-w-[90rem] px-5 py-24 sm:px-8 lg:py-36">
        <p className="field-label text-slate">
          Movement systems / 01–{String(collections.length).padStart(2, "0")}
        </p>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
          <h2 id="movement-heading" className="display-section text-carbon">
            Choose your ground.
          </h2>
          <Link
            href="/shop"
            className="field-label text-carbon hover:text-clay"
          >
            All products →
          </Link>
        </div>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:mt-24 lg:grid-cols-12 lg:items-start">
          {collections.map((collection, index) => {
            const layout = layouts[index % layouts.length];
            return (
              <Link
                key={collection.handle}
                href={`/shop/${collection.handle}`}
                data-surface="dark"
                className={cn("group block", layout?.span)}
              >
                <div className="relative">
                  <Image
                    src={collection.heroImage.src}
                    alt={collection.heroImage.alt}
                    width={collection.heroImage.width}
                    height={collection.heroImage.height}
                    sizes="(min-width: 1024px) 34vw, (min-width: 640px) 45vw, 90vw"
                    className={cn(
                      "w-full object-cover transition-opacity group-hover:opacity-90",
                      layout?.aspect,
                    )}
                  />
                  <span
                    aria-hidden="true"
                    className="plate-mark absolute left-4 top-2 text-cream/90 [text-shadow:0_1px_12px_rgb(0_0_0/0.35)]"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="bg-carbon px-5 pb-7 pt-5 text-cream">
                  <span className="field-label block text-acid">
                    {collection.fieldCode} · {collection.productHandles.length}{" "}
                    products
                  </span>
                  <span className="mt-3 block font-display text-3xl leading-none lg:text-4xl">
                    {collection.title}
                  </span>
                  <span className="mt-3 block text-sm leading-relaxed text-cream/65">
                    {firstSentence(collection.description)}
                  </span>
                </div>
              </Link>
            );
          })}
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
  const metrics: readonly HomeMetric[] = [
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
  const dossierImage =
    collections[1]?.heroImage ?? themeContent.standardBandImage;

  return (
    <div>
      <HeroDossier heroImage={themeContent.homeHeroImage} />
      <OperatingPremise metrics={metrics} />
      <FieldDossier primary={dossierImage} overlay={overlayImage} />
      <EquipmentIndex products={products} />
      {leadArticle !== undefined ? (
        <DispatchSplit
          article={leadArticle}
          image={themeContent.standardBandImage}
        />
      ) : null}
      <MovementSystems collections={collections} />
    </div>
  );
}
