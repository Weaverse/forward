import type { Metadata } from "next";
import { headers } from "next/headers";

import { readShopifyCart, type ShopifyCartData } from "@/lib/cart/shopify-cart";
import { ShopifyCartProvider } from "@/lib/cart/shopify-cart-react";
import { DEFAULT_LOCALE, parseLocale } from "@/lib/i18n/locales";
import { translatedMetadata } from "@/lib/i18n/translator";
import { ShopifyCartView } from "./shopify-cart-view";

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  return translatedMetadata(params, {
    title: "cart.metaTitle",
    description: "cart.metaDescription",
    robots: { index: false, follow: false },
  });
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const requestHeaders = await headers();
  /* The route's market: the cookie still holds the previous page's. */
  const locale = parseLocale((await params).locale) ?? DEFAULT_LOCALE;
  const data: ShopifyCartData = await readShopifyCart(
    new Request("https://forward.local/api/cart", {
      headers: requestHeaders,
    }),
    locale,
  );
  return (
    <ShopifyCartProvider initialData={data}>
      <ShopifyCartView />
    </ShopifyCartProvider>
  );
}
