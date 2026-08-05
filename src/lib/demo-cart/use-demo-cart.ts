"use client";

import { useSyncExternalStore } from "react";

import type { DemoCartLine } from "./cart-logic";
import {
  getCartSnapshot,
  getServerCartSnapshot,
  subscribeToCart,
} from "./store";

/** Subscribes a client component to the demo cart lines. */
export function useDemoCartLines(): readonly DemoCartLine[] {
  return useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getServerCartSnapshot,
  );
}
