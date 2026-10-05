import type { WeaverseNextRequestContext } from "@weaverse/next";

import {
  DEFAULT_LOCALE,
  LOCALES,
  type LocaleId,
  localeFromI18n,
  localePathPrefix,
  localeTag,
  localizePath,
} from "@/lib/i18n/locales";

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
 * undefined crashes the bridge rather than degrading it. `locale` is BCP-47
 * (`de-DE`), the Weaverse format — never the URL id (`de-de`), which the theme
 * recovers from `language` and `country` instead. Every field here is one the
 * SDK's revalidation boundary accepts.
 */
export function weaverseI18n(locale: LocaleId) {
  const { country, label, language } = LOCALES[locale];
  return {
    country,
    label,
    language,
    locale: localeTag(locale),
    pathPrefix: localePathPrefix(locale),
  };
}

/**
 * The market a section loader runs in: the locale the page's request context
 * reports, or the default when a caller (a Studio revalidation without one)
 * reports none.
 */
export function loaderLocale(context: unknown): LocaleId {
  /* Read the Storefront pair, not `i18n.locale`: that one is in Weaverse's
   * format, which routing must not depend on. */
  const i18n = (
    context as { i18n?: { language?: unknown; country?: unknown } } | undefined
  )?.i18n;
  return (
    localeFromI18n(
      typeof i18n?.language === "string" ? i18n.language : null,
      typeof i18n?.country === "string" ? i18n.country : null,
    ) ?? DEFAULT_LOCALE
  );
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
  /**
   * The request's market. `pathname` is the unprefixed route path; the
   * context reports it under the market prefix, the URL the browser shows.
   */
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
  /* Studio's address bar follows this path, so it must carry the market; the
   * Builder strips `i18n.pathPrefix` itself when it resolves the page. */
  const path = localizePath(pathname, locale);
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  const proto = headers.get("x-forwarded-proto") ?? "http";
  const origin = host === null ? "" : `${proto}://${host}`;

  return {
    headers,
    i18n: weaverseI18n(locale),
    pathname: path,
    searchParams: search,
    url: `${origin}${path}${search.size > 0 ? `?${search}` : ""}`,
    ...(page === undefined
      ? {}
      : {
          pageType: page.type,
          ...(page.handle === undefined ? {} : { handle: page.handle }),
        }),
  };
}
