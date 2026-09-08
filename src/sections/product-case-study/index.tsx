"use client";

import Image from "next/image";
import Link from "next/link";
import { cta, eyebrow } from "@/lib/presentation/variants";
import type { Product, StorefrontImage } from "@/lib/storefront/types";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";

interface ProductCaseStudyProps extends WeaverseElementProps {
  eyebrowLabel: string;
  ctaLabel: string;
  /** Resolved by `./loader` from the merchant's product selection. */
  loaderData?: { product: Product; image: StorefrontImage } | null;
}

/** A single product examined in depth: description, spec list, and image. */
function ProductCaseStudy({
  eyebrowLabel,
  ctaLabel,
  loaderData,
  ...rest
}: ProductCaseStudyProps) {
  /* No selection, or a product that no longer resolves: render nothing rather
   * than a case study with no case. */
  /* No product selected, or one that no longer resolves.
   *
   * Returning nothing is right on the storefront, but wrong inside Studio: a
   * section that renders nothing cannot be selected, so a merchant could never
   * reach it to pick a product. When the runtime is rendering us — which the
   * identity attributes tell us — keep a selectable placeholder instead. */
  if (!loaderData) {
    const attributes = elementAttributes(rest);
    if (attributes["data-wv-id"] === undefined) {
      return null;
    }
    return (
      <section
        {...attributes}
        className="grid min-h-64 place-items-center bg-ink p-panel-wide text-text-inverse"
      >
        <p className={eyebrow()}>Select a product for this case study</p>
      </section>
    );
  }
  const { image, product } = loaderData;

  return (
    <section
      {...elementAttributes(rest)}
      className="grid grid-cols-split-75 bg-ink text-text-inverse max-md:grid-cols-1"
    >
      <div className="self-center p-[clamp(50px,7vw,110px)] max-md:order-2">
        <p className={eyebrow()}>{eyebrowLabel}</p>
        <h2 className="text-balance font-heading text-field-case-title leading-field-case">
          {product.title}
        </h2>
        <p>{product.description}</p>
        <dl className="my-8.75 border-border-dark border-t">
          {product.specs.map((spec) => (
            <div
              key={spec.label}
              className="flex justify-between border-border-dark border-b py-3.25"
            >
              <dt>{spec.label}</dt>
              <dd>{spec.value}</dd>
            </div>
          ))}
        </dl>
        <Link
          className={cta({ intent: "light" })}
          href={`/products/${product.handle}`}
        >
          {ctaLabel}
        </Link>
      </div>
      <Image
        className="h-190 object-cover max-md:h-[62svh]"
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes="(min-width: 820px) 55vw, 100vw"
      />
    </section>
  );
}

export default ProductCaseStudy;

export { schema } from "./schema";
