import {
  COLLECTION_PRESENTATION_PROFILES,
  type CollectionPresentationProfile,
} from "../collection-presentation";
import type { Collection, FooterColumn, NavItem } from "../types";
import type { NavigationQueryResult } from "./client";
import { ShopifyCatalogError } from "./errors";
import { FOOTER_MENU_HANDLE } from "./navigation-query";

interface ExpectedMenuItem {
  label: string;
  href: string;
  sourcePaths: readonly string[];
  children?: readonly ExpectedMenuItem[];
}

const EXPECTED_MENU = [
  {
    label: "Shop",
    href: "/shop",
    sourcePaths: ["/shop", "/collections/forward"],
    children: [
      {
        label: "Outerwear",
        href: "/shop/outerwear",
        sourcePaths: ["/shop/outerwear", "/collections/outerwear"],
      },
      {
        label: "Packs",
        href: "/shop/packs",
        sourcePaths: ["/shop/packs", "/collections/packs"],
      },
      {
        label: "Footwear",
        href: "/shop/footwear",
        sourcePaths: ["/shop/footwear", "/collections/footwear"],
      },
    ],
  },
  {
    label: "Field Notes",
    href: "/journal",
    sourcePaths: ["/journal", "/blogs/field-notes"],
  },
  {
    label: "About",
    href: "/pages/about-forward",
    sourcePaths: ["/pages/about-forward"],
  },
] as const satisfies readonly ExpectedMenuItem[];

const EXPECTED_FOOTER_MENU = [
  {
    label: "Shop",
    href: "/shop",
    sourcePaths: ["/shop", "/collections/forward"],
    children: [
      {
        label: "All products",
        href: "/shop",
        sourcePaths: ["/shop", "/collections/forward"],
      },
      {
        label: "Outerwear",
        href: "/shop/outerwear",
        sourcePaths: ["/shop/outerwear", "/collections/outerwear"],
      },
      {
        label: "Packs",
        href: "/shop/packs",
        sourcePaths: ["/shop/packs", "/collections/packs"],
      },
      {
        label: "Footwear",
        href: "/shop/footwear",
        sourcePaths: ["/shop/footwear", "/collections/footwear"],
      },
    ],
  },
  {
    label: "Company",
    href: "/pages/about-forward",
    sourcePaths: ["/pages/about-forward"],
    children: [
      {
        label: "About Forward",
        href: "/pages/about-forward",
        sourcePaths: ["/pages/about-forward"],
      },
      {
        label: "Field Repair",
        href: "/pages/field-repair",
        sourcePaths: ["/pages/field-repair"],
      },
      {
        label: "Shipping & Returns",
        href: "/pages/shipping-returns",
        sourcePaths: ["/pages/shipping-returns"],
      },
      {
        label: "Contact",
        href: "/pages/contact",
        sourcePaths: ["/pages/contact"],
      },
    ],
  },
  {
    label: "Support",
    href: "/account",
    sourcePaths: ["/account"],
    children: [
      {
        label: "Account",
        href: "/account",
        sourcePaths: ["/account"],
      },
      {
        label: "Shipping",
        href: "/policies/shipping-policy",
        sourcePaths: ["/policies/shipping-policy"],
      },
      {
        label: "Returns",
        href: "/policies/return-policy",
        sourcePaths: ["/policies/return-policy", "/policies/refund-policy"],
      },
      {
        label: "Privacy",
        href: "/policies/privacy-policy",
        sourcePaths: ["/policies/privacy-policy"],
      },
      {
        label: "Terms",
        href: "/policies/terms-of-service",
        sourcePaths: ["/policies/terms-of-service"],
      },
    ],
  },
] as const satisfies readonly ExpectedMenuItem[];

export interface NavigationSnapshot {
  primary: readonly NavItem[];
  collections: readonly Collection[];
}

function fail(message: string): never {
  throw new ShopifyCatalogError(message);
}

function asRecord(value: unknown, context: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(`${context} is not an object.`);
  }
  return value as Record<string, unknown>;
}

function asArray(value: unknown, context: string): readonly unknown[] {
  if (!Array.isArray(value)) {
    fail(`${context} is not an array.`);
  }
  return value;
}

function asText(value: unknown, context: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(`${context} is missing or empty.`);
  }
  return value.trim();
}

