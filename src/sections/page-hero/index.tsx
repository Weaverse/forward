"use client";

import Image from "next/image";

import { eyebrow } from "@/lib/presentation/variants";
import type { StorefrontImage } from "@/lib/storefront/types";
import { useStorefrontContext } from "@/lib/weaverse/data-context";
import { weaverseImage } from "@/lib/weaverse/image";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";

interface PageHeroProps extends WeaverseElementProps {
  /** Used when the page itself carries no eyebrow. */
  eyebrowLabel: string;
  /** Used when the page itself carries no hero image. */
  image?: StorefrontImage | unknown;
}

/**
 * Custom-page hero: cover image beside a dark title panel.
 *
 * The title and eyebrow belong to the page, not to the template, because one
 * `PAGE` template serves every page. Only the fallbacks are settings.
 */
function PageHero({ eyebrowLabel, image, ...rest }: PageHeroProps) {
  const { page } = useStorefrontContext();
  if (page === undefined) return null;
  const resolvedImage = weaverseImage(page.heroImage ?? image);
  return (
    <section
      {...elementAttributes(rest)}
      className="mt-5.5 mr-7 ml-7 grid min-h-article-min grid-cols-[1.15fr_0.85fr] place-items-stretch bg-ink text-left text-text-inverse max-md:mx-3 max-md:min-h-0 max-md:grid-cols-1"
    >
      <div className="relative min-w-0 overflow-hidden max-md:min-h-route-media-min">
        {resolvedImage === null ? null : (
          <Image
            className="absolute inset-0 h-full object-cover object-[56%_center] saturate-76"
            src={resolvedImage.src}
            alt={resolvedImage.alt}
            width={resolvedImage.width}
            height={resolvedImage.height}
            sizes="(min-width: 820px) 58vw, 100vw"
            priority
          />
        )}
      </div>
      <div className="relative z-2 flex flex-col justify-center bg-ink p-[clamp(45px,6vw,96px)] max-md:px-page-gutter max-md:pt-12 max-md:pb-14.5">
        <p className={eyebrow({ tone: "warm" })}>
          {page.eyebrow || eyebrowLabel}
        </p>
        <h1 className="m-0 max-w-162.5 text-balance font-heading text-page-display leading-heading font-medium tracking-heading max-md:text-page-display-mobile">
          {page.title}
        </h1>
      </div>
    </section>
  );
}

export default PageHero;

export { schema } from "./schema";
