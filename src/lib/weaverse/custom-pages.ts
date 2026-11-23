import type { WeaverseNextCustomPageEntry } from "@weaverse/hydrogen/next/server";

import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n/locales";

/**
 * Whether a custom page entry is served by the default market, whose URLs
 * have no locale prefix: a global assignment (every market), one assigned to
 * the default locale, or one assigned to the default market's country.
 *
 * An entry without `scope` comes from a Studio that predates it. Its explicit
 * locale still counts, but `locale: null` may be a global page or another
 * market's page, so it is left out rather than risk listing a URL that 404s.
 */
export function isDefaultMarketCustomPage(
  page: Pick<WeaverseNextCustomPageEntry, "locale" | "market" | "scope">,
): boolean {
  switch (page.scope) {
    case "global":
      return true;
    case "locale":
      return page.locale?.toLowerCase() === DEFAULT_LOCALE;
    case "market":
      return (
        page.market?.toLowerCase() ===
        LOCALES[DEFAULT_LOCALE].country.toLowerCase()
      );
    default:
      return page.locale?.toLowerCase() === DEFAULT_LOCALE;
  }
}
