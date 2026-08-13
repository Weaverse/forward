/**
 * Synthetic Storefront API catalog responses for adapter tests.
 *
 * These are hand-built GraphQL-shaped objects that mirror the live catalog's
 * *shape* — the exact nine approved products, `Color` plus `Size` options, four
 * media roles per colorway, and the five `forward` metafields. They are not
 * captured live responses: media IDs, CDN paths, and copy are synthetic, and
 * there are no headers, signed CDN parameters, or credentials anywhere in this
 * file.
 *
 * Media nodes are deliberately emitted in reverse of the metafield order so
 * tests prove that role resolution comes from `forward.colorway_media_map`
 * and never from `product.media.nodes` ordering.
 */

const CDN_BASE =
  "https://cdn.shopify.com/s/files/1/0978/4757/4828/files/synthetic";

const MEDIA_ROLES = ["primary", "alternate", "detail", "context"] as const;

interface ColorwaySpec {
  label: string;
  filePrefix: string;
}

interface ProductSpec {
  handle: string;
  title: string;
  productType: string;
  description: string;
  price: string;
  colorways: readonly ColorwaySpec[];
  sizes?: readonly string[];
  highlights: readonly string[];
  materials: string;
  fieldSpecs: Record<string, unknown>;
  care: string;
  mediaIdBase: number;
}

