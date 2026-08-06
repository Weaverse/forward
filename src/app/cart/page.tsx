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

// Next requires a literal route-segment value. Keep this equal to
// CATALOG_REVALIDATE_SECONDS in the adapter contract test.
export const revalidate = 3600;

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

  /* CartView owns the canonical `.cart-page` shell so the live item count can
     join the heading. */
  return <CartView seedLines={seedLines} />;
}
