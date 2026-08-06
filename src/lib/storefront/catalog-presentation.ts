/**
 * Theme-owned catalog presentation profile.
 *
 * Shopify owns product identity, copy, price, options, media, and the `forward`
 * metafields. It does not currently own the editorial framing the approved
 * canonical source port depends on, so those fields stay here, keyed by the
 * three approved product handles.
 *
 * This is deliberately NOT a copy of the static `Product` fixture: it may only
 * carry fields Shopify does not own. Everything else must come from the live
 * adapter (or, in static mode, from `fixtures/products.ts`).
 *
 * Colorway IDs are canonical and load-bearing: PDP/PLP deep links
 * (`?colorway=charcoal`), the demo cart seed, and the demo order fixtures all
 * reference them. Mapping full Shopify Color labels onto these IDs is what
 * keeps those references valid.
 */

import type { ProductCategory } from "./types";

export interface PresentationColorway {
  /** Canonical normalized colorway id used by deep links and demo state. */
  id: string;
  /** Solid swatch color; presentation-owned until Shopify swatches exist. */
  swatchColor: string;
}

export interface CatalogPresentationProfile {
  handle: string;
  /** Canonical plate number used by the editorial framing. */
  plate: string;
  category: ProductCategory;
  /** Approved activity labels backing the current PLP filters. */
  activities: readonly string[];
  /** Concise subtitle; the live description is not an equivalent field. */
  subtitle: string;
  /** Repair-program copy. */
  repair: string;
  /** Related-product handle order. */
  relatedHandles: readonly string[];
  /** Exact Shopify `Color` option label -> canonical colorway identity. */
  colorways: Readonly<Record<string, PresentationColorway>>;
}

const CHARCOAL_SWATCH = "#3b403f";

/**
 * Canonical catalog order. Storefront API title/created ordering is not
 * authoritative for the approved presentation, so the adapter re-orders live
 * products to match this list.
 */
export const CANONICAL_PRODUCT_HANDLES = [
  "weatherline-shell",
  "ridge-30-field-pack",
  "talus-trail-shoe",
] as const;

export const CATALOG_PRESENTATION_PROFILES: readonly CatalogPresentationProfile[] =
  [
    {
      handle: "weatherline-shell",
      plate: "01",
      category: "shells",
      activities: ["alpine", "trail", "camp"],
      subtitle: "Three-layer waterproof shell for shifting coastal weather.",
      repair:
        "Field-repair small punctures with tenacious tape; our repairs program handles delaminations, zip replacements, and re-taping for the life of the garment.",
      relatedHandles: ["ridge-30-field-pack", "talus-trail-shoe"],
      colorways: {
        "Charcoal / Moss": { id: "charcoal", swatchColor: CHARCOAL_SWATCH },
        "Claystone / Charcoal": { id: "claystone", swatchColor: "#a9705a" },
      },
    },
    {
      handle: "ridge-30-field-pack",
      plate: "02",
      category: "packs",
      activities: ["alpine", "trail"],
      subtitle: "A 30-liter pack built for long days above the treeline.",
      repair:
        "Buckles, straps, and stays are standard parts we stock for replacement. Torn panels and blown seams go through the repairs program rather than the landfill.",
      relatedHandles: ["weatherline-shell", "talus-trail-shoe"],
      colorways: {
        "Charcoal / Moss / Tan": {
          id: "charcoal",
          swatchColor: CHARCOAL_SWATCH,
        },
        "Dune / Charcoal": { id: "dune", swatchColor: "#c4ad83" },
      },
    },
    {
      handle: "talus-trail-shoe",
      plate: "03",
      category: "footwear",
      activities: ["trail", "camp"],
      subtitle: "Grippy, stable footwear for scree, roots, and river rock.",
      repair:
        "Delaminated outsoles within reason are re-bonded through the repairs program. Worn laces and insoles are standard replaceable parts.",
      relatedHandles: ["ridge-30-field-pack", "weatherline-shell"],
      colorways: {
        "Charcoal / Moss / Gum": {
          id: "charcoal",
          swatchColor: CHARCOAL_SWATCH,
        },
        "Limestone / Clay / Moss": { id: "limestone", swatchColor: "#cfc8b8" },
      },
    },
  ] as const;

const PROFILES_BY_HANDLE = new Map<string, CatalogPresentationProfile>(
  CATALOG_PRESENTATION_PROFILES.map((profile) => [profile.handle, profile]),
);

/** Returns the approved presentation profile, or `null` for unknown handles. */
export function getCatalogPresentationProfile(
  handle: string,
): CatalogPresentationProfile | null {
  return PROFILES_BY_HANDLE.get(handle) ?? null;
}
