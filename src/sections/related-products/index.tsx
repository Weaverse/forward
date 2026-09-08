import { ProductCard } from "@/components/product-card";
import {
  eyebrow,
  SHELL_SECTION_CLASS,
  sectionHeading,
} from "@/lib/presentation/variants";
import type { Product } from "@/lib/storefront/types";

interface RelatedProductsProps {
  eyebrowLabel: string;
  heading: string;
  products: readonly Product[];
}

/** Products that complete the system around the one being viewed. */
export function RelatedProducts({
  eyebrowLabel,
  heading,
  products,
}: RelatedProductsProps) {
  return (
    <section className={SHELL_SECTION_CLASS}>
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
    </section>
  );
}
