/**
 * Static product fixture records for the Forward demo catalog.
 *
 * Only `src/lib/storefront/data-source.ts` may import this file. Images come
 * exclusively from the approved branded catalog mirrored in
 * `public/images/products/` (see `public/images/products/manifest.json`).
 */

import type { Product, ProductColorway, StorefrontImage } from "../types";

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

function colorway(
  id: string,
  name: string,
  swatchColor: string,
  filePrefix: string,
  productTitle: string,
): ProductColorway {
  return {
    id,
    name,
    swatchColor,
    images: {
      primary: productImage(
        `${filePrefix}-primary.webp`,
        `${productTitle} in ${name} — studio view`,
      ),
      alternate: productImage(
        `${filePrefix}-alternate.webp`,
        `${productTitle} in ${name} — alternate angle`,
      ),
      detail: productImage(
        `${filePrefix}-detail.webp`,
        `${productTitle} in ${name} — material detail`,
      ),
      context: productImage(
        `${filePrefix}-context.webp`,
        `${productTitle} in ${name} — in the field`,
      ),
    },
  };
}

export const PRODUCT_FIXTURES: readonly Product[] = [
  {
    handle: "weatherline-shell",
    title: "Weatherline Shell",
    subtitle: "Three-layer waterproof shell for shifting coastal weather.",
    plate: "01",
    category: "shells",
    activities: ["alpine", "trail", "camp"],
    price: { amount: 248, currencyCode: "USD" },
    description:
      "A three-layer hardshell cut for movement, not bulk. The Weatherline holds its own through sideways rain and ridge-top wind, then packs down small enough to forget until the sky turns.",
    detailParagraphs: [
      "The face fabric is a tightly woven 40-denier ripstop bonded to a breathable waterproof membrane and a soft tricot backer. Seams are fully taped; the main zip is water-resistant with an internal storm guard.",
      "A single-pull helmet-compatible hood, two harness-clear hand pockets, and pit zips cover the essentials without adding trim you will never use. The hem drops slightly in back and cinches one-handed.",
      "Cut for a mid layer underneath. If you are between sizes and ride the warm side, size down.",
    ],
    specs: [
      { label: "Weight", value: "312 g (size M)" },
      { label: "Fabric", value: "40D 3L ripstop, PFAS-free DWR" },
      { label: "Waterproofing", value: "20,000 mm hydrostatic head" },
      { label: "Breathability", value: "20,000 g/m²/24h" },
      { label: "Packed size", value: "Stows into its own chest pocket" },
      { label: "Fit", value: "Regular, mid-layer compatible" },
    ],
    care: [
      "Machine wash cold on gentle with technical wash, zips closed.",
      "Tumble dry low to reactivate the DWR finish.",
      "Never use fabric softener or dry cleaning.",
    ],
    repair:
      "Field-repair small punctures with tenacious tape; our repairs program handles delaminations, zip replacements, and re-taping for the life of the garment.",
    colorways: [
      colorway(
        "charcoal",
        "Charcoal",
        "#3b403f",
        "weatherline-charcoal",
        "Weatherline Shell",
      ),
      colorway(
        "claystone",
        "Claystone",
        "#a9705a",
        "weatherline-claystone",
        "Weatherline Shell",
      ),
    ],
    options: [{ name: "Size", values: ["XS", "S", "M", "L", "XL"] }],
    relatedHandles: ["ridge-30-field-pack", "talus-trail-shoe"],
  },
  {
    handle: "ridge-30-field-pack",
    title: "Ridge 30 Field Pack",
    subtitle: "A 30-liter pack built for long days above the treeline.",
    plate: "02",
    category: "packs",
    activities: ["alpine", "trail"],
    price: { amount: 168, currencyCode: "USD" },
    description:
      "Thirty liters is the honest size for a full day out: shell, food, water, a warm layer, and room left over for whatever the day produces. The Ridge carries close and quiet, with nothing swinging off the back.",
    detailParagraphs: [
      "The body is a 210-denier recycled nylon with a burlier 420-denier boot. A single top-loading chamber with an internal zip pocket keeps packing simple; a stretch front pocket swallows a wet shell without opening the bag.",
      "The back panel uses a framesheet with a light aluminum stay — enough structure to transfer weight to the hipbelt without turning the pack into furniture. Side compression doubles as pole or axe carry.",
      "Hipbelt pockets fit a phone or a day of snacks. The whole harness fits close enough to scramble in.",
    ],
    specs: [
      { label: "Volume", value: "30 L" },
      { label: "Weight", value: "980 g" },
      { label: "Fabric", value: "210D recycled nylon, 420D boot" },
      { label: "Back length", value: "One size, 43–53 cm torso" },
      { label: "Load range", value: "Comfortable to 12 kg" },
      { label: "Hydration", value: "Internal sleeve, dual hose ports" },
    ],
    care: [
      "Hose down and air-dry after gritty or salty trips.",
      "Spot-clean with mild soap; never machine wash.",
      "Store loosely packed, out of direct sun.",
    ],
    repair:
      "Buckles, straps, and stays are standard parts we stock for replacement. Torn panels and blown seams go through the repairs program rather than the landfill.",
    colorways: [
      colorway(
        "charcoal",
        "Charcoal",
        "#3b403f",
        "ridge-charcoal",
        "Ridge 30 Field Pack",
      ),
      colorway("dune", "Dune", "#c4ad83", "ridge-dune", "Ridge 30 Field Pack"),
    ],
    options: [],
    relatedHandles: ["weatherline-shell", "talus-trail-shoe"],
  },
  {
    handle: "talus-trail-shoe",
    title: "Talus Trail Shoe",
    subtitle: "Grippy, stable footwear for scree, roots, and river rock.",
    plate: "03",
    category: "footwear",
    activities: ["trail", "camp"],
    price: { amount: 142, currencyCode: "USD" },
    description:
      "The Talus is built for the ground most trails are actually made of: loose rock, wet roots, and off-camber dirt. Sticky rubber and a stable midsole platform, without the dead weight of a boot.",
    detailParagraphs: [
      "The outsole uses 4.5 mm multidirectional lugs in a sticky compound that holds on wet rock and sheds mud instead of carrying it. A forefoot rock plate takes the sting out of sharp talus.",
      "The midsole is firm enough to edge on but cushioned for full days under load. A wide-ish toe box lets feet spread on descents without swimming in the shoe.",
      "The engineered mesh upper drains fast and dries on the move. No waterproof liner by design — wet feet that dry beat wet feet that stay wet.",
    ],
    specs: [
      { label: "Weight", value: "298 g (per shoe, EU 42)" },
      { label: "Drop", value: "6 mm" },
      { label: "Stack", value: "28 mm heel / 22 mm forefoot" },
      { label: "Lugs", value: "4.5 mm multidirectional, sticky compound" },
      { label: "Protection", value: "Forefoot rock plate, welded toe cap" },
      { label: "Upper", value: "Quick-drain engineered mesh" },
    ],
    care: [
      "Knock off dry mud and rinse with fresh water.",
      "Air-dry with insoles out; never on a radiator.",
      "Re-lace loosely for storage so the upper keeps its shape.",
    ],
    repair:
      "Delaminated outsoles within reason are re-bonded through the repairs program. Worn laces and insoles are standard replaceable parts.",
    colorways: [
      colorway(
        "charcoal",
        "Charcoal",
        "#3b403f",
        "talus-charcoal",
        "Talus Trail Shoe",
      ),
      colorway(
        "limestone",
        "Limestone",
        "#cfc8b8",
        "talus-limestone",
        "Talus Trail Shoe",
      ),
    ],
    options: [
      {
        name: "Size (EU)",
        values: ["39", "40", "41", "42", "43", "44", "45", "46"],
      },
    ],
    relatedHandles: ["ridge-30-field-pack", "weatherline-shell"],
  },
] as const;
