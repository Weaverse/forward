"use client";

/**
 * One-way browser signal from an add-to-cart control to the header mini-cart.
 *
 * The mini-cart must open on a deliberate add, not on every cart change (a
 * quantity edit on the cart page must not pop a header panel), so the add is
 * announced explicitly. The signal carries only the merchandise id that was
 * added; the mini-cart still reads the real cart it belongs to and never
 * writes one.
 */

type Listener = (variantId: string) => void;

const LISTENERS = new Set<Listener>();

export function announceCartAdd(variantId: string): void {
  for (const listener of LISTENERS) {
    listener(variantId);
  }
}

export function subscribeToCartAdd(listener: Listener): () => void {
  LISTENERS.add(listener);
  return () => {
    LISTENERS.delete(listener);
  };
}
