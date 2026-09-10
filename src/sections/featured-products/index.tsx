"use client";

import type { ReactNode } from "react";
import { ProductCard } from "@/components/product-card";
import { Section } from "@/components/section";
import type { Product } from "@/lib/storefront/types";
import type { WeaverseElementProps } from "../weaverse-element";

interface FeaturedProductsProps extends WeaverseElementProps {
  children?: ReactNode;
  /** Resolved by `./loader` from the merchant's product selection. */
  loaderData?: { products: readonly Product[] };
}

/** A four-up product grid introduced by a heading, body copy, and one link. */
function FeaturedProducts({
  children,
  loaderData,
  ...rest
}: FeaturedProductsProps) {
  const products = loaderData?.products ?? [];
  return (
    <Section {...rest} aria-labelledby="home-featured-title">
      <header className="mb-11.25 grid grid-cols-feature-row items-end gap-10 max-md:grid-cols-1 max-md:gap-5">
        {children}
      </header>
      <div className="grid grid-cols-4 gap-4.5 max-md:grid-cols-2 max-sm:gap-2.5">
        {products.map((product, index) => (
          <ProductCard
            key={product.handle}
            product={product}
            priority={index < 2}
          />
        ))}
      </div>
    </Section>
  );
}

export default FeaturedProducts;

export { schema } from "./schema";
