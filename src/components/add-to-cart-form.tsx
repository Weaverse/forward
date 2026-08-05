"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/cn";
import { lineKey, MAX_LINE_QUANTITY } from "@/lib/demo-cart/cart-logic";
import { addCartLine } from "@/lib/demo-cart/store";
import { formatMoney } from "@/lib/storefront/format";
import { productColorwayHref } from "@/lib/storefront/product-state";
import type { Product, ProductColorway } from "@/lib/storefront/types";

interface AddToCartFormProps {
  product: Product;
  colorway: ProductColorway;
}

/**
 * Size, quantity, and add-to-demo-cart controls. Everything happens in the
 * browser: the "cart" is honest prototype state and no request leaves the
 * page.
 */
export function AddToCartForm({ product, colorway }: AddToCartFormProps) {
  const sizeOption = product.options[0];
  const [size, setSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("");
  const [sizeError, setSizeError] = useState(false);
  const groupId = useId();

  function handleAdd() {
    if (sizeOption !== undefined && size === undefined) {
      setSizeError(true);
      setStatus(`Choose a ${sizeOption.name.toLowerCase()} first.`);
      return;
    }
    addCartLine({
      key: lineKey(product.handle, colorway.id, size),
      productHandle: product.handle,
      title: product.title,
      colorwayId: colorway.id,
      colorwayName: colorway.name,
      size,
      quantity,
      unitPrice: product.price,
      image: colorway.images.primary,
      href: productColorwayHref(product, colorway.id),
    });
    setStatus(
      `Added ${quantity} × ${product.title} (${colorway.name}${
        size !== undefined ? `, ${size}` : ""
      }) to the demo cart.`,
    );
  }

  return (
    <div className="space-y-5">
      {sizeOption !== undefined ? (
        <fieldset aria-describedby={`${groupId}-hint`}>
          <legend className="field-label text-ink">{sizeOption.name}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizeOption.values.map((value) => {
              const selected = size === value;
              return (
                <label
                  key={value}
                  className={cn(
                    "field-label inline-flex size-11 cursor-pointer items-center justify-center border transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-clay",
                    selected
                      ? "border-pine bg-pine text-bone"
                      : "border-mist text-ink hover:border-pine",
                  )}
                >
                  <input
                    type="radio"
                    name={`${groupId}-size`}
                    value={value}
                    checked={selected}
                    onChange={() => {
                      setSize(value);
                      setSizeError(false);
                    }}
                    className="sr-only"
                  />
                  {value}
                </label>
              );
            })}
          </div>
          <p
            id={`${groupId}-hint`}
            className={cn(
              "mt-2 text-xs",
              sizeError ? "text-clay-deep" : "text-slate",
            )}
          >
            {sizeError
              ? `Choose a ${sizeOption.name.toLowerCase()} to continue.`
              : "True to size. Between sizes? Size down."}
          </p>
        </fieldset>
      ) : null}

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor={`${groupId}-qty`} className="field-label text-ink">
            Quantity
          </label>
          <div className="mt-2 flex items-center border border-mist">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              className="inline-flex size-11 items-center justify-center text-ink transition-colors hover:bg-parchment"
            >
              −
            </button>
            <output
              id={`${groupId}-qty`}
              className="field-label w-10 text-center text-ink"
            >
              {quantity}
            </output>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() =>
                setQuantity((current) =>
                  Math.min(MAX_LINE_QUANTITY, current + 1),
                )
              }
              className="inline-flex size-11 items-center justify-center text-ink transition-colors hover:bg-parchment"
            >
              +
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="field-label inline-flex min-h-11 flex-1 items-center justify-center bg-pine px-6 text-bone transition-colors hover:bg-pine-deep"
        >
          Add to cart — {formatMoney(product.price)}
        </button>
      </div>

      <p aria-live="polite" role="status" className="min-h-5 text-sm text-moss">
        {status}
      </p>

      <p className="border-l-2 border-moss bg-parchment px-4 py-3 text-xs leading-relaxed text-slate">
        Demo cart only — items are kept in this browser and there is no real
        checkout. No live store is connected.
      </p>
    </div>
  );
}
