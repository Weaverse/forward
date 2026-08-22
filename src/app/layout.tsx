import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ShopifyCartRuntime } from "@/lib/cart/shopify-cart-react";
import { storefrontRuntimeMode } from "@/lib/storefront/data-source";

import "./globals.css";
import "./canonical-source.css";
import "./site-header.css";
import "./production-polish.css";

/* Premium type contract: Archivo for display, Manrope for body/UI, and
 * IBM Plex Mono only for compact field metadata. Next serves all three. */
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-archivo",
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
      className={`${archivo.variable} ${manrope.variable} ${plexMono.variable}`}
    >
      <head>
        {/* Non-rendering Tailwind theme probe, verified from compiled CSS by
         * `bun run check:theme`. */}
        <meta
          className="max-w-page bg-canvas font-heading text-signal"
          content="semantic-utilities"
          name="forward-tailwind-theme"
        />
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
