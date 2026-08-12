# Shopify Customer Account — Locked Implementation Contract

Date: 2026-08-11
Status: implemented and Production-verified on 2026-08-12
Pinned Hydrogen baseline: `0.0.0-preview-116d5d7-20260730141607`

This file is authoritative for Slice 3 where it narrows the epic README.

## Configuration and origin

The complete account tuple is:

```text
SHOP_ID
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID
CUSTOMER_ACCOUNT_SESSION_SECRET
PUBLIC_STOREFRONT_ORIGIN
```

All values are server-validated. `SHOP_ID` is digits only. Until the authoritative value is read back, the client ID is validated as a non-empty string with no whitespace; its exact format is then pinned from Shopify rather than guessed. The session secret has no default or development fallback and must contain at least 32 bytes of CSPRNG entropy. `PUBLIC_STOREFRONT_ORIGIN` is one canonical HTTPS origin with no credentials, path, query, fragment, non-default port, or trailing slash.

The tuple is all-or-none. With all four absent, account integration is disabled: no account/login affordance is rendered and every account protocol or personalized route returns one deterministic, non-descriptive 404. A partial or malformed tuple throws before handlers can be registered. Final Slice 3 Production release is prohibited while disabled.

The configured origin is the only origin source for `createCustomerAccountServerHandlers`, `ShopifyRouteSessionManager.getSessionOrigin()`, callback construction, refresh, logout, and return-target validation. Request `Host`, `Forwarded`, `X-Forwarded-Host`, and similar headers are never origin inputs. The pinned callback runtime has a request-derived fallback only when `pendingLogin.origin` is absent, while its current readiness guard requires that value; a package-upgrade test pins this guard so the fallback cannot silently become reachable. Production callback registration must exactly match `${PUBLIC_STOREFRONT_ORIGIN}/account/authorize`; post-logout registration must exactly match `${PUBLIC_STOREFRONT_ORIGIN}/`.

## Route ownership

There is exactly one `handleShopifyRoutes()` call in root `proxy.ts`, one request context, and one writable session manager per request. The Customer Account handler group exclusively owns:

- `GET /account/login`;
- `GET /account/authorize`;
- `GET /account/refresh`;
- `POST /account/logout`.

No App Router `route.ts` may coexist at those protocol paths. Existing placeholders must be removed when the proxy lands. `defaultPostLoginRedirectPathname` is exactly `/account`; `loginFailedRedirectPath` is exactly `/account?login=failed`; `postLogoutRedirectUri` is exactly `/`. Untrusted `return_to`/`returnTo` input is accepted only through Hydrogen's same-origin sanitizer against the pinned configured origin. Every Forward-built login href/server redirect caps its UTF-8 target at 512 bytes, below Hydrogen's 2,048-byte package cap. The logout form omits both aliases, so the intended path always sends Shopify the one registered `${PUBLIC_STOREFRONT_ORIGIN}/` URI; a crafted same-origin POST with an alias still clears local state first and then fails closed if Shopify rejects the unregistered URI.

The exact pinned runtime calls `sessionManager.commit()` on every successful 303 login, authorize, refresh, and logout response, sets `cache-control: no-store`, and `handleShopifyRoutes()` applies request-context personalization headers to matched responses. Forward's manager must implement `commit()`; omission is a build/test failure. A same-origin-rejected logout returns the package's generic no-store 403 before session mutation or commit and is expected to emit no `Set-Cookie`. A non-OAuth callback failure rethrows after clearing only the in-memory view, so the uncommitted encrypted cookie may retain the state-bound pending login until its ten-minute package expiry; it cannot authenticate and a new login replaces it. Hosted assertions verify `Set-Cookie`, Cache-Control, and personalization/Vary behavior on every 303 protocol response and personalized account page, plus no-store/no-cookie behavior on the rejected 403/error paths.

## Session boundary

Forward will use one authenticated-encrypted, server-only cookie session unless an approved durable opaque session store is introduced first. The cookie is `HttpOnly`, `SameSite=Lax`, `Secure` in Production, `Path=/`, host-only with no `Domain`, and has a narrowly bounded lifetime. No token or pending-login value appears in browser storage, URL output, rendered HTML, RSC payload, logs, analytics, or client props.

