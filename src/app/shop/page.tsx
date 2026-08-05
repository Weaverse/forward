import type { Metadata } from "next";

import { ProductTile } from "@/components/product-tile";
import { SurfaceShell } from "@/components/surface-shell";
import { SHELL_PRODUCTS } from "@/lib/shell-fixtures";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse the full Forward catalog of shells, packs, and footwear.",
};

export default function ShopPage() {
  return (
    <SurfaceShell
      eyebrow="Shop"
      title="The full catalog"
      description="Every shell, pack, and shoe in one place. Filtering, sorting, and pagination arrive with the live catalog."
      dataDependency="This surface will list products from the Shopify Storefront API. The tiles below are approved smoke fixtures, not live catalog data."
    >
      <div className="grid gap-5 sm:grid-cols-3">
        {SHELL_PRODUCTS.map((product) => (
          <ProductTile key={product.handle} product={product} />
        ))}
      </div>
    </SurfaceShell>
  );
}
