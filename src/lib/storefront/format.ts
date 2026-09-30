import type { Money } from "./types";

const MONEY_FORMATTERS = new Map<string, Intl.NumberFormat>();

/**
 * Money in its own currency, in the shopper's locale. The currency always comes
 * from the money itself — the market the store priced it in — never from the
 * locale.
 */
export function formatMoney(money: Money, localeTag = "en-US"): string {
  const key = `${localeTag}|${money.currencyCode}`;
  let formatter = MONEY_FORMATTERS.get(key);
  if (formatter === undefined) {
    formatter = new Intl.NumberFormat(localeTag, {
      style: "currency",
      currency: money.currencyCode,
      /* `$248`, but `£228.20` rather than `£228.2`. */
      trailingZeroDisplay: "stripIfInteger",
    });
    MONEY_FORMATTERS.set(key, formatter);
  }
  return formatter.format(money.amount);
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

/** Formats an ISO `YYYY-MM-DD` date for display. */
export function formatDate(isoDate: string): string {
  return DATE_FORMATTER.format(new Date(`${isoDate}T00:00:00Z`));
}
