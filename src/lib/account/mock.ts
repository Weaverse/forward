/**
 * TEMPORARY local review mock — delete this file and its two call sites
 * (`account-view.ts`, `address-actions.ts`) before merging.
 *
 * With `FORWARD_ACCOUNT_MOCK=1` in a non-production build, every account page
 * renders as a signed-in customer whose Customer Account API answers come from
 * the fixtures below, so the real mapping code still runs. Address changes are
 * kept in memory until the dev server restarts.
 */

import type { CustomerAccountClient } from "@shopify/hydrogen/customer-account";

export const ACCOUNT_MOCK =
  process.env.NODE_ENV !== "production" &&
  process.env.FORWARD_ACCOUNT_MOCK === "1";

const CDN = "https://cdn.shopify.com/s/files/1/0978/4757/4828/files";

const PRODUCTS = {
  shell: {
    title: "Weatherline Shell",
    variantTitle: "Charcoal / Moss / M",
    sku: "FWD-WLS-CHARCOAL-MOSS-M",
    price: "248.0",
    image: `${CDN}/weatherline-charcoal-primary.webp?v=1785922447`,
  },
  pack: {
    title: "Ridge 30 Field Pack",
    variantTitle: "Charcoal / Moss / Tan",
    sku: "FWD-R30-CHARCOAL-MOSS",
    price: "198.0",
    image: `${CDN}/ridge-charcoal-primary.webp?v=1785922464`,
  },
  shoe: {
    title: "Talus Trail Shoe",
    variantTitle: "Charcoal / Moss / Gum / US 9",
    sku: "FWD-TTS-CHARCOAL-MOSS-US9",
    price: "168.0",
    image: `${CDN}/talus-charcoal-primary.webp?v=1785922481`,
  },
  fleece: {
    title: "Traverse Grid Fleece",
    variantTitle: "Moss / Charcoal / L",
    sku: "FWD-TGF-MC-L",
    price: "148.0",
    image: `${CDN}/traverse-grid-fleece--moss-charcoal--primary.webp?v=1786967635`,
  },
} as const;

type ProductKey = keyof typeof PRODUCTS;

function usd(amount: number) {
  return { amount: amount.toFixed(2), currencyCode: "USD" };
}

const ORDERS = [
  {
    number: 1004,
    processedAt: "2026-11-12T09:30:00Z",
    fulfillmentStatus: "UNFULFILLED",
    financialStatus: "PAID",
    lines: [
      ["shell", 1],
      ["shoe", 1],
      ["fleece", 2],
    ],
    shipped: false,
  },
  {
    number: 1003,
    processedAt: "2026-11-02T15:10:00Z",
    fulfillmentStatus: "FULFILLED",
    financialStatus: "PAID",
    lines: [["pack", 1]],
    shipped: true,
  },
  {
    number: 1002,
    processedAt: "2026-10-18T11:00:00Z",
    fulfillmentStatus: "PARTIALLY_FULFILLED",
    financialStatus: "PARTIALLY_REFUNDED",
    lines: [
      ["shoe", 1],
      ["fleece", 1],
    ],
    shipped: true,
  },
  {
    number: 1001,
    processedAt: "2026-09-30T08:45:00Z",
    fulfillmentStatus: "FULFILLED",
    financialStatus: "PAID",
    lines: [
      ["shell", 1],
      ["pack", 1],
      ["shoe", 1],
      ["fleece", 1],
    ],
    shipped: true,
  },
] as const satisfies readonly {
  number: number;
  processedAt: string;
  fulfillmentStatus: string;
  financialStatus: string;
  lines: readonly (readonly [ProductKey, number])[];
  shipped: boolean;
}[];

type MockOrder = (typeof ORDERS)[number];

function subtotal(order: MockOrder) {
  return order.lines.reduce(
    (sum, [key, quantity]) => sum + Number(PRODUCTS[key].price) * quantity,
    0,
  );
}

function lineNodes(order: MockOrder, count: number) {
  return order.lines.slice(0, count).map(([key, quantity], index) => {
    const product = PRODUCTS[key];
    return {
      id: `gid://shopify/LineItem/${order.number}${index}`,
      title: product.title,
      variantTitle: product.variantTitle,
      sku: product.sku,
      quantity,
      image: {
        url: product.image,
        altText: null,
        width: 1600,
        height: 2000,
      },
      price: usd(Number(product.price)),
      totalPrice: usd(Number(product.price) * quantity),
    };
  });
}

interface MockAddress {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  address1: string;
  address2: string | null;
  city: string;
  zoneCode: string | null;
  zip: string | null;
  countryCode: string;
  phoneNumber: string | null;
}

let nextAddressId = 4;
let defaultAddressId = "gid://shopify/CustomerAddress/1";
let addresses: MockAddress[] = [
  {
    id: "gid://shopify/CustomerAddress/1",
    firstName: "Rowan",
    lastName: "Hale",
    company: "Forward Field Co.",
    address1: "14 Fell Road",
    address2: null,
    city: "Portland",
    zoneCode: "OR",
    zip: "97205",
    countryCode: "US",
    phoneNumber: "+15035550142",
  },
  {
    id: "gid://shopify/CustomerAddress/2",
    firstName: "Rowan",
    lastName: "Hale",
    company: null,
    address1: "Unit 6, Long Light Works",
    address2: "Gate B",
    city: "Bend",
    zoneCode: "OR",
    zip: "97701",
    countryCode: "US",
    phoneNumber: null,
  },
  {
    id: "gid://shopify/CustomerAddress/3",
    firstName: "Rowan",
    lastName: "Hale",
    company: null,
    address1: "GS2, Vinhomes Smart City",
    address2: null,
    city: "Ha Noi",
    zoneCode: null,
    zip: "100000",
    countryCode: "VN",
    phoneNumber: null,
  },
];

