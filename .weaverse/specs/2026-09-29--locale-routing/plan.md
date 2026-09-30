# Plan: Locale routing for Shopify Markets

## Decisions

| Question | Decision |
| --- | --- |
| Locale list | One constant, shaped like Pilot's `COUNTRIES` but trimmed: 5 locales, 4 languages. |
| Currency | Generalized now: `Money` carries any ISO currency; the market's currency flows through mapper, formatting, cart and add-to-cart. |
| Account pages | Move under `[locale]`. The proxy keeps the fail-closed account boundary; the four protocol paths stay unprefixed. |
| Market selector | Wired to the real locales; the preview-only country list is deleted. |
| Data seam | One data source instance per locale: `getStorefront(locale)`. The `StorefrontDataSource` interface is unchanged. |
| Links | A theme `Link` wraps `next/link` and prefixes the current locale; call sites only change their import. |

## Current state (re-checked on `main@53ac188`)

- `src/app/` holds 16 `page.tsx` files plus `layout.tsx`, `error.tsx`, `not-found.tsx` (19 files to move). Route handlers `api/cart`, `api/weaverse/revalidate`, `account/status` and metadata `robots.ts`, `sitemap.ts` stay at the root.
- Route contract: 20 route entries over 18 patterns, 4 permanent redirects (`check:routes` prints `20 route patterns and 4 permanent redirects`).
- `src/proxy.ts` matches only `/account/:path*`: disabled accounts get a no-store 404, the four protocol paths go to Hydrogen, other account pages get personalized headers and `NextResponse.next()`.
- The market is hardcoded as `{ country: "US", language: "EN" }` in six places: `shopify/client.ts` (`CATALOG_I18N`), `shopify/content-client.ts`, `cart/shopify-cart.ts`, `account/account-view.ts`, `proxy.ts`, and `weaverse/request-info.ts` (`WEAVERSE_I18N`, derived from `CATALOG_I18N`).
- The catalog, collection, all-products, content and navigation executors are module singletons; their `unstable_cache` keys carry no market.
- USD is baked in: `Money.currencyCode: "USD"` (`types.ts`), `format.ts`, the mapper's `REQUIRED_CURRENCY_CODE`, `formatShopifyMoney`, and `add-to-cart-form.tsx`.
- `localization.ts` has one active country plus five preview-only countries that the topbar selector shows.
- 41 files import `next/link` (63 uses); 36 `storefront.` calls in routes, header/footer, `weaverse/resource.ts` and one section loader; 5 routes use `generateStaticParams`.

## Locale model

`src/lib/i18n/locales.ts`:

```ts
export interface StorefrontLocale {
  /** URL segment, e.g. `de-de`. The default locale never appears in a URL. */
  id: string;
  label: string; // "Germany (EUR €)"
  language: LanguageCode; // Storefront API enum, e.g. "DE"
  country: CountryCode; // "DE"
  currency: CurrencyCode; // "EUR"
}

export const LOCALES = {
  "en-us": { id: "en-us", label: "United States (USD $)", language: "EN", country: "US", currency: "USD" },
  "en-gb": { id: "en-gb", label: "United Kingdom (GBP £)", language: "EN", country: "GB", currency: "GBP" },
  "de-de": { id: "de-de", label: "Germany (EUR €)", language: "DE", country: "DE", currency: "EUR" },
  "fr-fr": { id: "fr-fr", label: "France (EUR €)", language: "FR", country: "FR", currency: "EUR" },
  "ja-jp": { id: "ja-jp", label: "Japan (JPY ¥)", language: "JA", country: "JP", currency: "JPY" },
} as const satisfies Record<string, StorefrontLocale>;

export type LocaleId = keyof typeof LOCALES;
export const DEFAULT_LOCALE: LocaleId = "en-us";

export function parseLocale(segment: string | undefined): LocaleId | null;
/** `/shop` → `/de-de/shop`; the default locale returns `path` unchanged. */
export function localizePath(path: string, locale: LocaleId): string;
/** Strips a known prefix: `/de-de/shop` → `{ locale: "de-de", path: "/shop" }`. */
export function splitLocale(pathname: string): { locale: LocaleId | null; path: string };
```

Pure, dependency-free, used by the proxy, server routes and client components. It never reaches pricing on its own: prices come from Shopify's `@inContext` read. The store has one market today, so a non-US locale receives the store's own fallback prices; the theme renders whatever currency the response carries.

## Steps

### 1. Locale model and money in any currency

- Add `src/lib/i18n/locales.ts` with a small self-check test (`tests/locales.test.ts`: parse, localize, split, round-trip).
- `types.ts`: `Money.currencyCode: string` (an ISO 4217 code).
- `format.ts`: `formatMoney(money, locale?)` uses `Intl.NumberFormat` with the money's own currency and the locale's language-country; the default stays `en-US`.
- `mapper.ts`: replace `REQUIRED_CURRENCY_CODE` with a consistency rule. Every price on one product shares one currency (mixed currencies are malformed); the currency itself is the store's.
- `shopify-cart-react.tsx#formatShopifyMoney` and `add-to-cart-form.tsx` format with the money's currency instead of forcing USD.
- `product-state.ts`: the compare-at/currency guard keeps working unchanged.
- Update the mapper tests that assert "non-USD money is rejected" to assert "mixed currencies are rejected".

