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
import { createContext, type ReactNode, useContext } from "react";

import type { Product } from "@/lib/storefront/types";

type CartHandlers = typeof import("./shopify-cart").shopifyCartHandlers;

export type ShopifyCartLineData = CartLine;
export type ShopifyMoney = MoneyV2;

export const {
  CartProvider: ShopifyCartProvider,
  useCart: useShopifyCart,
  useCartForm: useShopifyCartForm,
} = createCartComponents<CartHandlers>();

export const {
  ProductProvider: ShopifyProductProvider,
  useProductForm: useShopifyProductForm,
} = createProductComponents<ProductInput>();

const ShopifyCartModeContext = createContext(false);

export function ShopifyCartRuntime({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  if (!enabled) return children;
  return (
    <ShopifyCartModeContext.Provider value>
      <ShopifyCartProvider>{children}</ShopifyCartProvider>
    </ShopifyCartModeContext.Provider>
  );
}

export function useShopifyCartMode(): boolean {
  return useContext(ShopifyCartModeContext);
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
