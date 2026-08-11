/**
 * Server-only read boundary for authenticated account routes.
 *
 * Pages get normalized view models only: no access token, no GraphQL error
 * envelope, no raw Customer Account document ever reaches a client prop, the
 * RSC payload, or rendered HTML. Session state is read through the read-only
 * manager surface; nothing here commits cookies, because a Server Component
 * render happens after `proxy.ts` has already returned its response.
 */

import { createShopifyRequestContext } from "@shopify/hydrogen";
import {
  type CustomerAccountClient,
  createCustomerAccountClient,
} from "@shopify/hydrogen/customer-account";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import {
  getCustomerAccountRuntime,
  refreshHref,
  REFRESH_MARKER_PARAM,
  REFRESH_MARKER_VALUE,
} from "./customer-account";
import {
  ACCOUNT_ADDRESS_LIMIT,
  ACCOUNT_ORDER_LOOKUP_QUERY,
  ACCOUNT_ORDER_QUERY,
  ACCOUNT_PROFILE_QUERY,
  ORDER_LINE_LIMIT,
} from "./queries";
import { createCustomerAccountSessionManager } from "./session-manager";

const ACCOUNT_I18N = { country: "US", language: "EN" } as const;
const ORDER_NUMBER_PATTERN = /^\d+$/;

/** Generic account failure. Carries no provider, GraphQL, or session detail. */
export class CustomerAccountRequestError extends Error {
  constructor() {
    super("The Customer Account request could not be completed.");
    this.name = "CustomerAccountRequestError";
  }
}

export interface AccountMoney {
  amount: string;
  currencyCode: string;
}

export interface AccountOrderSummary {
  number: number;
  name: string;
  href: string;
  processedAt: string;
  status: string;
  total: string;
}

export interface AccountAddress {
  id: string;
  lines: readonly string[];
  isDefault: boolean;
}

export interface AccountProfile {
  displayName: string;
  emailAddress: string | null;
  addresses: readonly AccountAddress[];
  orders: readonly AccountOrderSummary[];
}

export interface AccountOrderLine {
  id: string;
  title: string;
  variantTitle: string | null;
  quantity: number;
  total: string;
}

export interface AccountOrderDetail {
  name: string;
  processedAt: string;
  status: string;
  lines: readonly AccountOrderLine[];
  subtotal: string | null;
  shipping: string | null;
  tax: string | null;
  total: string;
  shippingAddress: readonly string[] | null;
}

export type AccountSession =
  | { status: "signed-out" }
  | { status: "needs-refresh"; href: string }
  | {
      status: "authenticated";
      accessToken: string;
      client: CustomerAccountClient;
      /** Writable boundary used only by approved Server Actions. */
      commitSession(): Promise<HeadersInit>;
    };

/** Formats a Customer Account `MoneyV2`, whose amount is a decimal string. */
export function formatAccountMoney(money: AccountMoney): string {
  const amount = Number(money.amount);
  if (!Number.isFinite(amount)) {
    return "—";
  }
  // Whole amounts read as "$390" like the rest of the theme; anything with a
  // fractional part keeps both cents digits rather than rendering "$12.5".
  const fractionDigits = Number.isInteger(amount) ? 0 : 2;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currencyCode,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

/** Turns `PARTIALLY_FULFILLED` into `Partially fulfilled`. */
export function formatStatusLabel(value: string | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "Processing";
  }
  const words = value.toLowerCase().split("_").filter(Boolean);
  const [first = "", ...rest] = words;
  return [first.charAt(0).toUpperCase() + first.slice(1), ...rest].join(" ");
}

/** True when the current request already spent its one refresh attempt. */
export function hasRefreshMarker(
  searchParams: Record<string, string | string[] | undefined>,
): boolean {
  const marker = searchParams[REFRESH_MARKER_PARAM];
  return Array.isArray(marker)
    ? marker.includes(REFRESH_MARKER_VALUE)
    : marker === REFRESH_MARKER_VALUE;
}

/**
 * Resolves the account session for a page render.
 *
 * Disabled configuration is a generic 404, identical to any unknown path, so a
 * disabled deployment exposes no account affordance at all.
 */
