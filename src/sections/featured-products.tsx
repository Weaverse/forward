import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import {
  eyebrow,
  SHELL_SECTION_CLASS,
  sectionHeading,
  textLink,
} from "@/lib/presentation/variants";
import type { Product } from "@/lib/storefront/types";

interface FeaturedProductsProps {
  eyebrowLabel: string;
  heading: string;
  body: string;
  linkLabel: string;
  linkHref: string;
  products: readonly Product[];
}

/** A four-up product grid introduced by a heading, body copy, and one link. */
export function FeaturedProducts({
  eyebrowLabel,
  heading,
  body,
  linkLabel,
  linkHref,
  products,
}: FeaturedProductsProps) {
  return (
    <section
      aria-labelledby="home-featured-title"
      className={SHELL_SECTION_CLASS}
    >
      <header className="mb-11.25 grid grid-cols-feature-row items-end gap-10 max-md:grid-cols-1 max-md:gap-5">
        <div>
          <p className={eyebrow()}>{eyebrowLabel}</p>
          <h2 className={sectionHeading()} id="home-featured-title">
            {heading}
          </h2>
        </div>
        <p className="m-0 max-w-copy-narrow">{body}</p>
        <Link className={textLink()} href={linkHref}>
          {linkLabel}
        </Link>
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
    </section>
  );
}
