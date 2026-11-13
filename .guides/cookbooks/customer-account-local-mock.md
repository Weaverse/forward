# Overview

This recipe lets you preview Forward's Customer Account pages (`/account`, `/account/orders`, `/account/orders/<number>`, `/account/addresses`) on the local dev server without signing in. It swaps the Customer Account API client for one that answers from fixtures, so the real page and mapping code still run.

The mock is a **temporary development aid**. It bypasses authentication, so it is never committed: add it, do your work, then follow [Remove the mock](#remove-the-mock) before committing.

# AI model verification steps

- After removing the mock, `git grep -n "ACCOUNT_MOCK\|account/mock"` must print nothing, and `bun run check` must pass.
- When a change adds or renames an account query, or selects new fields, update the fixtures in `respond()` so the pages render them; an unknown operation throws `Unmocked Customer Account query`.

# Summary

Preview the account pages locally with fixture orders and addresses, then remove the mock.

# User Intent Recognition

<user_queries>
- How do I work on the account pages locally without logging in?
- How do I mock customer orders and addresses in Forward?
- The account pages need OAuth and HTTPS; how do I preview them on localhost?
</user_queries>

# Troubleshooting

<troubleshooting>
- **Issue**: Every account page returns 404.
  **Solution**: The proxy answers 404 for `/account*` while Customer Account is disabled. Set all four account variables in `.env` (`SHOP_ID`, `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID`, `CUSTOMER_ACCOUNT_SESSION_SECRET`, `PUBLIC_STOREFRONT_ORIGIN`); they only need to pass validation, the mock never calls Shopify.
- **Issue**: An account page fails with `Unmocked Customer Account query`.
  **Solution**: A query was added or renamed. Add a branch for its operation name in `respond()`.
- **Issue**: Product images show as empty tiles.
  **Solution**: Images render only from the store's own CDN path (`SHOPIFY_IMAGE_PATH_PREFIX` in `src/lib/storefront/image-source.ts`). Replace `CDN` and the file names with your store's product image URLs.
- **Issue**: The pages still show the sign-in panel.
  **Solution**: Start the dev server with `FORWARD_ACCOUNT_MOCK=1`; a production build (`next build`/`next start`) never enables the mock.
</troubleshooting>

# Recipe

## Step 1: Add the mock client

Create `src/lib/account/mock.ts`. Fixtures cover one open multi-item order, one shipped order with tracking and a partial refund, and one address. Address changes report success without changing the fixtures.

```ts
/**
 * Local account preview mock. Delete this file and its two call sites before
 * committing (see `.guides/cookbooks/customer-account-local-mock.md`).
 */

import type { CustomerAccountClient } from "@shopify/hydrogen/customer-account";

export const ACCOUNT_MOCK =
  process.env.NODE_ENV !== "production" &&
  process.env.FORWARD_ACCOUNT_MOCK === "1";

/* Images render only from the store's own CDN path
 * (`SHOPIFY_IMAGE_PATH_PREFIX`); use your store's product image URLs. */
const CDN = "https://cdn.shopify.com/s/files/1/0978/4757/4828/files";

const usd = (amount: number) => ({
  amount: amount.toFixed(2),
  currencyCode: "USD",
});

function line(
  id: string,
  title: string,
  variantTitle: string,
  sku: string,
  image: string,
  price: number,
  quantity: number,
) {
  return {
    id: `gid://shopify/LineItem/${id}`,
    title,
    variantTitle,
    sku,
    quantity,
    image: { url: `${CDN}/${image}`, altText: null, width: 1600, height: 2000 },
    price: usd(price),
    totalPrice: usd(price * quantity),
  };
}

const ADDRESS = {
  id: "gid://shopify/CustomerAddress/1",
  firstName: "Rowan",
  lastName: "Hale",
  company: null,
  address1: "14 Fell Road",
  address2: null,
  city: "Portland",
  zoneCode: "OR",
  zip: "97205",
  countryCode: "US",
  phoneNumber: null,
  formatted: [
    "Rowan Hale",
    "14 Fell Road",
    "Portland OR 97205",
    "United States",
  ],
};

/* One open multi-item order and one shipped order with tracking cover every
 * state the account pages render. */
const ORDERS = [
  {
    id: "gid://shopify/Order/1002",
    name: "#1002",
    number: 1002,
    processedAt: "2026-11-12T09:30:00Z",
    fulfillmentStatus: "UNFULFILLED",
    financialStatus: "PAID",
    lines: [
      line(
        "1",
        "Weatherline Shell",
        "Charcoal / Moss / M",
        "FWD-WLS-M",
        "weatherline-charcoal-primary.webp",
        248,
        1,
      ),
      line(
        "2",
        "Traverse Grid Fleece",
        "Moss / Charcoal / L",
        "FWD-TGF-L",
        "traverse-grid-fleece--moss-charcoal--primary.webp",
        148,
        2,
      ),
    ],
    fulfillments: [],
  },
  {
    id: "gid://shopify/Order/1001",
    name: "#1001",
    number: 1001,
    processedAt: "2026-10-18T11:00:00Z",
    fulfillmentStatus: "FULFILLED",
    financialStatus: "PARTIALLY_REFUNDED",
    lines: [
      line(
        "3",
        "Ridge 30 Field Pack",
        "Charcoal / Moss / Tan",
        "FWD-R30",
        "ridge-charcoal-primary.webp",
        198,
        1,
      ),
    ],
    fulfillments: [
      {
        id: "gid://shopify/Fulfillment/1",
        createdAt: "2026-10-19T10:00:00Z",
        estimatedDeliveryAt: "2026-10-23T00:00:00Z",
        trackingInformation: [
          {
            company: "UPS",
            number: "1Z999AA10123456784",
            url: "https://www.ups.com/track",
          },
        ],
      },
    ],
  },
];

