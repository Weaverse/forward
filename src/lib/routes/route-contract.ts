/**
 * Route contract for the Forward storefront.
 *
 * This module is the single owner of the route topology defined in
 * `.weaverse/specs/2026-08-05--fresh-next-theme-foundation/README.md`
 * (Shared Contract 0.6-draft). Build validation (`bun run check:routes`),
 * production smoke (`bun run smoke:routes`), unit tests, and shell UI all
 * read from here instead of duplicating path strings.
 */

export type RouteCategory =
  | "storefront"
  | "commerce"
  | "editorial"
  | "content"
  | "account"
  | "account-protocol"
  | "resource";

export interface RouteSmoke {
  /** Concrete path hit against a production server. */
  path: string;
  /** Expected HTTP status from `next start`. */
  expectedStatus: number;
  /** Optional media type prefix expected from the response. */
  expectedContentType?: string;
}

export interface RouteContractEntry {
  /** App Router pattern, e.g. `/shop/[collectionHandle]`. */
  pattern: string;
  label: string;
  category: RouteCategory;
  smoke: RouteSmoke;
}

export interface RedirectContractEntry {
  /** `next.config.ts` source pattern (`:param` syntax). */
  source: string;
  /** Redirect destination pattern (`:param` syntax). */
  destination: string;
  permanent: true;
  smoke: {
    path: string;
    expectedLocation: string;
  };
}

/**
 * Route-smoke fixture handles only. Approved in the foundation spec; they are
 * NOT resolved production handles and must never leak into live data clients.
 */
export const SMOKE_FIXTURES = {
  productHandles: [
    "weatherline-shell",
    "ridge-30-field-pack",
    "talus-trail-shoe",
  ],
  collectionHandle: "outerwear",
  articleHandle: "walking-the-long-light",
  pageHandle: "about-forward",
  policyHandle: "shipping-policy",
  orderId: "1001",
} as const;

export const LIVE_CONTENT_SMOKE_FIXTURES = {
  articleHandle: "layering-for-moving-weather",
  pageHandle: "about-forward",
  policyHandle: "shipping-policy",
} as const;

const PRIMARY_PRODUCT_FIXTURE = SMOKE_FIXTURES.productHandles[0];

export const CANONICAL_ROUTES: readonly RouteContractEntry[] = [
  {
    pattern: "/",
    label: "Home",
    category: "storefront",
    smoke: { path: "/", expectedStatus: 200 },
  },
  {
    pattern: "/shop",
    label: "Shop",
    category: "commerce",
    smoke: { path: "/shop", expectedStatus: 200 },
  },
  {
    pattern: "/shop/[collectionHandle]",
    label: "Collection",
    category: "commerce",
    smoke: {
      path: `/shop/${SMOKE_FIXTURES.collectionHandle}`,
      expectedStatus: 200,
    },
  },
  {
    pattern: "/products/[productHandle]",
    label: "Product",
    category: "commerce",
    smoke: {
      path: `/products/${PRIMARY_PRODUCT_FIXTURE}`,
      expectedStatus: 200,
    },
  },
  {
    pattern: "/search",
    label: "Search",
    category: "commerce",
    smoke: { path: "/search", expectedStatus: 200 },
  },
  {
    pattern: "/cart",
    label: "Cart",
    category: "commerce",
    smoke: { path: "/cart", expectedStatus: 200 },
  },
  {
    pattern: "/journal",
    label: "Journal",
    category: "editorial",
    smoke: { path: "/journal", expectedStatus: 200 },
  },
  {
    pattern: "/journal/[articleHandle]",
    label: "Journal article",
    category: "editorial",
    smoke: {
      path: `/journal/${SMOKE_FIXTURES.articleHandle}`,
      expectedStatus: 200,
    },
  },
  {
    pattern: "/pages/[pageHandle]",
    label: "Store page",
    category: "content",
    smoke: {
      path: `/pages/${SMOKE_FIXTURES.pageHandle}`,
      expectedStatus: 200,
    },
  },
  {
    pattern: "/policies/[policyHandle]",
    label: "Policy",
    category: "content",
    smoke: {
      path: `/policies/${SMOKE_FIXTURES.policyHandle}`,
      expectedStatus: 200,
    },
  },
  {
    pattern: "/account",
    label: "Account overview",
    category: "account",
    smoke: { path: "/account", expectedStatus: 200 },
  },
  {
    pattern: "/account/orders",
    label: "Order history",
    category: "account",
    smoke: { path: "/account/orders", expectedStatus: 200 },
  },
  {
    pattern: "/account/orders/[orderId]",
    label: "Order detail",
    category: "account",
    smoke: {
      path: `/account/orders/${SMOKE_FIXTURES.orderId}`,
      expectedStatus: 200,
    },
  },
  {
    pattern: "/account/addresses",
    label: "Addresses",
    category: "account",
    smoke: { path: "/account/addresses", expectedStatus: 200 },
  },
  {
    pattern: "/account/login",
    label: "Sign in",
    category: "account",
    smoke: { path: "/account/login", expectedStatus: 200 },
  },
] as const;

