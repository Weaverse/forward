/**
 * Resource-picker values and how they become storefront data.
 *
 * Builder's resource pickers store an identity only — `{ id, handle }` — never
 * the resource itself. That keeps Shopify content out of the Studio payload
 * and leaves the storefront as the single owner of product data.
 *
 * Resolution therefore goes through the `storefront` data source, exactly like
 * every other read in this theme. A loader never queries Shopify directly: in
 * static mode the same handle resolves against fixtures, so a composed section
 * renders without credentials.
 */

import "server-only";

import { storefront } from "@/lib/storefront/data-source";
import type { Collection, Product } from "@/lib/storefront/types";

/** What a Builder resource picker stores. */
export interface ResourcePickerValue {
  id?: number | string;
  handle?: string;
}

/**
 * Reads the handle out of a picker value.
 *
 * Returns `null` for anything unusable — no selection, a cleared picker, or a
 * malformed value from older stored data — so callers have one shape to check
 * instead of three.
 */
export function pickerHandle(value: unknown): string | null {
  if (value === null || typeof value !== "object") {
    return null;
  }
  const handle = (value as ResourcePickerValue).handle;
  if (typeof handle !== "string") {
    return null;
  }
  const trimmed = handle.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Reads the handles out of a picker list, skipping unusable entries. */
export function pickerHandles(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((entry) => {
    const handle = pickerHandle(entry);
    return handle === null ? [] : [handle];
  });
}

/**
 * Resolves one selected product, or `null`.
 *
 * A handle that no longer exists resolves to `null` rather than throwing: a
 * merchant can delete a product in Shopify while a section still points at it,
 * and that must degrade to the section's empty state, not a broken page.
 */
export async function resolveProduct(value: unknown): Promise<Product | null> {
  const handle = pickerHandle(value);
  return handle === null ? null : await storefront.getProduct(handle);
}

/**
 * Resolves selected products in the merchant's chosen order.
 *
 * Unresolvable handles are dropped, so a deleted product removes one card
 * instead of leaving a hole or failing the whole section.
 */
export async function resolveProducts(
  value: unknown,
): Promise<readonly Product[]> {
  const handles = pickerHandles(value);
  if (handles.length === 0) {
    return [];
  }
  const products = await Promise.all(
    handles.map((handle) => storefront.getProduct(handle)),
  );
  return products.filter((product): product is Product => product !== null);
}

/** Resolves one selected collection, or `null`. */
export async function resolveCollection(
  value: unknown,
): Promise<Collection | null> {
  const handle = pickerHandle(value);
  return handle === null ? null : await storefront.getCollection(handle);
}

/** Resolves selected collections in the merchant's chosen order. */
export async function resolveCollections(
  value: unknown,
): Promise<readonly Collection[]> {
  const handles = pickerHandles(value);
  if (handles.length === 0) {
    return [];
  }
  const collections = await Promise.all(
    handles.map((handle) => storefront.getCollection(handle)),
  );
  return collections.filter(
    (collection): collection is Collection => collection !== null,
  );
}