function subtotal(order: (typeof ORDERS)[number]) {
  return order.lines.reduce(
    (sum, item) => sum + Number(item.totalPrice.amount),
    0,
  );
}

type Variables = Record<string, unknown>;

/* Answers by operation name; add a branch for every new account query. */
function respond(query: string, variables: Variables): unknown {
  if (query.includes("ForwardAccountProfile")) {
    return {
      customer: {
        displayName: "Rowan Hale",
        emailAddress: { emailAddress: "rowan@example.com" },
        defaultAddress: { id: ADDRESS.id },
        addresses: { nodes: [ADDRESS] },
        orders: {
          nodes: ORDERS.map((order) => ({
            ...order,
            totalPrice: usd(subtotal(order) + 12),
            lineItemsSummary: {
              totalQuantityOfLineItems: order.lines.reduce(
                (n, item) => n + item.quantity,
                0,
              ),
            },
            lineItems: {
              nodes: order.lines.slice(0, Number(variables.previewCount)),
            },
          })),
        },
      },
    };
  }
  if (query.includes("ForwardAccountAddresses")) {
    return {
      customer: {
        defaultAddress: { id: ADDRESS.id },
        addresses: { nodes: [ADDRESS] },
      },
    };
  }
  if (query.includes("ForwardAccountOrderLookup")) {
    const number = String(variables.query).replace("order_number:", "");
    return {
      customer: {
        orders: {
          nodes: ORDERS.filter((order) => String(order.number) === number),
        },
      },
    };
  }
  if (query.includes("ForwardAccountOrder(")) {
    const order = ORDERS.find((entry) => entry.id === variables.orderId);
    return {
      order:
        order === undefined
          ? null
          : {
              ...order,
              statusPageUrl: "https://shopify.com/orders/mock",
              totalPrice: usd(subtotal(order) + 12),
              subtotal: usd(subtotal(order)),
              totalShipping: usd(12),
              totalTax: usd(0),
              shippingAddress: { formatted: ADDRESS.formatted },
              billingAddress: { formatted: ADDRESS.formatted },
              fulfillments: { nodes: order.fulfillments },
              lineItems: { nodes: order.lines },
            },
    };
  }
  /* Address mutations succeed without changing the fixtures. */
  const id = String(variables.addressId ?? ADDRESS.id);
  if (query.includes("ForwardAccountAddressCreate")) {
    return {
      customerAddressCreate: { customerAddress: { id }, userErrors: [] },
    };
  }
  if (query.includes("ForwardAccountAddressUpdate")) {
    return {
      customerAddressUpdate: { customerAddress: { id }, userErrors: [] },
    };
  }
  if (query.includes("ForwardAccountAddressDelete")) {
    return { customerAddressDelete: { deletedAddressId: id, userErrors: [] } };
  }
  throw new Error("Unmocked Customer Account query");
}

/** A Customer Account client that answers from the fixtures above. */
export function createMockCustomerAccountClient(): CustomerAccountClient {
  return {
    graphql: async (
      document: { source: string },
      options: { variables?: Variables } = {},
    ) => ({
      data: respond(document.source, options.variables ?? {}),
      errors: undefined,
      headers: new Headers(),
    }),
  } as unknown as CustomerAccountClient;
}
```

## Step 2: Return a mock session

In `src/lib/account/account-view.ts`, import the mock and return a signed-in session from `readAccountSession`, right after the `runtime === null` check:

```ts
import { ACCOUNT_MOCK, createMockCustomerAccountClient } from "./mock";

// ...inside readAccountSession(), after `if (runtime === null) { notFound(); }`
if (ACCOUNT_MOCK) {
  return {
    status: "authenticated",
    accessToken: "mock",
    locale: options.locale ?? DEFAULT_LOCALE,
    client: createMockCustomerAccountClient(),
    commitSession: async () => ({}),
  };
}
```

## Step 3: Let address forms post from the dev server

Address actions check the request's origin against `PUBLIC_STOREFRONT_ORIGIN`, which is not the dev server. In `src/lib/account/address-actions.ts`, accept the request's own origin while the mock is on:

```ts
import { ACCOUNT_MOCK } from "./mock";

// ...in saveAddress(), the performAddressAction() call
origin:
  ACCOUNT_MOCK && requestHeaders.get("origin") !== null
    ? (requestHeaders.get("origin") ?? "")
    : runtime.config.storefrontOrigin,
```

## Step 4: Run it

```bash
FORWARD_ACCOUNT_MOCK=1 bun run dev
```

Open `http://localhost:3333/account`, `/account/orders`, `/account/orders/1001`, `/account/orders/1002` and `/account/addresses`. Any order number not in the fixtures answers 404, like a foreign order.

## Remove the mock

Before committing:

1. Delete `src/lib/account/mock.ts`.
2. Remove the import and the `if (ACCOUNT_MOCK)` block from `src/lib/account/account-view.ts`.
3. Remove the import and restore `origin: runtime.config.storefrontOrigin,` in `src/lib/account/address-actions.ts`.
4. Run `git grep -n "ACCOUNT_MOCK\|account/mock"` (no output) and `bun run check`.
