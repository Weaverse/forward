import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header/site-header";
import { ShopifyCartRuntime } from "@/lib/cart/shopify-cart-react";
import { cn } from "@/lib/cn";
import { storefrontRuntimeMode } from "@/lib/storefront/data-source";
import {
  loadWeaverseThemeSettings,
  weaverseProjectId,
} from "@/lib/weaverse/server";
import { StudioConnect } from "@/lib/weaverse/studio-connect";
import type { ThemeSettings } from "@/lib/weaverse/theme-schema";

import "./globals.css";

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

/**
 * Reads the merchant's page measure, or `null` to keep the theme's own.
 *
 * This is the first theme setting the storefront actually consumes. It lands
 * as a CSS variable rather than a prop because `max-w-page` is a Tailwind
 * token every section already resolves through.
 */
async function pageWidthStyle(): Promise<string | null> {
  const theme = await loadWeaverseThemeSettings();
  /* Read through the type derived from the schema groups, so renaming the
   * input or changing its type breaks here rather than silently ignoring the
   * merchant's setting. */
  const settings = theme?.themeSettings as Partial<ThemeSettings> | undefined;
  const pageWidth = settings?.pageWidth;
  if (typeof pageWidth !== "number" || pageWidth <= 0) {
    return null;
  }
  return `:root{--container-page:${pageWidth}px}`;
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const shopifyCartEnabled = storefrontRuntimeMode === "shopify";
  const weaverseEnabled = weaverseProjectId() !== null;
  const pageWidth = await pageWidthStyle();
  return (
    <html
      lang="en"
      className={cn(
        archivo.variable,
        manrope.variable,
        plexMono.variable,
        "max-w-full scroll-smooth overflow-x-clip motion-reduce:scroll-auto",
      )}
    >
      <head>
        {pageWidth === null ? null : (
          <style
            // biome-ignore lint/security/noDangerouslySetInnerHtml: one numeric theme setting rendered into a single custom property, never merchant markup.
            dangerouslySetInnerHTML={{ __html: pageWidth }}
          />
        )}
        {shopifyCartEnabled ? (
          <script
            crossOrigin="anonymous"
            id="shopify-standard-actions"
            src="https://cdn.shopify.com/storefront/standard-actions.js"
            type="module"
          />
        ) : null}
      </head>
      <body className="m-0 max-w-full overflow-x-clip bg-canvas font-body text-copy-sm leading-body text-ink antialiased">
        {weaverseEnabled ? <StudioConnect /> : null}
        <ShopifyCartRuntime enabled={shopifyCartEnabled}>
          <a
            className="fixed top-2.5 left-2.5 z-1000 -translate-y-3/2 bg-ink px-4 py-2.75 text-text-inverse focus:translate-y-0"
            data-shell-background
            href="#main-content"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main
            className="min-h-[66vh]"
            data-shell-background
            id="main-content"
          >
            {children}
          </main>
          <SiteFooter />
        </ShopifyCartRuntime>
      </body>
    </html>
  );
}
