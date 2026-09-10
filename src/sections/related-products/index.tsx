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
      <div className="mb-11 flex items-end justify-between gap-7.5 max-sm:flex-col max-sm:items-start">
        <div>{children}</div>
      </div>
      <div className="grid grid-cols-4 gap-4.5 max-lg:grid-cols-2 max-sm:grid-cols-2 max-sm:gap-2.5">
        {products.map((product) => (
          <ProductCard key={product.handle} product={product} />
        ))}
      </div>
    </Section>
  );
}

export default RelatedProducts;

export { schema } from "./schema";
