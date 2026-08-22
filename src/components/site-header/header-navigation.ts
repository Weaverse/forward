import {
  COLLECTION_PRESENTATION_PROFILES,
  type CanonicalCollectionHandle,
} from "@/lib/storefront/collection-presentation";
import type { NavItem, StorefrontImage } from "@/lib/storefront/types";

export interface FieldIndexCollection {
  id: CanonicalCollectionHandle;
  index: "00" | "01" | "02" | "03";
  label: string;
  href: string;
  coordinate: string;
  description: string;
  fieldNote: string;
  image: StorefrontImage;
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

interface FieldIndexPresentation {
  id: FieldIndexCollection["id"];
  index: FieldIndexCollection["index"];
  href: string;
  coordinate: string;
  description: string;
  fieldNote: string;
  image: StorefrontImage;
}

function collectionImage(handle: FieldIndexCollection["id"]): StorefrontImage {
  const profile = COLLECTION_PRESENTATION_PROFILES.find(
    (entry) => entry.handle === handle,
  );
  if (profile === undefined) {
    throw new Error(`Missing collection presentation for ${handle}.`);
  }
  return profile.heroImage;
}

/** Static visual metadata; Shopify owns labels, order, hierarchy, and URLs. */
export const FIELD_INDEX_PRESENTATION = [
  {
    id: "forward",
    index: "00",
    href: "/shop",
    coordinate: "54.4609° N / 03.0886° W",
    description:
      "The complete Forward catalog, ordered as one continuous field index.",
    fieldNote: "Every system in one list, from shell layers to trail footwear.",
    image: collectionImage("forward"),
  },
  {
    id: "outerwear",
    index: "01",
    href: "/shop/outerwear",
    coordinate: "54.4609° N",
    description:
      "Weatherproof layers built for exposed ground and changing forecasts.",
    fieldNote: "Protection designed for movement, repair, and repeat use.",
    image: collectionImage("outerwear"),
  },
  {
    id: "packs",
    index: "02",
    href: "/shop/packs",
    coordinate: "03.0886° W",
    description:
      "Low-bulk carry systems composed for long miles above the tree line.",
    fieldNote: "Stable load transfer for distance, exposure, and movement.",
    image: collectionImage("packs"),
  },
  {
    id: "footwear",
    index: "03",
    href: "/shop/footwear",
    coordinate: "ALT. 978 M",
    description:
      "Dependable trail footwear tuned for grip, feedback, and long days out.",
    fieldNote: "Ground contact selected for utility, not excess.",
    image: collectionImage("footwear"),
  },
] as const satisfies readonly FieldIndexPresentation[];

/** Maps the exact Shopify `Shop` children into Header 01 presentation cards. */
export function createFieldIndexCollections(
  shopItem: NavItem,
): readonly FieldIndexCollection[] {
  const children = shopItem.children ?? [];
  if (children.length !== FIELD_INDEX_PRESENTATION.length) {
    throw new Error("Header 01 requires Shop to have exactly four children.");
  }
  return FIELD_INDEX_PRESENTATION.map((presentation, index) => {
    const item = children[index];
    if (item === undefined || item.href !== presentation.href) {
      throw new Error(
        `Header 01 Shop child ${index + 1} must target ${presentation.href}.`,
      );
    }
    if (item.children !== undefined && item.children.length > 0) {
      throw new Error(
        "Header 01 collection links cannot contain grandchildren.",
      );
    }
    return {
      ...presentation,
      label: item.label,
      href: item.href,
    };
  });
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
