import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductCard } from "@/components/product-card";
import { storefront } from "@/lib/storefront/data-source";
import type { Product } from "@/lib/storefront/types";

import { ProductDetail, ProductDetailFallback } from "./product-detail";

interface ProductPageProps {
  params: Promise<{ productHandle: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const products = await storefront.listProducts();
  return products.map((product) => ({ productHandle: product.handle }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { productHandle } = await params;
  const product = await storefront.getProduct(productHandle);
  if (product === null) {
    return { title: "Product not found" };
  }
  return { title: product.title, description: product.subtitle };
}

async function relatedProducts(product: Product) {
  const related = await Promise.all(
    product.relatedHandles.map((handle) => storefront.getProduct(handle)),
  );
  return related.filter((entry): entry is Product => entry !== null);
}

/**
 * Field record: details, specs, care, repair — colorway-independent
 * accordions styled for the carbon purchase panel.
 */
function ProductFieldRecord({ product }: { product: Product }) {
  return (
    <div className="mt-10 divide-y divide-cream/15 border-y border-cream/15">
      <details open className="group py-4">
        <summary className="field-label flex min-h-11 cursor-pointer list-none items-center justify-between text-cream">
          Details
          <span aria-hidden="true" className="text-acid group-open:hidden">
            +
          </span>
          <span
            aria-hidden="true"
            className="hidden text-acid group-open:inline"
          >
            −
          </span>
        </summary>
        <div className="space-y-3 pt-3 text-sm leading-relaxed text-cream/70">
          {product.detailParagraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
      </details>
      <details className="group py-4">
        <summary className="field-label flex min-h-11 cursor-pointer list-none items-center justify-between text-cream">
          Specifications
          <span aria-hidden="true" className="text-acid group-open:hidden">
            +
          </span>
          <span
            aria-hidden="true"
            className="hidden text-acid group-open:inline"
          >
            −
          </span>
        </summary>
        <dl className="pt-3">
          {product.specs.map((row) => (
            <div
              key={row.label}
              className="flex justify-between gap-6 border-b border-cream/10 py-2 last:border-b-0"
            >
              <dt className="field-label text-cream/60">{row.label}</dt>
              <dd className="text-right text-sm text-cream">{row.value}</dd>
            </div>
          ))}
        </dl>
      </details>
      <details className="group py-4">
        <summary className="field-label flex min-h-11 cursor-pointer list-none items-center justify-between text-cream">
          Care
          <span aria-hidden="true" className="text-acid group-open:hidden">
            +
          </span>
          <span
            aria-hidden="true"
            className="hidden text-acid group-open:inline"
          >
            −
          </span>
        </summary>
        <ul className="list-disc space-y-2 pl-5 pt-3 text-sm leading-relaxed text-cream/70">
          {product.care.map((entry) => (
            <li key={entry.slice(0, 32)}>{entry}</li>
          ))}
        </ul>
      </details>
      <details className="group py-4">
        <summary className="field-label flex min-h-11 cursor-pointer list-none items-center justify-between text-cream">
          Repair
          <span aria-hidden="true" className="text-acid group-open:hidden">
            +
          </span>
          <span
            aria-hidden="true"
            className="hidden text-acid group-open:inline"
          >
            −
          </span>
        </summary>
        <div className="space-y-3 pt-3 text-sm leading-relaxed text-cream/70">
          <p>{product.repair}</p>
          <Link
            href="/pages/repairs"
            className="field-label inline-flex min-h-11 items-center text-acid hover:text-cream"
          >
            The repairs program →
          </Link>
        </div>
      </details>
    </div>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productHandle } = await params;
  const product = await storefront.getProduct(productHandle);
  if (product === null) {
    notFound();
  }
  const related = await relatedProducts(product);
  const fieldRecord = <ProductFieldRecord product={product} />;

  return (
    <div>
      {/* Near-black product stage: gallery + sticky purchase panel. */}
      <section
        data-surface="dark"
        aria-label={`${product.title} product stage`}
        className="bg-carbon text-cream"
      >
        <Suspense
          fallback={
            <ProductDetailFallback
              product={product}
              fieldRecord={fieldRecord}
            />
          }
        >
          <ProductDetail product={product} fieldRecord={fieldRecord} />
        </Suspense>
      </section>

      {related.length > 0 ? (
        <section
          aria-labelledby="related-heading"
          className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8"
        >
          <p className="field-label text-slate">Works well with</p>
          <h2 id="related-heading" className="display-large mt-3 text-carbon">
            Completes the kit.
          </h2>
          <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((entry, index) => (
              <ProductCard
                key={entry.handle}
                product={entry}
                plate={entry.plate}
                stagger={index % 3 === 1}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
