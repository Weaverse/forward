"use client";

import type { ReactNode } from "react";

import { ProductCard } from "@/components/product-card";
import { Section } from "@/components/section";
import { useStorefrontContext } from "@/lib/weaverse/data-context";
import type { WeaverseElementProps } from "../weaverse-element";

interface RelatedProductsProps extends WeaverseElementProps {
  children?: ReactNode;
}

/** Products that complete the system around the one being viewed. */
function RelatedProducts({ children, ...rest }: RelatedProductsProps) {
  const { products: contextProducts } = useStorefrontContext();
  const products = contextProducts ?? [];
  return (
    <Section {...rest}>
      <div className="mb-11 flex flex-col items-start justify-between gap-7.5 sm:flex-row sm:items-end">
        <div>{children}</div>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4.5 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.handle} product={product} />
        ))}
      </div>
    </Section>
  );
}

export default RelatedProducts;

export { schema } from "./schema";
