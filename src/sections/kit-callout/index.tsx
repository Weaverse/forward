"use client";

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
import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";

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
  /* No product selected: the callout has no subject, so render nothing on
   * the storefront and a selectable placeholder inside Studio. */
  if (product === null) {
    const attributes = elementAttributes(rest);
    if (attributes["data-wv-id"] === undefined) return null;
    return (
      <section
        {...attributes}
        className="grid min-h-64 place-items-center bg-ink p-panel-wide text-text-inverse"
      >
        <p className={eyebrow()}>Select a product for this kit</p>
      </section>
    );
  }
  return (
    <Section
      {...rest}
      verticalPadding="none"
      containerClassName={cn(
        "grid grid-cols-[0.55fr_1.45fr] items-end gap-15 max-md:grid-cols-1",
        VIEWPORT_SECTION_CLASS,
      )}
    >
      <div className="pb-7.5">
        <p className={eyebrow()}>{eyebrowLabel}</p>
        <h2 className={sectionHeading()}>{heading}</h2>
        <p className="mb-prose-paragraph">{product.subtitle}</p>
        <Link className={textLink()} href={`/products/${product.handle}`}>
          {linkLabel}
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3 max-md:gap-1.75">
        {tiles.map((tile) => (
          <Link
            href={`/products/${tile.product.handle}`}
            key={tile.product.handle}
          >
            <Image
              className="aspect-4/5 object-cover md-up:max-h-[calc(var(--home-viewport-media)_-_44px)] short-desktop:max-h-[calc(var(--home-viewport-media)_-_32px)]"
              src={tile.image.src}
              alt={tile.image.alt}
              width={tile.image.width}
              height={tile.image.height}
              sizes="(min-width: 820px) 20vw, 45vw"
            />
            <span className="mt-2.5 block text-caption font-bold short-desktop:mt-1 short-desktop:text-ui">
              {tile.product.title}
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}

export default KitCallout;

export { schema } from "./schema";
