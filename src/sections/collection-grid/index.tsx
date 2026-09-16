"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { ProductCard } from "@/components/product-card";
import { cta } from "@/lib/presentation/variants";
import { useStorefrontContext } from "@/lib/weaverse/data-context";
import {
  elementAttributes,
  type WeaverseElementProps,
} from "../weaverse-element";

interface CollectionGridProps extends WeaverseElementProps {
  children?: ReactNode;
  ctaLabel: string;
  ctaHref: string;
}

/** Dark product grid for a collection, introduced by a heading and one link. */
function CollectionGrid({
  children,
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
        <div className="mb-11 flex flex-col items-start justify-between gap-7.5 sm:flex-row sm:items-end">
          <div>{children}</div>
          <Link className={cta({ tone: "light" })} href={ctaHref}>
            {ctaLabel}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4.5 lg:grid-cols-4">
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
