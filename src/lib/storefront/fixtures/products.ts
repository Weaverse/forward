/** Static deterministic catalog used only when Shopify is not configured. */

import {
  CATALOG_PRESENTATION_PROFILES,
  type CatalogPresentationProfile,
} from "../catalog-presentation";
import type {
  Money,
  Product,
  ProductColorway,
  ProductOption,
  ProductVariant,
  StorefrontImage,
} from "../types";

const PRODUCT_IMAGE_WIDTH = 1600;
const PRODUCT_IMAGE_HEIGHT = 2000;

function productImage(file: string, alt: string): StorefrontImage {
  return {
    src: `/images/products/${file}`,
    alt,
    width: PRODUCT_IMAGE_WIDTH,
    height: PRODUCT_IMAGE_HEIGHT,
  };
}

function fixtureColorway(
  id: string,
  name: string,
  swatchColor: string,
  filePrefix: string,
  title: string,
): ProductColorway {
  return {
    id,
    name,
    swatchColor,
    images: {
      primary: productImage(
        `${filePrefix}-primary.webp`,
        `${title} in ${name} — primary view`,
      ),
      alternate: productImage(
        `${filePrefix}-alternate.webp`,
        `${title} in ${name} — alternate view`,
      ),
      detail: productImage(
        `${filePrefix}-detail.webp`,
        `${title} in ${name} — detail view`,
      ),
      context: productImage(
        `${filePrefix}-context.webp`,
        `${title} in ${name} — context view`,
      ),
    },
  };
}

function productVariants(
  handle: string,
  colorwayIds: readonly string[],
  options: readonly ProductOption[],
  price: Money,
): readonly ProductVariant[] {
  const values = options[0]?.values ?? [undefined];
  return colorwayIds.flatMap((colorwayId) =>
    values.map((value) => {
      const selectedOptions =
        value === undefined
          ? []
          : [{ name: options[0]?.name ?? "Option", value }];
      return {
        id: `demo:${handle}:${colorwayId}:${value ?? "default"}`,
        colorwayId,
        selectedOptions,
        price,
        availableForSale: true,
      };
    }),
  );
}

interface StaticProductDefinition {
  title: string;
  price: number;
  description: string;
  materials: string;
  specs: readonly { label: string; value: string }[];
  care: readonly string[];
  optionValues?: readonly string[];
  imagePrefixes: readonly string[];
}

const APPAREL_SIZES = ["XS", "S", "M", "L", "XL"] as const;
const FOOTWEAR_SIZES = [
  "US 7",
  "US 8",
  "US 9",
  "US 10",
  "US 11",
  "US 12",
  "US 13",
] as const;

