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
 * `useSearchParams` so the route stays fully static (unknown handles become
 * real production 404s) while `?colorway=` deep links, swatch navigation, and
 * browser history keep working.
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
 * Canonical `.gallery` (source `app.js:281`): a lead frame spanning the tall
 * column plus selectable tiles, with the selected view marked by the
 * `.gallery-button.active` treatment. Images are the active colorway's four
 * approved frames. Keyed by colorway at the call site so selection resets on
 * colorway change.
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

  return (
    <section className="gallery" aria-label={`${product.title} gallery`}>
      {gallery.map((image, index) => {
        const active = index === selectedIndex;
        return (
          <button
            key={image.src}
            type="button"
            className={cn("gallery-button", active && "active")}
            aria-label={`Select view ${index + 1}: ${image.alt}`}
            aria-pressed={active}
            onClick={() => setSelectedIndex(index)}
          >
            <Image
              src={image.src}
              alt={`${product.title} view ${index + 1}`}
              width={image.width}
              height={image.height}
              sizes={index === 0 ? "(min-width: 820px) 55vw, 100vw" : "30vw"}
              priority={index === 0}
              loading={index === 0 ? undefined : "lazy"}
            />
          </button>
        );
      })}
    </section>
  );
}

interface ProductDetailViewProps extends ProductDetailProps {
  colorway: ProductColorway;
}

/**
 * Canonical `.pdp` grid and sticky `.product-panel` (source `app.js:279–288`).
 */
function ProductDetailView({
  product,
  colorway,
  fieldRecord,
}: ProductDetailViewProps) {
  const specBadge = product.specs[0]?.value ?? product.category;

  return (
    <div className="pdp">
      <ProductGallery key={colorway.id} product={product} colorway={colorway} />
      <section className="product-panel" aria-label="Purchase panel">
        <div className="product-panel-inner">
          <p className="breadcrumbs">
            <Link href="/shop">Shop</Link> /{" "}
            <Link href={`/shop?category=${product.category}`}>
              {product.category}
            </Link>
          </p>
          <div className="product-kicker">
            <span className="eyebrow">Plate {product.plate}</span>
            <span className="meta">{specBadge}</span>
          </div>
          <h1 className="product-title">{product.title}</h1>
          <strong>{formatMoney(product.price)}</strong>
          <p className="product-intro">{product.description}</p>

          {/* Colorway selection stays a set of canonical deep links. */}
          <div className="option-group">
            <div className="option-label">
              <span>Color</span>
              <span>{colorway.name}</span>
            </div>
            {/* Each link carries its own colorway name and selected state. */}
            <div className="option-row">
              {product.colorways.map((entry) => {
                const selected = entry.id === colorway.id;
                return (
                  <Link
                    key={entry.id}
                    className={cn("option-chip", selected && "selected")}
                    href={productColorwayHref(product, entry.id)}
                    scroll={false}
                    aria-current={selected ? "true" : undefined}
                    aria-label={`${entry.name} colorway${
                      selected ? " (selected)" : ""
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="swatch"
                      style={{ backgroundColor: entry.swatchColor }}
                    />
                    {entry.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <AddToCartForm
            key={colorway.id}
            product={product}
            colorway={colorway}
          />

          {fieldRecord}
        </div>
      </section>
    </div>
  );
}