### 2. Per-locale data seam

- `shopify/client.ts`: every executor factory takes `i18n: { country, language }` and puts both into its `unstable_cache` key. `CATALOG_I18N` is deleted; `createStorefrontReadClient(config, i18n)`.
- `shopify/content-client.ts`: same (`CONTENT_I18N` deleted).
- `data-source.ts`: `createStorefrontDataSource(env, options, locale)`; export `getStorefront(locale: LocaleId): StorefrontDataSource`, memoized per locale in a module `Map`. Keep `storefront` as `getStorefront(DEFAULT_LOCALE)` only if something outside a locale needs it (`sitemap.ts`); otherwise delete it.
- `cart/shopify-cart.ts`: the request context takes the locale's i18n. `/api/cart` reads `?locale=` (validated by `parseLocale`, default otherwise). The client cart endpoint is configured per locale (`configureCartEndpoint` or the provider's endpoint option) so the header cart posts `?locale=<id>`.
- `account/account-view.ts` and `proxy.ts`: the account i18n comes from the request's locale.
- `weaverse/request-info.ts`: `WEAVERSE_I18N` becomes `weaverseI18n(locale)`; `buildRequestContext` takes the locale; `loadWeaversePage` and `loadWeaverseThemeSettings` receive it.
- `weaverse/resource.ts` and section loaders: resolve through `getStorefront(locale)`, where `locale` comes from the loader's request context `i18n.locale` (validated; default if absent).

### 3. Routes under `app/[locale]/`

- `git mv` the 16 pages, `layout.tsx`, `error.tsx`, `not-found.tsx` (and their co-located files: `cart/presentation.ts`, `cart/shopify-cart-view.tsx`, `account/addresses/address-form.tsx`) into `src/app/[locale]/`. `globals.css` and `icon.svg` move with the layout that imports them.
- `[locale]/layout.tsx` is the root layout: `params.locale` is validated (`notFound()` for an unknown segment), `<html lang>` is the locale's language, and a `LocaleProvider` (client context) wraps the shell. `SiteHeader` / `SiteFooter` receive the locale.
- Every page reads `params.locale` and calls `getStorefront(locale)`. `generateStaticParams` returns locales × handles; `dynamicParams` stays as it is per route.
- Stay at root: `api/cart`, `api/weaverse/revalidate`, `account/status`, `robots.ts`, `sitemap.ts`. `sitemap.ts` keeps listing default-locale URLs (hreflang alternates are out of scope).

### 4. Links, navigation and the selector

- `src/components/link.tsx`: `Link` reads `useLocale()` and passes `localizePath(href, locale)` to `next/link`. External and hash-only hrefs pass through. Swap the import in the 41 files. Biome `noRestrictedImports` forbids `next/link` outside this wrapper.
- Server-built hrefs (menus from `theme-routes.ts`, redirects in route handlers) stay unprefixed and are localized at render by the wrapper, so data stays locale-free.
- Forms (`sort-form`, `facet-list`, search): `action` takes the localized pathname. `usePathname()` already returns the visible URL, so the PDP `router.replace` and pagination keep their prefix.
- `header-navigation.ts#isActive` / `isShopActive` compare on `splitLocale(pathname).path`.
- Country control → locale switcher: it lists `LOCALES` by label, marks the current one, and links to the current path under the chosen locale. `localization.ts` preview countries are deleted.

### 5. Proxy

- `config.matcher` widens to every path except `_next`, static files, `api/`, `account/status`, `robots.txt`, `sitemap.xml`, `icon.svg`.
- Order inside `proxy()`:
  1. Split the locale prefix.
  2. `/en-us` or `/en-us/*` → 308 to the unprefixed path (query kept).
  3. Account boundary (unprefixed or prefixed `/account/*`): runs exactly as today. The four protocol paths match on the unprefixed path and stay unprefixed; disabled accounts still get the no-store 404 before anything else. The personalized page response becomes a rewrite to `/<locale>/account/...` instead of `NextResponse.next()`.
  4. A valid non-default prefix → `NextResponse.next()`.
  5. Everything else → rewrite to `/en-us<path>`.
- An unknown two-part prefix (`/xx-yy/shop`) is not a locale; it is rewritten under `en-us` and 404s through the catch-all like any unknown path.

### 6. Route contract and verification gates

- `route-contract.ts`: patterns become `/[locale]/...` for rendered routes (what the build manifests contain); smoke paths stay unprefixed because the proxy rewrites them. Add smokes: `/de-de/shop` 200, `/en-us/shop?x=1` 308 → `/shop?x=1`, `/xx-yy/shop` 404. The redirect contract gains the `/en-us` redirect (checked by smoke, not `next.config.ts`, since the proxy owns it). Update the printed counts.
- `check-routes.mts`, `smoke-routes.mts`: follow the contract; the smoke checks one prefixed PDP and one prefixed collection.
- `tests/route-contract.test.ts`, `tests/production-polish-*.test.ts`: update pattern expectations.
- DOM tests: `renderWithCart` gains a `LocaleProvider` (default locale); add one test that a `Link` under `de-de` renders `/de-de/...`.
- Browser suite: add a locale spec (`tests/browser/locale.pw.ts`): prefixed navigation keeps the prefix, the selector switches locale on the current path, `/en-us/...` redirects, the account boundary still answers as before.

