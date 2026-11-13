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
  DEFAULT_LOCALE,
  type LocaleId,
  localeI18n,
  localizePath,
} from "@/lib/i18n/locales";
import { SHOPIFY_I18N } from "@/lib/i18n/shopify-i18n";
import type { TranslationKey } from "@/lib/i18n/static-content";
import { formatMoney } from "@/lib/storefront/format";
import { isShopifyProductImageUrl } from "@/lib/storefront/image-source";
import {
  getCustomerAccountRuntime,
  REFRESH_MARKER_PARAM,
  REFRESH_MARKER_VALUE,
  refreshHref,
} from "./customer-account";
import {
  ACCOUNT_ADDRESS_LIMIT,
  ACCOUNT_ORDER_LOOKUP_QUERY,
  ACCOUNT_ORDER_QUERY,
  ACCOUNT_PROFILE_QUERY,
  ORDER_FULFILLMENT_LIMIT,
  ORDER_LINE_LIMIT,
  ORDER_PREVIEW_LINE_LIMIT,
} from "./queries";
import { createCustomerAccountSessionManager } from "./session-manager";

/**
 * Hydrogen discards the body of a rejected Customer Account request, so a
 * 4xx would surface as a bare status. Log only the error codes and the
 * line:column each points at in the query: enough to name the failing field,
 * and never a provider message or customer data.
 */
async function fetchReportingRejections(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(input, init);
  if (
    response.status >= 400 &&
    response.status < 500 &&
    response.status !== 401
  ) {
    const body: unknown = await response
      .clone()
      .json()
      .catch(() => null);
    const errors =
      body !== null &&
      typeof body === "object" &&
      "errors" in body &&
      Array.isArray(body.errors)
        ? body.errors
        : [];
    console.error(
      "Customer Account API rejected a request",
      JSON.stringify({
        status: response.status,
        requestId: response.headers.get("x-request-id"),
        errors: errors.map(
          (error: {
            extensions?: { code?: unknown };
            locations?: unknown;
            path?: unknown;
          }) => ({
            code: error.extensions?.code,
            locations: error.locations,
            path: error.path,
          }),
        ),
      }),
    );
  }
  return response;
}

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

/** A status Shopify reports, with the theme's key when it has one. */
export interface AccountStatus {
  /** English label, the fallback for a status the theme has no key for. */
  label: string;
  key: TranslationKey | null;
}

/** An owned Shopify CDN image; anything else is dropped, never rendered. */
export interface AccountImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface AccountOrderSummary {
  number: number;
  name: string;
  href: string;
  processedAt: string;
  status: AccountStatus;
  payment: AccountStatus;
  total: string;
  /** Total quantity across the order's lines. */
  itemCount: number;
  /** Up to `ORDER_PREVIEW_LINE_LIMIT` line images. */
  images: readonly AccountImage[];
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
  sku: string | null;
  image: AccountImage | null;
  quantity: number;
  unitPrice: string | null;
  total: string;
}

export interface AccountShipment {
  id: string;
  shippedAt: string;
  estimatedDeliveryAt: string | null;
  carrier: string | null;
  trackingNumber: string | null;
  /** An https tracking page, or `null`. */
  trackingUrl: string | null;
}

export interface AccountOrderDetail {
  name: string;
  processedAt: string;
  status: AccountStatus;
  payment: AccountStatus;
  /** Shopify's order status page (https), or `null`. */
  statusPageUrl: string | null;
  lines: readonly AccountOrderLine[];
  shipments: readonly AccountShipment[];
  subtotal: string | null;
  shipping: string | null;
  tax: string | null;
  total: string;
  shippingAddress: readonly string[] | null;
  billingAddress: readonly string[] | null;
}

