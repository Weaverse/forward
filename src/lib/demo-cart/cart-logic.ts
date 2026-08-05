/**
 * Pure demo-cart state logic. No DOM, no storage, no network — the client
 * store in `store.ts` layers persistence and subscription on top, and unit
 * tests exercise these functions directly.
 *
 * The demo cart is honest prototype state: it exists only in the visitor's
 * browser and never talks to a checkout.
 */

import type { Money, StorefrontImage } from "@/lib/storefront/types";

export const MAX_LINE_QUANTITY = 9;

export interface DemoCartLine {
  /** Stable identity for a product + colorway + size combination. */
  key: string;
  productHandle: string;
  title: string;
  colorwayId: string;
  colorwayName: string;
  size?: string;
  quantity: number;
  unitPrice: Money;
  image: StorefrontImage;
  /** Deep link back to the exact PDP state this line came from. */
  href: string;
}

export function lineKey(
  productHandle: string,
  colorwayId: string,
  size?: string,
): string {
  return [productHandle, colorwayId, size ?? ""].join("::");
}

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) {
    return 1;
  }
  return Math.min(MAX_LINE_QUANTITY, Math.max(1, Math.trunc(quantity)));
}

/** Adds a line, merging quantities when the same variant already exists. */
export function addLine(
  lines: readonly DemoCartLine[],
  incoming: DemoCartLine,
): readonly DemoCartLine[] {
  const existing = lines.find((line) => line.key === incoming.key);
  if (existing === undefined) {
    return [
      ...lines,
      { ...incoming, quantity: clampQuantity(incoming.quantity) },
    ];
  }
  return lines.map((line) =>
    line.key === incoming.key
      ? { ...line, quantity: clampQuantity(line.quantity + incoming.quantity) }
      : line,
  );
}

/** Sets a line quantity; quantities below one remove the line. */
export function setLineQuantity(
  lines: readonly DemoCartLine[],
  key: string,
  quantity: number,
): readonly DemoCartLine[] {
  if (quantity < 1) {
    return removeLine(lines, key);
  }
  return lines.map((line) =>
    line.key === key ? { ...line, quantity: clampQuantity(quantity) } : line,
  );
}

export function removeLine(
  lines: readonly DemoCartLine[],
  key: string,
): readonly DemoCartLine[] {
  return lines.filter((line) => line.key !== key);
}

export function totalQuantity(lines: readonly DemoCartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function subtotal(lines: readonly DemoCartLine[]): Money {
  const amount = lines.reduce(
    (sum, line) => sum + line.unitPrice.amount * line.quantity,
    0,
  );
  return { amount, currencyCode: "USD" };
}

export const FREE_SHIPPING_THRESHOLD = 150;

export function shipping(lines: readonly DemoCartLine[]): Money {
  const amount =
    lines.length === 0 || subtotal(lines).amount >= FREE_SHIPPING_THRESHOLD
      ? 0
      : 8;
  return { amount, currencyCode: "USD" };
}

export function total(lines: readonly DemoCartLine[]): Money {
  return {
    amount: subtotal(lines).amount + shipping(lines).amount,
    currencyCode: "USD",
  };
}

/** Validates lines revived from storage; malformed entries are dropped. */
export function sanitizeLines(value: unknown): readonly DemoCartLine[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const seen = new Set<string>();
  const lines: DemoCartLine[] = [];
  for (const entry of value) {
    if (typeof entry !== "object" || entry === null) {
      continue;
    }
    const line = entry as Record<string, unknown>;
    if (
      typeof line.key !== "string" ||
      typeof line.productHandle !== "string" ||
      typeof line.title !== "string" ||
      typeof line.colorwayId !== "string" ||
      typeof line.colorwayName !== "string" ||
      typeof line.quantity !== "number" ||
      typeof line.href !== "string" ||
      seen.has(line.key)
    ) {
      continue;
    }
    const unitPrice = line.unitPrice as Record<string, unknown> | undefined;
    const image = line.image as Record<string, unknown> | undefined;
    if (
      unitPrice === undefined ||
      typeof unitPrice.amount !== "number" ||
      image === undefined ||
      typeof image.src !== "string" ||
      typeof image.alt !== "string" ||
      typeof image.width !== "number" ||
      typeof image.height !== "number"
    ) {
      continue;
    }
    seen.add(line.key);
    lines.push({
      key: line.key,
      productHandle: line.productHandle,
      title: line.title,
      colorwayId: line.colorwayId,
      colorwayName: line.colorwayName,
      size: typeof line.size === "string" ? line.size : undefined,
      quantity: clampQuantity(line.quantity),
      unitPrice: { amount: unitPrice.amount, currencyCode: "USD" },
      image: {
        src: image.src,
        alt: image.alt,
        width: image.width,
        height: image.height,
      },
      href: line.href,
    });
  }
  return lines;
}
