"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ReactNode, useState } from "react";

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

/**
 * Multi-column gallery for the active colorway's four approved images.
 * Desktop keeps a large selected view plus selectable tiles; mobile renders
 * the full readable stacked sequence with no thumb-rail dependence. Keyed by
 * colorway at the call site so selection resets on colorway change.
 */
function ProductGallery({
  product,
  colorway,
}: {
  product: Product;
  colorway: ProductColorway;
}) {
  const gallery = galleryImages(colorway);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = gallery[selectedIndex] ?? gallery[0];

  return (
    <div>
      {/* Mobile: stacked sequence of all four views. */}
      <ul className="space-y-3 lg:hidden">
        {gallery.map((image, index) => (
          <li key={image.src} className="relative">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              priority={index === 0}
              sizes="100vw"
              className="w-full bg-carbon-deep object-cover"
            />
            {index === 0 ? (
              <span className="field-label absolute bottom-3 right-3 bg-acid px-2 py-1 text-carbon">
                Plate {product.plate} · {colorway.name}
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      {/* Desktop: large selected view + selectable tiles. */}
      <div className="hidden lg:block">
        <figure className="relative">
          <Image
            key={selected?.src}
            src={selected?.src ?? ""}
            alt={selected?.alt ?? ""}
            width={selected?.width ?? 1600}
            height={selected?.height ?? 2000}
            priority
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="aspect-4/5 w-full bg-carbon-deep object-cover"
          />
          <figcaption className="field-label absolute bottom-3 right-3 bg-acid px-2 py-1 text-carbon">
            Selected view · Plate {product.plate} · {colorway.name}
          </figcaption>
        </figure>
        <ul className="mt-3 grid grid-cols-4 gap-3">
          {gallery.map((image, index) => {
            const active = index === selectedIndex;
            return (
              <li key={image.src}>
                <button
                  type="button"
                  aria-pressed={active}
                  aria-label={`View image ${index + 1}: ${image.alt}`}
                  onClick={() => setSelectedIndex(index)}
                  className={cn(
                    "block w-full border transition-colors",
                    active
                      ? "border-acid"
                      : "border-transparent hover:border-cream/40",
                  )}
                >
                  <Image
                    src={image.src}
                    alt=""
                    width={image.width}
                    height={image.height}
                    sizes="12vw"
                    className="aspect-4/5 w-full bg-carbon-deep object-cover"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
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
  const specBadge = product.specs[0]?.value ?? product.category;

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-7">
        <ProductGallery
          key={colorway.id}
          product={product}
          colorway={colorway}
        />
      </div>

      {/* Sticky purchase panel */}
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-8">
          <nav aria-label="Breadcrumb">
            <ol className="field-label flex flex-wrap items-center gap-2 text-cream/60">
              <li>
                <Link href="/shop" className="hover:text-acid">
                  Shop
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  href={`/shop?category=${product.category}`}
                  className="hover:text-acid"
                >
                  {product.category}
                </Link>
              </li>
            </ol>
          </nav>

          <div className="mt-6 flex items-baseline justify-between gap-4">
            <p className="field-label text-acid">Plate {product.plate}</p>
            <p className="field-label text-cream/60">{specBadge}</p>
          </div>
          <h1 className="display-large mt-3 text-cream">{product.title}</h1>
          <p className="field-label mt-3 text-cream">
            {formatMoney(product.price)}
          </p>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/75">
            {product.description}
          </p>

          {/* Colorway swatches: deep links via the canonical colorway hrefs. */}
          <div className="mt-8">
            <div className="flex items-baseline justify-between gap-4">
              <p className="field-label text-cream" id="colorway-label">
                Color
              </p>
              <p className="field-label text-cream/60">{colorway.name}</p>
            </div>
            <ul
              aria-labelledby="colorway-label"
              className="mt-3 flex flex-wrap gap-2"
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
                        "field-label inline-flex min-h-11 items-center gap-2 px-4 transition-colors",
                        selected
                          ? "bg-acid text-carbon"
                          : "border border-cream/40 text-cream hover:border-cream",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="block size-3 rounded-full border border-carbon/30"
                        style={{ backgroundColor: entry.swatchColor }}
                      />
                      {entry.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-8">
            <AddToCartForm
              key={colorway.id}
              product={product}
              colorway={colorway}
            />
          </div>

          {fieldRecord}
        </div>
      </div>
    </div>
  );
}
