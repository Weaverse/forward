import type { Metadata } from "next";

import { SurfaceShell } from "@/components/surface-shell";
import { formatHandle, SHELL_PRODUCTS } from "@/lib/shell-fixtures";

interface ProductPageProps {
  params: Promise<{ productHandle: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { productHandle } = await params;
  return { title: formatHandle(productHandle) };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { productHandle } = await params;
  const fixture = SHELL_PRODUCTS.find(
    (product) => product.handle === productHandle,
  );
  const title = fixture?.title ?? formatHandle(productHandle);
  return (
    <SurfaceShell
      eyebrow="Product"
      title={title}
      description={
        fixture?.tagline ??
        "Product details, media, variants, and purchase options arrive with live catalog data."
      }
      dataDependency={`This surface will resolve the “${productHandle}” product from the Shopify Storefront API. Add-to-cart, pricing, variants, and media are intentionally absent in the foundation slice.`}
    >
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div
          aria-hidden="true"
          className="flex aspect-[4/3] items-center justify-center border border-mist bg-parchment font-display text-6xl font-semibold uppercase text-moss/50"
        >
          {title.charAt(0)}
        </div>
        <div className="space-y-4">
          <div className="border border-mist bg-parchment px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">
              Price
            </p>
            <p className="mt-1 text-sm text-slate">
              Pricing arrives with live catalog data.
            </p>
          </div>
          <div className="border border-mist bg-parchment px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moss">
              Purchase
            </p>
            <p className="mt-1 text-sm text-slate">
              Variant selection and add-to-cart are wired up when cart mutations
              land in a later slice.
            </p>
          </div>
        </div>
      </div>
    </SurfaceShell>
  );
}
