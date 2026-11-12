# Plan

1. `POST_LOGOUT_REDIRECT_URI` becomes `/account/signed-out`; the sign-out form drops its `return_to`, so Hydrogen's logout handler always uses it.
2. The proxy answers `GET /account/signed-out` (unprefixed, account configured) with a no-store 303 to `localizePath("/", cookie locale)` on the configured storefront origin.
3. `AccountShell` loses its now-unused `locale` prop.
4. README: register `/account/signed-out` as the logout URI.
5. Tests: proxy redirect per cookie, logout handler location, sign-out form action.

## Files

- `src/lib/account/customer-account.ts`
- `src/proxy.ts`
- `src/components/account-shell.tsx`
- `src/app/[locale]/account/page.tsx`, `addresses/page.tsx`, `orders/page.tsx`, `orders/[orderId]/page.tsx`
- `README.md`
- `tests/customer-account-routes.test.ts`, `tests/dom/account.test.tsx`
- `.weaverse/specs/2026-11-12--sign-out-returns-to-market/`

## Rollout

Each store registers `<origin>/account/signed-out` as a logout URI in the Customer Account API settings. Until it does, Shopify falls back as before.
