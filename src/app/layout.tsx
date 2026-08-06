import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Literata, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";
import "./canonical-source.css";

/*
 * Canonical font contract, ported from the Advanced POC document head
 * (source `index.html:11`): Literata (display), Manrope (UI), IBM Plex Mono
 * (field labels). Served by Next instead of hotlinked from Google Fonts.
 */
const literata = Literata({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
  return (
    <html
      lang="en"
      className={`${literata.variable} ${manrope.variable} ${plexMono.variable}`}
    >
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
