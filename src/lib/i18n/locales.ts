/**
 * The markets Forward serves, one entry per URL locale.
 *
 * The default locale never appears in a URL: `/shop` is `en-us`, and
 * `/de-de/shop` is Germany. Prices are never derived from this table — the
 * Storefront API reads in the locale's `country`/`language` context and returns
 * whatever currency the store prices that market in.
 *
 * This module has no dependencies so the proxy, server routes and client
 * components can all share it.
 */

export interface StorefrontLocale {
  /** URL segment, e.g. `de-de`. */
  id: string;
  /** What the market selector shows. */
  label: string;
  /** Storefront API `LanguageCode`. */
  language: string;
  /** Storefront API `CountryCode`. */
  country: string;
  /** The currency the market is expected to price in. */
  currency: string;
  /** Text direction of the market's language, for `<html dir>`. */
  direction: "ltr" | "rtl";
}

export const LOCALES = {
  "en-us": {
    id: "en-us",
    label: "United States (USD $)",
    language: "EN",
    country: "US",
    currency: "USD",
    direction: "ltr",
  },
  "en-gb": {
    id: "en-gb",
    label: "United Kingdom (GBP £)",
    language: "EN",
    country: "GB",
    currency: "GBP",
    direction: "ltr",
  },
  "de-de": {
    id: "de-de",
    label: "Germany (EUR €)",
    language: "DE",
    country: "DE",
    currency: "EUR",
    direction: "ltr",
  },
  "fr-fr": {
    id: "fr-fr",
    label: "France (EUR €)",
    language: "FR",
    country: "FR",
    currency: "EUR",
    direction: "ltr",
  },
  "ja-jp": {
    id: "ja-jp",
    label: "Japan (JPY ¥)",
    language: "JA",
    country: "JP",
    currency: "JPY",
    direction: "ltr",
  },
} as const satisfies Record<string, StorefrontLocale>;

export type LocaleId = keyof typeof LOCALES;

export const DEFAULT_LOCALE: LocaleId = "en-us";

export const LOCALE_IDS = Object.keys(LOCALES) as LocaleId[];

export function parseLocale(
  segment: string | null | undefined,
): LocaleId | null {
  return typeof segment === "string" && Object.hasOwn(LOCALES, segment)
    ? (segment as LocaleId)
    : null;
}

/** The `language-COUNTRY` tag `Intl` and `<html lang>` expect. */
export function localeTag(locale: LocaleId): string {
  const { language, country } = LOCALES[locale];
  return `${language.toLowerCase()}-${country}`;
}

/** The Storefront API `@inContext` pair for a locale. */
export type LocaleI18n = Pick<
  (typeof LOCALES)[LocaleId],
  "country" | "language"
>;

export function localeI18n(locale: LocaleId): LocaleI18n {
  const { country, language } = LOCALES[locale];
  return { country, language };
}

/**
 * A path under a locale: `/shop` → `/de-de/shop`. The default locale, external
 * URLs, and fragment- or query-only hrefs pass through unchanged.
 */
export function localizePath(path: string, locale: LocaleId): string {
  if (
    locale === DEFAULT_LOCALE ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    /* Already localized: a pathname read back from the URL carries its own
     * prefix, and prefixing it again would name a page that does not exist. */
    parseLocale(path.split(/[/?#]/)[1]) !== null
  ) {
    return path;
  }
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** Splits a known locale prefix: `/de-de/shop` → `de-de` and `/shop`. */
export function splitLocale(pathname: string): {
  locale: LocaleId | null;
  path: string;
} {
  const segment = pathname.split("/")[1];
  const locale = parseLocale(segment);
  if (locale === null) {
    return { locale: null, path: pathname };
  }
  const rest = pathname.slice(locale.length + 1);
  return { locale, path: rest === "" ? "/" : rest };
}

/**
 * The cookie naming the locale of the page the shopper last loaded. The proxy
 * writes it; request handlers that serve no page of their own, like the cart
 * endpoint, read it to answer in the same market.
 */
export const LOCALE_COOKIE = "forward_locale";

export function localeFromCookieHeader(header: string | null): LocaleId {
  for (const part of (header ?? "").split(";")) {
    const [name, value] = part.trim().split("=");
    if (name === LOCALE_COOKIE) {
      return parseLocale(value) ?? DEFAULT_LOCALE;
    }
  }
  return DEFAULT_LOCALE;
}

/** The URL prefix a market's paths carry: none for the default market. */
export function localePathPrefix(locale: LocaleId): string {
  return locale === DEFAULT_LOCALE ? "" : `/${locale}`;
}

/** Inverse of {@link localeI18n}: the market for a Storefront API pair. */
export function localeFromI18n(
  language: string | null | undefined,
  country: string | null | undefined,
): LocaleId | null {
  return (
    LOCALE_IDS.find(
      (id) =>
        LOCALES[id].language === language?.toUpperCase() &&
        LOCALES[id].country === country?.toUpperCase(),
    ) ?? null
  );
}