function readInternalPath(
  value: unknown,
  context: string,
  storeDomain: string,
): string {
  const raw = asText(value, `${context} url`);
  if (raw.startsWith("//")) {
    fail(`${context} url must be relative or use an explicit HTTPS origin.`);
  }
  if (raw.includes("?") || raw.includes("#")) {
    fail(`${context} url must not include query or fragment delimiters.`);
  }
  let url: URL;
  try {
    url = new URL(raw, "https://forward-navigation.invalid");
  } catch {
    return fail(`${context} url is invalid.`);
  }
  const isSyntheticRelativeOrigin =
    url.hostname === "forward-navigation.invalid" &&
    raw.startsWith("/") &&
    !raw.startsWith("//");
  const isConfiguredStoreOrigin =
    url.protocol === "https:" &&
    url.hostname === storeDomain.toLowerCase() &&
    url.username.length === 0 &&
    url.password.length === 0 &&
    url.port.length === 0;
  if (!isSyntheticRelativeOrigin && !isConfiguredStoreOrigin) {
    fail(`${context} url must target the configured Shopify store.`);
  }
  if (url.search.length > 0 || url.hash.length > 0) {
    fail(`${context} url must not include query or fragment state.`);
  }
  const path = url.pathname.replace(/\/$/, "") || "/";
  return path;
}

function mapMenuItem(
  value: unknown,
  expected: ExpectedMenuItem,
  context: string,
  storeDomain: string,
): NavItem {
  const record = asRecord(value, context);
  const label = asText(record.title, `${context} title`);
  if (label !== expected.label) {
    fail(`${context} title must be "${expected.label}".`);
  }
  const sourcePath = readInternalPath(record.url, context, storeDomain);
  if (!expected.sourcePaths.includes(sourcePath)) {
    fail(`${context} url does not map to ${expected.href}.`);
  }

  const rawChildren = asArray(record.items, `${context} items`);
  const expectedChildren = expected.children ?? [];
  if (rawChildren.length !== expectedChildren.length) {
    fail(
      `${context} must contain exactly ${expectedChildren.length} children.`,
    );
  }
  const children = expectedChildren.map((child, index) =>
    mapMenuItem(
      rawChildren[index],
      child,
      `${context} child ${index}`,
      storeDomain,
    ),
  );

  return children.length === 0
    ? { href: expected.href, label }
    : { href: expected.href, label, children };
}

function mapMenu(
  value: unknown,
  storeDomain: string,
  menuHandle: string,
): readonly NavItem[] {
  if (value === null || value === undefined) {
    fail(`Shopify menu "${menuHandle}" is missing.`);
  }
  const menu = asRecord(value, `Shopify menu "${menuHandle}"`);
  if (menu.handle !== menuHandle) {
    fail(`Shopify returned the wrong menu handle.`);
  }
  const items = asArray(menu.items, `Shopify menu "${menuHandle}" items`);
  if (items.length !== EXPECTED_MENU.length) {
    fail(`Shopify menu "${menuHandle}" must contain exactly three items.`);
  }
  return EXPECTED_MENU.map((expected, index) =>
    mapMenuItem(
      items[index],
      expected,
      `Shopify menu item ${index}`,
      storeDomain,
    ),
  );
}

function mapFooterMenu(
  value: unknown,
  storeDomain: string,
): readonly FooterColumn[] {
  if (value === null || value === undefined) {
    fail(`Shopify menu "${FOOTER_MENU_HANDLE}" is missing.`);
  }
  const menu = asRecord(value, `Shopify menu "${FOOTER_MENU_HANDLE}"`);
  if (menu.handle !== FOOTER_MENU_HANDLE) {
    fail("Shopify returned the wrong footer menu handle.");
  }
  const items = asArray(
    menu.items,
    `Shopify menu "${FOOTER_MENU_HANDLE}" items`,
  );
  if (items.length !== EXPECTED_FOOTER_MENU.length) {
    fail(
      `Shopify menu "${FOOTER_MENU_HANDLE}" must contain exactly three columns.`,
    );
  }
  return EXPECTED_FOOTER_MENU.map((expected, index) => {
    const mapped = mapMenuItem(
      items[index],
      expected,
      `Shopify footer column ${index}`,
      storeDomain,
    );
    if (mapped.children === undefined) {
      fail(`Shopify footer column ${index} must contain navigation links.`);
    }
    return { heading: mapped.label, links: mapped.children };
  });
}

