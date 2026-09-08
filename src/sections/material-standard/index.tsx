"use client";

import Image from "next/image";
import Link from "next/link";
import {
  cta,
  eyebrow,
  sectionHeading,
  textLink,
} from "@/lib/presentation/variants";
import type { StorefrontImage } from "@/lib/storefront/types";
import { weaverseImage } from "@/lib/weaverse/image";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";

interface MaterialStandardProps extends WeaverseElementProps {
  eyebrowLabel: string;
  heading: string;
  body: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  /** A Builder image value, a StorefrontImage, or nothing. */
  image?: StorefrontImage | unknown;
}

/** Dark editorial band pairing the material story with a wide image. */
function MaterialStandard({
  eyebrowLabel,
  heading,
  body,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  image,
  ...rest
}: MaterialStandardProps) {
  const resolvedImage = weaverseImage(image);
  return (
    <section
      {...elementAttributes(rest)}
      className="grid grid-cols-split-85 bg-ink text-text-inverse max-md:grid-cols-1"
    >
      <div className="flex flex-col justify-center p-[clamp(48px,7vw,110px)]">
        <p className={eyebrow()}>{eyebrowLabel}</p>
        <h2 className={sectionHeading()}>{heading}</h2>
        <p className="mb-prose-paragraph max-w-state text-copy-lg text-text-dark-subtle">
          {body}
        </p>
        <div className="mt-8.5 flex flex-wrap items-center gap-6">
          <Link className={cta({ intent: "light" })} href={primaryCtaHref}>
            {primaryCtaLabel}
          </Link>
          <Link className={textLink()} href={secondaryCtaHref}>
            {secondaryCtaLabel}
          </Link>
        </div>
      </div>
      {resolvedImage === null ? null : (
        <Image
          className="h-175 object-cover saturate-70 max-md:h-[58svh]"
          src={resolvedImage.src}
          alt={resolvedImage.alt}
          width={resolvedImage.width}
          height={resolvedImage.height}
          sizes="(min-width: 820px) 55vw, 100vw"
        />
      )}
    </section>
  );
}

export default MaterialStandard;

export { schema } from "./schema";
