"use client";

import { useThemeSettings, WeaverseNextRootProvider } from "@weaverse/next";
import type { ReactNode } from "react";

import { STATIC_CONTENT } from "@/lib/i18n/static-content";
import { type ThemeSettings, themeSchema } from "./theme-schema";

/**
 * The Weaverse root boundary the layout mounts once, above the header, the
 * page and the footer.
 *
 * It owns the session's theme-settings and translation stores, so theme copy
 * outside a composed page (header, footer, cart) translates and receives
 * Studio's live edits. Route-level providers adopt these stores rather than
 * creating their own.
 *
 * The SDK bundles this provider without a client directive, which is why the
 * boundary lives here. The schema and static copy are imported rather than
 * passed in, because a schema can hold functions that cannot cross from server
 * to client.
 */
export function WeaverseRoot({
  children,
  merchantOverrides,
  publicEnv,
  theme,
}: {
  children: ReactNode;
  merchantOverrides?: Record<string, unknown>;
  publicEnv?: Record<string, string | undefined>;
  theme?: Record<string, unknown>;
}) {
  return (
    <WeaverseNextRootProvider
      initialThemeSettings={theme}
      merchantOverrides={merchantOverrides}
      publicEnv={publicEnv}
      staticContent={STATIC_CONTENT}
      themeSchema={themeSchema}
    >
      <PageWidthStyle />
      {children}
    </WeaverseNextRootProvider>
  );
}

/**
 * The merchant's page measure as the `--container-page` token every
 * `max-w-page` container resolves through.
 *
 * It reads the root theme-settings store rather than the server response, so
 * dragging the slider in Studio resizes the page live. Unset keeps the theme's
 * own measure from `globals.css`.
 */
function PageWidthStyle() {
  const { pageWidth } = useThemeSettings<Partial<ThemeSettings>>();
  if (typeof pageWidth !== "number" || pageWidth <= 0) {
    return null;
  }
  return <style>{`:root{--container-page:${pageWidth}px}`}</style>;
}
