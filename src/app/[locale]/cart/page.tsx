import type { Metadata } from "next";
import { headers } from "next/headers";

import { readShopifyCart, type ShopifyCartData } from "@/lib/cart/shopify-cart";
import { ShopifyCartProvider } from "@/lib/cart/shopify-cart-react";
import { ShopifyCartView } from "./shopify-cart-view";

export const metadata: Metadata = {
  title: "Cart",
  description: "Your Forward cart.",
};

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function CartPage() {
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
