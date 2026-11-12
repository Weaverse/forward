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

## Verification

- `bun run check`
- Manual (by the user): page and cart flows per market, account login from a prefixed market, the CSP header in each mode, and Studio editing with `CSP_MODE=enforce`.

## Files touched

- `src/lib/i18n/shopify-i18n.ts` (new), `src/proxy.ts`, `src/lib/account/account-view.ts`, `src/lib/storefront/shopify/client.ts`, `src/lib/cart/shopify-cart.ts`
- `src/lib/security/content-security-policy.ts` (new)
- `tests/shopify-i18n.test.ts` (new), `tests/content-security-policy.test.ts` (new), `tests/customer-account-routes.test.ts`
- `package.json`, `bun.lock`, `.env.example`, `README.md`
- `.weaverse/specs/2026-11-12--hydrogen-locale-and-csp/`
