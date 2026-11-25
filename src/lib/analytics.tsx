"use client";

import {
  type AnalyticsCart,
  AnalyticsEvent,
  type AnalyticsEventMap,
  type AnalyticsEventName,
  type CartData,
} from "@shopify/hydrogen";
import { useEffect, useRef } from "react";
import { useShopifyCart } from "@/lib/cart/shopify-cart-react";
import { usePathname } from "@/lib/i18n/locale-context";

/**
 * Publishes to the analytics bus `ShopifyScripts` creates in `<head>`. The
 * bus owns consent gating, replay and delivery; without it (a test, a page
 * that failed before the head rendered) nothing is sent.
 */
function publishAnalytics<E extends AnalyticsEventName>(
  event: E,
  payload: AnalyticsEventMap[E],
): void {
  const analytics = window.Shopify?.analytics;
  /* The bus types its payload per literal event; `E` here may be a union. */
  (
    analytics?.publish as
      | ((event: E, payload: AnalyticsEventMap[E]) => void)
      | undefined
  )?.call(analytics, event, payload);
}

/**
 * One `page_viewed` per path, on the first load and every client navigation.
 * Query changes (a variant pick, a filter) rewrite the URL in place, as a
 * Liquid theme's `replaceState` does, so they are not new page views.
 */
export function PageViewed() {
  const pathname = usePathname();
  const published = useRef<string | null>(null);
  useEffect(() => {
    if (published.current === pathname) return;
    published.current = pathname;
    publishAnalytics(AnalyticsEvent.PAGE_VIEWED, {});
  }, [pathname]);
  return null;
}

type ResourceViewEvent =
  | typeof AnalyticsEvent.PRODUCT_VIEWED
  | typeof AnalyticsEvent.COLLECTION_VIEWED
  | typeof AnalyticsEvent.SEARCH_VIEWED;

type ResourceViewedProps = {
  [E in ResourceViewEvent]: {
    event: E;
    payload: AnalyticsEventMap[E];
    /** What was viewed. The event fires once per key, so a re-render with a
     * new payload for the same resource (a variant switch) is not a new view. */
    viewKey: string;
  };
}[ResourceViewEvent];

/** A product, collection or search view, with the payload the route built. */
export function ResourceViewed({
  event,
  payload,
  viewKey,
}: ResourceViewedProps) {
  const published = useRef<string | null>(null);
  useEffect(() => {
    if (published.current === viewKey) return;
    published.current = viewKey;
    publishAnalytics(event, payload);
  }, [event, payload, viewKey]);
  return null;
}

function text(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/**
 * The cart in Hydrogen's analytics shape, the fields its cart tracker sends:
 * id, update time, currencies and lines. The checkout URL stays out, since
 * it carries the cart's key. The id is already keyless
 * (`sanitizeCartHandlerResult`).
 */
function toAnalyticsCart(cart: CartData): AnalyticsCart | null {
  if (cart.id === null || cart.id === "") return null;
  return {
    id: cart.id,
    updatedAt: cart.updatedAt ?? new Date().toISOString(),
    cost: cart.cost,
    lines: {
      nodes: cart.lines.nodes.flatMap((line) => {
        const { merchandise } = line;
        if (merchandise === undefined) return [];
        const { product } = merchandise;
        return [
          {
            id: line.id,
            quantity: line.quantity,
            merchandise: {
              id: merchandise.id,
              title: merchandise.title ?? product.title,
              price: line.cost.amountPerQuantity,
              sku: text(merchandise.sku) ?? null,
              product: {
                id: text(product.id) ?? "",
                title: product.title,
                vendor: text(product.vendor) ?? "",
                productType: text(product.productType),
                handle: product.handle,
              },
            },
          },
        ];
      }),
    },
  };
}

/**
 * One `cart_viewed` per visit to the cart page, with the cart the page
 * rendered (`null` when there is none). Render inside the cart page's
 * provider.
 */
export function CartViewed() {
  const cart = useShopifyCart((state) => state.data);
  const published = useRef(false);
  useEffect(() => {
    if (published.current) return;
    published.current = true;
    publishAnalytics(AnalyticsEvent.CART_VIEWED, {
      cart: toAnalyticsCart(cart),
    });
  }, [cart]);
  return null;
}
