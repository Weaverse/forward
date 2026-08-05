/**
 * Static account-demo fixture records: prototype orders and addresses shown
 * on the clearly-labeled non-live account surfaces. Only the data source may
 * import this file. Order `1001` is the approved route-smoke order id.
 */

import type { DemoAddress, DemoCartSeedLine, DemoOrder } from "../types";

export const DEMO_ORDER_FIXTURES: readonly DemoOrder[] = [
  {
    id: "1001",
    number: "#1001",
    placedAt: "2026-07-21",
    status: "delivered",
    statusDetail: "Delivered 26 Jul 2026 — signed at the door",
    lines: [
      {
        productHandle: "weatherline-shell",
        title: "Weatherline Shell",
        colorwayName: "Charcoal",
        size: "M",
        quantity: 1,
        unitPrice: { amount: 248, currencyCode: "USD" },
        image: {
          src: "/images/products/weatherline-charcoal-primary.webp",
          alt: "Weatherline Shell in Charcoal — studio view",
          width: 1600,
          height: 2000,
        },
      },
      {
        productHandle: "talus-trail-shoe",
        title: "Talus Trail Shoe",
        colorwayName: "Limestone",
        size: "EU 43",
        quantity: 1,
        unitPrice: { amount: 142, currencyCode: "USD" },
        image: {
          src: "/images/products/talus-limestone-primary.webp",
          alt: "Talus Trail Shoe in Limestone — studio view",
          width: 1600,
          height: 2000,
        },
      },
    ],
    subtotal: { amount: 390, currencyCode: "USD" },
    shipping: { amount: 0, currencyCode: "USD" },
    total: { amount: 390, currencyCode: "USD" },
  },
  {
    id: "1002",
    number: "#1002",
    placedAt: "2026-08-02",
    status: "in-transit",
    statusDetail: "In transit — estimated 08 Aug 2026",
    lines: [
      {
        productHandle: "ridge-30-field-pack",
        title: "Ridge 30 Field Pack",
        colorwayName: "Dune",
        quantity: 1,
        unitPrice: { amount: 168, currencyCode: "USD" },
        image: {
          src: "/images/products/ridge-dune-primary.webp",
          alt: "Ridge 30 Field Pack in Dune — studio view",
          width: 1600,
          height: 2000,
        },
      },
    ],
    subtotal: { amount: 168, currencyCode: "USD" },
    shipping: { amount: 0, currencyCode: "USD" },
    total: { amount: 168, currencyCode: "USD" },
  },
] as const;

export const DEMO_ADDRESS_FIXTURES: readonly DemoAddress[] = [
  {
    id: "home",
    label: "Home",
    isDefault: true,
    name: "Rowan Hale",
    lines: ["14 Fell Road", "Keswick CA12 5AB", "United Kingdom"],
  },
  {
    id: "studio",
    label: "Studio",
    isDefault: false,
    name: "Rowan Hale",
    lines: ["Unit 6, Long Light Works", "Sheffield S3 8EN", "United Kingdom"],
  },
] as const;

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
