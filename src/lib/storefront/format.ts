import { type LocaleId, localeTag } from "@/lib/i18n/locales";
import type { Money } from "./types";

const MONEY_FORMATTERS = new Map<string, Intl.NumberFormat>();
const DATE_FORMATTERS = new Map<string, Intl.DateTimeFormat>();

/**
 * Money in its own currency, written the way the shopper's market writes it
 * (`€221.78` in the US market, `221,78 €` in Germany). The currency always
 * comes from the money itself — the market the store priced it in — never
 * from the locale. There is no default market: a caller that forgets one
 * fails to compile rather than silently printing US formatting.
 */
export function formatMoney(money: Money, locale: LocaleId): string {
  const tag = localeTag(locale);
  const key = `${tag}|${money.currencyCode}`;
  let formatter = MONEY_FORMATTERS.get(key);
  if (formatter === undefined) {
    formatter = new Intl.NumberFormat(tag, {
      style: "currency",
      currency: money.currencyCode,
      /* `$248`, but `£228.20` rather than `£228.2`. */
      trailingZeroDisplay: "stripIfInteger",
    });
    MONEY_FORMATTERS.set(key, formatter);
  }
  return formatter.format(money.amount);
}

/** Formats an ISO `YYYY-MM-DD` date in the market's language. */
export function formatDate(isoDate: string, locale: LocaleId): string {
  const tag = localeTag(locale);
  let formatter = DATE_FORMATTERS.get(tag);
  if (formatter === undefined) {
    formatter = new Intl.DateTimeFormat(tag, {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
    DATE_FORMATTERS.set(tag, formatter);
  }
  return formatter.format(new Date(`${isoDate}T00:00:00Z`));
}
