"use client";

/**
 * Browser-side demo cart store. State lives in `localStorage` only — nothing
 * is ever sent to a server. Components subscribe through the hooks in
 * `use-demo-cart.ts`; state transitions are the pure functions in
 * `cart-logic.ts`.
 */

import {
  addLine,
  type DemoCartLine,
  removeLine,
  sanitizeLines,
  setLineQuantity,
} from "./cart-logic";

const STORAGE_KEY = "forward-demo-cart:v1";
/** Distinguishes "visitor emptied the cart" from "first visit" in storage. */
const SEEDED_KEY = "forward-demo-cart:seeded";

type Listener = () => void;

const LISTENERS = new Set<Listener>();

let cachedLines: readonly DemoCartLine[] | null = null;

function readStorage(): readonly DemoCartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return [];
    }
    return sanitizeLines(JSON.parse(raw));
  } catch {
    return [];
  }
}

function writeStorage(lines: readonly DemoCartLine[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    window.localStorage.setItem(SEEDED_KEY, "1");
  } catch {
    // Storage may be unavailable (private mode); the in-memory cart still works.
  }
}

function commit(lines: readonly DemoCartLine[]): void {
  cachedLines = lines;
  writeStorage(lines);
  for (const listener of LISTENERS) {
    listener();
  }
}

export function getCartSnapshot(): readonly DemoCartLine[] {
  if (cachedLines === null) {
    cachedLines = readStorage();
  }
  return cachedLines;
}

const EMPTY_LINES: readonly DemoCartLine[] = [];

/** Server-render snapshot: the cart is unknown until the client hydrates. */
export function getServerCartSnapshot(): readonly DemoCartLine[] {
  return EMPTY_LINES;
}

export function subscribeToCart(listener: Listener): () => void {
  LISTENERS.add(listener);
  return () => {
    LISTENERS.delete(listener);
  };
}

/** Seeds the cart with demo lines exactly once per browser. */
export function seedCartOnce(seedLines: readonly DemoCartLine[]): void {
  try {
    if (window.localStorage.getItem(SEEDED_KEY) !== null) {
      return;
    }
  } catch {
    return;
  }
  if (getCartSnapshot().length > 0) {
    return;
  }
  commit(seedLines);
}

export function addCartLine(line: DemoCartLine): void {
  commit(addLine(getCartSnapshot(), line));
}

export function setCartLineQuantity(key: string, quantity: number): void {
  commit(setLineQuantity(getCartSnapshot(), key, quantity));
}

export function removeCartLine(key: string): void {
  commit(removeLine(getCartSnapshot(), key));
}
