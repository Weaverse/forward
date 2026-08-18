"use client";

import { useEffect, useRef, useState } from "react";

import { announceCartAdd } from "@/lib/cart/mini-cart-signal";
import {
  ShopifyProductProvider,
  toHydrogenProductInput,
  useShopifyCart,
  useShopifyCartMode,
  useShopifyProductForm,
} from "@/lib/cart/shopify-cart-react";
import { lineKey, MAX_LINE_QUANTITY } from "@/lib/demo-cart/cart-logic";
import { addCartLine } from "@/lib/demo-cart/store";
import { formatMoney } from "@/lib/storefront/format";
import {
  productSelectionHref,
  type ProductSelection,
} from "@/lib/storefront/product-state";
import type { Product } from "@/lib/storefront/types";

interface AddToCartFormProps {
  product: Product;
  selection: ProductSelection;
}

function DemoAddToCartForm({ product, selection }: AddToCartFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("");
  const size = selection.selectedOptions.Size;

  function handleAdd() {
    if (!selection.variant.availableForSale) return;
    addCartLine({
      key: lineKey(product.handle, selection.variant.id),
      variantId: selection.variant.id,
      productHandle: product.handle,
      title: product.title,
      colorwayId: selection.colorway.id,
      colorwayName: selection.colorway.name,
      selectedOptions: selection.selectedOptions,
      quantity,
      unitPrice: selection.variant.price,
      image: selection.colorway.images.primary,
      href: productSelectionHref(
        product,
        selection.colorway.id,
        selection.selectedOptions,
      ),
    });
    setStatus(
      `Added ${quantity} × ${product.title} (${selection.colorway.name}${
        size !== undefined ? `, ${size}` : ""
      }) to the demo cart.`,
    );
    announceCartAdd(selection.variant.id);
  }

  return (
    <>
      <div className="product-actions">
        <div className="quantity">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          >
            −
          </button>
          <output aria-live="polite" aria-label="Quantity">
            {quantity}
          </output>
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={quantity >= MAX_LINE_QUANTITY}
            onClick={() =>
              setQuantity((current) => Math.min(MAX_LINE_QUANTITY, current + 1))
            }
          >
            +
          </button>
        </div>
        <button
          className="button button-signal product-atc"
          type="button"
          disabled={!selection.variant.availableForSale}
          onClick={handleAdd}
        >
          {selection.variant.availableForSale ? "Add to cart" : "Sold out"} ·{" "}
          {formatMoney({
            amount: selection.variant.price.amount * quantity,
            currencyCode: "USD",
          })}
        </button>
      </div>
      <p className="add-feedback" role="status">
        {status}
      </p>
      <p className="demo-note">
        Demo cart only — items stay in this browser and no checkout is
        connected.
      </p>
    </>
  );
}

function ShopifyAddToCartForm({ selection }: AddToCartFormProps) {
  const { formProps, pending, register, selectedVariant } =
    useShopifyProductForm();
  const [quantity, setQuantity] = useState(1);
  const cartLines = useShopifyCart((state) => state.data.lines.nodes);
  const submittedVariantRef = useRef<{
    id: string;
    previousQuantity: number;
  } | null>(null);
  const wasPendingRef = useRef(false);
  const selectedPrice = Number(
    selectedVariant?.price.amount ?? selection.variant.price.amount,
  );

  /* The mini-cart only opens once the server-owned cart actually reports the
   * merchandise, so a failed add never announces a success. */
  useEffect(() => {
    if (pending) {
      wasPendingRef.current = true;
      return;
    }
    const submitted = submittedVariantRef.current;
    if (!wasPendingRef.current || submitted === null) {
      return;
    }
    const currentQuantity =
      cartLines.find((line) => line.merchandise?.id === submitted.id)
        ?.quantity ?? 0;
    if (currentQuantity <= submitted.previousQuantity) {
      return;
    }
    wasPendingRef.current = false;
    submittedVariantRef.current = null;
    announceCartAdd(submitted.id);
  }, [cartLines, pending]);

  return (
    <form
      {...formProps()}
      onSubmitCapture={() => {
        if (selectedVariant === null) return;
        submittedVariantRef.current = {
          id: selectedVariant.id,
          previousQuantity:
            cartLines.find(
              (line) => line.merchandise?.id === selectedVariant.id,
            )?.quantity ?? 0,
        };
      }}
    >
      <input type="hidden" {...register("merchandiseId", {})} />
      <input type="hidden" {...register("quantity", { value: quantity })} />
      <div className="product-actions">
        <div className="quantity">
          <button
            aria-label="Decrease quantity"
            disabled={pending || quantity <= 1}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            type="button"
          >
            −
          </button>
          <output aria-live="polite" aria-label="Quantity">
            {quantity}
          </output>
          <button
            aria-label="Increase quantity"
            disabled={pending || quantity >= MAX_LINE_QUANTITY}
            onClick={() =>
              setQuantity((current) => Math.min(MAX_LINE_QUANTITY, current + 1))
            }
            type="button"
          >
            +
          </button>
        </div>
        <button
          {...register("addToCart", {})}
          className="button button-signal product-atc"
          disabled={
            pending ||
            selectedVariant === null ||
            !selectedVariant.availableForSale
          }
        >
          {pending
            ? "Adding…"
            : selectedVariant?.availableForSale
              ? "Add to cart"
              : "Sold out"}{" "}
          ·{" "}
          {formatMoney({
            amount: selectedPrice * quantity,
            currencyCode: "USD",
          })}
        </button>
      </div>
      <p className="add-feedback" role="status" aria-live="polite">
        {pending ? "Updating your cart…" : ""}
      </p>
      <p className="demo-note">
        Secure Shopify cart. Checkout is handed off to Shopify; no payment runs
        on this page.
      </p>
    </form>
  );
}

export function AddToCartForm(props: AddToCartFormProps) {
  return useShopifyCartMode() ? (
    <ShopifyProductProvider
      product={toHydrogenProductInput(
        props.product,
        props.selection.colorway.id,
        props.selection.variant.id,
      )}
    >
      <ShopifyAddToCartForm {...props} />
    </ShopifyProductProvider>
  ) : (
    <DemoAddToCartForm {...props} />
  );
}
