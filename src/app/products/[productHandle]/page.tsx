import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductCard } from "@/components/product-card";
import { eyebrow, sectionHeading } from "@/lib/presentation/variants";
import { storefront } from "@/lib/storefront/data-source";
import type { Product } from "@/lib/storefront/types";

import { ProductDetail, ProductDetailFallback } from "./product-detail";

interface ProductPageProps {
  params: Promise<{ productHandle: string }>;
}

export const dynamicParams = false;

/*
 * Bounded catalog freshness. Must stay equal to `CATALOG_REVALIDATE_SECONDS`
 * (`src/lib/storefront/shopify/data-source.ts`); the literal is inlined because
 * Next requires a statically analyzable segment value, and a unit test asserts
 * the two never drift. The route stays static — no request-time API is called.
 */
export const revalidate = 3600;

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

function ProductFieldRecord({ product }: { product: Product }) {
  return (
    <div className="mt-7.5 border-border-dark border-t">
      <details className="group border-border-dark border-b" open>
        <summary className="flex min-h-13.5 list-none items-center justify-between font-body text-micro font-medium tracking-control uppercase after:text-copy-lg after:content-['+'] group-open:after:content-['−'] [&::-webkit-details-marker]:hidden">
          Why it works
        </summary>
        {product.detailParagraphs.map((paragraph) => (
          <p
            className="text-label text-text-dark-muted"
            key={paragraph.slice(0, 32)}
          >
            {paragraph}
          </p>
        ))}
      </details>
      <details className="group border-border-dark border-b">
        <summary className="flex min-h-13.5 list-none items-center justify-between font-body text-micro font-medium tracking-control uppercase after:text-copy-lg after:content-['+'] group-open:after:content-['−'] [&::-webkit-details-marker]:hidden">
          Specifications
        </summary>
        <dl>
          {product.specs.map((row) => (
            <div
              key={row.label}
              className="flex justify-between gap-5 border-border-dark border-b py-2.25 text-caption last:border-b-0"
            >
              <dt className="font-body text-micro text-text-dark-muted tracking-label uppercase">
                {row.label}
              </dt>
              <dd className="m-0 text-right text-text-inverse">{row.value}</dd>
            </div>
          ))}
        </dl>
      </details>
      <details className="group border-border-dark border-b">
        <summary className="flex min-h-13.5 list-none items-center justify-between font-body text-micro font-medium tracking-control uppercase after:text-copy-lg after:content-['+'] group-open:after:content-['−'] [&::-webkit-details-marker]:hidden">
          Materials + care
        </summary>
        <ul className="mt-0 mb-prose-block pl-[1.2em]">
          {product.care.map((entry) => (
            <li className="text-label text-text-muted" key={entry.slice(0, 32)}>
              {entry}
            </li>
          ))}
        </ul>
      </details>
      <details className="group border-border-dark border-b">
        <summary className="flex min-h-13.5 list-none items-center justify-between font-body text-micro font-medium tracking-control uppercase after:text-copy-lg after:content-['+'] group-open:after:content-['−'] [&::-webkit-details-marker]:hidden">
          Repair
        </summary>
        <p className="text-label text-text-dark-muted">{product.repair}</p>
        <p>
          <Link
            className="inline-flex min-h-touch items-center gap-3.5 border-text-inverse border-b font-body text-ui font-medium tracking-link uppercase after:text-control-lg after:font-normal after:content-['→'] after:transition-transform after:duration-200 after:ease-standard hover:after:translate-x-1.25"
            href="/pages/field-repair"
          >
            The repairs programme
          </Link>
        </p>
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
    <>
      <Suspense
        fallback={
          <ProductDetailFallback product={product} fieldRecord={fieldRecord} />
        }
      >
        <ProductDetail product={product} fieldRecord={fieldRecord} />
      </Suspense>

      {related.length > 0 ? (
        <section className="mx-auto w-full max-w-page px-page-gutter py-section-block">
          <div className="mb-11 flex items-end justify-between gap-7.5 max-sm:flex-col max-sm:items-start">
            <div>
              <p className={eyebrow()}>Works well with</p>
              <h2 className={sectionHeading()}>Complete the field system.</h2>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4.5 max-lg:grid-cols-2 max-sm:grid-cols-2 max-sm:gap-2.5">
            {related.map((entry) => (
              <ProductCard key={entry.handle} product={entry} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
