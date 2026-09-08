"use client";

import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { cta, eyebrow, sectionHeading } from "@/lib/presentation/variants";
import type { Product } from "@/lib/storefront/types";
import { useStorefrontContext } from "@/lib/weaverse/data-context";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";

interface CollectionGridProps extends WeaverseElementProps {
  eyebrowLabel: string;
  heading: string;
  ctaLabel: string;
  ctaHref: string;
}

/** Dark product grid for a collection, introduced by a heading and one link. */
function CollectionGrid({
  eyebrowLabel,
  heading,
  ctaLabel,
  ctaHref,
  ...rest
}: CollectionGridProps) {
  const { collectionProducts } = useStorefrontContext();
  const products = collectionProducts ?? [];
  return (
    <section
      {...elementAttributes(rest)}
      className="bg-surface-dark py-section-block text-text-inverse"
    >
      <div className="mx-auto w-full max-w-page px-page-gutter">
        <div className="mb-11 flex items-end justify-between gap-7.5 max-sm:flex-col max-sm:items-start">
          <div>
            <p className={eyebrow()}>{eyebrowLabel}</p>
            <h2 className={sectionHeading()}>{heading}</h2>
          </div>
          <Link className={cta({ intent: "light" })} href={ctaHref}>
            {ctaLabel}
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-4.5 max-lg:grid-cols-2 max-sm:grid-cols-2 max-sm:gap-2.5">
          {products.map((product) => (
            <ProductCard key={product.handle} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CollectionGrid;

export { schema } from "./schema";
