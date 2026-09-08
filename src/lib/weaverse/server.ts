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

import type { WeaverseNextLoaderData } from "@weaverse/next";
import type {
  WeaverseNextServerClient,
  WeaverseNextThemeSettingsResponse,
} from "@weaverse/next/server";
import { createWeaverseNextServerClient } from "@weaverse/next/server";
import { headers } from "next/headers";
import { cache } from "react";
import { readWeaverseConfig } from "./env";
import { WEAVERSE_SERVER_COMPONENTS } from "./server-components";
import { themeSchema } from "./theme-schema";

/** Weaverse page roles this theme composes. See the contract in the spec. */
export type WeaversePageType =
  | "INDEX"
  | "PRODUCT"
  | "COLLECTION"
  | "ARTICLE"
  | "PAGE"
  | "CUSTOM";

export type SearchParams = Record<string, string | string[] | undefined>;

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

function toSearchParams(input: SearchParams | undefined): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input ?? {})) {
    if (Array.isArray(value)) {
      for (const entry of value) params.append(key, entry);
    } else if (value !== undefined) {
      params.set(key, value);
    }
  }
  return params;
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
    requestContext: {
      headers: new Headers(Object.fromEntries(headerList.entries())),
      pathname,
      searchParams: toSearchParams(searchParams),
    },
  });
}

/**
 * `true` when a page carries at least one authored section.
 *
 * The root item always exists; what makes a page real is a child under it.
 */
function hasAuthoredSections(page: WeaverseNextLoaderData): boolean {
  const items = page.page?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return false;
  }
  return items.some((item) => {
    const children = (item as { children?: unknown }).children;
    return Array.isArray(children) && children.length > 0;
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
    const client = await createServerClient(pathname, searchParams);
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
