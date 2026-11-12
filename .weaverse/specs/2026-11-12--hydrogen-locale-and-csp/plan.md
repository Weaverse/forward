# Plan

## Locale APIs (#126)

- `src/lib/i18n/shopify-i18n.ts` defines `SHOPIFY_I18N` with `defineShopifyI18n`: `en-us` is the unprefixed default, the other markets use pathname routing. Hydrogen derives each prefix as `/{language}-{country}`, which equals Forward's locale ids, so no `pathSegment` overrides. Kept out of `locales.ts`, which client components import and must stay dependency-free.
- Every `createShopifyRequestContext` call passes `i18n: SHOPIFY_I18N` and pins `locale` (Forward always knows the market from the route or the locale cookie), instead of the deprecated fixed `i18n` pair: `src/proxy.ts` (2), `src/lib/account/account-view.ts`, `src/lib/storefront/shopify/client.ts`, `src/lib/cart/shopify-cart.ts`.
- The cart reads the market from `requestContext.locale`.
- Account protocol paths stay unprefixed: Hydrogen strips the locale prefix only when the path carries it.
- Forward's own helpers (`parseLocale`, `localizePath`, `splitLocale`, `LOCALE_IDS`) stay. Hydrogen's counterparts behave differently: `resolveSupportedLocale` throws instead of returning `null`, and `getLocalizedHref` lacks the "already localized" passthrough.
- `@weaverse/hydrogen` 6.3.0, which reads `storefront.locale`.

## Content Security Policy (#127)

- `src/lib/security/content-security-policy.ts`: `CSP_MODE` = `report-only` (default, also for unknown values), `enforce` or `off`.
- Policy: Hydrogen's `createContentSecurityPolicy` defaults + `getWeaverseStudioCspDirectives(request)` + `THEME_DIRECTIVES`. `nonce: false` with `'unsafe-inline'` scripts, Hydrogen's guidance for prerendered Next shells (Next cannot nonce them). `'unsafe-eval'` in development only, for Next's dev runtime.
- Report-only sets `Content-Security-Policy-Report-Only` from `csp.header`; enforce uses `csp.applyResponseHeaders`.
- `src/proxy.ts` applies it to page responses (ordinary pages and personalized account pages), and drops incoming CSP request headers so a shopper-supplied policy can't hand Next a nonce.
- No report endpoint; stores add `reportTo` to `THEME_DIRECTIVES` if they need one.

## Cart market after switching markets (#129, #130)

Found while testing: production showed the previous market's totals after a switch until reload (#129), and sometimes a third market's currency, such as yen (#130).

- #130: the cart read its market from the `forward_locale` cookie, which the proxy wrote on every page request, prefetches included. Opening the country selector prefetches every market, so the last prefetch (often `ja-jp`) won. The cart page's server render also read the previous request's cookie.
  - `localeFromReferer(request)` in `locales.ts`: the market of the same-origin page that sent the request.
  - Cart market order: the route locale (the cart page passes its `[locale]` param), then the `Referer`, then the cookie (for requests without one, such as a return from Shopify's login). Pilot resolves its cart market from the `Referer` the same way.
  - The proxy skips the cookie on prefetches (`next-router-prefetch`, `sec-purpose`/`purpose: prefetch`).
- #129: switching market is a client navigation, and the client cart kept its data. `CartMarketSync` in `shopify-cart-react.tsx` calls Hydrogen's `refresh()` when the locale changes; the market it last showed lives at module scope so a layout remount can't hide a switch.

## Verification

- `bun run check`
- Browser check on the Vercel preview: switch markets with items in the cart, with the country selector opened (prefetches) in between.
- Manual (by the user): page and cart flows per market, account login from a prefixed market, the CSP header in each mode, and Studio editing with `CSP_MODE=enforce`.

## Files touched

- `src/lib/i18n/shopify-i18n.ts` (new), `src/proxy.ts`, `src/lib/account/account-view.ts`, `src/lib/storefront/shopify/client.ts`, `src/lib/cart/shopify-cart.ts`
- `src/lib/security/content-security-policy.ts` (new)
- `src/lib/i18n/locales.ts`, `src/lib/cart/shopify-cart-react.tsx`, `src/app/[locale]/cart/page.tsx`
- `tests/shopify-i18n.test.ts` (new), `tests/content-security-policy.test.ts` (new), `tests/customer-account-routes.test.ts`, `tests/shopify-cart.test.ts`, `tests/locale-route.test.ts`
- `package.json`, `bun.lock`, `.env.example`, `README.md`
- `.weaverse/specs/2026-11-12--hydrogen-locale-and-csp/`
