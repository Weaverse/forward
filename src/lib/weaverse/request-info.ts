import type { WeaverseNextRequestContext } from "@weaverse/next";

import { DEFAULT_LOCALE, LOCALES, type LocaleId } from "@/lib/i18n/locales";

/** Weaverse page roles this theme composes. See the contract in the spec. */
export type WeaversePageType =
  | "INDEX"
  | "PRODUCT"
  | "COLLECTION"
  | "ALL_PRODUCTS"
  | "ARTICLE"
  | "PAGE"
  | "CUSTOM";

export type SearchParams = Record<string, string | string[] | undefined>;

/**
 * The market identity a Weaverse request carries: the request's own locale.
 *
 * Studio reads `i18n.language` when it binds its runtime; leaving `i18n`
 * undefined crashes the bridge rather than degrading it.
 */
export function weaverseI18n(locale: LocaleId) {
  const { country, language } = LOCALES[locale];
  return { country, language, locale };
}

export function toSearchParams(
  input: SearchParams | undefined,
): URLSearchParams {
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

export interface RequestContextInput {
  headers: Headers;
  pathname: string;
  searchParams?: SearchParams;
  page?: { type: WeaversePageType; handle?: string };
  /** The request's market; the path stays unprefixed so pages resolve alike. */
  locale?: LocaleId;
}

/**
 * Builds the route identity handed to the SDK.
 *
 * This is the whole contract with the Studio bridge, and every field is
 * load-bearing rather than decorative:
 *
 * - `i18n` — the bridge reads `i18n.language`; absent it throws.
 * - `pageType` and `handle` — how Studio knows which page it is editing.
 * - `url` — `resolveRequestUrl` prefers it over `pathname`, and a bare
 *   pathname resolves against `http://localhost`, which never matches a
 *   deployed preview.
 *
 * None of these are read by the storefront, so nothing storefront-facing
 * catches them going missing. That is why this is a pure function with its own
 * tests rather than an inline object in the client factory.
 */
export function buildRequestContext({
  headers,
  page,
  pathname,
  searchParams,
  locale = DEFAULT_LOCALE,
}: RequestContextInput): WeaverseNextRequestContext {
  const search = toSearchParams(searchParams);
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  const proto = headers.get("x-forwarded-proto") ?? "http";
  const origin = host === null ? "" : `${proto}://${host}`;

  return {
    headers,
    i18n: weaverseI18n(locale),
    pathname,
    searchParams: search,
    url: `${origin}${pathname}${search.size > 0 ? `?${search}` : ""}`,
    ...(page === undefined
      ? {}
      : {
          pageType: page.type,
          ...(page.handle === undefined ? {} : { handle: page.handle }),
        }),
  };
}
