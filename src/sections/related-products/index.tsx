"use client";

import { ProductCard } from "@/components/product-card";
import { Section } from "@/components/section";
import { eyebrow, sectionHeading } from "@/lib/presentation/variants";
import { useStorefrontContext } from "@/lib/weaverse/data-context";
import type { WeaverseElementProps } from "../weaverse-element";

interface RelatedProductsProps extends WeaverseElementProps {
  eyebrowLabel: string;
  heading: string;
}

/** Products that complete the system around the one being viewed. */
function RelatedProducts({
  eyebrowLabel,
  heading,
  ...rest
}: RelatedProductsProps) {
  const { products: contextProducts } = useStorefrontContext();
  const products = contextProducts ?? [];
  return (
    <Section {...rest}>
      <div className="mb-11 flex items-end justify-between gap-7.5 max-sm:flex-col max-sm:items-start">
        <div>
          <p className={eyebrow()}>{eyebrowLabel}</p>
          <h2 className={sectionHeading()}>{heading}</h2>
        </div>
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
