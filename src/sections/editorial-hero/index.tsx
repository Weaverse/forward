"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import { eyebrow } from "@/lib/presentation/variants";
import type { StorefrontImage } from "@/lib/storefront/types";
import { weaverseImage } from "@/lib/weaverse/image";

interface EditorialHeroProps {
  eyebrowLabel: string;
  heading: string;
  lede: string;
  /** A Builder image value, a StorefrontImage, or nothing. */
  image?: StorefrontImage | unknown;
  /** Which column the image occupies on desktop. Defaults to `right`. */
  imageSide?: "left" | "right";
}

/**
 * Split editorial hero: copy in one column, full-bleed image in the other.
 * Used by the About and Materials custom pages.
 */
function EditorialHero({
  eyebrowLabel,
  heading,
  lede,
  image,
  imageSide = "right",
}: EditorialHeroProps) {
  const imageFirst = imageSide === "left";
  /* A merchant can clear the image in Studio, so absent is an ordinary state.
   * The copy column still carries the page; a missing image drops to one
   * column rather than taking the route down. */
  const resolved = weaverseImage(image);
  return (
    <section className="mt-5.5 mr-7 ml-7 grid min-h-page-min grid-cols-split-90 bg-ink text-text-inverse max-md:mx-2.5 max-md:mt-2.5 max-md:min-h-0 max-md:grid-cols-1">
      <div
        className={cn(
          "flex flex-col justify-center p-panel-wide max-md:px-page-gutter max-md:py-13.75",
          imageFirst && "order-2 max-md:order-1",
        )}
      >
        <p className={eyebrow()}>{eyebrowLabel}</p>
        <h1 className="mt-5 mb-7.5 text-balance font-heading text-display-wide leading-display-tightest tracking-display-tight max-md:text-display-mobile">
          {heading}
        </h1>
        <p className="max-w-lede text-lede leading-lede text-text-muted">
          {lede}
        </p>
      </div>
      {resolved === null ? null : (
        <Image
          className={cn(
            "h-full object-cover saturate-72 max-md:h-home-media-mobile",
            imageFirst && "order-1 max-md:order-2",
          )}
          src={resolved.src}
          alt={resolved.alt}
          width={resolved.width}
          height={resolved.height}
          sizes="(min-width: 820px) 55vw, 100vw"
          priority
        />
      )}
    </section>
  );
}

export default EditorialHero;

export { schema } from "./schema";
