/**
 * Typed local shell data for the foundation slice.
 *
 * Everything here exists only so route shells are reviewable before live
 * Shopify data clients land. Nothing in this file is a resolved production
 * handle: product handles come from the approved smoke-fixture list, and the
 * rest are neutral route-smoke fixtures. Future Shopify data clients must
 * live elsewhere (`src/lib/shopify/`) and must not import from this file.
 */

import { SMOKE_FIXTURES } from "@/lib/routes/route-contract";

export interface ShellProduct {
  handle: string;
  title: string;
  tagline: string;
  priceLabel: string;
}

export interface ShellArticle {
  handle: string;
  title: string;
  excerpt: string;
}

/** Approved smoke-fixture products rendered as placeholder tiles. */
export const SHELL_PRODUCTS: readonly ShellProduct[] = [
  {
    handle: "weatherline-shell",
    title: "Weatherline Shell",
    tagline: "Three-layer waterproof shell for shifting coastal weather.",
    priceLabel: "Pricing arrives with live catalog data",
  },
  {
    handle: "ridge-30-field-pack",
    title: "Ridge 30 Field Pack",
    tagline: "A 30-liter pack built for long days above the treeline.",
    priceLabel: "Pricing arrives with live catalog data",
  },
  {
    handle: "talus-trail-shoe",
    title: "Talus Trail Shoe",
    tagline: "Grippy, stable footwear for scree, roots, and river rock.",
    priceLabel: "Pricing arrives with live catalog data",
  },
] as const;

/** Neutral editorial fixture used by the journal shell. */
export const SHELL_ARTICLE: ShellArticle = {
  handle: SMOKE_FIXTURES.articleHandle,
  title: "Walking the Long Light",
  excerpt:
    "Field notes from a week of low sun, long shadows, and unhurried miles.",
};

/** Turns a URL handle into readable display text for shell pages. */
export function formatHandle(handle: string): string {
  const words = decodeURIComponent(handle)
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  return words.length > 0 ? words.join(" ") : handle;
}
