"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { Section } from "@/components/section";
import { sectionHeading, textLink } from "@/lib/presentation/variants";
import type { Product } from "@/lib/storefront/types";
import type { WeaverseElementProps } from "../weaverse-element";

interface ProductStripProps extends WeaverseElementProps {
  eyebrowLabel: string;
  heading: string;
  linkLabel: string;
  linkHref: string;
  /** Resolved by `./loader` from the merchant's product selection. */
  loaderData?: { products: readonly Product[] };
}

/** A titled row of product cards with a single catalog link. */
function ProductStrip({
  eyebrowLabel,
  heading,
  linkLabel,
  linkHref,
  loaderData,
  ...rest
}: ProductStripProps) {
  const products = loaderData?.products ?? [];
  return (
    <Section {...rest}>
      <header className="mb-11.25 grid grid-cols-feature-row items-end gap-10 max-md:grid-cols-1 max-md:gap-5">
        <div>
          <p className="m-0 max-w-copy-narrow font-field-meta text-ui leading-meta font-medium text-signal-strong tracking-field-meta uppercase">
            {eyebrowLabel}
          </p>
          <h2 className={sectionHeading()}>{heading}</h2>
        </div>
        <Link className={textLink()} href={linkHref}>
          {linkLabel}
        </Link>
      </header>
      <div className="grid grid-cols-4 gap-4.5 max-lg:grid-cols-2 max-sm:grid-cols-2 max-sm:gap-2.5">
        {products.map((product) => (
          <ProductCard key={product.handle} product={product} />
        ))}
      </div>
    </Section>
  );
}

export default ProductStrip;

export { schema } from "./schema";