export async function readAccountSession(options: {
  /** Same-origin path this page renders at, used as the refresh return target. */
  path: string;
  /** True when this render already came back from `/account/refresh`. */
  refreshed: boolean;
}): Promise<AccountSession> {
  const runtime = getCustomerAccountRuntime();
  if (runtime === null) {
    notFound();
  }

  const requestHeaders = await headers();
  const requestContext = createShopifyRequestContext({
    request: {
      headers: new Headers(requestHeaders),
      // The configured origin, never a Host/Forwarded header.
      url: `${runtime.config.storefrontOrigin}${options.path}`,
    },
    i18n: ACCOUNT_I18N,
  });
  const sessionManager = await createCustomerAccountSessionManager({
    config: runtime.config,
    cookieHeader: requestHeaders.get("cookie"),
    secure: process.env.NODE_ENV === "production",
  });

  const accessToken = await runtime.customerSession.getAccessToken(
    sessionManager,
    requestContext,
  );
  if (accessToken !== undefined) {
    return {
      status: "authenticated",
      accessToken,
      client: createCustomerAccountClient({
        shopId: runtime.config.shopId,
        requestContext,
      }),
      commitSession: () => sessionManager.commit(),
    };
  }
  if (
    !options.refreshed &&
    (await runtime.customerSession.isLoggedIn(sessionManager, requestContext))
  ) {
    return { status: "needs-refresh", href: refreshHref(options.path) };
  }
  return { status: "signed-out" };
}

function mapOrderSummary(order: {
  name: string;
  number: number;
  processedAt: string;
  fulfillmentStatus: string;
  totalPrice: AccountMoney;
}): AccountOrderSummary {
  return {
    number: order.number,
    name: order.name,
    href: `/account/orders/${order.number}`,
    processedAt: order.processedAt,
    status: formatStatusLabel(order.fulfillmentStatus),
    total: formatAccountMoney(order.totalPrice),
  };
}

/** Reads the authenticated customer profile, addresses, and recent orders. */
export async function readAccountProfile(
  session: Extract<AccountSession, { status: "authenticated" }>,
  orderCount: number,
): Promise<AccountProfile> {
  const result = await session.client.graphql(ACCOUNT_PROFILE_QUERY, {
    accessToken: session.accessToken,
    variables: { orderCount, addressCount: ACCOUNT_ADDRESS_LIMIT },
  });
  if (result.errors !== undefined || result.data === null) {
    throw new CustomerAccountRequestError();
  }

  const { customer } = result.data;
  const defaultAddressId = customer.defaultAddress?.id ?? null;
  return {
    displayName: customer.displayName,
    emailAddress: customer.emailAddress?.emailAddress ?? null,
    addresses: customer.addresses.nodes.map((address) => ({
      id: address.id,
      lines: address.formatted,
      isDefault: address.id === defaultAddressId,
    })),
    orders: customer.orders.nodes.map(mapOrderSummary),
  };
}

/**
 * Reads one order belonging to the authenticated customer.
 *
 * A malformed number, a number outside the authenticated customer's orders,
 * and an order the API will not return all reach the same generic 404, so a
 * foreign order id is indistinguishable from a missing one. The customer-scoped
 * search resolves the exact order across history without unbounded pagination;
 * two results are requested so an ambiguous match also fails closed.
 */
export async function readAccountOrder(
  session: Extract<AccountSession, { status: "authenticated" }>,
  orderNumber: string,
): Promise<AccountOrderDetail | null> {
  if (!ORDER_NUMBER_PATTERN.test(orderNumber)) {
    return null;
  }

  const lookup = await session.client.graphql(ACCOUNT_ORDER_LOOKUP_QUERY, {
    accessToken: session.accessToken,
    variables: { query: `order_number:${orderNumber}` },
  });
  if (lookup.errors !== undefined || lookup.data === null) {
    throw new CustomerAccountRequestError();
  }
  const matches = lookup.data.customer.orders.nodes.filter(
    (order) => String(order.number) === orderNumber,
  );
  if (matches.length !== 1) {
    return null;
  }
  const orderId = matches[0]?.id;
  if (orderId === undefined) {
    return null;
  }

  const result = await session.client.graphql(ACCOUNT_ORDER_QUERY, {
    accessToken: session.accessToken,
    variables: { orderId, lineCount: ORDER_LINE_LIMIT },
  });
  if (result.errors !== undefined || result.data === null) {
    return null;
  }
  const order = result.data.order;
  if (order === null || order === undefined) {
    return null;
  }

  return {
    name: order.name,
    processedAt: order.processedAt,
    status: formatStatusLabel(order.fulfillmentStatus),
    lines: order.lineItems.nodes.map((line) => ({
      id: line.id,
      title: line.title,
      variantTitle: line.variantTitle ?? null,
      quantity: line.quantity,
      total:
        line.totalPrice === null || line.totalPrice === undefined
          ? "—"
          : formatAccountMoney(line.totalPrice),
    })),
    subtotal: order.subtotal ? formatAccountMoney(order.subtotal) : null,
    shipping: formatAccountMoney(order.totalShipping),
    tax: order.totalTax ? formatAccountMoney(order.totalTax) : null,
    total: formatAccountMoney(order.totalPrice),
    shippingAddress: order.shippingAddress?.formatted ?? null,
  };
}
