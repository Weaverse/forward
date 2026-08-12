# Shopify Content, Cart, and Customer Account Productionization

## Status

Production-verified complete on 2026-08-12. Leo approved the plan on
2026-08-09, and all three slices were independently released before the next
slice began:

1. Shopify Content Adapter.
2. Shopify Cart and checkout handoff.
3. Shopify Customer Account API.

The accepted Production baseline is `main@8d13dc68d7ecd7d1c6cdab614c717605e9d22d85`
at `https://forward-sandy.vercel.app`. Weaverse composition and
Markets/localization have not started.

Execute as three independently reviewed and deployed slices in this order:

1. Shopify Content Adapter.
2. Shopify Cart and checkout handoff.
3. Shopify Customer Account API.

Do not start Weaverse composition or Markets/localization until all three slices
are complete or explicitly deferred with a production blocker.

## Repository and approved baseline

```text
repository=https://github.com/Weaverse/forward
branch=main
base SHA=799ddbd8f3c018440523bb1797ff590b9182957d
runtime=Next.js 16.3.0 App Router
package manager=Bun 1.3.14
Hydrogen=0.0.0-preview-116d5d7-20260730141607
Shopify store=forward-xbirmxxt.myshopify.com
Admin API=2026-07
Storefront API=package-pinned 2026-04
```

Work in the primary checkout on `main`. Do not create worktrees unless Leo asks.
Do not inspect, copy, import, or emulate Pilot.

## Source authority

1. `/Users/hta218/Documents/work/obsidian/Hermes/Projects/Forward Productionization/Shared Contract.md`.
2. Existing normalized seam in `src/lib/storefront/data-source.ts` and
   `src/lib/storefront/types.ts`.
3. Live Shopify Storefront/Admin readback for the dedicated Forward store.
4. Existing store manifest and immutable reports under
   `/Users/hta218/Documents/work/artifacts/forward-shopify-seed/`.
5. Pinned generated Hydrogen guidance under `.agents/skills/` and exact installed
   package declarations under `node_modules/@shopify/hydrogen/`.

## Shared invariants

- Routes and visual components consume Shopify-backed records only through the
  normalized storefront boundary or a dedicated server-owned cart/account
  boundary. They never import raw Shopify documents or credentials.
- Private Storefront credentials, Customer Account access/refresh/ID tokens,
  cart secrets, Admin credentials, and session secrets stay server-only.
- Static mode remains deterministic and network-independent.
- Shopify mode fails closed for live content, cart, and account facts. It never
  silently serves fixture records as live truth.
- Unknown handles return `null` and routes translate them to `notFound()`.
- GraphQL errors are validated before cache eligibility. Malformed or partial
  error envelopes cannot be cached as success.
- Caught errors and operational logs use fixed sanitized labels and never emit
  URLs, headers, query bodies, tokens, customer data, or arbitrary messages.
- Preserve canonical layout, responsive behavior, accessibility, transitions,
  and query-state continuity. Data wiring is not permission for visual drift.
- Each slice follows RED -> GREEN -> full static/live checks -> immutable-tree
  independent review -> commit/push -> Git-triggered Vercel Production -> hosted
  QA. A later slice starts only after the preceding Production gate passes.

## Store operation protocol

Read-only Storefront/Admin inspection is allowed for discovery and verification.
Any persistent Shopify Store mutation must have all of the following before
apply:

1. Exact store and resource identity.
2. Complete non-paginated inventory or an explicit pagination proof.
3. Exact accepted baseline and target state.
4. Required live access scopes.
5. Zero-delete default; every delete requires separate explicit approval.
6. Immutable plan hash and independent review.
7. One bounded mutation operation unless the reviewed plan explicitly says
   otherwise.
8. Admin observed-state readback and unchanged non-target hash.
9. Same-plan ambiguous-success recovery.

Cart creation and line mutations are ephemeral shopper operations and do not
use Admin API. Customer QA fixtures, policy edits, callback/client changes, or
orders are persistent Store operations and require the guarded protocol.

---

# Slice 1 — Shopify Content Adapter

## Locked live ownership

Shopify owns resource identity, handle, title, publication state, body copy,
summary/excerpt, dates where the Storefront API exposes them, and resource
ordering for:

```text
pages:
  about-forward
  field-repair
  shipping-returns
  contact

blog:
  field-notes

articles:
  layering-for-moving-weather
  packing-thirty-liters-for-a-long-day
  reading-the-trail-underfoot

policies:
  privacy-policy
  refund-policy
  shipping-policy
  terms-of-service
```

