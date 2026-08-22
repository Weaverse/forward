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

const ACTIONS_CLASS =
  "mt-[30px] grid grid-cols-[112px_1fr] gap-2 max-sm:grid-cols-1";
const QUANTITY_CLASS =
  "grid h-[52px] grid-cols-[36px_1fr_36px] border border-border-dark-strong max-sm:h-12";
const QUANTITY_BUTTON_CLASS =
  "bg-transparent text-[20px] hover:bg-signal hover:text-ink disabled:text-text-disabled disabled:hover:bg-transparent disabled:hover:text-text-disabled";
const QUANTITY_OUTPUT_CLASS = "grid place-items-center font-bold";
const ADD_TO_CART_CLASS =
  "inline-flex min-h-12 items-center justify-center gap-2.5 border border-signal bg-signal px-[22px] py-3 font-body text-[11px] font-bold text-ink tracking-[0.09em] uppercase shadow-[4px_4px_0_var(--color-text-inverse)] [transition:background_var(--duration-fast)_var(--ease-standard),color_var(--duration-fast)_var(--ease-standard),border-color_var(--duration-fast)_var(--ease-standard),box-shadow_120ms_var(--ease-standard),transform_120ms_var(--ease-standard)] hover:translate-[2px] hover:border-text-inverse hover:bg-text-inverse hover:shadow-[2px_2px_0_var(--color-text-inverse)] active:translate-1 active:shadow-none focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-[3px] disabled:translate-0 disabled:border-control-disabled disabled:bg-control-disabled disabled:text-text-disabled disabled:opacity-[0.46] disabled:shadow-none disabled:hover:translate-0 disabled:hover:border-control-disabled disabled:hover:bg-control-disabled disabled:hover:text-text-disabled disabled:hover:shadow-none motion-reduce:hover:translate-0 motion-reduce:active:translate-0";
const FEEDBACK_CLASS = "mt-3 mb-0 min-h-6 text-[12px] font-bold text-signal";
const NOTE_CLASS =
  "mt-[18px] mb-0 border-signal border-l-2 px-3.5 py-3 font-body text-[9px] leading-[1.7] text-text-dark-muted tracking-[0.06em] uppercase";

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
      <div className={ACTIONS_CLASS}>
        <div className={QUANTITY_CLASS}>
          <button
            className={QUANTITY_BUTTON_CLASS}
            type="button"
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          >
            −
          </button>
          <output
            className={QUANTITY_OUTPUT_CLASS}
            aria-live="polite"
            aria-label="Quantity"
          >
            {quantity}
          </output>
          <button
            className={QUANTITY_BUTTON_CLASS}
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
          className={ADD_TO_CART_CLASS}
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
      <p className={FEEDBACK_CLASS} role="status">
        {status}
      </p>
      <p className={NOTE_CLASS}>
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
      <div className={ACTIONS_CLASS}>
        <div className={QUANTITY_CLASS}>
          <button
            className={QUANTITY_BUTTON_CLASS}
            aria-label="Decrease quantity"
            disabled={pending || quantity <= 1}
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            type="button"
          >
            −
          </button>
          <output
            className={QUANTITY_OUTPUT_CLASS}
            aria-live="polite"
            aria-label="Quantity"
          >
            {quantity}
          </output>
          <button
            className={QUANTITY_BUTTON_CLASS}
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
          className={ADD_TO_CART_CLASS}
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
      <p className={FEEDBACK_CLASS} role="status" aria-live="polite">
        {pending ? "Updating your cart…" : ""}
      </p>
      <p className={NOTE_CLASS}>
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
