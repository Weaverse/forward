import {
  COLLECTION_PRESENTATION_PROFILES,
  type CanonicalCollectionHandle,
} from "@/lib/storefront/collection-presentation";
import type { NavItem, StorefrontImage } from "@/lib/storefront/types";

export interface FieldIndexCollection {
  id: Exclude<CanonicalCollectionHandle, "forward">;
  index: "01" | "02" | "03";
  label: string;
  href: string;
  coordinate: string;
  description: string;
  fieldNote: string;
  image: StorefrontImage;
}

/** Carries the current route query through header navigation unchanged. */
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
  return `${base}${base.includes("?") ? "&" : "?"}${queryString}${hash}`;
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
    throw new Error("Header 01 requires Shop to have exactly three children.");
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