Theme-owned presentation profiles may provide only fields Shopify does not own:
article plate, reading time, location, coordinates and art-directed image;
page eyebrow, structural section labels and art-directed hero; policy summary
when Shopify has no summary field. Shopify policies do not expose an updated
timestamp through the Storefront API, so the live adapter must not invent one
and the route omits that label. Presentation profiles are exact-handle
allowlists, not content fallback. They cannot override Shopify
title/body/excerpt/date or invent resources.

The extra Shopify page `data-sharing-opt-out` is outside the approved canonical
page set and must not become a generated public route in this slice.

## Query and mapping rules

- Use one bounded content query or independently bounded page/blog/policy
  documents behind a plain injectable executor.
- Query article `contentHtml` and page/policy HTML so paragraph boundaries are
  preserved; do not rely on flattened plain `content`.
- Query the four pages as exact `page(handle: ...)` aliases. Do not use an
  unfiltered `pages(first: ...)` connection: the live store contains an
  auto-managed `data-sharing-opt-out` page with script/meta markup, and that
  unrelated resource must neither be fetched into nor take down the approved
  content bundle.
- Query one exact `field-notes` blog with a bounded article connection and the
  four named policy fields. Require exactly the approved article handles and
  exact identities for every aliased page and policy.
- Reject pagination beyond the configured article bound, duplicates, missing
  resources, unsupported handles, empty required fields, invalid dates,
  unsupported HTML, unsafe links, unsafe image URLs, unresolved Liquid,
  scripts, styles, embeds, forms, event attributes, unapproved attributes, and
  malformed GraphQL envelopes.
- Parse a deliberately small exact tag/attribute subset into normalized text
  blocks. Do
  not render Storefront HTML with `dangerouslySetInnerHTML`.
- Internal links may use only canonical theme routes. External links require
  exact `https` URLs with no credentials.
- Make normalized `Policy.updatedAt` optional before mapping live policies and
  conditionally render the route's Updated label only when the API provides a
  real value. Static fixtures may retain their owned dates; Shopify mode must
  not synthesize one.
- Shared content uses the same one-hour request-independent cache window as the
  catalog. Complete article/page/policy parsing and mapper validation runs
  inside the Next cached callback. Any local process reuse stores only the
  normalized aggregate, never a raw or partially validated response.
- Content failures in Shopify mode throw; no static content fallback.

## Privacy-policy contract

The Shopify privacy policy is auto-managed. A corrected read through the exact
pinned Hydrogen private client, with the same US/EN request context used by the
catalog, returns a fully rendered 16,898-byte HTML body with no Liquid tokens.
Its accepted tag surface is `a`, `div`, `h2`, `li`, `p`, `strong`, and `ul`, with
`href` as the only attribute. The rendered result is identical with explicit
US/EN variables and with the request context alone.

The earlier preflight that reported raw `{{ ... }}`/`{% ... %}` was a faulty
audit path and is superseded by the exact Hydrogen-client readback. Do not
replace or disable the auto-managed policy. The adapter must still reject any
future unresolved Liquid before cache eligibility, but Liquid is an adversarial
failure case, not the current live baseline. Merchant/legal review of all policy
copy remains required before accepting real orders.

## Slice 1 verification

- Synthetic mapper/query/cache/error tests, including unresolved Liquid and
  unsafe HTML adversarial cases.
- Contract parity in static mode.
- Live verifier proves exact resources, the rendered auto-managed privacy body,
  and that every live normalized record is Shopify-derived.
- All canonical content pages, redirects, metadata, 404s, sitemap and route
  contract pass.
- Clean static and live builds, route smoke, desktop/tablet/mobile browser QA,
  and no fixture-only marker in live artifacts.

---

# Slice 2 — Shopify Cart and checkout handoff

## Locked ownership

- Shopify Cart API owns cart identity, lines, quantities, availability, warnings,
  user errors, discounts when exposed, subtotal/total, currency and checkout URL.
- Forward owns presentation, progressive enhancement, accessible feedback and
  canonical product/colorway URLs.
- No client-computed money totals or synthetic shipping amount may be presented
  as Shopify truth.

## Architecture

- Add a normalized `ProductVariant` seam under `Product`: exact Shopify
  merchandise ID, colorway ID, selected non-color options, current price and
  availability. A colorway can own many size variants, so a single merchandise
  ID must not be placed on `ProductColorway`. Thread the variant seam through
  `types.ts`, the static source, Shopify catalog query/mapper, fixtures and
  adapter tests before wiring Cart. Cart writes must never infer a variant ID
  from a product, colorway or option label.