const DEFINITIONS: Readonly<Record<string, StaticProductDefinition>> = {
  "weatherline-shell": {
    title: "Weatherline Shell",
    price: 248,
    description:
      "A three-layer hardshell cut for movement, not bulk. Weather protection, useful venting, and a quiet articulated fit make it dependable through long days and fast changes.",
    materials:
      "A recycled 40-denier ripstop face, waterproof breathable membrane, soft tricot backer, fully taped seams, and a PFAS-free water-repellent finish.",
    specs: [
      { label: "Weight", value: "312 g (size M)" },
      { label: "Waterproofing", value: "20,000 mm" },
      { label: "Fit", value: "Regular, mid-layer compatible" },
    ],
    care: [
      "Machine wash cold with technical cleaner and zips closed.",
      "Tumble dry low to reactivate the water-repellent finish.",
    ],
    optionValues: APPAREL_SIZES,
    imagePrefixes: ["weatherline-charcoal", "weatherline-claystone"],
  },
  "traverse-grid-fleece": {
    title: "Traverse Grid Fleece",
    price: 148,
    description:
      "A breathable grid-fleece midlayer for high-output movement and quick temperature changes. It vents under load, dries quickly, and layers cleanly under a shell.",
    materials:
      "Recycled grid-fleece knit with a brushed interior, low-bulk cuffs, and reinforced pocket openings.",
    specs: [
      { label: "Weight", value: "320 g (size M)" },
      { label: "Fit", value: "Trim active fit" },
      { label: "Use", value: "Fast hiking and cold-weather layering" },
    ],
    care: [
      "Machine wash cold without fabric softener.",
      "Tumble dry low or air dry.",
    ],
    optionValues: APPAREL_SIZES,
    imagePrefixes: ["weatherline-charcoal", "weatherline-claystone"],
  },
  "drift-insulated-vest": {
    title: "Drift Insulated Vest",
    price: 188,
    description:
      "A packable synthetic-insulation layer for exposed starts, stops, and cold transitions. It adds core warmth without restricting movement.",
    materials:
      "Recycled ripstop shell with a water-repellent finish and mapped synthetic insulation.",
    specs: [
      { label: "Insulation", value: "60 g synthetic fill" },
      { label: "Fit", value: "Regular layering fit" },
      { label: "Packed size", value: "Stows into pocket" },
    ],
    care: [
      "Machine wash cold with technical cleaner.",
      "Tumble dry low to restore loft.",
    ],
    optionValues: APPAREL_SIZES,
    imagePrefixes: ["weatherline-charcoal", "weatherline-claystone"],
  },
  "ridge-30-field-pack": {
    title: "Ridge 30 Field Pack",
    price: 198,
    description:
      "A stable 30-liter field pack for moving light without sacrificing access or durability. The close carry stays composed on rough ground.",
    materials:
      "High-tenacity recycled nylon body, reinforced base, aluminum stay, and weather-resistant hardware.",
    specs: [
      { label: "Volume", value: "30 L" },
      { label: "Weight", value: "980 g" },
      { label: "Load range", value: "Comfortable to 12 kg" },
    ],
    care: [
      "Hand wash with mild soap and cool water.",
      "Air dry away from direct heat.",
    ],
    imagePrefixes: ["ridge-charcoal", "ridge-dune"],
  },
  "approach-18-day-pack": {
    title: "Approach 18 Day Pack",
    price: 148,
    description:
      "A close-body 18-liter pack for short technical days and fast access. It remains stable on scrambling terrain without excess structure.",
    materials:
      "High-tenacity recycled nylon, reinforced base, close-body harness, and weather-resistant zippers.",
    specs: [
      { label: "Volume", value: "18 L" },
      { label: "Carry", value: "Close-body panel" },
      { label: "Use", value: "Approaches and short technical days" },
    ],
    care: ["Hand wash with mild soap.", "Air dry completely before storage."],
    imagePrefixes: ["ridge-charcoal", "ridge-dune"],
  },
  "waypoint-sling-6": {
    title: "Waypoint Sling 6",
    price: 98,
    description:
      "A compact six-liter carry for travel, daily field essentials, and quick organization. The main compartment opens with one hand.",
    materials:
      "Recycled nylon body, padded back panel, adjustable strap, and weather-resistant main zipper.",
    specs: [
      { label: "Volume", value: "6 L" },
      { label: "Carry", value: "Cross-body sling" },
      { label: "Use", value: "Travel and daily field carry" },
    ],
    care: ["Spot clean with mild soap and cool water.", "Air dry completely."],
    imagePrefixes: ["ridge-charcoal", "ridge-dune"],
  },
  "talus-trail-shoe": {
    title: "Talus Trail Shoe",
    price: 168,
    description:
      "A precise trail shoe tuned for mixed rock, loose dirt, and technical descents. It balances protection, confident edge control, and sustained-mileage cushioning.",
    materials:
      "Abrasion-resistant woven upper, protective overlays, responsive foam, and a high-traction rubber outsole.",
    specs: [
      { label: "Weight", value: "298 g (per shoe, US 9)" },
      { label: "Drop", value: "6 mm" },
      { label: "Lugs", value: "4.5 mm multidirectional" },
    ],
    care: [
      "Brush off dirt and hand wash with cool water.",
      "Air dry away from direct heat.",
    ],
    optionValues: FOOTWEAR_SIZES,
    imagePrefixes: ["talus-charcoal", "talus-limestone"],
  },
  "scree-approach-shoe": {
    title: "Scree Approach Shoe",
    price: 158,
    description:
      "A precise low-profile approach shoe for rock, mixed trail, and technical transitions. Sticky rubber and a protected forefoot keep footing deliberate.",
    materials:
      "Abrasion-resistant woven upper, protective toe cap, firm midsole, and sticky rubber outsole.",
    specs: [
      { label: "Drop", value: "8 mm" },
      { label: "Platform", value: "Low-profile edging platform" },
      { label: "Use", value: "Approaches and scrambling" },
    ],
    care: [
      "Brush off dry dirt and hand wash.",
      "Air dry away from direct heat.",
    ],
    optionValues: FOOTWEAR_SIZES,
    imagePrefixes: ["talus-charcoal", "talus-limestone"],
  },
  "camp-recovery-clog": {
    title: "Camp Recovery Clog",
    price: 118,
    description:
      "Easy-on recovery and camp footwear with durable traction and weather-tolerant materials. It stays comfortable after long days and composed on wet ground.",
    materials:
      "Water-tolerant upper, molded foam midsole, adjustable heel strap, and durable rubber outsole.",
    specs: [
      { label: "Weight", value: "240 g (per shoe, US 9)" },
      { label: "Closure", value: "Easy-on heel strap" },
      { label: "Use", value: "Camp, travel, and recovery" },
    ],
    care: ["Rinse with cool water.", "Air dry; do not apply direct heat."],
    optionValues: FOOTWEAR_SIZES,
    imagePrefixes: ["talus-charcoal", "talus-limestone"],
  },
};

function buildProduct(profile: CatalogPresentationProfile): Product {
  const definition = DEFINITIONS[profile.handle];
  if (definition === undefined) {
    throw new Error(`Missing static product definition for ${profile.handle}.`);
  }
  const colorEntries = Object.entries(profile.colorways);
  if (colorEntries.length !== definition.imagePrefixes.length) {
    throw new Error(`Static colorway images do not match ${profile.handle}.`);
  }
  const colorways = colorEntries.map(([name, presentation], index) => {
    const prefix = definition.imagePrefixes[index];
    if (prefix === undefined) {
      throw new Error(`Missing static image prefix for ${profile.handle}.`);
    }
    return fixtureColorway(
      presentation.id,
      name,
      presentation.swatchColor,
      prefix,
      definition.title,
    );
  });
  const options: readonly ProductOption[] =
    definition.optionValues === undefined
      ? []
      : [{ name: "Size", values: definition.optionValues }];
  const price: Money = { amount: definition.price, currencyCode: "USD" };
  return {
    handle: profile.handle,
    title: definition.title,
    subtitle: profile.subtitle,
    plate: profile.plate,
    category: profile.category,
    activities: profile.activities,
    price,
    description: definition.description,
    detailParagraphs: [definition.description, definition.materials],
    specs: definition.specs,
    care: definition.care,
    repair: profile.repair,
    colorways,
    options,
    variants: productVariants(
      profile.handle,
      colorways.map((entry) => entry.id),
      options,
      price,
    ),
    relatedHandles: profile.relatedHandles,
  };
}

export const PRODUCT_FIXTURES: readonly Product[] =
  CATALOG_PRESENTATION_PROFILES.map(buildProduct);
