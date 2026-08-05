import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartForm } from "@/components/add-to-cart-form";
import { ProductCard } from "@/components/product-card";
import { cn } from "@/lib/cn";
import { storefront } from "@/lib/storefront/data-source";
import { formatMoney } from "@/lib/storefront/format";
import {
  COLORWAY_PARAM,
  galleryImages,
  productColorwayHref,
  resolveColorway,
} from "@/lib/storefront/product-state";
import type { Product } from "@/lib/storefront/types";

interface ProductPageProps {
  params: Promise<{ productHandle: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { productHandle } = await params;
  const product = await storefront.getProduct(productHandle);
  if (product === null) {
    return { title: "Product not found" };
  }
  return { title: product.title, description: product.subtitle };
}

async function relatedProducts(product: Product) {
  const related = await Promise.all(
    product.relatedHandles.map((handle) => storefront.getProduct(handle)),
  );
  return related.filter((entry): entry is Product => entry !== null);
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const [{ productHandle }, query] = await Promise.all([params, searchParams]);
  const product = await storefront.getProduct(productHandle);
  if (product === null) {
    notFound();
  }
  const requestedColorway =
    typeof query[COLORWAY_PARAM] === "string"
      ? query[COLORWAY_PARAM]
      : undefined;
  const colorway = resolveColorway(product, requestedColorway);
  const gallery = galleryImages(colorway);
  const [primaryImage, ...secondaryImages] = gallery;
  const related = await relatedProducts(product);

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
      <nav aria-label="Breadcrumb">
        <ol className="field-label flex flex-wrap items-center gap-2 text-slate">
          <li>
            <Link href="/shop" className="hover:text-pine">
              Shop
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">
            {product.title}
          </li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-12">
        {/* Gallery: complete four-image group for the active colorway. */}
        <div className="lg:col-span-7">
          <figure className="relative">
            <Image
              key={primaryImage?.src}
              src={primaryImage?.src ?? ""}
              alt={primaryImage?.alt ?? ""}
              width={primaryImage?.width ?? 1600}
              height={primaryImage?.height ?? 2000}
              priority
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="aspect-4/5 w-full border border-mist bg-parchment object-cover"
            />
            <figcaption className="field-label absolute left-3 top-3 border border-ink/20 bg-bone/90 px-2 py-1 text-ink">
              Plate {product.plate} · {colorway.name}
            </figcaption>
          </figure>
          <ul className="mt-4 grid grid-cols-3 gap-4">
            {secondaryImages.map((image) => (
              <li key={image.src}>
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  sizes="(min-width: 1024px) 18vw, 30vw"
                  className="aspect-4/5 w-full border border-mist bg-parchment object-cover"
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Purchase panel */}
        <div className="lg:col-span-5">
          <p className="field-label text-clay">
            Plate {product.plate} · {product.category}
          </p>
          <h1 className="mt-2 font-display text-3xl text-pine sm:text-4xl">
            {product.title}
          </h1>
          <p className="mt-2 text-base leading-relaxed text-slate">
            {product.subtitle}
          </p>
          <p className="mt-4 font-display text-2xl text-ink">
            {formatMoney(product.price)}
          </p>

          {/* Colorway swatches: server-rendered deep links. */}
          <div className="mt-6">
            <p className="field-label text-ink" id="colorway-label">
              Colorway — {colorway.name}
            </p>
            <ul
              aria-labelledby="colorway-label"
              className="mt-2 flex flex-wrap gap-2"
            >
              {product.colorways.map((entry) => {
                const selected = entry.id === colorway.id;
                return (
                  <li key={entry.id}>
                    <Link
                      href={productColorwayHref(product, entry.id)}
                      scroll={false}
                      aria-current={selected ? "true" : undefined}
                      aria-label={`${entry.name} colorway${selected ? " (selected)" : ""}`}
                      className={cn(
                        "flex size-11 items-center justify-center transition-colors",
                        selected
                          ? "border-2 border-pine"
                          : "border border-mist hover:border-pine",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="block size-7 border border-ink/25"
                        style={{ backgroundColor: entry.swatchColor }}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-6">
            <AddToCartForm
              key={colorway.id}
              product={product}
              colorway={colorway}
            />
          </div>

          {/* Field record: details, specs, care, repair. */}
          <div className="mt-8 divide-y divide-mist border-y border-mist">
            <details open className="group py-4">
              <summary className="field-label flex min-h-11 cursor-pointer list-none items-center justify-between text-ink">
                Details
                <span aria-hidden="true" className="group-open:hidden">
                  +
                </span>
                <span aria-hidden="true" className="hidden group-open:inline">
                  −
                </span>
              </summary>
              <div className="space-y-3 pt-3 text-sm leading-relaxed text-slate">
                <p>{product.description}</p>
                {product.detailParagraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                ))}
              </div>
            </details>
            <details className="group py-4">
              <summary className="field-label flex min-h-11 cursor-pointer list-none items-center justify-between text-ink">
                Specifications
                <span aria-hidden="true" className="group-open:hidden">
                  +
                </span>
                <span aria-hidden="true" className="hidden group-open:inline">
                  −
                </span>
              </summary>
              <dl className="pt-3">
                {product.specs.map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between gap-6 border-b border-mist/60 py-2 last:border-b-0"
                  >
                    <dt className="field-label text-slate">{row.label}</dt>
                    <dd className="text-right text-sm text-ink">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </details>
            <details className="group py-4">
              <summary className="field-label flex min-h-11 cursor-pointer list-none items-center justify-between text-ink">
                Care
                <span aria-hidden="true" className="group-open:hidden">
                  +
                </span>
                <span aria-hidden="true" className="hidden group-open:inline">
                  −
                </span>
              </summary>
              <ul className="list-disc space-y-2 pl-5 pt-3 text-sm leading-relaxed text-slate">
                {product.care.map((entry) => (
                  <li key={entry.slice(0, 32)}>{entry}</li>
                ))}
              </ul>
            </details>
            <details className="group py-4">
              <summary className="field-label flex min-h-11 cursor-pointer list-none items-center justify-between text-ink">
                Repair
                <span aria-hidden="true" className="group-open:hidden">
                  +
                </span>
                <span aria-hidden="true" className="hidden group-open:inline">
                  −
                </span>
              </summary>
              <div className="space-y-3 pt-3 text-sm leading-relaxed text-slate">
                <p>{product.repair}</p>
                <Link
                  href="/pages/repairs"
                  className="field-label inline-flex min-h-11 items-center text-clay hover:text-clay-deep"
                >
                  The repairs program →
                </Link>
              </div>
            </details>
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section aria-labelledby="related-heading" className="mt-16">
          <h2
            id="related-heading"
            className="font-display text-2xl text-pine sm:text-3xl"
          >
            Completes the kit
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((entry) => (
              <ProductCard
                key={entry.handle}
                product={entry}
                plate={entry.plate}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
