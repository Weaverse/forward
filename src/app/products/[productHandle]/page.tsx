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

/** Field record: details, specs, care, repair — colorway-independent. */
function ProductFieldRecord({ product }: { product: Product }) {
  return (
    <div className="mt-8 divide-y divide-mist border-y border-mist">
      <details open className="group py-4">
        <summary className="field-label flex min-h-11 cursor-pointer list-none items-center justify-between text-ink">
          Details
          <span aria-hidden="true" className="group-open:hidden">
            +
          </span>
          <span aria-hidden="true" className="hidden group-open:inline">
            −
          </span>
        </summary>
        <div className="space-y-3 pt-3 text-sm leading-relaxed text-slate">
          <p>{product.description}</p>
          {product.detailParagraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
      </details>
      <details className="group py-4">
        <summary className="field-label flex min-h-11 cursor-pointer list-none items-center justify-between text-ink">
          Specifications
          <span aria-hidden="true" className="group-open:hidden">
            +
          </span>
          <span aria-hidden="true" className="hidden group-open:inline">
            −
          </span>
        </summary>
        <dl className="pt-3">
          {product.specs.map((row) => (
            <div
              key={row.label}
              className="flex justify-between gap-6 border-b border-mist/60 py-2 last:border-b-0"
            >
              <dt className="field-label text-slate">{row.label}</dt>
              <dd className="text-right text-sm text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
      </details>
      <details className="group py-4">
        <summary className="field-label flex min-h-11 cursor-pointer list-none items-center justify-between text-ink">
          Care
          <span aria-hidden="true" className="group-open:hidden">
            +
          </span>
          <span aria-hidden="true" className="hidden group-open:inline">
            −
          </span>
        </summary>
        <ul className="list-disc space-y-2 pl-5 pt-3 text-sm leading-relaxed text-slate">
          {product.care.map((entry) => (
            <li key={entry.slice(0, 32)}>{entry}</li>
          ))}
        </ul>
      </details>
      <details className="group py-4">
        <summary className="field-label flex min-h-11 cursor-pointer list-none items-center justify-between text-ink">
          Repair
          <span aria-hidden="true" className="group-open:hidden">
            +
          </span>
          <span aria-hidden="true" className="hidden group-open:inline">
            −
          </span>
        </summary>
        <div className="space-y-3 pt-3 text-sm leading-relaxed text-slate">
          <p>{product.repair}</p>
          <Link
            href="/pages/repairs"
            className="field-label inline-flex min-h-11 items-center text-clay hover:text-clay-deep"
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
    <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8">
      <nav aria-label="Breadcrumb">
        <ol className="field-label flex flex-wrap items-center gap-2 text-slate">
          <li>
            <Link href="/shop" className="hover:text-pine">
              Shop
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">
            {product.title}
          </li>
        </ol>
      </nav>

      <Suspense
        fallback={
          <ProductDetailFallback product={product} fieldRecord={fieldRecord} />
        }
      >
        <ProductDetail product={product} fieldRecord={fieldRecord} />
      </Suspense>

      {related.length > 0 ? (
        <section aria-labelledby="related-heading" className="mt-16">
          <h2
            id="related-heading"
            className="font-display text-2xl text-pine sm:text-3xl"
          >
            Completes the kit
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((entry) => (
              <ProductCard
                key={entry.handle}
                product={entry}
                plate={entry.plate}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