export type AccountSession =
  | { status: "signed-out" }
  | { status: "needs-refresh"; href: string }
  | {
      status: "authenticated";
      accessToken: string;
      /** The page's market: money formats the way it writes it. */
      locale: LocaleId;
      client: CustomerAccountClient;
      /** Writable boundary used only by approved Server Actions. */
      commitSession(): Promise<HeadersInit>;
    };

/**
 * Formats a Customer Account `MoneyV2`, whose amount is a decimal string, in
 * the page's market. An unparseable amount renders as a dash.
 */
export function formatAccountMoney(
  money: AccountMoney,
  locale: LocaleId,
): string {
  const amount = Number(money.amount);
  if (!Number.isFinite(amount)) {
    return "—";
  }
  return formatMoney({ amount, currencyCode: money.currencyCode }, locale);
}

const PAYMENT_KEYS: Record<string, TranslationKey> = {
  AUTHORIZED: "account.payment.authorized",
  EXPIRED: "account.payment.expired",
  PAID: "account.payment.paid",
  PARTIALLY_PAID: "account.payment.partiallyPaid",
  PARTIALLY_REFUNDED: "account.payment.partiallyRefunded",
  PENDING: "account.payment.pending",
  REFUNDED: "account.payment.refunded",
  VOIDED: "account.payment.voided",
};

/** A payment status; an unknown or missing one is labelled from its value. */
export function paymentStatus(value: string | null | undefined): AccountStatus {
  return {
    label: formatStatusLabel(value ?? "PENDING"),
    key:
      value !== null &&
      value !== undefined &&
      Object.hasOwn(PAYMENT_KEYS, value)
        ? (PAYMENT_KEYS[value] ?? null)
        : null,
  };
}

/** A fulfillment status with its translation key. */
export function fulfillmentStatus(
  value: string | null | undefined,
): AccountStatus {
  return { label: formatStatusLabel(value), key: orderStatusKey(value) };
}

/** Keeps an image only when it is owned Shopify CDN media. */
export function accountImage(
  image:
    | {
        url: string;
        altText?: string | null;
        width?: number | null;
        height?: number | null;
      }
    | null
    | undefined,
  fallbackAlt: string,
): AccountImage | null {
  if (
    image === null ||
    image === undefined ||
    !isShopifyProductImageUrl(image.url)
  ) {
    return null;
  }
  return {
    src: image.url,
    alt: image.altText || fallbackAlt,
    width: image.width ?? 1,
    height: image.height ?? 1,
  };
}

/** An https URL Shopify returned, or `null`. */
function httpsUrl(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  try {
    return new URL(value).protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

const STATUS_KEYS: Record<string, TranslationKey> = {
  FULFILLED: "account.status.fulfilled",
  UNFULFILLED: "account.status.unfulfilled",
  PARTIALLY_FULFILLED: "account.status.partiallyFulfilled",
  IN_PROGRESS: "account.status.inProgress",
  ON_HOLD: "account.status.onHold",
  OPEN: "account.status.open",
  PENDING_FULFILLMENT: "account.status.pendingFulfillment",
  RESTOCKED: "account.status.restocked",
  SCHEDULED: "account.status.scheduled",
};

/**
 * The translation key for a fulfillment status, or `null` for one Shopify adds
 * later; the page then shows the English label from `formatStatusLabel`.
 */
export function orderStatusKey(
  value: string | null | undefined,
): TranslationKey | null {
  if (value === null || value === undefined || value === "") {
    return "account.status.processing";
  }
  return Object.hasOwn(STATUS_KEYS, value)
    ? (STATUS_KEYS[value] ?? null)
    : null;
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
  /** The page's market; the default locale when omitted. */
  locale?: LocaleId;
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
    i18n: SHOPIFY_I18N,
    locale: localeI18n(options.locale ?? DEFAULT_LOCALE),
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
      locale: options.locale ?? DEFAULT_LOCALE,
      client: createCustomerAccountClient({
        shopId: runtime.config.shopId,
        requestContext,
        fetch: fetchReportingRejections,
      }),
      commitSession: () => sessionManager.commit(),
    };
  }
  if (
    !options.refreshed &&
    (await runtime.customerSession.isLoggedIn(sessionManager, requestContext))
  ) {
    return {
      status: "needs-refresh",
      href: refreshHref(
        localizePath(options.path, options.locale ?? DEFAULT_LOCALE),
      ),
    };
  }
  return { status: "signed-out" };
}

