"use client";

import type { ShopifyRouteTemplates } from "@shopify/hydrogen";
import { ShopifyScripts as HydrogenShopifyScripts } from "@shopify/hydrogen/react";
import { useRouter } from "next/navigation";
import { type ComponentProps, useEffect } from "react";
import { useLocale } from "@/lib/i18n/locale-context";
import { localizePath } from "@/lib/i18n/locales";

type HydrogenProps = ComponentProps<typeof HydrogenShopifyScripts>;

interface ShopifyScriptsProps {
  shop: HydrogenProps["shop"];
  i18n: NonNullable<HydrogenProps["i18n"]>;
  analytics: HydrogenProps["analytics"];
  routes: ShopifyRouteTemplates;
}

/**
 * Points Standard Actions' `openCart` at the cart page, Forward's only full
 * cart view. Standard Actions is a module script, so it has run by
 * `DOMContentLoaded` at the latest.
 */
function configureOpenCart(openCart: () => void): () => void {
  function configure() {
    window.Shopify?.actions?.openCart?.configure({
      handler: async () => openCart(),
    });
  }
  if (document.readyState !== "loading") {
    configure();
    return () => {};
  }
  document.addEventListener("DOMContentLoaded", configure, { once: true });
  return () => document.removeEventListener("DOMContentLoaded", configure);
}

/**
 * Shopify's browser runtime: Standard Actions, analytics, consent and WebMCP,
 * with storefront URLs resolved through Forward's routes and opened by the
 * App Router instead of a full page load.
 */
export function ShopifyScripts({
  shop,
  i18n,
  analytics,
  routes,
}: ShopifyScriptsProps) {
  const router = useRouter();
  const locale = useLocale();

  useEffect(
    () => configureOpenCart(() => router.push(localizePath("/cart", locale))),
    [router, locale],
  );

  return (
    <HydrogenShopifyScripts
      analytics={analytics}
      i18n={i18n}
      navigate={(url) => router.push(url)}
      routes={routes}
      shop={shop}
    />
  );
}