### 7. Docs

- `AGENTS.md`: a Markets rule (locale list lives in `src/lib/i18n/locales.ts`; default locale is never in a URL; data reads go through `getStorefront(locale)`; `next/link` only through the theme `Link`).
- `README.md`: route section notes the `[locale]` segment and the proxy's redirect/rewrite.
- This spec's work log as work proceeds.

## Order and commits

1. Locale model and generalized money (no routing change).
2. Per-locale data seam and i18n plumbing (default locale everywhere still).
3. Route move under `[locale]` with params plumbing.
4. Theme `Link`, forms, active-state, market selector.
5. Proxy redirect/rewrite with the account boundary preserved.
6. Route contract, smoke, check-routes, DOM and browser tests.
7. Docs.

Each commit keeps `bun run check` green; steps 3–5 land together if the build cannot resolve routes in between.

## Verification

- `bun run check`, `bun run smoke:routes`, `bun run verify:shopify`, `bun run verify:live`.
- `bun run test:browser` (both live matrices), including `locale.pw.ts`.
- Manual: `/`, `/de-de`, `/ja-jp/products/weatherline-shell`, `/en-us/shop` (308), `/fr-fr/cart` add-to-cart, `/de-de/account` with accounts enabled and disabled, the selector from a PDP.

## Risks

| Risk | Mitigation |
| --- | --- |
| The store has one market, so non-US locales show the store's fallback prices | Intended: the theme renders the currency Shopify returns. Adding markets in Shopify needs no code change beyond `LOCALES`. |
| Cart created in one country, then browsed in another | The cart request carries the locale's country. Confirm Hydrogen updates buyer identity on country change, or reset the cart on mismatch. |
| Proxy widens from `/account` to every page | Keep the account branch byte-for-byte, add proxy unit tests for each branch, and keep the matcher's exclusions tight. |
| Static generation grows ×5 (locales × handles) | Acceptable for the current catalog size; revisit with `dynamicParams` if build time hurts. |
| A raw `next/link` import slips back in | Biome `noRestrictedImports` rule. |
| Weaverse translations per locale | Out of scope: the request context reports the locale, and Studio content stays as authored. |

## Out of scope

- Reading markets from Shopify `localization` at runtime.
- hreflang alternates in `sitemap.ts`.
- Translating theme copy and Weaverse content.
- Fixing 404 status codes (done in #65).

## Files and folders touched

**Create**
- `src/lib/i18n/locales.ts`, `src/lib/i18n/locale-context.tsx` (`LocaleProvider`, `useLocale`)
- `src/components/link.tsx`
- `tests/locales.test.ts`, `tests/proxy.test.ts`, `tests/browser/locale.pw.ts`

**Move** (into `src/app/[locale]/`)
- `page.tsx`, `layout.tsx`, `error.tsx`, `not-found.tsx`, `globals.css`, `icon.svg`
- `[...slug]/`, `account/` (except `account/status/`), `cart/`, `journal/`, `pages/`, `policies/`, `products/`, `search/`, `shop/`

**Modify: source**
- `src/proxy.ts`
- `src/app/api/cart/route.ts`, `src/app/sitemap.ts`
- `src/lib/storefront/`: `types.ts`, `format.ts`, `data-source.ts`, `localization.ts` (delete preview list), `shopify/client.ts`, `shopify/content-client.ts`, `shopify/data-source.ts`, `shopify/mapper.ts`
- `src/lib/cart/shopify-cart.ts`, `src/lib/cart/shopify-cart-react.tsx`
- `src/lib/account/account-view.ts`
- `src/lib/weaverse/`: `request-info.ts`, `server.ts`, `resource.ts`, `page.tsx`, `request-context.ts`
- `src/sections/**/loader.ts` that read storefront data
- `src/components/`: `add-to-cart-form.tsx`, `site-footer.tsx`, `sort-form.tsx`, `facet-list.tsx`, `site-header/*` (`site-header.tsx`, `header-navigation.ts`, `country-control.tsx`, …)
- The 41 files importing `next/link` (import swap only)
- `src/lib/routes/route-contract.ts`
- `biome.json` (`noRestrictedImports`)

**Modify: tests, scripts, docs**
- `tests/route-contract.test.ts`, `tests/production-polish-*.test.ts`, `tests/shopify-catalog-adapter.test.ts` (currency rule), `tests/dom/harness.tsx`, affected DOM tests
- `tests/browser/` (fixtures and specs that build paths)
- `scripts/check-routes.mts`, `scripts/smoke-routes.mts`, `scripts/verify-shopify.mts`
- `AGENTS.md`, `README.md`
- `.weaverse/specs/2026-09-29--locale-routing/` (README, work-logs)
