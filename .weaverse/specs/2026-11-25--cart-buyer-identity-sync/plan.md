# Plan

## Wiring

- `createCustomerAccountRuntime` creates `cartHandlers =
  createCartServerHandlers({ customerSession })` and passes them to
  `createCustomerAccountServerHandlers` as `cartServerHandlers`. Hydrogen then:
  - attaches the customer (`cartBuyerIdentityUpdate` with the access token) on
    `/account/authorize` and `/account/refresh`;
  - detaches them (`customerAccessToken: null`) on `/account/logout` and on a
    refresh Shopify rejects, and expires the `cart` cookie when that detach
    fails. A transient refresh failure leaves the cart alone.
- `/api/cart` and the cart page call `runtime.cartHandlers` with the request
  context and a customer session manager built from the request's cookies, so
  a first cart is created with the signed-in customer and cart reads mark the
  checkout URL `logged_in=true`. A refresh during a first add commits the
  session cookie on the cart response. Without Customer Accounts the plain
  `shopifyCartHandlers` run as before.
- The proxy's protocol routes get the catalog's Storefront client from
  `createShopifyRouteContext` (now taking the market), built on the same
  request context `handleShopifyRoutes` runs with. Without catalog
  credentials the inert carrier stays, so the four-key account boundary still
  works alone; there is no cart to sync then.

## Kept as is

- The browser gets the keyless cart GID; the server acts only on the HttpOnly
  `cart` cookie (`withCookieCartIdentity`, `sanitizeCartHandlerResult`).
  Hydrogen's buyer-identity update reads the cart id from the cookie too.
- `syncCartCountry` still runs before every cart read and change. It sends
  only `countryCode`; Shopify is expected to keep the cart's customer on a
  partial buyer-identity update (checked by hand on the preview, below).
- Forward has no programmatic logout or `/cart/checkout` route: a session only
  ends through the protocol routes, which do the detach.

## Development build

`@shopify/hydrogen` 2026.10.3 exports a `development` build of its core, but
`./customer-account` has none. Under `next dev` the cart handlers carry the
dev build's `cartBuyerIdentitySync` symbol while the account handlers look up
the production one, and `createCustomerAccountServerHandlers` throws
`cartServerHandlers must be created by createCartServerHandlers with the
customerSession option.` on every page (the header resolves the runtime).
Reproduced locally with `next dev`: `/` and `/account/login` answer 500.

- `NODE_ENV === "development"` omits `cartServerHandlers`. Dev signs in and
  out without touching the cart; the cart handlers keep `customerSession`, so
  dev first carts still carry the customer. Hydrogen's own
  `migrate-to-hydrogen-2026-10` skill describes this workaround.
- Vitest resolves the `development` condition too. `vite.config.ts` aliases
  `@shopify/hydrogen` to `dist/core/index.mjs` so tests run the production
  pairing (setting `ssr.resolve.conditions` does not remove `development`
  from the worker's `--conditions`).
- Drop both once `exports['./customer-account']` gains a `development` key.

## Tests

`tests/customer-cart-sync.test.ts` runs through `proxy()` and
`handleShopifyCartRequest`, faking Shopify's token endpoint (an unsigned ID
token with the login's nonce) and the Storefront API:

- authorize attaches the guest cart (cookie cart id, the new access token);
- logout detaches the cart and keeps the cookie;
- a failed detach expires the `cart` cookie;
- the first add while signed in creates the cart with the customer;
- a signed-in cart read's checkout URL carries `logged_in=true`, a guest's
  does not.

`tests/customer-account-routes.test.ts` passes an inert Storefront client to
the handlers it calls directly, since the sync handlers require one.

## Manual verification (Vercel preview)

Real sign-in needs an email OTP, so it is checked by hand: add to cart as a
guest, sign in, `GET /api/cart` shows `buyerIdentity.customer` set and the
checkout URL has `logged_in=true`; switch market (for example `/de-de`) and
the customer is still set; sign out, the customer is null and the cart
(lines) is kept.

## Files touched

- `src/lib/account/customer-account.ts`
- `src/lib/cart/shopify-cart.ts`
- `src/lib/routes/shopify-routes.ts`
- `src/proxy.ts`
- `tests/customer-cart-sync.test.ts` (new)
- `tests/customer-account-routes.test.ts`
- `vite.config.ts`
- `.weaverse/specs/2026-11-25--cart-buyer-identity-sync/`
