"use client";

import type {
  CartLine,
  MoneyV2,
  ProductInput,
  ProductVariantInput,
} from "@shopify/hydrogen";
import {
  createCartComponents,
  createProductComponents,
} from "@shopify/hydrogen/react";
import { type ReactNode, useEffect } from "react";
import { useLocale } from "@/lib/i18n/locale-context";
import type { LocaleId } from "@/lib/i18n/locales";
import { formatMoney } from "@/lib/storefront/format";
import type { Product } from "@/lib/storefront/types";

type CartHandlers = typeof import("./shopify-cart").shopifyCartHandlers;

export type ShopifyCartLineData = CartLine;
export type ShopifyMoney = MoneyV2;

export const {
  CartProvider: ShopifyCartProvider,
  useCart: useShopifyCart,
  useCartActions: useShopifyCartActions,
  useCartForm: useShopifyCartForm,
} = createCartComponents<CartHandlers>();

export const {
  ProductProvider: ShopifyProductProvider,
  useProductForm: useShopifyProductForm,
} = createProductComponents<ProductInput>();

/** The most of one variant a single add or line may hold. */
export const MAX_LINE_QUANTITY = 9;

/* Module scope, so it survives Next remounting the locale layout. */
let shownMarket: LocaleId | null = null;

/**
 * Reloads the cart when the shopper switches market. Switching is a client
 * navigation, so without this the cart keeps the previous market's totals
 * until a reload. The reload asks the server again from the new page, which
 * moves the cart into the new market.
 */
function CartMarketSync() {
  const locale = useLocale();
  const { refresh } = useShopifyCartActions();
  useEffect(() => {
    if (shownMarket !== null && shownMarket !== locale) {
      refresh();
    }
    shownMarket = locale;
  }, [locale, refresh]);
  return null;
}

export function ShopifyCartRuntime({ children }: { children: ReactNode }) {
  return (
    <ShopifyCartProvider>
      <CartMarketSync />
      {children}
    </ShopifyCartProvider>
  );
}

/** Renders Shopify cart money, or an em dash when it is absent or off-currency. */
export function formatShopifyMoney(
  value: ShopifyMoney | undefined,
  locale: LocaleId,
): string {
  if (value === undefined) return "—";
  return formatMoney(
    { amount: Number(value.amount), currencyCode: value.currencyCode },
    locale,
  );
}

export function toHydrogenProductInput(
  product: Product,
  colorwayId: string,
  selectedVariantId?: string,
): ProductInput {
  const colorway = product.colorways.find(({ id }) => id === colorwayId);
  if (colorway === undefined) {
    throw new Error("Product colorway is unavailable.");
  }
  const variants: ProductVariantInput[] = product.variants
    .filter((variant) => variant.colorwayId === colorwayId)
    .map((variant) => ({
      id: variant.id,
      title:
        variant.selectedOptions.map(({ value }) => value).join(" / ") ||
        "Default",
      availableForSale: variant.availableForSale,
      selectedOptions: [
        { name: "Color", value: colorway.name },
        ...variant.selectedOptions.map((option) => ({ ...option })),
      ],
      price: {
        amount: String(variant.price.amount),
        currencyCode: variant.price.currencyCode,
      },
    }));
  const selectedOrFirstAvailableVariant =
    variants.find((variant) => variant.id === selectedVariantId) ??
    variants.find((variant) => variant.availableForSale) ??
    variants[0] ??
    null;
  const options = [
    {
      name: "Color",
      optionValues: [{ name: colorway.name }],
    },
    ...product.options
      .filter(({ name }) => name !== "Color")
      .map((option) => ({
        name: option.name,
        optionValues: option.values.map((value) => ({ name: value })),
      })),
  ];
  const optionNames = new Set(options.map(({ name }) => name));
  for (const variant of variants) {
    for (const selectedOption of variant.selectedOptions) {
      if (optionNames.has(selectedOption.name)) continue;
      options.push({
        name: selectedOption.name,
        optionValues: [{ name: selectedOption.value }],
      });
      optionNames.add(selectedOption.name);
    }
  }
  return {
    id: product.handle,
    handle: product.handle,
    title: product.title,
    options,
    selectedOrFirstAvailableVariant,
    adjacentVariants: variants,
  };
}
