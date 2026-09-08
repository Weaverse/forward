"use client";

import Image from "next/image";
import Link from "next/link";

import {
  eyebrow,
  SHELL_SECTION_CLASS,
  textLink,
} from "@/lib/presentation/variants";
import type { StorefrontImage } from "@/lib/storefront/types";
import { useStorefrontContext } from "@/lib/weaverse/data-context";
import { weaverseImage } from "@/lib/weaverse/image";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";

interface SystemManifestProps extends WeaverseElementProps {
  eyebrowLabel: string;
  heading: string;
  body: string;
  /** A Builder image value, a StorefrontImage, or nothing. */
  image?: StorefrontImage | unknown;
  linkLabel: string;
  /** Omitted when no article resolves; the link is then not rendered. */
  linkHref?: string;
}

/** An offset image beside the system story and its product manifest list. */
function SystemManifest({
  eyebrowLabel,
  heading,
  body,
  image,
  linkLabel,
  linkHref,
  ...rest
}: SystemManifestProps) {
  const { collectionProducts } = useStorefrontContext();
  const products = collectionProducts ?? [];
  const resolvedImage = weaverseImage(image);
  return (
    <section {...elementAttributes(rest)} className={SHELL_SECTION_CLASS}>
      <div className="grid grid-cols-[0.8fr_1.2fr] items-center gap-[clamp(50px,10vw,150px)] max-md:grid-cols-1">
        {resolvedImage === null ? null : (
          <div className="translate-y-20 shadow-collection-feature max-md:translate-y-0 max-md:shadow-collection-feature-mobile">
            <Image
              className="aspect-4/5 object-cover"
              src={resolvedImage.src}
              alt={resolvedImage.alt}
              width={resolvedImage.width}
              height={resolvedImage.height}
              sizes="(min-width: 820px) 38vw, 100vw"
              loading="lazy"
            />
          </div>
        )}
        <div>
          <p className={eyebrow()}>{eyebrowLabel}</p>
          <h2 className="mb-7 text-balance font-heading text-heading-2 leading-heading font-medium tracking-heading">
            {heading}
          </h2>
          <p className="mb-7.5 max-w-lede text-lede leading-lede text-text-muted">
            {body}
          </p>
          <ul className="my-8 list-none border-border-subtle border-t p-0">
            {products.map((product) => (
              <li
                className="flex min-h-14.5 items-center justify-between border-border-subtle border-b font-body text-micro font-bold"
                key={product.handle}
              >
                <span>{product.title}</span>
                <span>{product.category}</span>
              </li>
            ))}
          </ul>
          {linkHref !== undefined ? (
            <Link className={textLink()} href={linkHref}>
              {linkLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default SystemManifest;

export { schema } from "./schema";
