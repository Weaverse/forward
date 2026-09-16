"use client";

import { IMAGES_PLACEHOLDERS } from "@weaverse/schema";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
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

/* Shown until a product is picked (or when it no longer resolves), so a fresh
 * section keeps its real layout instead of collapsing to a notice. */
const PLACEHOLDER = {
  title: "Product title",
  description:
    "A product description appears here once a product is selected, followed by its spec list.",
  specs: [
    { label: "Weight", value: "—" },
    { label: "Material", value: "—" },
    { label: "Fit", value: "—" },
    { label: "Care", value: "—" },
  ],
};

const IMAGE_CLASS = "h-[62svh] object-cover md:h-190";

/** A single product examined in depth: description, spec list, and image. */
function ProductCaseStudy({
  eyebrowLabel,
  ctaLabel,
  loaderData,
  ...rest
}: ProductCaseStudyProps) {
  const product = loaderData?.product ?? null;
  const image = loaderData?.image ?? null;
  const specs = product?.specs ?? PLACEHOLDER.specs;
  const ctaClass = cta({ tone: "light" });

  return (
    <section
      {...elementAttributes(rest)}
      className="grid grid-cols-1 bg-ink text-text-inverse md:grid-cols-split-75"
    >
      <div className="order-2 self-center p-[clamp(50px,7vw,110px)] md:order-none">
        <p className={eyebrow({ tone: "warm" })}>{eyebrowLabel}</p>
        <h2 className="text-balance font-heading text-field-case-title leading-field-case">
          {product?.title ?? PLACEHOLDER.title}
        </h2>
        <p>{product?.description ?? PLACEHOLDER.description}</p>
        <dl className="my-8.75 border-border-dark border-t">
          {specs.map((spec) => (
            <div
              key={spec.label}
              className="flex justify-between border-border-dark border-b py-3.25"
            >
              <dt>{spec.label}</dt>
              <dd>{spec.value}</dd>
            </div>
          ))}
        </dl>
        {product ? (
          <Link className={ctaClass} href={`/products/${product.handle}`}>
            {ctaLabel}
          </Link>
        ) : (
          <span className={ctaClass}>{ctaLabel}</span>
        )}
      </div>
      {image ? (
        <Image
          className={IMAGE_CLASS}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(min-width: 820px) 55vw, 100vw"
        />
      ) : (
        /* Weaverse placeholder art: SVG on Weaverse's CDN, outside this
         * theme's `remotePatterns`, so it bypasses the optimizer. */
        <Image
          className={cn(IMAGE_CLASS, "bg-media-placeholder")}
          src={IMAGES_PLACEHOLDERS.product_3}
          alt=""
          width={1024}
          height={1024}
          unoptimized
        />
      )}
    </section>
  );
}

export default ProductCaseStudy;

export { schema } from "./schema";