/**
 * Account protocol surfaces. In the foundation slice these are explicit
 * placeholders that answer 501 Not Implemented — they must not pretend
 * Customer Account authentication exists.
 */
export const ACCOUNT_PROTOCOL_ROUTES: readonly RouteContractEntry[] = [
  {
    pattern: "/account/authorize",
    label: "OAuth authorize callback (placeholder)",
    category: "account-protocol",
    smoke: {
      path: "/account/authorize",
      expectedStatus: 501,
      expectedContentType: "text/plain",
    },
  },
  {
    pattern: "/account/logout",
    label: "Logout endpoint (placeholder)",
    category: "account-protocol",
    smoke: {
      path: "/account/logout",
      expectedStatus: 501,
      expectedContentType: "text/plain",
    },
  },
] as const;

export const RESOURCE_ROUTES: readonly RouteContractEntry[] = [
  {
    pattern: "/robots.txt",
    label: "Robots",
    category: "resource",
    smoke: {
      path: "/robots.txt",
      expectedStatus: 200,
      expectedContentType: "text/plain",
    },
  },
  {
    pattern: "/sitemap.xml",
    label: "Sitemap",
    category: "resource",
    smoke: {
      path: "/sitemap.xml",
      expectedStatus: 200,
      expectedContentType: "application/xml",
    },
  },
] as const;

export const ROUTE_CONTRACT: readonly RouteContractEntry[] = [
  ...CANONICAL_ROUTES,
  ...ACCOUNT_PROTOCOL_ROUTES,
  ...RESOURCE_ROUTES,
] as const;

/** A path that must exercise the root `not-found.tsx`, never a dynamic route. */
export const NOT_FOUND_SMOKE: RouteSmoke = {
  path: "/__forward-route-smoke-missing__",
  expectedStatus: 404,
  expectedContentType: "text/html",
};

/** Dynamic fixture routes must reject unknown handles rather than invent data. */
export const DYNAMIC_NOT_FOUND_SMOKES: readonly RouteSmoke[] = [
  "/shop/__forward-missing__",
  "/products/__forward-missing__",
  "/journal/__forward-missing__",
  "/pages/__forward-missing__",
  "/policies/__forward-missing__",
  "/account/orders/__forward-missing__",
].map((path) => ({
  path,
  expectedStatus: 404,
  expectedContentType: "text/html",
}));

/**
 * Shopify-compatibility redirects. Order matters: the literal
 * `/collections/all` case must precede the parameterised collection rule.
 */
export const REDIRECT_CONTRACT: readonly RedirectContractEntry[] = [
  {
    source: "/collections/all",
    destination: "/shop",
    permanent: true,
    smoke: {
      path: "/collections/all?utm_source=route-smoke",
      expectedLocation: "/shop?utm_source=route-smoke",
    },
  },
  {
    source: "/collections/:collectionHandle",
    destination: "/shop/:collectionHandle",
    permanent: true,
    smoke: {
      path: `/collections/${SMOKE_FIXTURES.collectionHandle}`,
      expectedLocation: `/shop/${SMOKE_FIXTURES.collectionHandle}`,
    },
  },
  {
    source: "/blogs/journal",
    destination: "/journal",
    permanent: true,
    smoke: { path: "/blogs/journal", expectedLocation: "/journal" },
  },
  {
    source: "/blogs/journal/:articleHandle",
    destination: "/journal/:articleHandle",
    permanent: true,
    smoke: {
      path: `/blogs/journal/${SMOKE_FIXTURES.articleHandle}`,
      expectedLocation: `/journal/${SMOKE_FIXTURES.articleHandle}`,
    },
  },
] as const;

/** Status code `next start` answers for `permanent: true` redirects. */
export const PERMANENT_REDIRECT_STATUS = 308;

/**
 * Normalizes an App Router build-manifest key (e.g. `/shop/[collectionHandle]/page`,
 * `/(marketing)/journal/page`, `/account/logout/route`, `/robots.txt/route`)
 * to its public route pattern. Returns `null` for entries that are not
 * addressable pages/handlers (default routes, parallel-route slots).
 */
export function normalizeAppRoutePattern(manifestKey: string): string | null {
  const segments = manifestKey.split("/").filter(Boolean);
  const leaf = segments.at(-1);
  if (leaf !== "page" && leaf !== "route") {
    return null;
  }
  const pathSegments = segments
    .slice(0, -1)
    .filter((segment) => !(segment.startsWith("(") && segment.endsWith(")")))
    .filter((segment) => !segment.startsWith("@"));
  if (pathSegments.some((segment) => segment === "_not-found")) {
    return null;
  }
  return `/${pathSegments.join("/")}`;
}

/**
 * Returns the required route patterns that are absent from the actual build
 * output. Empty array means the build satisfies the contract.
 */
export function findMissingRoutePatterns(
  actualPatterns: Iterable<string>,
): string[] {
  const actual = new Set(actualPatterns);
  return ROUTE_CONTRACT.map((entry) => entry.pattern).filter(
    (pattern) => !actual.has(pattern),
  );
}
