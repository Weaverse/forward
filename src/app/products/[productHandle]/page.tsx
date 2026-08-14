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

/**
 * Canonical `.accordion-list` (source `app.js:286`), filled with the
 * normalized field record: details, specs, care, and the repair commitment.
 */
function ProductFieldRecord({ product }: { product: Product }) {
  return (
    <div className="accordion-list">
      <details open>
        <summary>Why it works</summary>
        {product.detailParagraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </details>
      <details>
        <summary>Specifications</summary>
        <dl>
          {product.specs.map((row) => (
            <div key={row.label} className="spec-row">
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </details>
      <details>
        <summary>Materials + care</summary>
        <ul>
          {product.care.map((entry) => (
            <li key={entry.slice(0, 32)}>{entry}</li>
          ))}
        </ul>
      </details>
      <details>
        <summary>Repair</summary>
        <p>{product.repair}</p>
        <p>
          <Link className="text-link" href="/pages/field-repair">
            The repairs programme
          </Link>
        </p>
      </details>
    </div>
  );
}

/**
 * PDP — port of the canonical `productPage()` (source `app.js:275–291`):
 * near-black product stage, multi-frame gallery, sticky purchase panel, and
 * the cream related-products close.
 */
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
        <section className="section shell">
          <div className="section-head">
            <div>
              <p className="eyebrow">Works well with</p>
              <h2 className="h2">Complete the field system.</h2>
            </div>
          </div>
          <div className="product-grid">
            {related.map((entry) => (
              <ProductCard key={entry.handle} product={entry} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
