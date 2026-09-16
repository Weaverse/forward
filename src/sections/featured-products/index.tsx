"use client";

import { IMAGES_PLACEHOLDERS } from "@weaverse/schema";
import Image from "next/image";
import type { ReactNode } from "react";
import { ProductCard } from "@/components/product-card";
import { Section } from "@/components/section";
import type { Product } from "@/lib/storefront/types";
import type { WeaverseElementProps } from "../weaverse-element";

interface FeaturedProductsProps extends WeaverseElementProps {
  children?: ReactNode;
  /** Resolved by `./loader` from the merchant's product selection. */
  loaderData?: { products: readonly Product[] };
}

/** Cards shown until the merchant picks products, so a fresh section reads as a grid. */
const PLACEHOLDER_IMAGES = [
  IMAGES_PLACEHOLDERS.product_1,
  IMAGES_PLACEHOLDERS.product_2,
  IMAGES_PLACEHOLDERS.product_3,
  IMAGES_PLACEHOLDERS.product_4,
];

/**
 * A four-up product grid introduced by a heading block on the left and a link
 * block on the right. With no products picked it shows placeholder cards in
 * the same geometry instead of collapsing to an empty band.
 */
function FeaturedProducts({
  children,
  loaderData,
  ...rest
}: FeaturedProductsProps) {
  const products = loaderData?.products ?? [];
  return (
    <Section {...rest} aria-labelledby="home-featured-title">
      <header className="mb-11.25 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end md:gap-10">
        {children}
      </header>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4.5 md:grid-cols-4">
        {products.length > 0
          ? products.map((product, index) => (
              <ProductCard
                key={product.handle}
                product={product}
                priority={index < 2}
              />
            ))
          : PLACEHOLDER_IMAGES.map((src) => (
              <PlaceholderCard key={src} src={src} />
            ))}
      </div>
    </Section>
  );
}

/* Weaverse's own placeholder art. Served from Weaverse's Shopify CDN as SVG,
 * outside this theme's `remotePatterns`, so it bypasses the optimizer. */
function PlaceholderCard({ src }: { src: string }) {
  return (
    <article className="min-w-0" aria-hidden="true">
      <Image
        className="aspect-4/5 bg-media-placeholder object-cover"
        src={src}
        alt=""
        width={1024}
        height={1280}
        unoptimized
      />
      <div className="flex justify-between gap-4.5 border-ink border-t pt-3.5 pb-5.5">
        <span className="font-heading text-copy font-semibold text-text-muted sm:text-card-title">
          Product title
        </span>
        <span className="whitespace-nowrap text-label text-text-muted">
          $00.00
        </span>
      </div>
    </article>
  );
}

export default FeaturedProducts;

export { schema } from "./schema";