const PRODUCT_SPECS: readonly ProductSpec[] = [
  {
    handle: "weatherline-shell",
    title: "Weatherline Shell",
    productType: "Outerwear",
    description:
      "A lightweight three-layer shell designed for exposed ridgelines, fast weather shifts, and long days on foot.\nThe Weatherline Shell balances storm protection with an articulated fit that stays quiet and mobile under a pack.",
    price: "248.0",
    colorways: [
      { label: "Charcoal / Moss", filePrefix: "weatherline-charcoal" },
      { label: "Claystone / Charcoal", filePrefix: "weatherline-claystone" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    highlights: [
      "Three-layer weather protection",
      "Helmet-compatible articulated hood",
      "Field-repairable construction",
    ],
    materials:
      "Recycled nylon face fabric, waterproof breathable membrane, and low-bulk tricot backer.",
    fieldSpecs: {
      waterproofing: "3-layer membrane",
      fit: "articulated regular",
      recommended_use: ["hiking", "fastpacking", "wet-weather travel"],
    },
    care: "Machine wash cold with technical cleaner. Close all zippers. Tumble dry low to reactivate the water-repellent finish.",
    mediaIdBase: 1000,
  },
  {
    handle: "traverse-grid-fleece",
    title: "Traverse Grid Fleece",
    productType: "Outerwear",
    description:
      "A breathable grid-fleece midlayer built for high-output movement and fast temperature changes.\nThe Traverse Grid Fleece vents under load, dries quickly, and layers cleanly beneath a shell.",
    price: "148.0",
    colorways: [
      { label: "Moss / Charcoal", filePrefix: "traverse-moss" },
      { label: "Claystone / Bone", filePrefix: "traverse-claystone" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    highlights: [
      "Breathable grid-fleece structure",
      "Fast-drying high-output midlayer",
      "Layers cleanly under a shell",
    ],
    materials:
      "Recycled grid-fleece knit with a brushed interior face and low-bulk bonded cuffs.",
    fieldSpecs: {
      weight_g: 320,
      fit: "trim active",
      recommended_use: ["hiking", "fastpacking", "cold-weather layering"],
    },
    care: "Machine wash cold on a gentle cycle without fabric softener. Tumble dry low or air dry.",
    mediaIdBase: 2000,
  },
  {
    handle: "drift-insulated-vest",
    title: "Drift Insulated Vest",
    productType: "Outerwear",
    description:
      "A packable synthetic-insulation layer for exposed starts, stops, and cold transitions.\nThe Drift Insulated Vest adds core warmth without limiting arm movement, then compresses into a pack lid.",
    price: "188.0",
    colorways: [
      { label: "Charcoal / Signal", filePrefix: "drift-charcoal" },
      { label: "Dune / Moss", filePrefix: "drift-dune" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    highlights: [
      "Packable synthetic core warmth",
      "Wind-resistant recycled shell fabric",
      "Compresses into its own pocket",
    ],
    materials:
      "Recycled ripstop shell with a water-repellent finish and mapped synthetic insulation.",
    fieldSpecs: {
      insulation_g: 60,
      fit: "layering regular",
      recommended_use: ["alpine starts", "camp warmth", "cold transitions"],
    },
    care: "Machine wash cold with a technical cleaner. Tumble dry low to restore loft.",
    mediaIdBase: 3000,
  },
  {
    handle: "ridge-30-field-pack",
    title: "Ridge 30 Field Pack",
    productType: "Packs",
    description:
      "A stable 30-liter field pack for moving light without sacrificing access or durability.\nThe Ridge 30 keeps the load close, separates wet essentials, and opens quickly when conditions change.",
    price: "198.0",
    colorways: [
      { label: "Charcoal / Moss / Tan", filePrefix: "ridge-charcoal" },
      { label: "Dune / Charcoal", filePrefix: "ridge-dune" },
    ],
    highlights: [
      "30-liter all-day capacity",
      "Stable close-body carry",
      "Fast-access field organization",
    ],
    materials:
      "High-tenacity recycled nylon body, reinforced base, and weather-resistant hardware.",
    fieldSpecs: {
      volume_liters: 30,
      carry: "close-body internal frame",
      recommended_use: ["day hiking", "field work", "light overnights"],
    },
    care: "Hand wash with mild soap and cool water. Air dry completely away from direct heat.",
    mediaIdBase: 4000,
  },
  {
    handle: "approach-18-day-pack",
    title: "Approach 18 Day Pack",
    productType: "Packs",
    description:
      "A close-body 18-liter pack for short technical days and fast access.\nThe Approach 18 stays stable on scrambling terrain and opens without coming off your back.",
    price: "148.0",
    colorways: [
      { label: "Moss / Charcoal", filePrefix: "approach-moss" },
      { label: "Claystone / Dune", filePrefix: "approach-claystone" },
    ],
    highlights: [
      "18-liter close-body carry",
      "Stable on technical ground",
      "Fast side and top access",
    ],
    materials:
      "High-tenacity recycled nylon body with a reinforced base and weather-resistant zippers.",
    fieldSpecs: {
      volume_liters: 18,
      carry: "close-body panel",
      recommended_use: ["approaches", "short technical days", "travel"],
    },
    care: "Hand wash with mild soap and cool water. Air dry away from direct heat.",
    mediaIdBase: 5000,
  },
  {
    handle: "waypoint-sling-6",
    title: "Waypoint Sling 6",
    productType: "Packs",
    description:
      "A compact 6-liter carry for travel, daily field essentials, and quick organization.\nThe Waypoint Sling 6 keeps documents, tools, and a light layer within reach of one hand.",
    price: "98.0",
    colorways: [
      { label: "Charcoal / Signal", filePrefix: "waypoint-charcoal" },
      { label: "Dune / Moss", filePrefix: "waypoint-dune" },
    ],
    highlights: [
      "6-liter everyday carry",
      "Quick cross-body access",
      "Organized document and tool pockets",
    ],
    materials:
      "Recycled nylon body with a padded back panel and a weather-resistant main zipper.",
    fieldSpecs: {
      volume_liters: 6,
      carry: "cross-body sling",
      recommended_use: ["travel", "daily carry", "field organization"],
    },
    care: "Spot clean with mild soap and cool water. Air dry completely.",
    mediaIdBase: 6000,
  },
  {
    handle: "talus-trail-shoe",
    title: "Talus Trail Shoe",
    productType: "Footwear",
    description:
      "A precise trail shoe tuned for mixed rock, loose dirt, and long technical descents.\nThe Talus combines a protected upper, confident edge control, and enough cushioning for sustained mileage.",
    price: "168.0",
    colorways: [
      { label: "Charcoal / Moss / Gum", filePrefix: "talus-charcoal" },
      { label: "Limestone / Clay / Moss", filePrefix: "talus-limestone" },
    ],
    sizes: ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12", "US 13"],
    highlights: [
      "Mixed-terrain lug geometry",
      "Protected low-volume upper",
      "Balanced cushioning and ground feel",
    ],
    materials:
      "Abrasion-resistant woven upper, protective film overlays, responsive foam, and high-traction rubber outsole.",
    fieldSpecs: {
      drop_mm: 6,
      terrain: ["rock", "dirt", "mixed trail"],
      recommended_use: ["trail running", "fast hiking"],
    },
    care: "Brush off dry dirt, hand wash with cool water, and air dry. Do not machine wash or expose to direct heat.",
    mediaIdBase: 7000,
  },
  {
    handle: "scree-approach-shoe",
    title: "Scree Approach Shoe",
    productType: "Footwear",
    description:
      "A precise low-profile approach shoe for rock, mixed trail, and technical transitions.\nThe Scree edges confidently, protects the forefoot, and keeps ground feel close underfoot.",
    price: "158.0",
    colorways: [
      { label: "Charcoal / Gum", filePrefix: "scree-charcoal" },
      { label: "Limestone / Moss", filePrefix: "scree-limestone" },
    ],
    sizes: ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12", "US 13"],
    highlights: [
      "Low-profile edging platform",
      "Sticky rubber approach outsole",
      "Protective abrasion-resistant upper",
    ],
    materials:
      "Abrasion-resistant woven upper, protective toe cap, firm midsole, and sticky rubber outsole.",
    fieldSpecs: {
      drop_mm: 8,
      terrain: ["rock", "mixed trail", "scree"],
      recommended_use: ["approaches", "scrambling"],
    },
    care: "Brush off dry dirt and hand wash with cool water. Air dry away from direct heat.",
    mediaIdBase: 8000,
  },
  {
    handle: "camp-recovery-clog",
    title: "Camp Recovery Clog",
    productType: "Footwear",
    description:
      "Easy-on recovery and camp footwear with durable traction and weather-tolerant materials.\nThe Camp Recovery Clog stays warm underfoot and handles wet ground without complaint.",
    price: "118.0",
    colorways: [
      { label: "Charcoal / Moss", filePrefix: "camp-charcoal" },
      { label: "Dune / Claystone", filePrefix: "camp-dune" },
    ],
    sizes: ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12", "US 13"],
    highlights: [
      "Easy-on recovery fit",
      "Weather-tolerant durable materials",
      "Grippy camp and transition outsole",
    ],
    materials:
      "Molded foam midsole, water-tolerant upper, and a durable rubber outsole.",
    fieldSpecs: {
      weight_g: 240,
      closure: "easy-on heel strap",
      recommended_use: ["camp", "travel", "recovery"],
    },
    care: "Rinse with cool water and air dry. Do not machine wash or apply direct heat.",
    mediaIdBase: 9000,
  },
];

function mediaId(value: number): string {
  return `gid://shopify/MediaImage/${value}`;
}

function richText(text: string): string {
  return JSON.stringify({
    type: "root",
    children: [
      { type: "paragraph", children: [{ type: "text", value: text }] },
    ],
  });
}

function metafield(type: string, value: string) {
  return { type, value };
}

function buildProduct(spec: ProductSpec) {
  const mediaNodes: Record<string, unknown>[] = [];
  const colorwayMediaMap: Record<string, string[]> = {};

  spec.colorways.forEach((colorway, colorwayIndex) => {
    const ids = MEDIA_ROLES.map((role, roleIndex) => {
      const id = mediaId(
        spec.mediaIdBase + colorwayIndex * MEDIA_ROLES.length + roleIndex,
      );
      const alt = `${spec.title} in ${colorway.label} — ${role} view`;
      mediaNodes.push({
        __typename: "MediaImage",
        id,
        alt,
        image: {
          url: `${CDN_BASE}-${colorway.filePrefix}-${role}.webp`,
          width: 1600,
          height: 2000,
          altText: alt,
        },
      });
      return id;
    });
    colorwayMediaMap[colorway.label] = ids;
  });

  // Reverse so metafield order, not node order, decides the four roles.
  mediaNodes.reverse();
  // Unreferenced non-image media must be tolerated, never used as a role.
  mediaNodes.push({ __typename: "Video", id: mediaId(spec.mediaIdBase + 900) });

  const sizes = spec.sizes ?? [];
  const options = [
    {
      name: "Color",
      optionValues: spec.colorways.map((colorway) => ({
        name: colorway.label,
      })),
    },
    ...(sizes.length > 0
      ? [{ name: "Size", optionValues: sizes.map((size) => ({ name: size })) }]
      : []),
  ];

  const variantNodes: Record<string, unknown>[] = [];
  spec.colorways.forEach((colorway, colorwayIndex) => {
    const values = sizes.length > 0 ? sizes : [undefined];
    values.forEach((size, sizeIndex) => {
      variantNodes.push({
        id: `gid://shopify/ProductVariant/${
          spec.mediaIdBase + colorwayIndex * 100 + sizeIndex
        }`,
        availableForSale: true,
        price: { amount: spec.price, currencyCode: "USD" },
        selectedOptions: [
          { name: "Color", value: colorway.label },
          ...(size === undefined ? [] : [{ name: "Size", value: size }]),
        ],
      });
    });
  });

  return {
    id: `gid://shopify/Product/${spec.mediaIdBase}`,
    handle: spec.handle,
    title: spec.title,
    description: spec.description,
    descriptionHtml: spec.description
      .split("\n")
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join(""),
    productType: spec.productType,
    tags: ["forward", "managed-by:forward-seed"],
    options,
    variants: { pageInfo: { hasNextPage: false }, nodes: variantNodes },
    media: { pageInfo: { hasNextPage: false }, nodes: mediaNodes },
    highlights: metafield(
      "list.single_line_text_field",
      JSON.stringify(spec.highlights),
    ),
    materials: metafield("multi_line_text_field", spec.materials),
    fieldSpecs: metafield("json", JSON.stringify(spec.fieldSpecs)),
    care: metafield("rich_text_field", richText(spec.care)),
    colorwayMediaMap: metafield("json", JSON.stringify(colorwayMediaMap)),
  };
}

export interface CatalogResponse {
  data: {
    products: {
      pageInfo: { hasNextPage: boolean };
      // biome-ignore lint/suspicious/noExplicitAny: synthetic GraphQL payload
      nodes: any[];
    };
  };
}

/** A fresh, mutable, live-shaped catalog response. */
export function catalogResponse(): CatalogResponse {
  return {
    data: {
      products: {
        pageInfo: { hasNextPage: false },
        nodes: PRODUCT_SPECS.map((spec) => buildProduct(spec)),
      },
    },
  };
}

/** Returns a catalog response with one product node patched in place. */
export function catalogResponseWith(
  handle: string,
  // biome-ignore lint/suspicious/noExplicitAny: synthetic GraphQL payload
  patch: (product: any) => void,
): CatalogResponse {
  const response = catalogResponse();
  const product = response.data.products.nodes.find(
    (node) => node.handle === handle,
  );
  if (product === undefined) {
    throw new Error(`Unknown synthetic product handle: ${handle}`);
  }
  patch(product);
  return response;
}

/** The synthetic media id order the metafield declares for a colorway. */
export function syntheticMediaIds(
  handle: string,
  colorwayLabel: string,
): readonly string[] {
  const response = catalogResponse();
  const product = response.data.products.nodes.find(
    (node) => node.handle === handle,
  );
  const map = JSON.parse(product.colorwayMediaMap.value) as Record<
    string,
    string[]
  >;
  const ids = map[colorwayLabel];
  if (ids === undefined) {
    throw new Error(`Unknown synthetic colorway: ${colorwayLabel}`);
  }
  return ids;
}
