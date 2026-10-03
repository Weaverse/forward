"use client";

import { WeaverseNextRootProvider } from "@weaverse/next";
import type { ReactNode } from "react";

import { STATIC_CONTENT } from "@/lib/i18n/static-content";
import { themeSchema } from "./theme-schema";

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
      {children}
    </WeaverseNextRootProvider>
  );
}
