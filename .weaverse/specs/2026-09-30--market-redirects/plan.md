# Plan: Keep the market on client and server redirects

## Scope check

Every navigation that does not go through the theme `Link` was listed
(`router.push/replace`, `redirect(`, `window.location`). Only two build a
theme path; the account refresh/login redirects target unprefixed protocol
paths by design, and the market selector only reads `location.search`.

## Fixes

1. `MainProduct` localizes `productSelectionHref(...)` with `useLocale()`
   before comparing it with the theme `usePathname()` and replacing. The theme
   pathname keeps a non-default prefix and drops the default one, so the
   comparison stays exact and never loops.
2. `saveAddress` redirects to `localizePath(ADDRESSES_PATH, <forward_locale
   cookie>)`. Revalidation and the refresh/login redirect are unchanged.

## Tests

- `tests/dom/product-detail.test.tsx`: a `de-de` PDP replaces to
  `/de-de/products/...`.
- `tests/customer-account-address.test.ts`: the source contract now expects
  the localized success redirect.

## Files touched

- `src/sections/main-product/index.tsx`
- `src/lib/account/address-actions.ts`
- `tests/dom/product-detail.test.tsx`
- `tests/customer-account-address.test.ts`
- `.weaverse/specs/2026-09-30--market-redirects/`
- `.weaverse/specs/2026-09-29--locale-routing/work-logs.md`
