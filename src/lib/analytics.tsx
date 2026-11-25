"use client";

import {
  AnalyticsEvent,
  type AnalyticsEventMap,
  type AnalyticsEventName,
} from "@shopify/hydrogen";
import { useEffect, useRef } from "react";
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

/**
 * One `cart_viewed` per visit to the cart page.
 *
 * ponytail: the cart travels as `null`, which Hydrogen accepts. Forward
 * redacts the cart id from every browser response (it carries the cart's
 * secret key), and Hydrogen's cart analytics needs that id, so neither this
 * payload nor `useCartAnalytics` (add/remove events) can describe the cart.
 * Both become possible once the browser gets the id without its `?key=`.
 */
export function CartViewed() {
  const published = useRef(false);
  useEffect(() => {
    if (published.current) return;
    published.current = true;
    publishAnalytics(AnalyticsEvent.CART_VIEWED, { cart: null });
  }, []);
  return null;
}
