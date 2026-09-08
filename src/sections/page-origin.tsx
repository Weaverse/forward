import Image from "next/image";
import Link from "next/link";

import {
  eyebrow,
  SHELL_SECTION_CLASS,
  sectionHeading,
  textLink,
} from "@/lib/presentation/variants";
import type { StorefrontImage } from "@/lib/storefront/types";

interface PageOriginProps {
  eyebrowLabel: string;
  /** Rendered verbatim, so a manual line break stays where it was authored. */
  heading: React.ReactNode;
  body: string;
  linkLabel: string;
  linkHref: string;
  image: StorefrontImage;
}

/** Closing custom-page band: heading beside a wide image and one link. */
export function PageOrigin({
  eyebrowLabel,
  heading,
  body,
  linkLabel,
  linkHref,
  image,
}: PageOriginProps) {
  return (
    <section className={SHELL_SECTION_CLASS}>
      <div className="grid grid-cols-split-75 items-start gap-20 max-md:grid-cols-1">
        <div>
          <p className={eyebrow()}>{eyebrowLabel}</p>
          <h2 className={sectionHeading()}>{heading}</h2>
        </div>
        <div>
          <Image
            className="aspect-5/4 object-cover"
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(min-width: 820px) 60vw, 100vw"
            loading="lazy"
          />
          <p className="max-w-lede text-lede leading-lede text-text-muted">
            {body}
          </p>
          <Link className={textLink()} href={linkHref}>
            {linkLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
