"use client";

import { IMAGES_PLACEHOLDERS } from "@weaverse/schema";
import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/section";
import { cn } from "@/lib/cn";
import {
  eyebrow,
  sectionHeading,
  textLink,
  VIEWPORT_SECTION_CLASS,
} from "@/lib/presentation/variants";
import type { Product, StorefrontImage } from "@/lib/storefront/types";
import type { WeaverseElementProps } from "../weaverse-element";

interface KitCalloutProps extends WeaverseElementProps {
  eyebrowLabel: string;
  heading: string;
  linkLabel: string;
  /** Resolved by `./loader` from the merchant's selections. */
  loaderData?: {
    product: Product | null;
    tiles: readonly { product: Product; image: StorefrontImage }[];
  };
}

/* Shown until products are picked, so a fresh section keeps its real layout
 * instead of collapsing to a notice. Weaverse placeholder art is SVG on
 * Weaverse's CDN, outside this theme's `remotePatterns`, so it bypasses the
 * optimizer. */
const PLACEHOLDER_SUBTITLE =
  "A short summary of the kit's anchor product appears here once one is selected.";
const PLACEHOLDER_TILES = [
  IMAGES_PLACEHOLDERS.product_6,
  IMAGES_PLACEHOLDERS.product_7,
  IMAGES_PLACEHOLDERS.product_8,
];

const TILE_IMAGE_CLASS =
  "aspect-4/5 object-cover md:max-h-[calc(var(--home-viewport-media)_-_44px)] short-desktop:max-h-[calc(var(--home-viewport-media)_-_32px)]";
const TILE_TITLE_CLASS =
  "mt-2.5 block text-caption font-bold short-desktop:mt-1 short-desktop:text-ui";

/** A named kit: one anchor product beside the pieces that travel with it. */
function KitCallout({
  eyebrowLabel,
  heading,
  linkLabel,
  loaderData,
  ...rest
}: KitCalloutProps) {
  const product = loaderData?.product ?? null;
  const tiles = loaderData?.tiles ?? [];
  return (
    <Section
      {...rest}
      containerClassName={cn(
        "grid grid-cols-1 items-end gap-15 md:grid-cols-[0.55fr_1.45fr]",
        VIEWPORT_SECTION_CLASS,
      )}
    >
      <div className="pb-7.5">
        <p className={eyebrow()}>{eyebrowLabel}</p>
        <h2 className={sectionHeading()}>{heading}</h2>
        <p className="mb-prose-paragraph">
          {product?.subtitle ?? PLACEHOLDER_SUBTITLE}
        </p>
        {product ? (
          <Link className={textLink()} href={`/products/${product.handle}`}>
            {linkLabel}
          </Link>
        ) : (
          <span className={textLink()}>{linkLabel}</span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-1.75 md:gap-3">
        {tiles.length > 0
          ? tiles.map((tile) => (
              <Link
                href={`/products/${tile.product.handle}`}
                key={tile.product.handle}
              >
                <Image
                  className={TILE_IMAGE_CLASS}
                  src={tile.image.src}
                  alt={tile.image.alt}
                  width={tile.image.width}
                  height={tile.image.height}
                  sizes="(min-width: 820px) 20vw, 45vw"
                />
                <span className={TILE_TITLE_CLASS}>{tile.product.title}</span>
              </Link>
            ))
          : PLACEHOLDER_TILES.map((src) => (
              <div key={src} aria-hidden="true">
                <Image
                  className={cn(TILE_IMAGE_CLASS, "bg-media-placeholder")}
                  src={src}
                  alt=""
                  width={1024}
                  height={1280}
                  unoptimized
                />
                <span className={cn(TILE_TITLE_CLASS, "text-text-muted")}>
                  Product title
                </span>
              </div>
            ))}
      </div>
    </Section>
  );
}

export default KitCallout;

export { schema } from "./schema";
