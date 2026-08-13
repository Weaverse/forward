/**
 * Pure demo-cart state logic. No DOM, no storage, no network — the client
 * store in `store.ts` layers persistence and subscription on top, and unit
 * tests exercise these functions directly.
 *
 * The demo cart is honest prototype state: it exists only in the visitor's
 * browser and never talks to a checkout.
 */

import { isAllowedProductImageSrc } from "@/lib/storefront/image-source";
import type { Money, StorefrontImage } from "@/lib/storefront/types";

export const MAX_LINE_QUANTITY = 9;

const HANDLE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface DemoCartLine {
  /** Stable identity for one exact catalog variant. */
  key: string;
  variantId: string;
  productHandle: string;
  title: string;
  colorwayId: string;
  colorwayName: string;
  size?: string;
  selectedOptions: Readonly<Record<string, string>>;
  quantity: number;
  unitPrice: Money;
  image: StorefrontImage;
  /** Deep link back to the exact PDP state this line came from. */
  href: string;
}

export function lineKey(productHandle: string, variantId: string): string {
  return [productHandle, variantId].join("::");
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

function isPositiveInteger(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value > 0 &&
    value <= 10_000
  );
}

function isCanonicalProductHref(
  href: string,
  productHandle: string,
  colorwayId: string,
): boolean {
  try {
    const url = new URL(href, "https://forward.local");
    return (
      url.origin === "https://forward.local" &&
      url.pathname === `/products/${productHandle}` &&
      (url.searchParams.get("colorway") === null ||
        url.searchParams.get("colorway") === colorwayId)
    );
  } catch {
    return false;
  }
}

function sanitizeSelectedOptions(
  value: unknown,
): Readonly<Record<string, string>> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const entries = Object.entries(value);
  if (
    entries.length > 8 ||
    entries.some(
      ([name, option]) =>
        name.trim().length === 0 ||
        name.length > 80 ||
        typeof option !== "string" ||
        option.trim().length === 0 ||
        option.length > 120,
    )
  ) {
    return null;
  }
  return Object.fromEntries(entries) as Readonly<Record<string, string>>;
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
      typeof line.variantId !== "string" ||
      line.variantId.trim().length === 0 ||
      typeof line.productHandle !== "string" ||
      typeof line.title !== "string" ||
      typeof line.colorwayId !== "string" ||
      typeof line.colorwayName !== "string" ||
      (line.size !== undefined && typeof line.size !== "string") ||
      typeof line.quantity !== "number" ||
      typeof line.href !== "string" ||
      seen.has(line.key)
    ) {
      continue;
    }
    const unitPrice = line.unitPrice as Record<string, unknown> | undefined;
    const image = line.image as Record<string, unknown> | undefined;
    const size = typeof line.size === "string" ? line.size : undefined;
    const selectedOptions = sanitizeSelectedOptions(line.selectedOptions);
    if (
      unitPrice === undefined ||
      typeof unitPrice.amount !== "number" ||
      !Number.isFinite(unitPrice.amount) ||
      unitPrice.amount < 0 ||
      unitPrice.currencyCode !== "USD" ||
      image === undefined ||
      selectedOptions === null ||
      typeof image.src !== "string" ||
      /* Static mode stores local catalog paths; Shopify mode stores owned CDN
         media URLs. Anything else is dropped on revive. */
      !isAllowedProductImageSrc(image.src) ||
      typeof image.alt !== "string" ||
      image.alt.trim().length === 0 ||
      !isPositiveInteger(image.width) ||
      !isPositiveInteger(image.height) ||
      line.title.trim().length === 0 ||
      line.colorwayName.trim().length === 0 ||
      !HANDLE_PATTERN.test(line.productHandle) ||
      !HANDLE_PATTERN.test(line.colorwayId) ||
      line.key !== lineKey(line.productHandle, line.variantId) ||
      !isCanonicalProductHref(line.href, line.productHandle, line.colorwayId)
    ) {
      continue;
    }
    seen.add(line.key);
    lines.push({
      key: line.key,
      variantId: line.variantId,
      productHandle: line.productHandle,
      title: line.title,
      colorwayId: line.colorwayId,
      colorwayName: line.colorwayName,
      size,
      selectedOptions,
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
