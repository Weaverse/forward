"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { AddToCartForm } from "@/components/add-to-cart-form";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/storefront/format";
import {
  COLORWAY_PARAM,
  galleryImages,
  productColorwayHref,
  resolveColorway,
} from "@/lib/storefront/product-state";
import type { Product, ProductColorway } from "@/lib/storefront/types";

interface ProductDetailProps {
  product: Product;
  fieldRecord: ReactNode;
}

/**
 * Query-driven half of the PDP. Colorway selection lives in the browser via
 * `useSearchParams` so the route itself stays fully static (unknown handles
 * become real production 404s) while `?colorway=` deep links, swatch
 * navigation, and browser history keep working.
 */
export function ProductDetail({ product, fieldRecord }: ProductDetailProps) {
  const searchParams = useSearchParams();
  const requestedColorway = searchParams.get(COLORWAY_PARAM) ?? undefined;
  return (
    <ProductDetailView
      product={product}
      colorway={resolveColorway(product, requestedColorway)}
      fieldRecord={fieldRecord}
    />
  );
}

/**
 * Suspense fallback for the static prerender: identical markup in the
 * canonical default-colorway state, so the served HTML is complete before
 * hydration resolves the query string.
 */
export function ProductDetailFallback({
  product,
  fieldRecord,
}: ProductDetailProps) {
  return (
    <ProductDetailView
      product={product}
      colorway={resolveColorway(product, undefined)}
      fieldRecord={fieldRecord}
    />
  );
}

interface ProductDetailViewProps extends ProductDetailProps {
  colorway: ProductColorway;
}

function ProductDetailView({
  product,
  colorway,
  fieldRecord,
}: ProductDetailViewProps) {
  const gallery = galleryImages(colorway);
  const [primaryImage, ...secondaryImages] = gallery;

  return (
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

        {/* Colorway swatches: deep links via the canonical colorway hrefs. */}
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

        {fieldRecord}
      </div>
    </div>
  );
}
