import { isShopifyProductImageUrl } from "../image-source";
import type {
  Collection,
  FooterColumn,
  NavItem,
  StorefrontImage,
} from "../types";
import type { NavigationQueryResult } from "./client";
import { ShopifyCatalogError } from "./errors";
import { FOOTER_MENU_HANDLE } from "./navigation-query";

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

/**
 * The path a menu URL names on this store, or `null` when it points anywhere
 * else. Query and fragment state are dropped: a menu link names a
 * destination, never the state a shopper carries into it.
 */
function readStorePath(value: unknown, context: string, storeDomain: string) {
  const raw = asText(value, `${context} url`);
  if (raw.startsWith("//")) {
    return null;
  }
  let url: URL;
  try {
    url = new URL(raw, "https://forward-navigation.invalid");
  } catch {
    return null;
  }
  const isRelative =
    url.hostname === "forward-navigation.invalid" && raw.startsWith("/");
  const isStoreOrigin =
    url.protocol === "https:" &&
    url.hostname === storeDomain.toLowerCase() &&
    url.username.length === 0 &&
    url.password.length === 0 &&
    url.port.length === 0;
  if (!isRelative && !isStoreOrigin) {
    return null;
  }
  return url.pathname.replace(/\/$/, "") || "/";
}

/**
 * Shopify storefront paths and the theme routes that serve them.
 *
 * The theme has one journal, so every blog maps onto it. A path with no route
 * here maps to `null`, and the menu leaves that link out rather than render a
 * dead one.
 */
const THEME_ROUTES: readonly [RegExp, (match: RegExpMatchArray) => string][] = [
  [/^\/$/, () => "/"],
  [/^\/collections\/all$/, () => "/shop"],
  [/^\/collections\/([^/]+)$/, (match) => `/shop/${match[1]}`],
  [/^\/blogs\/[^/]+$/, () => "/journal"],
  [/^\/blogs\/[^/]+\/([^/]+)$/, (match) => `/journal/${match[1]}`],
  [/^\/(shop|journal|products|pages|policies)(\/[^/]+)?$/, (match) => match[0]],
  [/^\/(search|account|cart)$/, (match) => match[0]],
];

function toThemePath(path: string): string | null {
  for (const [pattern, route] of THEME_ROUTES) {
    const match = path.match(pattern);
    if (match !== null) {
      return route(match);
    }
  }
  return null;
}

/**
 * One menu entry exactly as the merchant arranged it.
 *
 * The query reads two levels of items, so only a top-level entry maps its
 * children. An entry the theme has no route for is `null`, with its children.
 */
function mapMenuItem(
  value: unknown,
  context: string,
  storeDomain: string,
  withChildren: boolean,
): NavItem | null {
  const record = asRecord(value, context);
  const label = asText(record.title, `${context} title`);
  const path = readStorePath(record.url, context, storeDomain);
  const href = path === null ? null : toThemePath(path);
  if (href === null) {
    return null;
  }
  const children = withChildren
    ? mapMenuItems(record.items, `${context} child`, storeDomain, false)
    : [];
  return children.length === 0 ? { href, label } : { href, label, children };
}

function mapMenuItems(
  value: unknown,
  context: string,
  storeDomain: string,
  withChildren: boolean,
): readonly NavItem[] {
  return asArray(value, `${context} items`)
    .map((item, index) =>
      mapMenuItem(item, `${context} ${index}`, storeDomain, withChildren),
    )
    .filter((item): item is NavItem => item !== null);
}

/** A menu's top-level items, or none when the store has no such menu. */
function readMenuItems(value: unknown, menuHandle: string): unknown {
  if (value === null || value === undefined) {
    return [];
  }
  const menu = asRecord(value, `Shopify menu "${menuHandle}"`);
  if (menu.handle !== menuHandle) {
    fail(`Shopify returned the wrong menu for "${menuHandle}".`);
  }
  return menu.items;
}

function mapMenu(
  value: unknown,
  storeDomain: string,
  menuHandle: string,
): readonly NavItem[] {
  return mapMenuItems(
    readMenuItems(value, menuHandle),
    "Shopify menu item",
    storeDomain,
    true,
  );
}

/**
 * The footer menu's top-level items are column headings, so a heading needs
 * no destination of its own — only its links do.
 */
function mapFooterMenu(
  value: unknown,
  storeDomain: string,
): readonly FooterColumn[] {
  return asArray(
    readMenuItems(value, FOOTER_MENU_HANDLE),
    "Shopify footer columns",
  ).map((item, index) => {
    const context = `Shopify footer column ${index}`;
    const record = asRecord(item, context);
    return {
      heading: asText(record.title, `${context} title`),
      links: mapMenuItems(record.items, `${context} link`, storeDomain, false),
    };
  });
}

function mapCollectionImage(
  value: unknown,
  title: string,
  context: string,
): StorefrontImage | null {
  if (value === null || value === undefined) {
    return null;
  }
  const record = asRecord(value, `${context} image`);
  const src = asText(record.url, `${context} image url`);
  /* Next Image only serves the owned CDN tenant; anything else would crash
   * the render, and the hero already handles a collection with no image. */
  if (!isShopifyProductImageUrl(src)) {
    return null;
  }
  const width = record.width;
  const height = record.height;
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    (width as number) <= 0 ||
    (height as number) <= 0
  ) {
    fail(`${context} image has no usable intrinsic dimensions.`);
  }
  const altText = record.altText;
  return {
    src,
    alt: typeof altText === "string" && altText.length > 0 ? altText : title,
    width: width as number,
    height: height as number,
  };
}

/**
 * A collection exactly as the store publishes it.
 *
 * Title, image and membership are the merchant's. Description and field code
 * are optional: a store that sets neither renders a collection without them
 * rather than borrowing copy the theme invented.
 */
function mapCollection(value: unknown, index: number): Collection {
  const context = `Shopify collection ${index}`;
  const record = asRecord(value, context);
  const handle = asText(record.handle, `${context} handle`);
  const title = asText(record.title, `Shopify collection "${handle}" title`);
  const products = asRecord(record.products, `${context} products`);
  const productHandles = asArray(
    products.nodes,
    `${context} product nodes`,
  ).map((entry, productIndex) =>
    asText(
      asRecord(entry, `${context} product ${productIndex}`).handle,
      `${context} product ${productIndex} handle`,
    ),
  );
  const description = record.description;
  const fieldCodeRecord = record.fieldCode;
  const fieldCode =
    fieldCodeRecord === null || fieldCodeRecord === undefined
      ? ""
      : asText(
          asRecord(fieldCodeRecord, `${context} field code`).value,
          `${context} field code value`,
        );

  return {
    handle,
    title,
    description: typeof description === "string" ? description : "",
    fieldCode,
    heroImage: mapCollectionImage(record.image, title, context),
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
  /* Every collection the store publishes, in the store's order. */
  return nodes.map((node, index) => mapCollection(node, index));
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
