import type { Money } from "./types";

const USD_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatMoney(money: Money): string {
  return USD_FORMATTER.format(money.amount);
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

/** Formats an ISO `YYYY-MM-DD` fixture date for display. */
export function formatDate(isoDate: string): string {
  return DATE_FORMATTER.format(new Date(`${isoDate}T00:00:00Z`));
}
