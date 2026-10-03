import type { Metadata } from "next";
import { headers } from "next/headers";

import { readShopifyCart, type ShopifyCartData } from "@/lib/cart/shopify-cart";
import { ShopifyCartProvider } from "@/lib/cart/shopify-cart-react";
import { DEFAULT_LOCALE, parseLocale } from "@/lib/i18n/locales";
import { getTranslator } from "@/lib/i18n/translator";
import { ShopifyCartView } from "./shopify-cart-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const t = await getTranslator(
    parseLocale((await params).locale) ?? DEFAULT_LOCALE,
  );
  return {
    title: t("cart.metaTitle"),
    description: t("cart.metaDescription"),
    robots: { index: false, follow: false },
  };
}

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
