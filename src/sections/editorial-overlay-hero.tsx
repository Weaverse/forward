import Image from "next/image";

import { eyebrow } from "@/lib/presentation/variants";
import type { StorefrontImage } from "@/lib/storefront/types";

interface EditorialOverlayHeroProps {
  eyebrowLabel: string;
  heading: string;
  lede: string;
  image: StorefrontImage;
}

/** Full-bleed hero: copy sits over a darkened cover image. */
export function EditorialOverlayHero({
  eyebrowLabel,
  heading,
  lede,
  image,
}: EditorialOverlayHeroProps) {
  return (
    <section className="relative mt-5.5 mr-7 ml-7 min-h-[90svh] overflow-hidden text-text-inverse after:absolute after:inset-0 after:bg-field-testing-overlay after:content-[''] max-md:mx-2.5 max-md:mt-2.5 max-md:min-h-0">
      <Image
        className="absolute inset-0 h-full object-cover"
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes="100vw"
        priority
      />
      <div className="relative z-1 max-w-205 p-[clamp(70px,9vw,150px)] max-md:px-page-gutter max-md:py-16.25">
        <p className={eyebrow()}>{eyebrowLabel}</p>
        <h1 className="mt-5 mb-7.5 text-balance font-heading text-display-wide leading-display-tightest tracking-display-tight max-md:text-display-mobile">
          {heading}
        </h1>
        <p className="max-w-state text-control-lg">{lede}</p>
      </div>
    </section>
  );
}