function mapCollection(
  value: unknown,
  profile: CollectionPresentationProfile,
): Collection {
  const context = `Shopify collection "${profile.handle}"`;
  const record = asRecord(value, context);
  if (record.handle !== profile.handle) {
    fail(`${context} returned the wrong handle.`);
  }
  const title = asText(record.title, `${context} title`);
  if (title !== profile.title) {
    fail(`${context} title must be "${profile.title}".`);
  }
  const products = asRecord(record.products, `${context} products`);
  const pageInfo = asRecord(products.pageInfo, `${context} products pageInfo`);
  if (pageInfo.hasNextPage !== false) {
    fail(`${context} products page must be complete and unpaginated.`);
  }
  const productHandles = asArray(
    products.nodes,
    `${context} product nodes`,
  ).map((entry, index) =>
    asText(
      asRecord(entry, `${context} product ${index}`).handle,
      `${context} product ${index} handle`,
    ),
  );
  if (
    productHandles.length !== profile.productHandles.length ||
    productHandles.some(
      (handle, index) => handle !== profile.productHandles[index],
    )
  ) {
    fail(`${context} product membership/order does not match the contract.`);
  }
  return {
    handle: profile.handle,
    title,
    description: profile.description,
    fieldCode: profile.fieldCode,
    heroImage: profile.heroImage,
    productHandles,
  };
}

function mapCollections(value: unknown): readonly Collection[] {
  const connection = asRecord(value, "Shopify collections");
  const pageInfo = asRecord(
    connection.pageInfo,
    "Shopify collections pageInfo",
  );
  if (pageInfo.hasNextPage !== false) {
    fail("Shopify collections page must be complete and unpaginated.");
  }
  const nodes = asArray(connection.nodes, "Shopify collection nodes");
  const byHandle = new Map<string, unknown>();
  for (const [index, node] of nodes.entries()) {
    const record = asRecord(node, `Shopify collection node ${index}`);
    const handle = asText(
      record.handle,
      `Shopify collection node ${index} handle`,
    );
    if (byHandle.has(handle)) {
      fail(`Shopify returned duplicate collection handle "${handle}".`);
    }
    byHandle.set(handle, node);
  }
  return COLLECTION_PRESENTATION_PROFILES.map((profile) => {
    const node = byHandle.get(profile.handle);
    if (node === undefined) {
      fail(`Shopify collection "${profile.handle}" is missing.`);
    }
    return mapCollection(node, profile);
  });
}

type NavigationRootField = "menu" | "footerMenu" | "collections";

const NAVIGATION_ROOT_FIELDS = new Set<NavigationRootField>([
  "menu",
  "footerMenu",
  "collections",
]);

function errorAffectsField(
  error: unknown,
  index: number,
  field: NavigationRootField,
): boolean {
  const record = asRecord(error, `Storefront navigation error ${index}`);
  if (!Array.isArray(record.path) || record.path.length === 0) {
    return true;
  }
  const root = record.path[0];
  if (
    typeof root !== "string" ||
    !NAVIGATION_ROOT_FIELDS.has(root as NavigationRootField)
  ) {
    return true;
  }
  return root === field;
}

function readRoot(
  result: NavigationQueryResult,
  field: NavigationRootField,
): Record<string, unknown> {
  if (result.errors !== undefined) {
    const errors = asArray(result.errors, "Storefront navigation errors");
    const affectedCount = errors.filter((error, index) =>
      errorAffectsField(error, index, field),
    ).length;
    if (affectedCount > 0) {
      fail(
        `Storefront navigation field "${field}" contained ${affectedCount} error(s).`,
      );
    }
  }
  return asRecord(result.data, "Storefront navigation response data");
}

export function mapMainMenuResult(
  result: NavigationQueryResult,
  storeDomain: string,
  menuHandle: string,
): readonly NavItem[] {
  return mapMenu(readRoot(result, "menu").menu, storeDomain, menuHandle);
}

export function mapFooterMenuResult(
  result: NavigationQueryResult,
  storeDomain: string,
): readonly FooterColumn[] {
  return mapFooterMenu(readRoot(result, "footerMenu").footerMenu, storeDomain);
}

export function mapCollectionsResult(
  result: NavigationQueryResult,
): readonly Collection[] {
  return mapCollections(readRoot(result, "collections").collections);
}

export function mapNavigationResult(
  result: NavigationQueryResult,
  storeDomain: string,
  menuHandle: string,
): NavigationSnapshot {
  return {
    primary: mapMainMenuResult(result, storeDomain, menuHandle),
    collections: mapCollectionsResult(result),
  };
}
