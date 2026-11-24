import { WeaverseNextStudioConnect } from "@weaverse/hydrogen/next";
import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { NavigationProgress } from "@/components/navigation-progress";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header/site-header";
import { ShopifyCartRuntime } from "@/lib/cart/shopify-cart-react";
import { cn } from "@/lib/cn";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import {
  DEFAULT_LOCALE,
  LOCALE_IDS,
  LOCALES,
  localeTag,
  parseLocale,
} from "@/lib/i18n/locales";
import { ROUTE_TEMPLATES } from "@/lib/routes/shopify-routes";
import { siteBaseUrl } from "@/lib/routes/site";
import { ShopifyScripts } from "@/lib/shopify-scripts";
import { getStorefront } from "@/lib/storefront/data-source";
import { weaversePublicEnv } from "@/lib/weaverse/env";
import { WeaverseRoot } from "@/lib/weaverse/root";
import {
  loadWeaverseThemeSettings,
  weaverseProjectId,
} from "@/lib/weaverse/server";

import "../globals.css";
import { T } from "@/lib/i18n/t";
import { getTranslator } from "@/lib/i18n/translator";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const t = await getTranslator(
    parseLocale((await params).locale) ?? DEFAULT_LOCALE,
  );
  return {
    /* Canonical, hreflang and social image URLs resolve against the public
     * origin, never the request's `Host`. */
    metadataBase: new URL(siteBaseUrl()),
    title: { default: t("meta.siteTitle"), template: "%s · Forward" },
    description: t("meta.siteDescription"),
  };
}

export const viewport: Viewport = {
  themeColor: "#11130f",
};

export function generateStaticParams() {
  return LOCALE_IDS.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const locale = parseLocale((await params).locale);
  if (locale === null) {
    notFound();
  }
  const weaverseEnabled = weaverseProjectId() !== null;
  const [themeResponse, shop] = await Promise.all([
    loadWeaverseThemeSettings(locale),
    getStorefront(locale).getShop(),
  ]);
  const market = LOCALES[locale];
  /* A Hydrogen-channel storefront attributes analytics to its storefront;
   * any other is a Headless storefront, which Shopify identifies as `0`. */
  const storefrontId = process.env.PUBLIC_STOREFRONT_ID?.trim() || null;
  return (
    <html
      lang={localeTag(locale)}
      dir={LOCALES[locale].direction}
      data-scroll-behavior="smooth"
      className={cn(
        archivo.variable,
        manrope.variable,
        plexMono.variable,
        "max-w-full scroll-smooth overflow-x-clip motion-reduce:scroll-auto",
      )}
    >
      <head>
        <ShopifyScripts
          analytics={{
            channel: storefrontId === null ? "headless" : "hydrogen",
          }}
          i18n={{
            country: market.country,
            language: market.language,
            currency: market.currency,
            pathPrefix: locale === DEFAULT_LOCALE ? "" : `/${locale}`,
          }}
          routes={ROUTE_TEMPLATES}
          shop={{
            shopId: shop.id,
            storefrontId: storefrontId ?? "0",
            myshopifyDomain: shop.myshopifyDomain,
          }}
        />
      </head>
      <body className="m-0 max-w-full overflow-x-clip bg-canvas font-body text-copy-sm leading-body text-ink antialiased">
        {weaverseEnabled ? <WeaverseNextStudioConnect /> : null}
        <LocaleProvider locale={locale}>
          <WeaverseRoot
            merchantOverrides={themeResponse?.merchantOverrides}
            publicEnv={weaversePublicEnv(process.env)}
            theme={themeResponse?.theme}
          >
            <ShopifyCartRuntime>
              <NavigationProgress />
              <a
                className="fixed top-2.5 left-2.5 z-1000 -translate-y-3/2 bg-ink px-4 py-2.75 text-text-inverse focus:translate-y-0"
                data-shell-background
                href="#main-content"
              >
                <T k="common.skipToContent" />
              </a>
              <SiteHeader locale={locale} />
              <main
                className="min-h-[66vh]"
                data-shell-background
                id="main-content"
              >
                {children}
              </main>
              <SiteFooter locale={locale} />
            </ShopifyCartRuntime>
          </WeaverseRoot>
        </LocaleProvider>
      </body>
    </html>
  );
}
