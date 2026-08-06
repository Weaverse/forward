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
 * Canonical size `.option-group`, `.product-actions`, and `.add-feedback`
 * (source `app.js:284–285`).
 *
 * Behavior stays Forward-owned: the canonical prototype adds to a global
 * object and opens a fake drawer, while this writes to the browser-local demo
 * cart with the existing quantity limits, line key, and live-region status.
 */
export function AddToCartForm({ product, colorway }: AddToCartFormProps) {
  const sizeOption = product.options[0];
  const [size, setSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("");
  const groupId = useId();

  function handleAdd() {
    if (sizeOption !== undefined && size === undefined) {
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
    <>
      {sizeOption !== undefined ? (
        <fieldset className="option-group">
          <legend className="sr-only">{sizeOption.name}</legend>
          <div className="option-label">
            <span>{sizeOption.name}</span>
            <span>{size ?? "Select"}</span>
          </div>
          <div className="option-row">
            {sizeOption.values.map((value) => {
              const selected = size === value;
              return (
                <label
                  key={value}
                  className={cn("option-chip", selected && "selected")}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name={`${groupId}-size`}
                    value={value}
                    checked={selected}
                    onChange={() => {
                      setSize(value);
                      setStatus("");
                    }}
                  />
                  {value}
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <div className="product-actions">
        <div className="quantity">
          <button
            type="button"
            aria-label="Decrease quantity"
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
            onClick={() =>
              setQuantity((current) => Math.min(MAX_LINE_QUANTITY, current + 1))
            }
          >
            +
          </button>
        </div>
        <button
          className="button button-signal"
          type="button"
          onClick={handleAdd}
        >
          Add to cart ·{" "}
          {formatMoney({
            amount: product.price.amount * quantity,
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
