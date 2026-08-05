import type { Metadata } from "next";

import { CartView } from "@/components/cart-view";
import type { DemoCartLine } from "@/lib/demo-cart/cart-logic";
import { lineKey } from "@/lib/demo-cart/cart-logic";
import { storefront } from "@/lib/storefront/data-source";
import {
  productColorwayHref,
  resolveColorway,
} from "@/lib/storefront/product-state";

export const metadata: Metadata = {
  title: "Cart",
  description: "Your Forward demo cart.",
};

/** Resolves the demo seed lines against the catalog on the server. */
async function buildSeedLines(): Promise<readonly DemoCartLine[]> {
  const seed = await storefront.getDemoCartSeed();
  const lines: DemoCartLine[] = [];
  for (const entry of seed) {
    const product = await storefront.getProduct(entry.productHandle);
    if (product === null) {
      continue;
    }
    const colorway = resolveColorway(product, entry.colorwayId);
    lines.push({
      key: lineKey(product.handle, colorway.id, entry.size),
      productHandle: product.handle,
      title: product.title,
      colorwayId: colorway.id,
      colorwayName: colorway.name,
      size: entry.size,
      quantity: entry.quantity,
      unitPrice: product.price,
      image: colorway.images.primary,
      href: productColorwayHref(product, colorway.id),
    });
  }
  return lines;
}

export default async function CartPage() {
  const seedLines = await buildSeedLines();

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8">
      <header className="max-w-2xl">
        <p className="field-label text-clay">Staging area · demo only</p>
        <h1 className="mt-3 font-display text-4xl text-pine sm:text-5xl">
          Cart
        </h1>
      </header>
      <div className="mt-8">
        <CartView seedLines={seedLines} />
      </div>
    </div>
  );
}
