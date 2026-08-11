/**
 * Static navigation and theme-content fixture records. Only the data source
 * may import this file.
 */

import type { SiteNavigation, ThemeContent } from "../types";
import { EDITORIAL_IMAGES } from "./editorial-images";

export const NAVIGATION_FIXTURE: SiteNavigation = {
  primary: [
    {
      href: "/shop",
      label: "Shop",
      children: [
        { href: "/shop/outerwear", label: "Outerwear" },
        { href: "/shop/packs", label: "Packs" },
        { href: "/shop/footwear", label: "Footwear" },
      ],
    },
    { href: "/journal", label: "Field Notes" },
    { href: "/pages/about-forward", label: "About" },
    { href: "/search", label: "Search" },
  ],
  utility: [
    { href: "/account", label: "Account" },
    { href: "/cart", label: "Cart" },
  ],
  footerColumns: [
    {
      heading: "Shop",
      links: [
        { href: "/shop", label: "All products" },
        { href: "/shop/outerwear", label: "Outerwear" },
        { href: "/shop/packs", label: "Packs" },
        { href: "/shop/footwear", label: "Footwear" },
      ],
    },
    {
      heading: "Company",
      links: [
        { href: "/pages/about-forward", label: "About Forward" },
        { href: "/pages/field-repair", label: "Field Repair" },
        { href: "/pages/shipping-returns", label: "Shipping & Returns" },
        { href: "/pages/contact", label: "Contact" },
      ],
    },
    {
      heading: "Support",
      links: [
        { href: "/account", label: "Account" },
        { href: "/policies/shipping-policy", label: "Shipping" },
        { href: "/policies/refund-policy", label: "Returns" },
        { href: "/policies/privacy-policy", label: "Privacy" },
        { href: "/policies/terms-of-service", label: "Terms" },
      ],
    },
  ],
} as const;

export const THEME_CONTENT_FIXTURE: ThemeContent = {
  announcement: "Free shipping over $150 · Repairs for life",
  footerTagline:
    "Gear for moving through weather, not around it. A short catalog, built slowly and repaired indefinitely.",
  demoNotice:
    "Forward is running as a static demonstration storefront. Catalog and cart data are local fixtures, customer accounts are unavailable, and nothing you do here is sent anywhere.",
  footerStatus: "Static demonstration storefront · Not a live store",
  homeHeroImage: EDITORIAL_IMAGES.heroOpenSky,
  standardBandImage: EDITORIAL_IMAGES.mountainRidges,
} as const;
