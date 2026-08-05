/**
 * Static collection fixture records. Only the data source may import this
 * file. `field-gear` is the approved route-smoke collection handle.
 */

import type { Collection } from "../types";
import { EDITORIAL_IMAGES } from "./editorial-images";

export const COLLECTION_FIXTURES: readonly Collection[] = [
  {
    handle: "field-gear",
    title: "Field Gear",
    fieldCode: "FG-01",
    description:
      "The complete working kit: shell, pack, and footwear chosen to move together. Everything here earns its weight on a long day out and shrugs off the weather on the way back.",
    heroImage: EDITORIAL_IMAGES.trailMovement,
    productHandles: [
      "weatherline-shell",
      "ridge-30-field-pack",
      "talus-trail-shoe",
    ],
  },
  {
    handle: "high-route",
    title: "High Route",
    fieldCode: "HR-02",
    description:
      "For days spent above the treeline, where weather arrives without an invitation. Wind-shedding layers and a pack that carries close enough to scramble in.",
    heroImage: EDITORIAL_IMAGES.alpineTraverse,
    productHandles: ["weatherline-shell", "ridge-30-field-pack"],
  },
  {
    handle: "camp-craft",
    title: "Camp Craft",
    fieldCode: "CC-03",
    description:
      "The slow half of the trip: getting there, settling in, staying warm while the fire does its work. Gear for the miles and for the hours after them.",
    heroImage: EDITORIAL_IMAGES.campTent,
    productHandles: ["talus-trail-shoe", "weatherline-shell"],
  },
] as const;
