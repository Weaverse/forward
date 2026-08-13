import type { StorefrontImage } from "./types";

export type CanonicalCollectionHandle =
  | "forward"
  | "outerwear"
  | "packs"
  | "footwear";

export interface CollectionPresentationProfile {
  handle: CanonicalCollectionHandle;
  title: string;
  fieldCode: string;
  description: string;
  heroImage: StorefrontImage;
  productHandles: readonly string[];
}

export const COLLECTION_PRESENTATION_PROFILES = [
  {
    handle: "forward",
    title: "Forward",
    fieldCode: "FW-00",
    description:
      "The complete Forward catalog: weather protection, modular carry, and trail footwear selected to work as one compact field system.",
    heroImage: {
      src: "/images/editorial/trail-movement.webp",
      alt: "Runner moving along a high dirt trail at golden hour",
      width: 2000,
      height: 1333,
    },
    productHandles: [
      "weatherline-shell",
      "traverse-grid-fleece",
      "drift-insulated-vest",
      "ridge-30-field-pack",
      "approach-18-day-pack",
      "waypoint-sling-6",
      "talus-trail-shoe",
      "scree-approach-shoe",
      "camp-recovery-clog",
    ],
  },
  {
    handle: "outerwear",
    title: "Outerwear",
    fieldCode: "OW-01",
    description:
      "Weatherproof layers built for exposed ground, changing forecasts, and repeat repair across long days outside.",
    heroImage: {
      src: "/images/editorial/alpine-traverse.webp",
      alt: "Hiker traversing an alpine ridgeline above the clouds",
      width: 1800,
      height: 1201,
    },
    productHandles: [
      "weatherline-shell",
      "traverse-grid-fleece",
      "drift-insulated-vest",
    ],
  },
  {
    handle: "packs",
    title: "Packs",
    fieldCode: "PK-02",
    description:
      "Low-bulk carry systems composed for stable movement, deliberate organization, and long miles above the tree line.",
    heroImage: {
      src: "/images/editorial/camp-tent.webp",
      alt: "Tent pitched at dusk beneath a mountain skyline",
      width: 2000,
      height: 1334,
    },
    productHandles: [
      "ridge-30-field-pack",
      "approach-18-day-pack",
      "waypoint-sling-6",
    ],
  },
  {
    handle: "footwear",
    title: "Footwear",
    fieldCode: "FT-03",
    description:
      "Dependable trail footwear tuned for grip, ground feedback, and sustained comfort across changing terrain.",
    heroImage: {
      src: "/images/editorial/trail-movement.webp",
      alt: "Runner moving along a high dirt trail at golden hour",
      width: 2000,
      height: 1333,
    },
    productHandles: [
      "talus-trail-shoe",
      "scree-approach-shoe",
      "camp-recovery-clog",
    ],
  },
] as const satisfies readonly CollectionPresentationProfile[];

export function getCollectionPresentationProfile(
  handle: string,
): CollectionPresentationProfile | undefined {
  return COLLECTION_PRESENTATION_PROFILES.find(
    (profile) => profile.handle === handle,
  );
}
