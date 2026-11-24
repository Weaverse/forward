"use client";

import type { ShopifyRouteTemplates } from "@shopify/hydrogen";
import { ShopifyScripts as HydrogenShopifyScripts } from "@shopify/hydrogen/react";
import { useRouter } from "next/navigation";
import { type ComponentProps, useEffect } from "react";

type HydrogenProps = ComponentProps<typeof HydrogenShopifyScripts>;

interface ShopifyScriptsProps {
  shop: HydrogenProps["shop"];
  i18n: NonNullable<HydrogenProps["i18n"]>;
  analytics: HydrogenProps["analytics"];
  routes: ShopifyRouteTemplates;
  /** The market's cart page. Passed in: this renders in `<head>`, outside the
   * `LocaleProvider`. */
  cartPath: string;
}

/**
 * Points Standard Actions' `openCart` at the cart page, Forward's only full
 * cart view. Standard Actions is a module script: hydration can run before it
 * (`readyState` is already `interactive` then), but never after `load`.
 */
function configureOpenCart(openCart: () => void): () => void {
  function configure(): boolean {
    const action = window.Shopify?.actions?.openCart;
    action?.configure({ handler: async () => openCart() });
    return action !== undefined;
  }
  if (configure() || document.readyState === "complete") {
    return () => {};
  }
  window.addEventListener("load", configure, { once: true });
  return () => window.removeEventListener("load", configure);
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
  cartPath,
}: ShopifyScriptsProps) {
  const router = useRouter();

  useEffect(
    () => configureOpenCart(() => router.push(cartPath)),
    [router, cartPath],
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
