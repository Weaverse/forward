/**
 * Server-only Weaverse composition seam.
 *
 * This sits *beside* the storefront data source, never through it. Shopify
 * data enters routes only via `storefront` from
 * `src/lib/storefront/data-source.ts`; Weaverse page and theme payloads enter
 * only here. A section receives both as ordinary props, so neither seam can
 * reach into the other.
 *
 * An unconfigured project or a route with no page yields `null`, and the
 * route answers 404 — except in Studio's design mode, where a missing page
 * loads as the SDK's empty fallback so the merchant can compose it. A page
 * load that fails upstream (Weaverse unreachable, a bad response, a refused
 * request) throws instead, so the route renders its error boundary with a 5xx
 * rather than telling crawlers the page is gone. A page that exists renders
 * exactly as authored — an empty template renders empty.
 */

import "server-only";

import type {
  PageType,
  WeaverseNextLoaderData,
  WeaverseNextRequestContext,
} from "@weaverse/hydrogen/next";
import type {
  WeaverseNextCustomPageEntry,
  WeaverseNextServerClient,
  WeaverseNextThemeSettingsResponse,
} from "@weaverse/hydrogen/next/server";
import { createWeaverseNextServerClient } from "@weaverse/hydrogen/next/server";
import { headers } from "next/headers";
import { cache } from "react";
import { DEFAULT_LOCALE, type LocaleId } from "@/lib/i18n/locales";
import { readWeaverseConfig } from "./env";
import {
  buildRequestContext,
  type SearchParams,
  toSearchParams,
} from "./request-info";
import { WEAVERSE_SERVER_COMPONENTS } from "./server-components";

export type { SearchParams } from "./request-info";

import { type ThemeSettings, themeSchema } from "./theme-schema";

export interface LoadWeaversePageOptions {
  type: PageType;
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
  /** The request's market. Defaults to the store's default locale. */
  locale?: LocaleId;
}

/**
 * The one place the SDK server client is configured, or `null` when Weaverse
 * is not configured.
 *
 * The environment handed to the SDK is the explicit object built by
 * `readWeaverseConfig`, never `process.env` — see the note in `./env.ts` for
 * why that distinction is load-bearing.
 */
function createClient(
  requestContext: WeaverseNextRequestContext,
): WeaverseNextServerClient | null {
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
    /* `loadPage` rejects with `WeaverseLoadError` on upstream failures
     * instead of resolving to `null`; an unknown project still resolves to
     * `null`. */
    throwPageLoadFailures: true,
  });
}

/** Builds a client for the current request's route identity. */
async function createServerClient(
  pathname: string,
  searchParams: SearchParams | string | undefined,
  page?: { type: PageType; handle?: string },
  locale: LocaleId = DEFAULT_LOCALE,
): Promise<WeaverseNextServerClient | null> {
  const headerList = await headers();
  return createClient(
    buildRequestContext({
      headers: new Headers(Object.fromEntries(headerList.entries())),
      page,
      pathname,
      searchParams,
      locale,
    }),
  );
}

/**
 * Loads one Weaverse page, or `null` when there is no page to render.
 *
 * `null` is an ordinary outcome, not an error: the project may be
 * unconfigured or the Builder may hold no page for this route. Routes answer
 * it with `notFound()`. An upstream failure rejects (see the module note).
 */
export function loadWeaversePage({
  handle,
  locale = DEFAULT_LOCALE,
  pathname,
  searchParams,
  type,
}: LoadWeaversePageOptions): Promise<WeaverseNextLoaderData | null> {
  /* `cache()` matches arguments by identity, so the query travels as its
   * serialized string: a route's page and `generateMetadata` then share one
   * Builder call per request. */
  return loadPageOnce(
    type,
    handle,
    pathname,
    toSearchParams(searchParams).toString(),
    locale,
  );
}

const loadPageOnce = cache(
  async (
    type: PageType,
    handle: string | undefined,
    pathname: string,
    search: string,
    locale: LocaleId,
  ): Promise<WeaverseNextLoaderData | null> => {
    const client = await createServerClient(
      pathname,
      search,
      { handle, type },
      locale,
    );
    if (client === null) {
      return null;
    }
    const page = await client.loadPage({ handle, type });
    if (page === null || page === undefined) {
      return null;
    }
    /* The SDK answers with a placeholder page when a route has no real
     * composition yet. On the storefront that is "no page"; in Studio it is
     * the empty canvas the merchant composes into, so it renders there. */
    if (page.isFallback === true && page.configs?.isDesignMode !== true) {
      return null;
    }
    return page;
  },
);

/**
 * Builds a client for the Studio revalidation handler, re-running the loader
 * with the live page's exact route identity.
 */
export async function revalidateServerClient(
  requestContext: WeaverseNextRequestContext,
): Promise<WeaverseNextServerClient | null> {
  return createClient(requestContext);
}

/**
 * The project's custom pages, for the sitemap; empty when Weaverse is not
 * configured. A failed read rejects (`WeaverseLoadError` from the SDK) so the
 * sitemap answers 5xx instead of a 200 that drops every custom page: crawlers
 * keep the last good sitemap and retry.
 */
export async function fetchWeaverseCustomPages(): Promise<
  WeaverseNextCustomPageEntry[]
> {
  return (await createClient({ pathname: "/" })?.fetchCustomPages()) ?? [];
}

/**
 * The merchant's theme settings, read through the type derived from their
 * schema, so a renamed input breaks its consumers at compile time. A setting
 * the merchant left unset is simply absent.
 */
export async function readThemeSettings(
  locale: LocaleId = DEFAULT_LOCALE,
): Promise<Partial<ThemeSettings>> {
  /* The SDK answers `theme`: the merchant's saved values over the schema
   * defaults. There is no `themeSettings` key on the response. */
  const response = await loadWeaverseThemeSettings(locale);
  return (response?.theme ?? {}) as Partial<ThemeSettings>;
}

/** The configured project id, or `null` when Weaverse is not configured. */
export function weaverseProjectId(): string | null {
  return readWeaverseConfig(process.env)?.projectId ?? null;
}

/**
 * Loads published-mode theme settings once per request.
 *
 * Memoized with React `cache()` so the root layout and any metadata function
 * share a single fetch per request. This adds no cross-request caching, so
 * design-mode reads — which the SDK forces to `no-store` — stay fresh.
 */
export const loadWeaverseThemeSettings = cache(
  async (
    locale: LocaleId = DEFAULT_LOCALE,
  ): Promise<WeaverseNextThemeSettingsResponse | null> => {
    try {
      const client = await createServerClient(
        "/",
        undefined,
        undefined,
        locale,
      );
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
