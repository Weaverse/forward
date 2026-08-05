/**
 * Localized editorial imagery (see `docs/editorial-image-sources.md` for
 * Unsplash photo IDs, source URLs, and license notes). Only fixture modules
 * may import this file.
 */

import type { StorefrontImage } from "../types";

export const EDITORIAL_IMAGES = {
  heroOpenSky: {
    src: "/images/editorial/hero-open-sky.webp",
    alt: "Climber on an open granite face under a wide pale sky",
    width: 2000,
    height: 1445,
  },
  alpineTraverse: {
    src: "/images/editorial/alpine-traverse.webp",
    alt: "Hiker traversing an alpine ridgeline above the clouds",
    width: 1800,
    height: 1201,
  },
  campTent: {
    src: "/images/editorial/camp-tent.webp",
    alt: "Tent pitched at dusk beneath a mountain skyline",
    width: 2000,
    height: 1334,
  },
  mountainRidges: {
    src: "/images/editorial/mountain-ridges.webp",
    alt: "Layered mountain ridges fading into evening haze",
    width: 1800,
    height: 1200,
  },
  trailMovement: {
    src: "/images/editorial/trail-movement.webp",
    alt: "Runner moving along a high dirt trail at golden hour",
    width: 2000,
    height: 1333,
  },
  campfire: {
    src: "/images/editorial/campfire.webp",
    alt: "Campfire burning beside camp as night settles in",
    width: 2000,
    height: 1333,
  },
} as const satisfies Record<string, StorefrontImage>;
