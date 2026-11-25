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

## Country sync names the customer

Whether Shopify keeps a cart's customer on a `countryCode`-only
`cartBuyerIdentityUpdate` is undocumented, so with Customer Accounts the
country update sends `customerAccessToken` too, from the same session manager
the cart handlers use:

- the signed-in customer's token: attached;
- `null` when the session has ended (no tokens, or a refresh Shopify rejected
  with 400/401, which clears them): detached;
- left out when that can't be told (an expired token whose refresh failed
  transiently, or one the caller may not refresh): the customer is untouched.

`/api/cart` may refresh an expired token (`getOrRefreshAccessToken`) and
commits the session on its response, error responses included. The cart page
(`readShopifyCart`) can't set cookies, so it reads with `getAccessToken` and
never refreshes.

## Session cookie `Secure`

`createCustomerAccountSessionManager` defaults `secure` to
`process.env.NODE_ENV === "production"`, and the proxy, the account pages and
the cart all use that default. The cart used to derive it from the cart's own
environment source, so the two rules could disagree.

## Kept as is

- The browser gets the keyless cart GID; the server acts only on the HttpOnly
  `cart` cookie (`withCookieCartIdentity`, `sanitizeCartHandlerResult`).
  Hydrogen's buyer-identity update reads the cart id from the cookie too.
- `syncCartCountry` still runs before every cart read and change.
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
  does not;
- a market change sends the signed-in customer's token with the country;
- an expired token is refreshed for it, and the session cookie is committed;
- a refresh Shopify rejects sends `customerAccessToken: null`;
- a transient refresh failure leaves the field out;
- a cart page render never refreshes and leaves the field out.

`tests/shopify-cart.test.ts`'s fakes read the country from the mutation's
`buyerIdentity` variable.

`tests/customer-account-routes.test.ts` passes an inert Storefront client to
the handlers it calls directly, since the sync handlers require one.

## Manual verification (Vercel preview)

Real sign-in needs an email OTP, so it is checked by hand: add to cart as a
guest, sign in, `GET /api/cart` shows `buyerIdentity.customer` set and the
checkout URL has `logged_in=true`; switch market (for example `/de-de`) and
the customer is still set (the country update now sends the token); sign out, the customer is null and the cart
(lines) is kept.

## Files touched

- `src/lib/account/account-view.ts`
- `src/lib/account/customer-account.ts`
- `src/lib/account/session-manager.ts`
- `src/lib/cart/shopify-cart.ts`
- `src/lib/routes/shopify-routes.ts`
- `src/proxy.ts`
- `tests/customer-cart-sync.test.ts` (new)
- `tests/customer-account-routes.test.ts`
- `tests/shopify-cart.test.ts`
- `vite.config.ts`
- `.weaverse/specs/2026-11-25--cart-buyer-identity-sync/`
