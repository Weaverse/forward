import type { Metadata } from "next";
import { headers } from "next/headers";

import { CartView } from "@/components/cart-view";
import { ShopifyCartView } from "@/components/shopify-cart-view";
import { readShopifyCart, type ShopifyCartData } from "@/lib/cart/shopify-cart";
import { ShopifyCartProvider } from "@/lib/cart/shopify-cart-react";
import type { DemoCartLine } from "@/lib/demo-cart/cart-logic";
import { lineKey } from "@/lib/demo-cart/cart-logic";
import {
  storefront,
  storefrontRuntimeMode,
} from "@/lib/storefront/data-source";
import {
  productSelectionHref,
  resolveColorway,
  resolveProductSelection,
} from "@/lib/storefront/product-state";

export const metadata: Metadata = {
  title: "Cart",
  description: "Your Forward cart.",
};

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

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
    const selection = resolveProductSelection(product, colorway.id, {
      Size: entry.size,
    });
    lines.push({
      key: lineKey(product.handle, selection.variant.id),
      variantId: selection.variant.id,
      productHandle: product.handle,
      title: product.title,
      colorwayId: colorway.id,
      colorwayName: colorway.name,
      selectedOptions: selection.selectedOptions,
      quantity: entry.quantity,
      unitPrice: selection.variant.price,
      image: colorway.images.primary,
      href: productSelectionHref(
        product,
        colorway.id,
        selection.selectedOptions,
      ),
    });
  }
  return lines;
}

export default async function CartPage() {
  if (storefrontRuntimeMode === "shopify") {
    const requestHeaders = await headers();
    const data: ShopifyCartData = await readShopifyCart(
      new Request("https://forward.local/api/cart", {
        headers: requestHeaders,
      }),
    );
    return (
      <ShopifyCartProvider initialData={data}>
        <ShopifyCartView />
      </ShopifyCartProvider>
    );
  }

  const seedLines = await buildSeedLines();

  /* CartView owns the page shell so the live item count can join the heading. */
  return <CartView seedLines={seedLines} />;
}
