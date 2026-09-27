import type {
  Collection,
  NavItem,
  StorefrontImage,
} from "@/lib/storefront/types";

export interface FieldIndexCollection {
  id: string;
  index: string;
  label: string;
  href: string;
  fieldCode: string;
  description: string;
  image: StorefrontImage | null;
}

/**
 * Query parameters each header destination legitimately owns.
 *
 * Anything absent from a destination's list is dropped, so PDP selection state
 * (`colorway` plus the product option keys) and another route's search/PLP
 * state can never ride a header link into an unrelated destination.
 */
const DESTINATION_OWNED_PARAMS: readonly {
  prefix: string;
  params: readonly string[];
}[] = [
  { prefix: "/search", params: ["q"] },
  { prefix: "/shop", params: ["category", "activity", "sort"] },
];

function ownedParams(path: string): readonly string[] {
  return (
    DESTINATION_OWNED_PARAMS.find(
      ({ prefix }) => path === prefix || path.startsWith(`${prefix}/`),
    )?.params ?? []
  );
}

/** Carries only the query state the header destination itself owns. */
export function createHeaderNavigationHref(
  href: string,
  queryString: string,
): string {
  if (queryString.length === 0) {
    return href;
  }
  const hashIndex = href.indexOf("#");
  const base = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
  const queryIndex = base.indexOf("?");
  const path = queryIndex >= 0 ? base.slice(0, queryIndex) : base;
  const owned = ownedParams(path);
  const params = new URLSearchParams(
    queryIndex >= 0 ? base.slice(queryIndex + 1) : "",
  );
  for (const [key, value] of new URLSearchParams(queryString)) {
    if (owned.includes(key) && !params.has(key)) {
      params.append(key, value);
    }
  }
  const query = params.toString();
  return `${path}${query === "" ? "" : `?${query}`}${hash}`;
}

/** True when `href` names the current page or one of its nested routes. */
export function isActive(pathname: string, href: string): boolean {
  if (pathname === href || pathname.startsWith(`${href}/`)) {
    return true;
  }
  return href === "/shop" && pathname.startsWith("/products");
}

/**
 * Index of the deepest matching Shop destination, or `-1` when none matches,
 * so `/shop/packs` marks Packs rather than the broader `Shop all` entry.
 */
export function currentCollectionIndex(
  pathname: string,
  collections: readonly FieldIndexCollection[],
): number {
  return collections.reduce(
    (best, collection, index) =>
      isActive(pathname, collection.href) &&
      collection.href.length > (collections[best]?.href.length ?? 0)
        ? index
        : best,
    -1,
  );
}

/** True when `href`, or any of its children, names the current page. */
export function isBranchActive(pathname: string, item: NavItem): boolean {
  return (
    isActive(pathname, item.href) ||
    item.children?.some((child) => isActive(pathname, child.href)) === true
  );
}

/** Highlighted panel row: the current destination, or the first collection. */
export function activeCollectionIndex(
  pathname: string,
  collections: readonly FieldIndexCollection[],
): number {
  return Math.max(currentCollectionIndex(pathname, collections), 0);
}

/** True for the catalog and any collection route. */
function isCatalogHref(href: string): boolean {
  return href === "/shop" || href.startsWith("/shop/");
}

/** The top-level menu entry that opens the Shop panel: the catalog branch. */
export function findShopItem(primary: readonly NavItem[]): NavItem | undefined {
  return primary.find((item) => isCatalogHref(item.href));
}

/**
 * The Shop panel's rows: the merchant's Shop links, in the merchant's order,
 * each dressed with its collection's own description, image and field code.
 * A link to a collection the store does not publish keeps its label and loses
 * the rest. No Shop links means no panel.
 */
export function fieldIndexCollections(
  shopItem: NavItem | undefined,
  collections: readonly Collection[],
): readonly FieldIndexCollection[] | null {
  const children = shopItem?.children ?? [];
  if (children.length === 0) {
    return null;
  }
  return children.map((item, index) => {
    const collection = collections.find(
      (entry) => item.href === `/shop/${entry.handle}`,
    );
    return {
      id: item.href,
      index: String(index).padStart(2, "0"),
      label: item.label,
      href: item.href,
      fieldCode: collection?.fieldCode ?? "",
      description: collection?.description ?? "",
      image: collection?.heroImage ?? null,
    };
  });
}

/** Account entry reports session state; every other destination keeps its label. */
export function accountNavigationLabel(
  item: NavItem,
  signedIn: boolean,
): string {
  return item.href === "/account" && signedIn ? "Signed in" : item.label;
}
