/**
 * Static navigation and theme-content fixture records. Test data only; runtime
 * code never imports it.
 */

import type { SiteNavigation } from "@/lib/storefront/types";

export const NAVIGATION_FIXTURE: SiteNavigation = {
  primary: [
    {
      href: "/shop",
      label: "Shop",
      children: [
        { href: "/shop", label: "Shop all" },
        { href: "/shop/outerwear", label: "Outerwear" },
        { href: "/shop/packs", label: "Packs" },
        { href: "/shop/footwear", label: "Footwear" },
      ],
    },
    { href: "/journal", label: "Field Notes" },
    {
      href: "/pages/about-forward",
      label: "About",
      children: [
        { href: "/pages/materials-and-care", label: "Materials & Care" },
        { href: "/pages/fit-and-sizing", label: "Fit & Sizing" },
        { href: "/pages/field-testing", label: "Field Testing" },
        { href: "/pages/field-repair", label: "Field Repair" },
        { href: "/pages/shipping-returns", label: "Shipping & Returns" },
        { href: "/pages/contact", label: "Contact" },
      ],
    },
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
