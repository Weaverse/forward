"use client";

import Image from "next/image";
import Link from "next/link";
import { Section } from "@/components/section";
import { eyebrow, sectionHeading, textLink } from "@/lib/presentation/variants";
import type { StorefrontImage } from "@/lib/storefront/types";
import { weaverseImage } from "@/lib/weaverse/image";
import type { WeaverseElementProps } from "../weaverse-element";

interface PageOriginProps extends WeaverseElementProps {
  eyebrowLabel: string;
  /** Line breaks are preserved, so an authored break stays where it was put. */
  heading: string;
  body: string;
  linkLabel: string;
  linkHref: string;
  image?: StorefrontImage | unknown;
}

/** Closing custom-page band: heading beside a wide image and one link. */
function PageOrigin({
  eyebrowLabel,
  heading,
  body,
  linkLabel,
  linkHref,
  image,
  ...rest
}: PageOriginProps) {
  const resolvedImage = weaverseImage(image);
  return (
    <Section {...rest}>
      <div className="grid grid-cols-split-75 items-start gap-20 max-md:grid-cols-1">
        <div>
          <p className={eyebrow()}>{eyebrowLabel}</p>
          <h2 className={sectionHeading({ className: "whitespace-pre-line" })}>
            {heading}
          </h2>
        </div>
        <div>
          {resolvedImage === null ? null : (
            <Image
              className="aspect-5/4 object-cover"
              src={resolvedImage.src}
              alt={resolvedImage.alt}
              width={resolvedImage.width}
              height={resolvedImage.height}
              sizes="(min-width: 820px) 60vw, 100vw"
              loading="lazy"
            />
          )}
          <p className="max-w-lede text-lede leading-lede text-text-muted">
            {body}
          </p>
          <Link className={textLink()} href={linkHref}>
            {linkLabel}
          </Link>
        </div>
      </div>
    </Section>
  );
}

export default PageOrigin;

export { schema } from "./schema";
