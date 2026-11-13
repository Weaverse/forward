import type { WeaverseNextCustomPageEntry } from "@weaverse/hydrogen/next/server";

import { DEFAULT_LOCALE } from "@/lib/i18n/locales";

/**
 * Whether a custom page entry belongs on the default market's sitemap: a
 * global assignment (`""`, shared by every market) or one assigned to the
 * default market's locale.
 *
 * `null` is excluded on purpose. In a market-first Builder project a
 * per-market assignment stores `locale: null` with its country in `market`,
 * and the public endpoint does not return `market`, so a `null` entry may
 * belong to any market and would 404 on the default one.
 */
export function isDefaultMarketCustomPage(
  page: Pick<WeaverseNextCustomPageEntry, "locale">,
): boolean {
  return (
    page.locale === "" ||
    (page.locale !== null && page.locale.toLowerCase() === DEFAULT_LOCALE)
  );
}
