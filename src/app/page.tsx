import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";
import { storefront } from "@/lib/storefront/data-source";
import { formatDate, formatMoney } from "@/lib/storefront/format";

export const metadata: Metadata = {
  title: "Forward — Gear for the way out",
  description:
    "A short catalog of outdoor gear built for weather: shell, pack, and trail shoe. Built slowly, repaired indefinitely.",
};

export default async function HomePage() {
  const [products, collections, articles, themeContent] = await Promise.all([
    storefront.listProducts(),
    storefront.listCollections(),
    storefront.listArticles(),
    storefront.getThemeContent(),
  ]);
  const leadArticle = articles[0];
  const heroImage = themeContent.homeHeroImage;
  const ridgesImage = themeContent.standardBandImage;

  return (
    <div>
      <h1 className="sr-only">Forward — gear for the way out</h1>

      {/* Hero: copy on a solid panel beside the image, never over it. */}
      <section
        aria-label="Introduction"
        className="border-b border-mist bg-parchment"
      >
        <div className="mx-auto grid max-w-7xl lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="flex flex-col justify-center gap-6 px-5 py-14 sm:px-8 lg:py-20">
            <p className="field-label text-clay">
              Expedition outfitters · Est. 2026
            </p>
            <p className="max-w-md font-display text-4xl leading-[1.08] text-pine sm:text-5xl lg:text-6xl">
              Gear for moving through weather, not around it.
            </p>
            <p className="max-w-sm text-base leading-relaxed text-slate">
              Three products. A shell, a pack, and a trail shoe — built slowly,
              specified honestly, and repaired for as long as you keep going
              out.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/shop"
                className="field-label inline-flex min-h-11 items-center bg-pine px-6 text-bone transition-colors hover:bg-pine-deep"
              >
                Shop the catalog
              </Link>
              <Link
                href="/pages/about-forward"
                className="field-label inline-flex min-h-11 items-center border border-pine px-6 text-pine transition-colors hover:bg-pine hover:text-bone"
              >
                The field standard
              </Link>
            </div>
          </div>
          <div className="relative border-t border-mist lg:border-l lg:border-t-0">
            <Image
              src={heroImage.src}
              alt={heroImage.alt}
              width={heroImage.width}
              height={heroImage.height}
              priority
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="h-full max-h-[34rem] w-full object-cover lg:max-h-none"
            />
          </div>
        </div>
      </section>

      {/* Field-report strip */}
      <p className="field-label mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-1 px-5 py-4 text-slate sm:px-8">
        <span>Field report — 2026 season</span>
        <span
          aria-hidden="true"
          className="hidden h-px flex-1 bg-mist sm:block"
        />
        <span>3 products · 6 colorways · repairs for life</span>
      </p>

      {/* Catalog plates: asymmetric alternating rows, one per product. */}
      <section
        aria-labelledby="catalog-heading"
        className="border-t border-mist"
      >
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <h2
            id="catalog-heading"
            className="font-display text-3xl text-pine sm:text-4xl"
          >
            The catalog, complete
          </h2>
          <div className="mt-10 space-y-14">
            {products.map((product, index) => {
              const colorway = product.colorways[0];
              if (colorway === undefined) {
                return null;
              }
              const reversed = index % 2 === 1;
              return (
                <article
                  key={product.handle}
                  className="grid items-end gap-6 lg:grid-cols-12"
                >
                  <Link
                    href={`/products/${product.handle}`}
                    className={cn(
                      "block lg:col-span-7",
                      reversed && "lg:order-last lg:col-start-6",
                    )}
                  >
                    <Image
                      src={colorway.images.context.src}
                      alt={colorway.images.context.alt}
                      width={colorway.images.context.width}
                      height={colorway.images.context.height}
                      sizes="(min-width: 1024px) 55vw, 100vw"
                      className="aspect-4/3 w-full border border-mist object-cover"
                    />
                  </Link>
                  <div
                    className={cn(
                      "flex flex-col gap-3 border-t-2 border-pine pt-4 lg:col-span-5",
                      reversed && "lg:col-start-1 lg:row-start-1",
                    )}
                  >
                    <p className="field-label text-clay">
                      Plate {product.plate} · {product.category}
                    </p>
                    <h3 className="font-display text-2xl text-pine sm:text-3xl">
                      <Link
                        href={`/products/${product.handle}`}
                        className="hover:text-clay"
                      >
                        {product.title}
                      </Link>
                    </h3>
                    <p className="max-w-sm text-sm leading-relaxed text-slate">
                      {product.subtitle}
                    </p>
                    <p className="field-label text-ink">
                      {formatMoney(product.price)} ·{" "}
                      {product.colorways.map((c) => c.name).join(" / ")}
                    </p>
                    <Link
                      href={`/products/${product.handle}`}
                      className="field-label inline-flex min-h-11 w-fit items-center border border-pine px-5 text-pine transition-colors hover:bg-pine hover:text-bone"
                    >
                      Inspect plate {product.plate}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Collections band */}
      <section
        aria-labelledby="collections-heading"
        className="border-t border-mist bg-parchment"
      >
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2
              id="collections-heading"
              className="font-display text-3xl text-pine sm:text-4xl"
            >
              Ways into the kit
            </h2>
            <Link
              href="/shop"
              className="field-label text-clay hover:text-clay-deep"
            >
              All products →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {collections.map((collection) => (
              <Link
                key={collection.handle}
                href={`/shop/${collection.handle}`}
                className="group block border border-mist bg-bone"
              >
                <Image
                  src={collection.heroImage.src}
                  alt={collection.heroImage.alt}
                  width={collection.heroImage.width}
                  height={collection.heroImage.height}
                  sizes="(min-width: 640px) 30vw, 100vw"
                  className="aspect-4/3 w-full object-cover"
                />
                <span className="block border-t border-mist px-4 py-4">
                  <span className="field-label block text-clay">
                    {collection.fieldCode}
                  </span>
                  <span className="mt-1 block font-display text-xl text-pine group-hover:text-clay">
                    {collection.title}
                  </span>
                  <span className="mt-1 block text-sm text-slate">
                    {collection.productHandles.length} products
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Journal teaser */}
      {leadArticle !== undefined ? (
        <section
          aria-labelledby="journal-heading"
          className="border-t border-mist"
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Link
                href={`/journal/${leadArticle.handle}`}
                className="group block"
              >
                <Image
                  src={leadArticle.heroImage.src}
                  alt={leadArticle.heroImage.alt}
                  width={leadArticle.heroImage.width}
                  height={leadArticle.heroImage.height}
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="aspect-3/2 w-full border border-mist object-cover"
                />
                <span className="mt-4 block">
                  <span className="field-label block text-clay">
                    {leadArticle.plate} · {leadArticle.location}
                  </span>
                  <span className="mt-2 block font-display text-2xl text-pine group-hover:text-clay sm:text-3xl">
                    {leadArticle.title}
                  </span>
                </span>
              </Link>
            </div>
            <div className="flex flex-col lg:col-span-5">
              <h2
                id="journal-heading"
                className="font-display text-3xl text-pine"
              >
                From the journal
              </h2>
              <ul className="mt-6 divide-y divide-mist border-y border-mist">
                {articles.map((article) => (
                  <li key={article.handle}>
                    <Link
                      href={`/journal/${article.handle}`}
                      className="group block py-4"
                    >
                      <span className="field-label block text-slate">
                        {article.plate} · {formatDate(article.publishedAt)}
                      </span>
                      <span className="mt-1 block font-display text-lg text-pine group-hover:text-clay">
                        {article.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/journal"
                className="field-label mt-6 inline-flex min-h-11 w-fit items-center border border-pine px-5 text-pine transition-colors hover:bg-pine hover:text-bone"
              >
                Read the journal
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* Standard band */}
      <section
        aria-labelledby="standard-heading"
        className="border-t border-mist bg-pine-deep text-bone"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-2">
          <div>
            <p className="field-label text-moss-light">The Forward standard</p>
            <h2
              id="standard-heading"
              className="mt-3 max-w-md font-display text-3xl leading-tight sm:text-4xl"
            >
              Built to be worn out. Made to be repaired.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-mist">
              Every product answers three questions before it ships: does it
              work when the weather turns, does it carry its weight, and can we
              fix it when you finally wear it out.
            </p>
            <Link
              href="/pages/repairs"
              className="field-label mt-6 inline-flex min-h-11 items-center border border-moss-light px-6 text-moss-light transition-colors hover:bg-moss-light hover:text-pine-deep"
            >
              The repairs program
            </Link>
          </div>
          <Image
            src={ridgesImage.src}
            alt={ridgesImage.alt}
            width={ridgesImage.width}
            height={ridgesImage.height}
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="aspect-3/2 w-full border border-bone/20 object-cover"
          />
        </div>
      </section>
    </div>
  );
}