function mapOrderSummary(
  locale: LocaleId,
  order: {
    name: string;
    number: number;
    processedAt: string;
    fulfillmentStatus: string;
    financialStatus?: string | null;
    totalPrice: AccountMoney;
    lineItems: {
      nodes: readonly {
        title: string;
        quantity: number;
        image?: { url: string; altText?: string | null } | null;
      }[];
    };
  },
): AccountOrderSummary {
  return {
    number: order.number,
    name: order.name,
    href: `/account/orders/${order.number}`,
    processedAt: order.processedAt,
    status: fulfillmentStatus(order.fulfillmentStatus),
    payment: paymentStatus(order.financialStatus),
    total: formatAccountMoney(order.totalPrice, locale),
    itemCount: order.lineItems.nodes.reduce(
      (count, line) => count + line.quantity,
      0,
    ),
    images: order.lineItems.nodes.flatMap((line) => {
      const image = accountImage(line.image, line.title);
      return image === null ? [] : [image];
    }),
  };
}

/** Reads the authenticated customer profile, addresses, and recent orders. */
export async function readAccountProfile(
  session: Extract<AccountSession, { status: "authenticated" }>,
  orderCount: number,
): Promise<AccountProfile> {
  const result = await session.client.graphql(ACCOUNT_PROFILE_QUERY, {
    accessToken: session.accessToken,
    variables: {
      orderCount,
      addressCount: ACCOUNT_ADDRESS_LIMIT,
      previewCount: ORDER_PREVIEW_LINE_LIMIT,
    },
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
    orders: customer.orders.nodes.map((order) =>
      mapOrderSummary(session.locale, order),
    ),
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
    variables: {
      orderId,
      lineCount: ORDER_LINE_LIMIT,
      fulfillmentCount: ORDER_FULFILLMENT_LIMIT,
    },
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
    status: fulfillmentStatus(order.fulfillmentStatus),
    payment: paymentStatus(order.financialStatus),
    statusPageUrl: httpsUrl(order.statusPageUrl),
    shipments: order.fulfillments.nodes.map((fulfillment) => ({
      id: fulfillment.id,
      shippedAt: fulfillment.createdAt,
      estimatedDeliveryAt: fulfillment.estimatedDeliveryAt ?? null,
      carrier: fulfillment.trackingInformation[0]?.company ?? null,
      trackingNumber: fulfillment.trackingInformation[0]?.number ?? null,
      trackingUrl: httpsUrl(fulfillment.trackingInformation[0]?.url),
    })),
    lines: order.lineItems.nodes.map((line) => ({
      id: line.id,
      title: line.title,
      variantTitle: line.variantTitle ?? null,
      sku: line.sku || null,
      image: accountImage(line.image, line.title),
      quantity: line.quantity,
      unitPrice:
        line.price === null || line.price === undefined
          ? null
          : formatAccountMoney(line.price, session.locale),
      total:
        line.totalPrice === null || line.totalPrice === undefined
          ? "—"
          : formatAccountMoney(line.totalPrice, session.locale),
    })),
    subtotal: order.subtotal
      ? formatAccountMoney(order.subtotal, session.locale)
      : null,
    shipping: formatAccountMoney(order.totalShipping, session.locale),
    tax: order.totalTax
      ? formatAccountMoney(order.totalTax, session.locale)
      : null,
    total: formatAccountMoney(order.totalPrice, session.locale),
    shippingAddress: order.shippingAddress?.formatted ?? null,
    billingAddress: order.billingAddress?.formatted ?? null,
  };
}