- Create a request-scoped private Storefront client with trusted Vercel buyer IP
  handling for cart operations. Shared catalog/content remain on
  `private_no_buyer_context`.
- Use the pinned Hydrogen `createCartCookie`, `createCartServerHandlers`, React
  cart provider/store/forms, and same-origin `/api/cart` route where compatible
  with the exact package declarations.
- The cart cookie is Secure in Production, HttpOnly, SameSite=Lax, scoped to `/`,
  and contains only the opaque Shopify cart identity required by the pinned
  handler. Never expose cart secrets through props, localStorage, logs, URLs, or
  analytics. The pinned `createCartCookie()` omits `HttpOnly` and `Secure`; the
  Next `/api/cart` response boundary must harden the helper's `Set-Cookie` value
  before returning it.
- `/cart` is dynamic/no-store and server-seeded. Remove the existing
  `revalidate = 3600` and set `dynamic = "force-dynamic"` (plus no-store where
  needed). No-JS GET/POST flows must render the real cart and commit the cart
  cookie.
- Replace the demo cart completely in Shopify mode; do not run demo and live
  stores simultaneously. Static mode retains the deterministic demo cart.
- Preserve rapid-click safety, rollback, line-scoped accessible errors and
  pending-state continuity.
- Validate checkout handoff from the server-returned `cart.checkoutUrl`: exact
  HTTPS Shopify-owned checkout origin, default port, no credentials, and no
  caller-controlled redirect. Do not create a payment/order during QA.

## Store prerequisites and verification

- Read-only verify Cart API mutations with the Forward Headless publication and
  currently published variants.
- Verify line add/update/remove, refresh, new tab, expired/invalid cart, unavailable
  merchandise, malformed responses, rapid mutations, no-JS behavior, and
  checkout handoff.
- Inspect the real `/api/cart` POST response and prove its committed cart cookie
  includes `HttpOnly`, `SameSite=Lax`, `Path=/`, and `Secure` on Production;
  prove the cookie is not exposed through browser JavaScript.
- Cart QA may create ephemeral carts only. No Admin mutation or order creation is
  part of Slice 2.
- Release only after static/live full checks, independent security review and
  hosted repeated-cycle QA.

---

# Slice 3 — Shopify Customer Account API

## Store state and configuration

Read-only Admin evidence on 2026-08-09:

```text
shop id=gid://shopify/Shop/97847574828
customerAccountsV2.customerAccountsVersion=NEW_CUSTOMER_ACCOUNTS
login links visible=true
login required at checkout=false
customer account URL=https://shopify.com/97847574828/account
```

Canonical server configuration names:

```text
SHOP_ID
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID
CUSTOMER_ACCOUNT_SESSION_SECRET
PUBLIC_STOREFRONT_ORIGIN
```

At audit time, no Customer Account client ID, session secret, or canonical account
origin was present in the local theme env or Vercel Production. Local ignored env
is now configured for implementation verification. Vercel configuration and the
authoritative Headless callback/logout allowlists still require trusted
readback/configuration. Never invent a client ID or derive one from
publication/catalog/storefront IDs.

The read-only evidence is in `customer-account-audit.md`. The corrected
authoritative implementation and release contract is
`customer-account-contract.md`; where it narrows this original epic spec, the
contract file governs Slice 3.

## OAuth and session architecture

- Use pinned `createCustomerSession`, `createCustomerAccountServerHandlers`,
  `createCustomerAccountClient`, and Customer Account `gql` exports from the
  package's `@shopify/hydrogen/customer-account` subpath, not an unverified core
  barrel export.
- Canonical routes remain `/account/login`, `/account/authorize`,
  `/account/refresh`, and POST `/account/logout`.
- OAuth Authorization Code + PKCE must bind state, verifier, nonce and sanitized
  same-origin `return_to` to a protected server session.
- Hydrogen does not consume `CUSTOMER_ACCOUNT_SESSION_SECRET`; that key belongs
  to Forward's caller-owned `ShopifyRouteSessionManager` implementation. The
  session manager must provide read/write/unset/commit boundaries expected by
  the pinned route handlers and must be committed by every writable response.
- Prefer opaque server-side sessions. If an encrypted cookie is used, it must be
  Secure in Production, HttpOnly, SameSite=Lax, rotated, size-bounded and use a
  cryptographically random secret. Tokens never enter browser storage or RSC
  client payloads.
