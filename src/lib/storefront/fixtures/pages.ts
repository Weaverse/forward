/**
 * Static store-page fixture records. Only the data source may import this
 * file. `about-forward` is the approved route-smoke page handle.
 */

import type { StorePage } from "../types";
import { EDITORIAL_IMAGES } from "./editorial-images";

export const PAGE_FIXTURES: readonly StorePage[] = [
  {
    handle: "about-forward",
    title: "The Field Standard",
    eyebrow: "About Forward",
    intro:
      "Forward makes a short list of gear for moving through weather, not around it. Three products, built slowly, repaired indefinitely.",
    heroImage: EDITORIAL_IMAGES.mountainRidges,
    sections: [
      {
        heading: "Why the list is short",
        paragraphs: [
          "Most gear companies solve problems by adding products. We solve them by revising the ones we already make. The catalog is three items long because that is how many things we currently believe we make better than anyone needs us to: a shell, a pack, and a trail shoe.",
          "Each one is expected to hold a place in your kit for years. When a material or pattern improves, the product quietly improves with it — same name, same job, better execution.",
        ],
      },
      {
        heading: "The standard",
        paragraphs: [
          "Every Forward product is tested against the same three questions. Does it work when the weather turns? Does it carry its weight? Can we repair it when you finally wear it out?",
          "If the answer to any of the three is no, it does not ship. This is also why we publish real specifications — weights, membranes, hydrostatic head — instead of adjectives.",
        ],
      },
      {
        heading: "Made to be repaired",
        paragraphs: [
          "A garment that cannot be repaired is a disposable with a long fuse. Buckles, straps, zips, laces, and insoles are stocked standard parts. Delaminations, tears, and blown seams route through the repairs program — see the Repairs page for how it works.",
        ],
      },
    ],
  },
  {
    handle: "field-repair",
    title: "Field Repair",
    eyebrow: "Forward field service",
    intro: "Small damage should not end a trip or a product’s useful life.",
    heroImage: EDITORIAL_IMAGES.alpineTraverse,
    sections: [
      {
        heading: "Stabilize, then repair",
        paragraphs: [
          "Clean and dry the affected area, stabilize tears with a compatible repair patch, and contact Forward when a permanent repair or replacement component is needed.",
        ],
      },
    ],
  },
  {
    handle: "shipping-returns",
    title: "Shipping & Returns",
    eyebrow: "Forward service",
    intro:
      "Orders are prepared within two business days. Delivery estimates appear at checkout.",
    heroImage: EDITORIAL_IMAGES.campTent,
    sections: [
      {
        heading: "Returns",
        paragraphs: [
          "Unused items may be returned within 30 days in original condition. Contact support before returning worn footwear or equipment with field damage.",
        ],
      },
    ],
  },
  {
    handle: "contact",
    title: "Contact",
    eyebrow: "Forward support",
    intro:
      "Questions about fit, equipment, repairs, or an order can be sent through the contact form. Include your order number when applicable.",
    heroImage: EDITORIAL_IMAGES.trailMovement,
    sections: [],
  },
  {
    handle: "repairs",
    title: "Repairs",
    eyebrow: "Forward program",
    intro:
      "Wearing something out is the point. When you do, we would rather fix it than replace it — for the life of the product, at honest cost.",
    sections: [
      {
        heading: "What we repair",
        paragraphs: [
          "Shells: re-taping, delamination, zip and cord replacement, tears and burns. Packs: buckles, straps, stays, panel tears, seam failures. Footwear: outsole re-bonding within reason, plus standard replaceable parts like laces and insoles.",
          "Crash damage, misadventure, and honest neglect are all repairable categories. We have seen worse than whatever you did.",
        ],
      },
      {
        heading: "How it works",
        paragraphs: [
          "Start a repair from your account or the address on the policy page, describe the damage, and ship the cleaned item to the workshop. Straightforward repairs turn around in about two weeks; structural work can take four.",
          "Repairs that stem from a defect in materials or workmanship are always free. Everything else is quoted before we start, and the quote is the price.",
        ],
      },
      {
        heading: "Field kit",
        paragraphs: [
          "Every order ships with a small patch kit. Tenacious tape solves most trailside problems; press it on clean, dry fabric and it will outlast your opinion of it. Save the workshop for what the tape cannot hold.",
        ],
      },
    ],
  },
] as const;
