import { ProductCard } from "@/components/product-card";
import { sectionHeading } from "@/lib/presentation/variants";
import type { Product } from "@/lib/storefront/types";

interface SearchResultsProps {
  query: string;
  products: readonly Product[];
}

/** Matched products for the current search query. */
export function SearchResults({ query, products }: SearchResultsProps) {
  return (
    <section aria-label="Search results">
      <div className="mb-7.5 flex justify-between gap-5">
        <h2 className={sectionHeading({ size: "subsection" })}>
          Results for “{query}”
        </h2>
        <span
          className="font-field-meta text-caption font-medium text-text-muted tracking-field-meta uppercase"
          aria-live="polite"
        >
          {products.length} found
        </span>
      </div>
      <div className="grid grid-cols-4 gap-4.5 max-lg:grid-cols-2 max-sm:grid-cols-2 max-sm:gap-2.5">
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
