import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Literata, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ShopifyCartRuntime } from "@/lib/cart/shopify-cart-react";
import { storefrontRuntimeMode } from "@/lib/storefront/data-source";

import "./globals.css";
import "./canonical-source.css";
import "./site-header.css";

/*
 * Canonical font contract, ported from the Advanced POC document head
 * (source `index.html:11`): Literata (display), Manrope (UI), IBM Plex Mono
 * (field labels). Served by Next instead of hotlinked from Google Fonts.
 *
 * The source requests `Literata:opsz,wght@7..72,400;7..72,500;7..72,600` — the
 * variable font including its optical-size axis. Declaring discrete weights
 * here would download static instances cut at the default `opsz` of 14, the
 * text optical size, so the oversized display headlines would render in a
 * body-text cut: blunter serifs, lower stroke contrast, looser spacing.
 * Requesting the `opsz` axis instead lets the browser's default
 * `font-optical-sizing: auto` pick the display cut at hero sizes, and the
 * variable `wght` axis still covers every weight the stylesheet asks for.
 *
 * Manrope and IBM Plex Mono stay on discrete weights because the source
 * requests them the same way (`wght@400;500;600;700` and `wght@400;500`).
 */
const literata = Literata({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-literata",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-manrope",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Forward — Gear for the way out",
    template: "%s · Forward",
  },
  description:
    "Forward is an outdoor gear storefront theme built on Next.js and powered by Weaverse.",
};

export const viewport: Viewport = {
  themeColor: "#11130f",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const shopifyCartEnabled = storefrontRuntimeMode === "shopify";
  return (
    <html
      lang="en"
      className={`${literata.variable} ${manrope.variable} ${plexMono.variable}`}
    >
      <head>
        {shopifyCartEnabled ? (
          <script
            crossOrigin="anonymous"
            id="shopify-standard-actions"
            src="https://cdn.shopify.com/storefront/standard-actions.js"
            type="module"
          />
        ) : null}
      </head>
      <body>
        <ShopifyCartRuntime enabled={shopifyCartEnabled}>
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <SiteHeader />
          <main id="main-content">{children}</main>
          <SiteFooter />
        </ShopifyCartRuntime>
      </body>
    </html>
  );
}
