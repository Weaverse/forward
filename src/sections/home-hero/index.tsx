"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Product, StorefrontImage } from "@/lib/storefront/types";
import { weaverseImage } from "@/lib/weaverse/image";
import { parseRows } from "../parse";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";

interface HomeHeroProps extends WeaverseElementProps {
  children?: ReactNode;
  /** One `value | label` pair per line. Parsed by `../parse`. */
  stats: string;
  /** A Builder image value, a StorefrontImage, or nothing. */
  image?: StorefrontImage | unknown;
  /** Resolved by `./loader` from the merchant's product selection. */
  loaderData?: { featuredProduct: Product | null };
}

/** Home hero: split copy and image, with a summary stat row and image badge. */
function HomeHero({
  children,
  stats,
  image,
  loaderData,
  ...rest
}: HomeHeroProps) {
  const featuredProduct = loaderData?.featuredProduct ?? undefined;
  const resolvedImage = weaverseImage(image);
  return (
    <section
      {...elementAttributes(rest)}
      aria-labelledby="home-hero-title"
      className="grid min-h-[calc(100svh-var(--spacing-header))] grid-cols-[minmax(390px,0.78fr)_minmax(0,1.22fr)] bg-ink text-text-inverse max-md:min-h-[calc(100svh-var(--spacing-header-compact))] max-md:grid-cols-1"
    >
      <div className="flex flex-col justify-center p-[clamp(48px,6vw,100px)] max-md:px-page-gutter max-md:py-13.75">
        {children}
        <dl className="mt-auto grid grid-cols-3 border-border-dark-subtle border-t pt-9 max-md:mt-11.25">
          {parseRows(stats, 2).map(([value, label]) => (
            <div className="grid gap-1.5" key={label}>
              <dt className="m-0 font-field-meta text-micro text-text-dark-meta uppercase">
                {label}
              </dt>
              <dd className="m-0 font-heading text-heading-4">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="relative m-5 min-h-190 overflow-hidden max-md:mx-2.5 max-md:mt-0 max-md:mb-2.5 max-md:min-h-[68svh]">
        {resolvedImage === null ? null : (
          <Image
            className="absolute inset-0 h-full object-cover saturate-78 contrast-105"
            src={resolvedImage.src}
            alt={resolvedImage.alt}
            width={resolvedImage.width}
            height={resolvedImage.height}
            sizes="(min-width: 820px) 58vw, 100vw"
            priority
          />
        )}
        {featuredProduct !== undefined ? (
          <Link
            className="absolute right-4.5 bottom-4.5 grid w-[min(330px,calc(100%-36px))] gap-2 bg-signal p-5 text-ink"
            href={`/products/${featuredProduct.handle}`}
          >
            <span className="font-field-meta text-micro uppercase">
              Featured system
            </span>
            <strong className="font-heading text-home-feature-title">
              {featuredProduct.title}
            </strong>
            <span className="font-field-meta text-micro uppercase">
              View product →
            </span>
          </Link>
        ) : null}
      </div>
    </section>
  );
}

export default HomeHero;

export { schema } from "./schema";
