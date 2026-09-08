import Image from "next/image";

import { eyebrow } from "@/lib/presentation/variants";
import type { StorefrontImage } from "@/lib/storefront/types";

interface PageHeroProps {
  eyebrowLabel: string;
  heading: string;
  image: StorefrontImage;
}

/** Custom-page hero: cover image beside a dark title panel. */
export function PageHero({ eyebrowLabel, heading, image }: PageHeroProps) {
  return (
    <section className="mt-5.5 mr-7 ml-7 grid min-h-article-min grid-cols-[1.15fr_0.85fr] place-items-stretch bg-ink text-left text-text-inverse max-md:mx-3 max-md:min-h-0 max-md:grid-cols-1">
      <div className="relative min-w-0 overflow-hidden max-md:min-h-route-media-min">
        <Image
          className="absolute inset-0 h-full object-cover object-[56%_center] saturate-76"
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(min-width: 820px) 58vw, 100vw"
          priority
        />
      </div>
      <div className="relative z-2 flex flex-col justify-center bg-ink p-[clamp(45px,6vw,96px)] max-md:px-page-gutter max-md:pt-12 max-md:pb-14.5">
        <p className={eyebrow({ tone: "warm" })}>{eyebrowLabel}</p>
        <h1 className="m-0 max-w-162.5 text-balance font-heading text-page-display leading-heading font-medium tracking-heading max-md:text-page-display-mobile">
          {heading}
        </h1>
      </div>
    </section>
  );
}
