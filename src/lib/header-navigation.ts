interface HeaderImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface FieldIndexCollection {
  id: "field-gear" | "high-route" | "camp-craft";
  index: "01" | "02" | "03";
  label: string;
  href: string;
  coordinate: string;
  description: string;
  fieldNote: string;
  image: HeaderImage;
}

/**
 * Static presentation boundary for the canonical Field Index header.
 * Shopify Navigation can replace the destination hierarchy later without
 * changing the header's visual or interaction contract.
 */
export const FIELD_INDEX_COLLECTIONS = [
  {
    id: "field-gear",
    index: "01",
    label: "Field Gear",
    href: "/shop/field-gear",
    coordinate: "54.4609° N",
    description:
      "Weather protection and modular carry systems for exposed ground.",
    fieldNote: "Built for changing forecasts and repeat repair.",
    image: {
      src: "/images/editorial/alpine-traverse.webp",
      alt: "Hiker traversing an alpine ridgeline above the clouds",
      width: 1800,
      height: 1201,
    },
  },
  {
    id: "high-route",
    index: "02",
    label: "High Route",
    href: "/shop/high-route",
    coordinate: "03.0886° W",
    description:
      "Low-bulk equipment composed for long miles above the tree line.",
    fieldNote: "A lighter system for distance, exposure, and movement.",
    image: {
      src: "/images/editorial/trail-movement.webp",
      alt: "Runner moving along a high dirt trail at golden hour",
      width: 2000,
      height: 1333,
    },
  },
  {
    id: "camp-craft",
    index: "03",
    label: "Camp Craft",
    href: "/shop/camp-craft",
    coordinate: "ALT. 978 M",
    description:
      "Quiet tools and dependable layers for deliberate nights outside.",
    fieldNote: "Camp essentials selected for utility, not excess.",
    image: {
      src: "/images/editorial/camp-tent.webp",
      alt: "Tent pitched at dusk beneath a mountain skyline",
      width: 2000,
      height: 1334,
    },
  },
] as const satisfies readonly FieldIndexCollection[];
