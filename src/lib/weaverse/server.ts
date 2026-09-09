/**
 * Server-only Weaverse composition seam.
 *
 * This sits *beside* the storefront data source, never through it. Shopify
 * data enters routes only via `storefront` from
 * `src/lib/storefront/data-source.ts`; Weaverse page and theme payloads enter
 * only here. A section receives both as ordinary props, so neither seam can
 * reach into the other.
 *
 * Every read fails soft. Weaverse is a composition layer over a storefront
 * that already renders without it, so an unconfigured project, a network
 * failure, or a missing page yields `null` and the route keeps its existing
 * theme-owned rendering. Composition never turns a working page into an error
 * page.
 */

import "server-only";

import type {
  WeaverseNextLoaderData,
  WeaverseNextRequestContext,
} from "@weaverse/next";
import type {
  WeaverseNextServerClient,
  WeaverseNextThemeSettingsResponse,
} from "@weaverse/next/server";
import { createWeaverseNextServerClient } from "@weaverse/next/server";
import { headers } from "next/headers";
import { cache } from "react";
import { readWeaverseConfig } from "./env";
import { hasAuthoredSections } from "./page-payload";
import {
  buildRequestContext,
  type SearchParams,
  toSearchParams,
  type WeaversePageType,
} from "./request-info";
import { WEAVERSE_SERVER_COMPONENTS } from "./server-components";

export type { SearchParams, WeaversePageType } from "./request-info";

import { themeSchema } from "./theme-schema";

export interface LoadWeaversePageOptions {
  type: WeaversePageType;
  handle?: string;
  /**
   * The route's own path.
   *
   * Required, and not optional by accident: Weaverse resolves `CUSTOM` pages
   * by pathname, and the SDK falls back to `"/"` when the request context has
   * neither `url` nor `pathname` — which silently resolves every custom route
   * to the home page.
   */
  pathname: string;
  searchParams?: SearchParams;
}

/** Whether this request is Studio composing the page rather than a visitor. */
function isDesignMode(searchParams: SearchParams | undefined): boolean {
  return String(searchParams?.isDesignMode) === "true";
}

/**
 * Builds the server client, or `null` when Weaverse is not configured.
 *
 * The environment handed to the SDK is the explicit object built by
 * `readWeaverseConfig`, never `process.env` — see the note in `./env.ts` for
 * why that distinction is load-bearing.
 */
async function createServerClient(
  pathname: string,
  searchParams: SearchParams | undefined,
  page?: { type: WeaversePageType; handle?: string },
): Promise<WeaverseNextServerClient | null> {
  const config = readWeaverseConfig(process.env);
  if (config === null) {
    return null;
  }

  const headerList = await headers();

  return createWeaverseNextServerClient({
    components: WEAVERSE_SERVER_COMPONENTS,
    env: config.sdkEnv,
    projectId: config.projectId,
    themeSchema,
    ...(config.weaverseHost === undefined
      ? {}
      : { weaverseHost: config.weaverseHost }),
    requestContext: buildRequestContext({
      headers: new Headers(Object.fromEntries(headerList.entries())),
      page,
      pathname,
      searchParams,
    }),
  });
}

/**
 * Loads one Weaverse page, or `null` when composition is unavailable.
 *
 * `null` is an ordinary outcome, not an error: the project may be
 * unconfigured, the Builder may hold no page for this route yet, or the fetch
 * may have failed. Routes fall back to their theme-owned rendering.
 */
export async function loadWeaversePage({
  handle,
  pathname,
  searchParams,
  type,
}: LoadWeaversePageOptions): Promise<WeaverseNextLoaderData | null> {
  try {
    const client = await createServerClient(pathname, searchParams, {
      handle,
      type,
    });
    if (client === null) {
      return null;
    }
    const page = await client.loadPage({ handle, type });
    if (page === null || page === undefined) {
      return null;
    }
    /* The Builder answers with a placeholder page when a route has no real
     * composition yet; that is "no page", not content to render. */
    if (
      typeof page.page?.id === "string" &&
      page.page.id.includes("fallback")
    ) {
      return null;
    }
    /* An empty payload is the project's shared default template, or a page a
     * merchant emptied. Rendering it composes a blank route, so the route
     * falls back to its own sections instead — except in Studio, where that
     * empty page is exactly what the merchant is about to compose. */
    if (!isDesignMode(searchParams) && !hasAuthoredSections(page)) {
      return null;
    }
    return page;
  } catch {
    return null;
  }
}

/**
 * Loads published-mode theme settings once per request.
 *
 * Memoized with React `cache()` so the root layout and any metadata function
 * share a single fetch per request. This adds no cross-request caching, so
 * design-mode reads — which the SDK forces to `no-store` — stay fresh.
 */
/**
 * Builds a client for the Studio revalidation handler.
 *
 * When the handler supplies a validated request context, the loader re-runs
 * with the live page's exact route identity. Without one — an older Studio
 * bridge — fall back to a bare client so the edit still resolves rather than
 * failing outright.
 */
export async function revalidateServerClient(
  requestContext?: WeaverseNextRequestContext,
): Promise<WeaverseNextServerClient | null> {
  if (requestContext === undefined) {
    return await createServerClient("/", undefined);
  }

  const config = readWeaverseConfig(process.env);
  if (config === null) {
    return null;
  }
  return createWeaverseNextServerClient({
    components: WEAVERSE_SERVER_COMPONENTS,
    env: config.sdkEnv,
    projectId: config.projectId,
    themeSchema,
    ...(config.weaverseHost === undefined
      ? {}
      : { weaverseHost: config.weaverseHost }),
    requestContext,
  });
}

/** The configured project id, or `null` when Weaverse is not configured. */
export function weaverseProjectId(): string | null {
  return readWeaverseConfig(process.env)?.projectId ?? null;
}

export const loadWeaverseThemeSettings = cache(
  async (): Promise<WeaverseNextThemeSettingsResponse | null> => {
    try {
      const client = await createServerClient("/", undefined);
      if (client === null) {
        return null;
      }
      const theme = await client.loadThemeSettings();
      return theme ?? null;
    } catch {
      return null;
    }
  },
);