function formatted(address: MockAddress): string[] {
  return [
    `${address.firstName} ${address.lastName}`,
    address.company,
    address.address1,
    address.address2,
    [address.city, address.zoneCode, address.zip].filter(Boolean).join(" "),
    address.countryCode,
  ].filter((line): line is string => Boolean(line));
}

function addressNode(address: MockAddress) {
  return { ...address, formatted: formatted(address) };
}

function orderSummary(order: MockOrder, previewCount: number) {
  return {
    name: `#${order.number}`,
    number: order.number,
    processedAt: order.processedAt,
    fulfillmentStatus: order.fulfillmentStatus,
    financialStatus: order.financialStatus,
    totalPrice: usd(subtotal(order) + 12),
    lineItemsSummary: {
      totalQuantityOfLineItems: order.lines.reduce((n, [, q]) => n + q, 0),
    },
    lineItems: { nodes: lineNodes(order, previewCount) },
  };
}

function orderDetail(order: MockOrder) {
  const shipping = formatted(addresses[0] ?? addresses[1]!);
  return {
    name: `#${order.number}`,
    processedAt: order.processedAt,
    fulfillmentStatus: order.fulfillmentStatus,
    financialStatus: order.financialStatus,
    statusPageUrl: `https://shopify.com/orders/mock-${order.number}`,
    totalPrice: usd(subtotal(order) + 12),
    subtotal: usd(subtotal(order)),
    totalShipping: usd(12),
    totalTax: usd(0),
    shippingAddress: { formatted: shipping },
    billingAddress: { formatted: shipping },
    fulfillments: {
      nodes: order.shipped
        ? [
            {
              id: `gid://shopify/Fulfillment/${order.number}`,
              createdAt: order.processedAt,
              estimatedDeliveryAt: "2026-11-20T00:00:00Z",
              trackingInformation: [
                {
                  company: "UPS",
                  number: `1Z999AA1${order.number}`,
                  url: "https://www.ups.com/track",
                },
              ],
            },
          ]
        : [],
    },
    lineItems: { nodes: lineNodes(order, 50) },
  };
}

type Variables = Record<string, unknown>;

function respond(query: string, variables: Variables): unknown {
  if (query.includes("ForwardAccountProfile")) {
    return {
      customer: {
        displayName: "Rowan Hale",
        emailAddress: { emailAddress: "rowan@example.com" },
        defaultAddress: { id: defaultAddressId },
        addresses: { nodes: addresses.map(addressNode) },
        orders: {
          nodes: ORDERS.slice(0, Number(variables.orderCount)).map((order) =>
            orderSummary(order, Number(variables.previewCount)),
          ),
        },
      },
    };
  }
  if (query.includes("ForwardAccountAddresses")) {
    return {
      customer: {
        defaultAddress: { id: defaultAddressId },
        addresses: { nodes: addresses.map(addressNode) },
      },
    };
  }
  if (query.includes("ForwardAccountOrderLookup")) {
    const number = String(variables.query).replace("order_number:", "");
    return {
      customer: {
        orders: {
          nodes: ORDERS.filter((order) => String(order.number) === number).map(
            (order) => ({
              id: `gid://shopify/Order/${order.number}`,
              number: order.number,
            }),
          ),
        },
      },
    };
  }
  if (query.includes("ForwardAccountOrder(")) {
    const number = String(variables.orderId).split("/").pop();
    const order = ORDERS.find((entry) => String(entry.number) === number);
    return { order: order === undefined ? null : orderDetail(order) };
  }
  if (query.includes("ForwardAccountAddressCreate")) {
    const id = `gid://shopify/CustomerAddress/${nextAddressId++}`;
    addresses.push({ id, ...(variables.address as Omit<MockAddress, "id">) });
    if (variables.defaultAddress === true) {
      defaultAddressId = id;
    }
    return {
      customerAddressCreate: { customerAddress: { id }, userErrors: [] },
    };
  }
  if (query.includes("ForwardAccountAddressUpdate")) {
    const id = String(variables.addressId);
    if (variables.address) {
      addresses = addresses.map((address) =>
        address.id === id
          ? { id, ...(variables.address as Omit<MockAddress, "id">) }
          : address,
      );
    }
    if (variables.defaultAddress === true) {
      defaultAddressId = id;
    }
    return {
      customerAddressUpdate: { customerAddress: { id }, userErrors: [] },
    };
  }
  if (query.includes("ForwardAccountAddressDelete")) {
    const id = String(variables.addressId);
    addresses = addresses.filter((address) => address.id !== id);
    if (defaultAddressId === id) {
      defaultAddressId = addresses[0]?.id ?? "";
    }
    return {
      customerAddressDelete: { deletedAddressId: id, userErrors: [] },
    };
  }
  throw new Error("Unmocked Customer Account query");
}

/** A Customer Account client that answers from the fixtures above. */
export function createMockCustomerAccountClient(): CustomerAccountClient {
  return {
    graphql: async (
      document: unknown,
      options: { variables?: Variables } = {},
    ) => ({
      data: respond(
        (document as { source: string }).source,
        options.variables ?? {},
      ),
      errors: undefined,
      headers: new Headers(),
    }),
  } as unknown as CustomerAccountClient;
}
