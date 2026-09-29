/**
 * The two facets every Shopify store exposes by default, as the Storefront API
 * returns them for the fixture catalog. Test data only.
 */

import type { StorefrontFilter } from "@/lib/storefront/types";

export const FILTER_FIXTURES: readonly StorefrontFilter[] = [
  {
    id: "filter.v.availability",
    label: "Availability",
    type: "LIST",
    values: [
      {
        id: "filter.v.availability.1",
        label: "In stock",
        count: 9,
        input: JSON.stringify({ available: true }),
      },
      {
        id: "filter.v.availability.0",
        label: "Out of stock",
        count: 0,
        input: JSON.stringify({ available: false }),
      },
    ],
  },
  {
    id: "filter.v.price",
    label: "Price",
    type: "PRICE_RANGE",
    values: [
      {
        id: "filter.v.price.0",
        label: "Price",
        count: 9,
        input: JSON.stringify({ price: { min: 98, max: 248 } }),
      },
    ],
  },
];
