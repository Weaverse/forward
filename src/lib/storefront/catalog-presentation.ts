/** Theme-owned presentation fields keyed by the exact managed catalog handles. */

import type { ProductCategory } from "./types";

export interface PresentationColorway {
  id: string;
  swatchColor: string;
}

export interface CatalogPresentationProfile {
  handle: string;
  plate: string;
  category: ProductCategory;
  activities: readonly string[];
  subtitle: string;
  repair: string;
  relatedHandles: readonly string[];
  colorways: Readonly<Record<string, PresentationColorway>>;
}

const CHARCOAL = "#3b403f";
const MOSS = "#59654b";
const CLAYSTONE = "#a9705a";
const DUNE = "#c4ad83";
const LIMESTONE = "#cfc8b8";

export const CANONICAL_PRODUCT_HANDLES = [
  "weatherline-shell",
  "traverse-grid-fleece",
  "drift-insulated-vest",
  "ridge-30-field-pack",
  "approach-18-day-pack",
  "waypoint-sling-6",
  "talus-trail-shoe",
  "scree-approach-shoe",
  "camp-recovery-clog",
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
      relatedHandles: ["traverse-grid-fleece", "ridge-30-field-pack"],
      colorways: {
        "Charcoal / Moss": { id: "charcoal", swatchColor: CHARCOAL },
        "Claystone / Charcoal": { id: "claystone", swatchColor: CLAYSTONE },
      },
    },
    {
      handle: "traverse-grid-fleece",
      plate: "02",
      category: "shells",
      activities: ["trail", "alpine", "travel"],
      subtitle: "Breathable grid fleece for fast temperature changes.",
      repair:
        "Cuffs, pocket openings, and small tears can be reinforced through the Forward repair program.",
      relatedHandles: ["weatherline-shell", "drift-insulated-vest"],
      colorways: {
        "Moss / Charcoal": { id: "moss-charcoal", swatchColor: MOSS },
        "Claystone / Bone": { id: "claystone-bone", swatchColor: CLAYSTONE },
      },
    },
    {
      handle: "drift-insulated-vest",
      plate: "03",
      category: "shells",
      activities: ["alpine", "camp", "travel"],
      subtitle: "Packable synthetic warmth for exposed starts and stops.",
      repair:
        "Shell tears, pocket damage, and insulation migration are assessed and repaired where construction allows.",
      relatedHandles: ["traverse-grid-fleece", "weatherline-shell"],
      colorways: {
        "Charcoal / Signal": { id: "charcoal-signal", swatchColor: CHARCOAL },
        "Dune / Moss": { id: "dune-moss", swatchColor: DUNE },
      },
    },
    {
      handle: "ridge-30-field-pack",
      plate: "04",
      category: "packs",
      activities: ["alpine", "trail"],
      subtitle: "A 30-liter pack built for long days above the treeline.",
      repair:
        "Buckles, straps, and stays are standard parts we stock for replacement. Torn panels and blown seams go through the repairs program rather than the landfill.",
      relatedHandles: ["approach-18-day-pack", "weatherline-shell"],
      colorways: {
        "Charcoal / Moss / Tan": { id: "charcoal", swatchColor: CHARCOAL },
        "Dune / Charcoal": { id: "dune", swatchColor: DUNE },
      },
    },
    {
      handle: "approach-18-day-pack",
      plate: "05",
      category: "packs",
      activities: ["alpine", "trail", "travel"],
      subtitle: "Close-body 18-liter carry for short technical days.",
      repair:
        "Replaceable hardware and repairable seams keep the pack in service after hard use.",
      relatedHandles: ["ridge-30-field-pack", "scree-approach-shoe"],
      colorways: {
        "Moss / Charcoal": { id: "moss-charcoal", swatchColor: MOSS },
        "Claystone / Dune": { id: "claystone-dune", swatchColor: CLAYSTONE },
      },
    },
    {
      handle: "waypoint-sling-6",
      plate: "06",
      category: "packs",
      activities: ["travel", "camp"],
      subtitle: "Compact six-liter carry with fast, one-handed access.",
      repair:
        "Straps, buckles, zip pulls, and accessible seams can be replaced or reinforced.",
      relatedHandles: ["approach-18-day-pack", "camp-recovery-clog"],
      colorways: {
        "Charcoal / Signal": { id: "charcoal-signal", swatchColor: CHARCOAL },
        "Dune / Moss": { id: "dune-moss", swatchColor: DUNE },
      },
    },
    {
      handle: "talus-trail-shoe",
      plate: "07",
      category: "footwear",
      activities: ["trail", "camp"],
      subtitle: "Grippy, stable footwear for scree, roots, and river rock.",
      repair:
        "Delaminated outsoles within reason are re-bonded through the repairs program. Worn laces and insoles are standard replaceable parts.",
      relatedHandles: ["scree-approach-shoe", "ridge-30-field-pack"],
      colorways: {
        "Charcoal / Moss / Gum": { id: "charcoal", swatchColor: CHARCOAL },
        "Limestone / Clay / Moss": { id: "limestone", swatchColor: LIMESTONE },
      },
    },
    {
      handle: "scree-approach-shoe",
      plate: "08",
      category: "footwear",
      activities: ["alpine", "trail"],
      subtitle: "Precise low-profile footwear for rock and mixed approaches.",
      repair:
        "Laces and footbeds are replaceable; repairable bonding failures are assessed by the repair desk.",
      relatedHandles: ["talus-trail-shoe", "approach-18-day-pack"],
      colorways: {
        "Charcoal / Gum": { id: "charcoal-gum", swatchColor: CHARCOAL },
        "Limestone / Moss": { id: "limestone-moss", swatchColor: LIMESTONE },
      },
    },
    {
      handle: "camp-recovery-clog",
      plate: "09",
      category: "footwear",
      activities: ["camp", "travel"],
      subtitle: "Easy-on recovery footwear with durable wet-ground traction.",
      repair:
        "Replaceable straps and repairable bonding failures are handled through the repair desk.",
      relatedHandles: ["talus-trail-shoe", "waypoint-sling-6"],
      colorways: {
        "Charcoal / Moss": { id: "charcoal-moss", swatchColor: CHARCOAL },
        "Dune / Claystone": { id: "dune-claystone", swatchColor: DUNE },
      },
    },
  ];

const PROFILES_BY_HANDLE = new Map<string, CatalogPresentationProfile>(
  CATALOG_PRESENTATION_PROFILES.map((profile) => [profile.handle, profile]),
);

export function getCatalogPresentationProfile(
  handle: string,
): CatalogPresentationProfile | null {
  return PROFILES_BY_HANDLE.get(handle) ?? null;
}
