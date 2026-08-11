/**
 * Static demo-cart seed lines.
 *
 * The demo cart is browser-local prototype state in static mode only. Account
 * records are never fixture-backed: signed-in orders and addresses come from
 * the Customer Account API, and a deployment without account configuration
 * renders no account data at all.
 */

import type { DemoCartSeedLine } from "../types";

/** Lines the client-side demo cart starts with on first visit. */
export const DEMO_CART_SEED: readonly DemoCartSeedLine[] = [
  {
    productHandle: "weatherline-shell",
    colorwayId: "claystone",
    size: "M",
    quantity: 1,
  },
  { productHandle: "ridge-30-field-pack", colorwayId: "charcoal", quantity: 1 },
] as const;
