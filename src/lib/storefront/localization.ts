/**
 * Storefront localization the Forward store actually publishes today.
 *
 * The live Store has exactly one active market — United States, primary locale
 * `en`, presentment currency USD — so that is the only selection this module
 * may describe. `AVAILABLE_STOREFRONT_COUNTRIES` is the seam a future
 * Storefront `@inContext` localization read fills once more markets exist;
 * nothing here may name a market the store does not sell to.
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

export const AVAILABLE_STOREFRONT_COUNTRIES: readonly StorefrontCountry[] = [
  ACTIVE_STOREFRONT_COUNTRY,
];

export function countryControlLabel(country: StorefrontCountry): string {
  return `${country.name} · ${country.currencyCode}`;
}
