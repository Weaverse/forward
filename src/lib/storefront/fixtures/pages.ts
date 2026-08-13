/** Representative static pages for credential-free development. Shopify owns live copy. */

import type { StorePage } from "../types";
import { EDITORIAL_IMAGES } from "./editorial-images";

export const PAGE_FIXTURES: readonly StorePage[] = [
  {
    handle: "about-forward",
    title: "About Forward",
    eyebrow: "About Forward",
    intro:
      "Forward makes a short list of equipment for moving through weather, not around it.",
    heroImage: EDITORIAL_IMAGES.mountainRidges,
    sections: [
      {
        heading: "The standard",
        paragraphs: [
          "Every object must carry well, work with the rest of the system, and remain useful after visible wear.",
          "We revise existing patterns before adding new ones and design repair access into the construction from the start.",
        ],
      },
      {
        heading: "A short catalog",
        paragraphs: [
          "Nine products cover weather protection, insulation, carry, technical movement, and recovery without turning choice into noise.",
        ],
      },
    ],
  },
  {
    handle: "field-repair",
    title: "Field Repair",
    eyebrow: "Field Repair",
    intro: "Small damage should not end a trip or a product’s useful life.",
    heroImage: EDITORIAL_IMAGES.alpineTraverse,
    sections: [
      {
        heading: "A repairable standard",
        paragraphs: [
          "Clean and dry the affected area before applying a compatible field patch. Record the damage and contact the repair desk when the trip is over.",
          "Replaceable hardware, accessible seams, and honest material choices keep routine damage from becoming disposal.",
        ],
      },
    ],
  },
  {
    handle: "shipping-returns",
    title: "Shipping & Returns",
    eyebrow: "Shipping & Returns",
    intro:
      "Delivery estimates appear at checkout and returns begin with a support request.",
    heroImage: EDITORIAL_IMAGES.campTent,
    sections: [
      {
        heading: "Before you send it back",
        paragraphs: [
          "Keep packaging until fit and function are confirmed. Contact support before returning worn equipment so repair, exchange, and return routes stay clear.",
        ],
      },
    ],
  },
  {
    handle: "contact",
    title: "Contact",
    eyebrow: "Contact",
    intro:
      "Use the store support path for product, fit, repair, shipping, return, and order questions.",
    heroImage: EDITORIAL_IMAGES.trailMovement,
    sections: [],
  },
  {
    handle: "materials-and-care",
    title: "Materials & Care",
    eyebrow: "Materials & Care",
    intro:
      "Specific construction choices need equally specific care to keep working.",
    heroImage: EDITORIAL_IMAGES.campfire,
    sections: [
      {
        heading: "Face fabrics and membranes",
        paragraphs: [
          "Recycled nylon face fabrics balance abrasion resistance with packability. Waterproof products add a breathable membrane and taped seams.",
        ],
      },
      {
        heading: "Washing and reproofing",
        paragraphs: [
          "Wash technical fabrics with dedicated cleaner, avoid softener, and use low heat only where the garment instructions allow it.",
        ],
      },
    ],
  },
  {
    handle: "fit-and-sizing",
    title: "Fit & Sizing",
    eyebrow: "Fit & Sizing",
    intro:
      "Choose size around the layers, load, and terrain the product is designed to handle.",
    heroImage: EDITORIAL_IMAGES.trailMovement,
    sections: [
      {
        heading: "Apparel fit",
        paragraphs: [
          "Shells clear a working midlayer while fleece and insulation stay closer to the body for efficient movement.",
        ],
      },
      {
        heading: "Footwear sizing",
        paragraphs: [
          "Forward footwear uses US sizing from 7 through 13. Confirm toe room with the socks used on the trail.",
        ],
      },
    ],
  },
  {
    handle: "field-testing",
    title: "Field Testing",
    eyebrow: "Field Testing",
    intro:
      "A product earns its place only after wet, loaded, cold, and repeat-use testing.",
    heroImage: EDITORIAL_IMAGES.alpineTraverse,
    sections: [
      {
        heading: "What we test",
        paragraphs: [
          "Movement, access, weather resistance, drying, repair access, and comfort are tested together rather than as isolated specifications.",
        ],
      },
      {
        heading: "What ends a test",
        paragraphs: [
          "A failure that cannot be repaired or explained sends the pattern back for revision instead of into the catalog.",
        ],
      },
    ],
  },
];
