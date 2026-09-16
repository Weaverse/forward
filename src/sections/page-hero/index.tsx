"use client";

import Image from "next/image";

import { cn } from "@/lib/cn";
import { eyebrow, sectionHeading } from "@/lib/presentation/variants";
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
      className="mx-3 mt-5.5 grid min-h-0 grid-cols-1 place-items-stretch bg-ink text-left text-text-inverse md:mx-7 md:min-h-article-min md:grid-cols-[1.15fr_0.85fr]"
    >
      <div className="relative min-h-route-media-min min-w-0 overflow-hidden md:min-h-auto">
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
      <div className="relative z-2 flex flex-col justify-center bg-ink px-page-gutter pt-12 pb-14.5 md:p-[clamp(45px,6vw,96px)]">
        <p className={eyebrow({ tone: "warm" })}>
          {page.eyebrow || eyebrowLabel}
        </p>
        <h1 className={cn(sectionHeading({ size: "page" }), "max-w-162.5")}>
          {page.title}
        </h1>
      </div>
    </section>
  );
}

export default PageHero;

export { schema } from "./schema";
