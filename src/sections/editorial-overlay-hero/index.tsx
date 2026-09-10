"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import { eyebrow, sectionHeading } from "@/lib/presentation/variants";
import type { StorefrontImage } from "@/lib/storefront/types";
import { weaverseImage } from "@/lib/weaverse/image";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";

interface EditorialOverlayHeroProps extends WeaverseElementProps {
  eyebrowLabel: string;
  heading: string;
  lede: string;
  /** A Builder image value, a StorefrontImage, or nothing. */
  image?: StorefrontImage | unknown;
}

/** Full-bleed hero: copy sits over a darkened cover image. */
function EditorialOverlayHero({
  eyebrowLabel,
  heading,
  lede,
  image,
  ...rest
}: EditorialOverlayHeroProps) {
  /* A merchant can clear the image in Studio; the copy still stands alone. */
  const resolved = weaverseImage(image);
  return (
    <section
      {...elementAttributes(rest)}
      className="relative mt-5.5 mr-7 ml-7 min-h-[90svh] overflow-hidden text-text-inverse after:absolute after:inset-0 after:bg-field-testing-overlay after:content-[''] max-md:mx-2.5 max-md:mt-2.5 max-md:min-h-0"
    >
      {resolved === null ? null : (
        <Image
          className="absolute inset-0 h-full object-cover"
          src={resolved.src}
          alt={resolved.alt}
          width={resolved.width}
          height={resolved.height}
          sizes="100vw"
          priority
        />
      )}
      <div className="relative z-1 max-w-205 p-[clamp(70px,9vw,150px)] max-md:px-page-gutter max-md:py-16.25">
        <p className={eyebrow()}>{eyebrowLabel}</p>
        <h1 className={cn(sectionHeading({ size: "heroWide" }), "mt-5 mb-7.5")}>
          {heading}
        </h1>
        <p className="max-w-state text-control-lg">{lede}</p>
      </div>
    </section>
  );
}

export default EditorialOverlayHero;

export { schema } from "./schema";
