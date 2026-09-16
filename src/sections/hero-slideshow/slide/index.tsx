"use client";

import { IMAGES_PLACEHOLDERS } from "@weaverse/schema";
import { cva } from "class-variance-authority";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useContext } from "react";

import { cn } from "@/lib/cn";
import type { Product, StorefrontImage } from "@/lib/storefront/types";
import { weaverseImage } from "@/lib/weaverse/image";

import {
  elementAttributes,
  type WeaverseElementProps,
} from "../../weaverse-element";
import { SlideshowContext } from "../context";

const imageVariants = cva(
  "object-cover transition-[scale] duration-2400 ease-media starting:scale-110",
  {
    variants: {
      position: {
        center: "object-center",
        right: "object-[70%_center]",
        "right-low": "object-[70%_68%]",
      },
    },
    defaultVariants: { position: "center" },
  },
);

/* The shared elements inside the slide's content column rise in one after
 * another whenever the copy mounts. `@starting-style`, so no keyframes; the
 * global reduced-motion override zeroes the durations. */
const STAGGER =
  "[&>*>*]:transition-[opacity,translate] [&>*>*]:duration-700 [&>*>*]:ease-enter [&>*>*]:starting:translate-y-4 [&>*>*]:starting:opacity-0 [&>*>*:nth-child(2)]:delay-100 [&>*>*:nth-child(3)]:delay-200 [&>*>*:nth-child(4)]:delay-300";

type ImagePosition = "center" | "right" | "right-low";

interface HeroSlideProps extends WeaverseElementProps {
  children?: ReactNode;
  /** A Builder image value, a StorefrontImage, or nothing. */
  image?: StorefrontImage | unknown;
  imagePosition?: ImagePosition;
  fieldTag?: string;
  /** Resolved by `./loader` from the merchant's product selection. */
  loaderData?: { featuredProduct: Product | null };
}

/**
 * One slide of `hero-slideshow`.
 *
 * The image fills the whole hero and crossfades on `active`. The copy, field
 * tag and badge follow `shown`: they fade out while the slide is leaving and
 * stay in the DOM but invisible otherwise, so the shared cell keeps the tallest
 * slide's height. Remounting them under a new key replays the entrance.
 *
 * The slide root is deliberately unpositioned: the image, tag and badge are
 * placed against the slideshow section, not against this column.
 */
function HeroSlide({
  children,
  fieldTag,
  image,
  imagePosition,
  loaderData,
  ...rest
}: HeroSlideProps) {
  const { index, active, shown } = useContext(SlideshowContext);
  const isActive = index === active;
  const isShown = index === shown;
  const leaving = isShown && active !== shown;
  const phase = isShown ? "shown" : "hidden";
  const fade = cn(leaving && "opacity-0", !isShown && "invisible opacity-0");
  const resolvedImage = weaverseImage(image);
  const product = loaderData?.featuredProduct ?? null;

  return (
    <div
      {...elementAttributes(rest)}
      className="flex min-w-0 max-w-6xl flex-col justify-end px-page-gutter pt-28 pb-10 [grid-area:1/1] md:pb-14"
    >
      {resolvedImage === null ? null : (
        <div
          aria-hidden={!isActive}
          className={cn(
            "-z-10 absolute inset-0 transition-opacity duration-1000 ease-media",
            isActive ? "opacity-100" : "opacity-0",
          )}
        >
          <Image
            className={imageVariants({ position: imagePosition })}
            src={resolvedImage.src}
            alt={resolvedImage.alt}
            fill
            sizes="100vw"
            {...(index === 0 ? { priority: true } : { loading: "eager" })}
          />
        </div>
      )}
      {fieldTag ? (
        <p
          key={`tag-${phase}`}
          className={cn(
            "absolute top-4 right-page-gutter left-page-gutter z-10 m-0 bg-ink/55 px-3 py-2 font-field-meta text-micro uppercase backdrop-blur-md transition-opacity duration-300 starting:opacity-0 md:top-6 md:left-auto",
            fade,
          )}
        >
          <span className="mr-2 inline-block size-1.5 animate-pulse rounded-full bg-signal align-middle" />
          {fieldTag}
        </p>
      ) : null}
      <div
        key={phase}
        className={cn(
          STAGGER,
          "transition-[opacity,translate] duration-300 ease-standard",
          fade,
          leaving && "-translate-y-2",
        )}
      >
        {children}
      </div>
      <FeaturedBadge
        key={`badge-${phase}`}
        className={cn(
          "absolute inset-x-0 bottom-0 z-10 h-22 w-auto border-text-inverse/15 border-t px-page-gutter transition-[opacity,background-color] duration-300 starting:opacity-0 md:right-0 md:left-auto md:h-28 md:w-80 md:border-t-0 md:border-l md:px-0",
          fade,
        )}
        product={product}
      />
    </div>
  );
}

/**
 * Secondary pointer to the slide's product. Deliberately not yellow: signal is
 * kept for the primary CTA. The title clamps to two lines (one on mobile) so a
 * long product name cannot push the floor bar around; the full name stays in
 * the link's accessible name and on the PDP.
 *
 * With no product picked (or one that no longer resolves) it keeps its slot
 * with a placeholder thumbnail and text instead of leaving a hole in the bar.
 */
function FeaturedBadge({
  product,
  className,
}: {
  product: Product | null;
  className?: string;
}) {
  if (product === null) {
    return (
      <div
        className={cn(
          "flex items-center gap-4 px-6 text-text-inverse",
          className,
        )}
      >
        <ThumbnailPlaceholder />
        <span className="grid min-w-0 flex-1 gap-1">
          <span className="font-field-meta text-micro text-text-dark-meta uppercase">
            Featured system
          </span>
          <span className="line-clamp-1 font-heading text-lede text-text-dark-meta leading-copy">
            Product Title
          </span>
        </span>
      </div>
    );
  }
  const thumbnail = product.colorways[0]?.images.primary;
  return (
    <Link
      aria-label={`Featured system: ${product.title}`}
      className={cn(
        "group flex items-center gap-4 px-6 text-text-inverse hover:bg-ink/35",
        className,
      )}
      href={`/products/${product.handle}`}
    >
      {thumbnail ? (
        <Image
          className="size-14 shrink-0 bg-surface-subtle object-cover"
          src={thumbnail.src}
          alt=""
          width={112}
          height={112}
          sizes="56px"
        />
      ) : (
        <ThumbnailPlaceholder />
      )}
      <span className="grid min-w-0 flex-1 gap-1">
        <span className="font-field-meta text-micro text-text-dark-meta uppercase">
          Featured system
        </span>
        <span className="line-clamp-1 text-balance font-heading text-lede leading-copy md:line-clamp-2">
          {product.title}
        </span>
      </span>
      <span
        aria-hidden
        className="shrink-0 text-control-lg transition-[color,translate] duration-200 ease-standard group-hover:translate-x-1 group-hover:text-signal"
      >
        →
      </span>
    </Link>
  );
}

/* Weaverse's generic placeholder art. Served from Weaverse's Shopify CDN as
 * SVG, outside this theme's `remotePatterns`, so it bypasses the optimizer. */
function ThumbnailPlaceholder() {
  return (
    <Image
      className="size-14 shrink-0 bg-media-placeholder object-cover"
      src={IMAGES_PLACEHOLDERS.image}
      alt=""
      width={56}
      height={56}
      unoptimized
    />
  );
}

export default HeroSlide;

export { schema } from "./schema";
