"use client";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";
import { cta, eyebrow, sectionHeading } from "@/lib/presentation/variants";
import { useStorefrontContext } from "@/lib/weaverse/data-context";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";

interface CollectionHeroProps extends WeaverseElementProps {
  eyebrowPrefix: string;
  ctaLabel: string;
  ctaHref: string;
}

/** Collection hero: wide image beside a dark title panel. */
function CollectionHero({
  eyebrowPrefix,
  ctaLabel,
  ctaHref,
  ...rest
}: CollectionHeroProps) {
  /* The collection is decided by the route, not by a merchant, so it
   * arrives through the shared data context rather than a picker. */
  const { collection } = useStorefrontContext();
  if (collection === undefined) return null;
  return (
    <section
      {...elementAttributes(rest)}
      className="relative mt-5.5 mr-7 ml-7 grid min-h-page-min grid-cols-[1.3fr_0.7fr] items-stretch overflow-hidden bg-ink text-text-inverse max-md:mx-3 max-md:min-h-0 max-md:grid-cols-1"
    >
      <div className="relative min-w-0 overflow-hidden max-md:min-h-route-media-min">
        <Image
          className="absolute inset-0 h-full object-cover object-center saturate-75 contrast-105"
          src={collection.heroImage.src}
          alt={collection.heroImage.alt}
          width={collection.heroImage.width}
          height={collection.heroImage.height}
          sizes="(min-width: 820px) 65vw, 100vw"
          priority
        />
      </div>
      <div className="relative z-2 flex flex-col justify-center bg-ink p-panel max-md:px-page-gutter max-md:pt-12 max-md:pb-14.5">
        <p className={eyebrow({ tone: "warm" })}>
          {eyebrowPrefix} {collection.fieldCode}
        </p>
        <h1 className={cn(sectionHeading({ size: "collection" }), "max-w-155")}>
          {collection.title}
        </h1>
        <p className="mt-6 mb-8 max-w-lede text-lede leading-lede text-text-dark-subtle">
          {collection.description}
        </p>
        <Link
          className={cn(cta({ intent: "signal" }), "self-start")}
          href={ctaHref}
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}

export default CollectionHero;

export { schema } from "./schema";