The encrypted envelope uses an authenticated cipher with a fresh random nonce and generation identifier on every commit. The encoded cookie value is capped at 3,600 bytes and the complete `Set-Cookie` line at 4,096 bytes; the serializer rejects before emission when either bound is exceeded and never truncates. The 512-byte Forward `return_to` cap reserves pre-login headroom. Synthetic maximum-size token tests and the first live callback must measure the larger access/refresh/ID-token generation against the same bounds before release. Successful callback replaces the pending-login object with tokens in a freshly encrypted generation, so no stable pre-login identifier survives authentication. Logout removes the complete `customerAccount` session value and emits cookie expiry; no local token state survives even when Shopify logout is unavailable.

Hydrogen owns state, nonce, PKCE verifier generation/validation, ten-minute pending-login expiry, token parsing, and one-time replacement of pending login with tokens. Tests pin those exact installed behaviors and Forward's commit boundary rather than reimplementing OAuth.

## Errors, cache, and CSRF

OAuth failure redirects only to fixed `/account?login=failed`; the UI renders a generic message. Same-origin POST failure is the package's generic `403 Forbidden`. Unexpected handler/provider errors become a generic server response with `no-store`; response bodies never expose provider messages, GraphQL extensions, tokens, PII, request headers, or payloads. Server diagnostics redact those fields.

Logout remains POST-only and requires Hydrogen's exact configured-origin Origin/Referer check plus `SameSite=Lax`. `SameSite=None` is forbidden. Account loaders and mutations are dynamic/no-store. Matched personalized account redirects/pages apply personalization headers; the pre-personalization rejected logout 403 is intentionally only no-store. Login/logout use raw full-page anchors/forms rather than client navigation.

A refresh attempt uses one fixed, non-rendered query marker inside the sanitized same-origin `return_to` URL and can occur at most once per request flow. The refresh route uses a raw full-page anchor with prefetch disabled. A missing/expired token then falls back to login, never another refresh. Repeated hosted QA includes parallel-tab refresh because the package's refresh-flight deduplication is process-local and serverless instances can race a rotated token. Account GraphQL reads require a usable access token. Null, unauthorized, malformed, or foreign order IDs map to the same generic 404 without surfacing API extensions.

## Queries and mutations

Profile, order list, and order detail are read-only Customer Account API queries using exact pinned types/documents. Address changes use a Server Action with a writable committed session boundary, schema validation, CSRF protection, explicit user intent, and no retry after an ambiguous timeout. A mutation never performs an implicit token refresh; it redirects through the bounded refresh route when no usable token exists.

Static mode and disabled account mode render no fake account data or functional-looking auth controls. Account order IDs never use `generateStaticParams`.

## Production closeout

The existing Forward Headless client, exact Production callback/logout/origin
allowlists, protected Vercel environment tuple and team-controlled login flow
were available for release. Production OAuth login and account rendering were
manually verified without recording credential values or customer PII.

The public storefront obtains only a boolean account affordance from
`GET /account/status`. That endpoint uses the server-owned encrypted session,
returns only `{signedIn: boolean}`, is dynamic and private/no-store, and never
returns email, customer identity, token or session details. Fetch failure fails
safe to the signed-out `Account` presentation. The public storefront itself
remains cacheable and is not converted into a personalized response.

Shopify `zoneCode` is a region code, not a free-form province/city. Live store
metadata exposes no province-code list for Vietnam. For `territoryCode=VN`, an
unsupported human-readable zone such as `Ha Noi` is therefore omitted as
`zoneCode=null`; the city and territory are preserved. Forward does not invent
`VN-HN` and does not add a remote metadata dependency to the mutation path.

The original OAuth, fixed-origin, encrypted-cookie, cache, CSRF, POST-only
logout, generic-error and exact order-ownership requirements remain unchanged.
Preview/config-disabled account mode remains hidden and fail closed.

Final source/runtime gates passed with 285/285 tests, configured and disabled
32/32 route smoke, 17 route patterns plus four redirects and a Production build.
Leo manually accepted the signed-in Header state, global enabled/disabled cursor
contract and Vietnam address flow on Production.

No payment or test order was created. Any future customer/address fixture still
requires a controlled identity and cleanup plan. Any order fixture remains
permanent/non-revertible, approval-gated and must never contact an uncontrolled
email address.
