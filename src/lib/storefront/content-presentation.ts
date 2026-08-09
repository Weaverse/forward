import { EDITORIAL_IMAGES } from "./fixtures/editorial-images";
import type { StorefrontImage } from "./types";

export interface ArticlePresentationProfile {
  plate: string;
  readingMinutes: number;
  location: string;
  coordinates: string;
  heroImage: StorefrontImage;
}

export interface PagePresentationProfile {
  eyebrow: string;
  heroImage?: StorefrontImage;
  sectionHeadings: readonly string[];
}

export interface PolicyPresentationProfile {
  summary: string;
}

export const ARTICLE_PRESENTATION_PROFILES = {
  "layering-for-moving-weather": {
    plate: "No. 01",
    readingMinutes: 7,
    location: "Pacific Crest Trail, California",
    coordinates: "36.5785° N, 118.2923° W",
    heroImage: EDITORIAL_IMAGES.mountainRidges,
  },
  "packing-thirty-liters-for-a-long-day": {
    plate: "No. 02",
    readingMinutes: 5,
    location: "North Cascades, Washington",
    coordinates: "48.7718° N, 121.2985° W",
    heroImage: EDITORIAL_IMAGES.alpineTraverse,
  },
  "reading-the-trail-underfoot": {
    plate: "No. 03",
    readingMinutes: 6,
    location: "Cairngorms, Scotland",
    coordinates: "57.0776° N, 3.6710° W",
    heroImage: EDITORIAL_IMAGES.campTent,
  },
} as const satisfies Record<string, ArticlePresentationProfile>;

export const PAGE_PRESENTATION_PROFILES = {
  "about-forward": {
    eyebrow: "About Forward",
    heroImage: EDITORIAL_IMAGES.mountainRidges,
    sectionHeadings: ["The standard"],
  },
  "field-repair": {
    eyebrow: "Repairs",
    heroImage: EDITORIAL_IMAGES.alpineTraverse,
    sectionHeadings: ["A repairable standard"],
  },
  "shipping-returns": {
    eyebrow: "Shipping & Returns",
    heroImage: EDITORIAL_IMAGES.campTent,
    sectionHeadings: ["Before you send it back"],
  },
  contact: {
    eyebrow: "Contact",
    heroImage: EDITORIAL_IMAGES.trailMovement,
    sectionHeadings: [],
  },
} as const satisfies Record<string, PagePresentationProfile>;

export const POLICY_PRESENTATION_PROFILES = {
  "privacy-policy": {
    summary: "How we handle your personal information.",
  },
  "refund-policy": {
    summary: "Returns, exchanges, and warranty.",
  },
  "shipping-policy": {
    summary: "Shipping destinations, timelines, and costs.",
  },
  "terms-of-service": {
    summary: "Terms governing your use of this store.",
  },
} as const satisfies Record<string, PolicyPresentationProfile>;

export function getArticlePresentationProfile(
  handle: string,
): ArticlePresentationProfile | null {
  return (
    ARTICLE_PRESENTATION_PROFILES[
      handle as keyof typeof ARTICLE_PRESENTATION_PROFILES
    ] ?? null
  );
}

export function getPagePresentationProfile(
  handle: string,
): PagePresentationProfile | null {
  return (
    PAGE_PRESENTATION_PROFILES[
      handle as keyof typeof PAGE_PRESENTATION_PROFILES
    ] ?? null
  );
}

export function getPolicyPresentationProfile(
  handle: string,
): PolicyPresentationProfile | null {
  return (
    POLICY_PRESENTATION_PROFILES[
      handle as keyof typeof POLICY_PRESENTATION_PROFILES
    ] ?? null
  );
}
