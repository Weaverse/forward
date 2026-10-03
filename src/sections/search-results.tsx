import { ProductCard } from "@/components/product-card";
import { T } from "@/lib/i18n/t";
import { sectionHeading } from "@/lib/presentation/variants";
import type { Product } from "@/lib/storefront/types";

interface SearchResultsProps {
  /** Accessible name of the results region, already translated. */
  label: string;
  query: string;
  products: readonly Product[];
}

/** Matched products for the current search query. */
export function SearchResults({ label, query, products }: SearchResultsProps) {
  return (
    <section aria-label={label}>
      <div className="mb-7.5 flex justify-between gap-5">
        <h2 className={sectionHeading({ size: "subsection" })}>
          <T k="search.resultsHeading" vars={{ query }} />
        </h2>
        <span
          className="font-field-meta text-caption font-medium text-text-muted tracking-field-meta uppercase"
          aria-live="polite"
        >
          <T k="search.found" vars={{ count: products.length }} />
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4.5 lg:grid-cols-4">
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