- Account pages are dynamic/no-store and use read-only session managers. Only
  writable response boundaries may refresh/commit/logout.
- Refresh once through `/account/refresh`; guard loops. Expired/invalid sessions
  fall back to login without leaking provider errors.
- Use typed Customer Account queries for customer profile, orders, order detail
  and addresses. Add address CRUD only when the pinned schema and live client
  support it; show scoped errors and never retry non-idempotent mutations after
  ambiguous timeout.
- Account order IDs are dynamic authenticated resources. Remove static params and
  fixture ownership in Shopify mode; unauthorized or foreign resources are never
  distinguishable through detailed errors.

## QA resource setup

The Store previously had no controlled customer/order fixtures. Before persistent
QA setup:

1. Inventory customers/orders and exact scopes.
2. Design one dedicated QA customer and, only if needed, one non-payable test or
   draft-derived order supported by the dev store.
3. Bind an immutable zero-delete plan to the exact baseline and target.
4. Obtain independent approval before apply.
5. Never activate a payment provider, charge money, fulfill inventory, send a
   real invoice, or contact an uncontrolled email address.

OAuth end-to-end QA requires access to the controlled customer's email/OTP flow.
If no controlled mailbox is available, source implementation can be verified
synthetically and provider redirects can be probed, but login/order/address
Production completion remains blocked and must be reported as such.

## Slice 3 verification

- Unit tests for config, cookie/session boundaries, return URL sanitization,
  OAuth routes, refresh loop guard, GraphQL mapping and address reads; mutation
  tests are required if address CRUD is added.
- Security tests for CSRF, state/nonce/PKCE mismatch, open redirects, token
  leakage, cache headers, cross-customer order access and ambiguous failures.
- Exact query validation, typecheck, full static/live suite/build/smoke.
- Hosted login/logout/refresh/profile/orders/order detail/address repeated cycles
  at desktop and mobile using only controlled QA data.
- Independent security review of the immutable tree before commit/deploy.

---

# Final combined gate

After all three slices:

- Live products, collections, Header, Footer, content, cart and account are
  Shopify-backed in Vercel Production.
- Static mode stays deterministic and network-independent.
- No secret, `.env`, QA token, customer PII, Admin artifact, Vercel artifact,
  build output or temporary file is staged.
- Full hosted route/browser regression repeats catalog filters, colorway query
  state, navigation cycles, cart cycles and account auth cycles.
- External Forward coordination notes record Store state, exact commits,
  deployment IDs, verification and any merchant/legal/payment blockers.

## Production closeout — 2026-08-12

- Slice 1 shipped at `73d724e94055df87e94395a23a301749a195290b`.
- Slice 2 shipped at `a6abc52b10dcfcf8d5c6280b4f33467bf0160339` and
  was subsequently merged through PR #55.
- Slice 3 merged through PR #56 at
  `1683ac456d6d6fa6751cc291b34d667d7b5a7186`. Two bounded Production QA
  follow-ups then shipped on `main`:
  - `2057f5e2d995181606ab22138b13488ce7f34d3e` — signed-in navigation state,
    private account-status boundary and global interactive cursor semantics;
  - `8d13dc68d7ecd7d1c6cdab614c717605e9d22d85` — narrow Vietnam address
    normalization.
- Git-triggered Vercel Production deployment
  `dpl_GJpBb5xGYjefk3fLrsrtmi1UMsww` is `READY`, targets Production and is
  aliased to `https://forward-sandy.vercel.app`.
- Final local gates passed: 285/285 tests, typecheck, lint, format, GraphQL,
  Production build, 17 route patterns plus four redirects, configured 32/32
  smoke, disabled/fail-closed 32/32 smoke and `git diff --check`.
- Tool QA proved `/account/status` returns only a signed-in boolean with
  private/no-store caching, while the public storefront remains publicly
  cacheable. Disabled/Preview account mode remains hidden and fail closed.
- Leo manually verified Production OAuth login and accepted the three hosted
  follow-ups: signed-in Header affordance, enabled/disabled interaction cursor
  behavior and Vietnam address creation without a free-form Shopify
  `zoneCode`.
- No payment, checkout order, uncontrolled customer fixture or test order was
  created. Exact order ownership and zero-order behavior remain covered by the
  automated contract rather than fabricated live order evidence.
- This closes the commerce productionization gate only. It does not install
  `@weaverse/next`, create a Weaverse project, connect Studio, or start
  Markets/localization.
