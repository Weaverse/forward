/**
 * Storefront localization for the Forward theme.
 *
 * The live Store publishes exactly one market — United States, primary locale
 * `en`, presentment currency USD — so `ACTIVE_STOREFRONT_COUNTRY` stays the
 * only market anything may transact against. Pricing, cart, and checkout read
 * that constant and nothing else.
 *
 * `AVAILABLE_STOREFRONT_COUNTRIES` additionally carries theme-preview markets
 * so the topbar selector can be demonstrated in the theme. They are demo data,
 * not a claim that Forward sells into them, and they must never reach pricing,
 * checkout, or a Storefront `@inContext` read. Replace this list with the
 * Storefront `localization.availableCountries` query before the selector is
 * allowed to change what a shopper is actually charged.
 */

export interface StorefrontCountry {
  /** ISO 3166-1 alpha-2 country code. */
  isoCode: string;
  name: string;
  /** ISO 4217 presentment currency for that market. */
  currencyCode: string;
}

export const ACTIVE_STOREFRONT_COUNTRY: StorefrontCountry = {
  isoCode: "US",
  name: "United States",
  currencyCode: "USD",
};

/** Theme-preview markets; see the module note before wiring these to anything. */
const PREVIEW_STOREFRONT_COUNTRIES: readonly StorefrontCountry[] = [
  { isoCode: "GB", name: "United Kingdom", currencyCode: "GBP" },
  { isoCode: "DE", name: "Germany", currencyCode: "EUR" },
  { isoCode: "CA", name: "Canada", currencyCode: "CAD" },
  { isoCode: "AU", name: "Australia", currencyCode: "AUD" },
  { isoCode: "JP", name: "Japan", currencyCode: "JPY" },
];

export const AVAILABLE_STOREFRONT_COUNTRIES: readonly StorefrontCountry[] = [
  ACTIVE_STOREFRONT_COUNTRY,
  ...PREVIEW_STOREFRONT_COUNTRIES,
];

export function countryControlLabel(country: StorefrontCountry): string {
  return `${country.name} · ${country.currencyCode}`;
}
