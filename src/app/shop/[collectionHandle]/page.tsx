import type { Metadata } from "next";

import { ProductTile } from "@/components/product-tile";
import { SurfaceShell } from "@/components/surface-shell";
import { formatHandle, SHELL_PRODUCTS } from "@/lib/shell-fixtures";

interface CollectionPageProps {
  params: Promise<{ collectionHandle: string }>;
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { collectionHandle } = await params;
  return { title: `${formatHandle(collectionHandle)} · Shop` };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { collectionHandle } = await params;
  const collectionTitle = formatHandle(collectionHandle);
  return (
    <SurfaceShell
      eyebrow="Collection"
      title={collectionTitle}
      description={`The ${collectionTitle} collection shell. Collection imagery, descriptions, and product membership arrive with live catalog data.`}
      dataDependency={`This surface will resolve the “${collectionHandle}” collection from the Shopify Storefront API. The tiles below are approved smoke fixtures shown for layout review only.`}
    >
      <div className="grid gap-5 sm:grid-cols-3">
        {SHELL_PRODUCTS.map((product) => (
          <ProductTile key={product.handle} product={product} />
        ))}
      </div>
    </SurfaceShell>
  );
}
