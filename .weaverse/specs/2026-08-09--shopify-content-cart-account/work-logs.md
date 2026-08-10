# Shopify Content, Cart, and Customer Account — Work Log

## 2026-08-09 — Hermes preflight

### Authorization

Leo reviewed the ordered Content → Cart → Customer Account plan, confirmed that
required Shopify Store setup is in scope under guarded mutation rules, and said
`Ok, làm đi`.

### Baseline

```text
branch=main
HEAD=799ddbd8f3c018440523bb1797ff590b9182957d
origin/main=799ddbd8f3c018440523bb1797ff590b9182957d
divergence=0 0
working tree=clean before this spec
```

The baseline is the Production-approved single Shopify Footer release.

### Credential and package boundary

Secret-safe local key-name inspection found:

```text
theme:
  PUBLIC_STORE_DOMAIN
  PUBLIC_STOREFRONT_API_TOKEN
  PRIVATE_STOREFRONT_API_TOKEN
  PUBLIC_STOREFRONT_ID

store operations artifact:
  SHOPIFY_SHOP
  SHOPIFY_CLIENT_ID
  SHOPIFY_CLIENT_SECRET
```

No value was printed or copied. No Customer Account client/session key exists.
The pinned package exports live Cart server/store/form APIs plus Customer Account
client/session/server-handler APIs. Generated Next cart and Customer Account
references were read before design.

### Baseline live verification

`bun run verify:shopify` passed against the live Storefront API:

- public and private credential validity;
- exact `main-menu` and complete single `footer` tree;
- 3 products, 26 variants and all owned media/metafields;
- four canonical live collections;
- unknown-handle and normalized-search semantics.

No Store mutation occurred.

### Live content discovery

Read-only Storefront inspection confirmed:

- four approved Forward pages are present and published;
- blog `field-notes` contains exactly the three approved published articles;
- refund, shipping and terms policies return static HTML;
- an initial custom audit path appeared to return raw Liquid for privacy;
- article image fields are empty and article plain `content` collapses paragraph
  boundaries, so the adapter must query `contentHtml` and use exact theme-owned
  presentation profiles for art direction;
- Shopify also returns `data-sharing-opt-out`, which is outside the approved
  canonical page set.

The initial privacy result was later disproved through the exact pinned Hydrogen
`private_no_buyer_context` client. Both request-context-only and explicit US/EN
queries returned the same rendered 16,898-byte body, SHA-256
`28a651e58b790f0cac288c83db6b87d4b2f3eb1c306b4d487c162fde3eef5949`, with no
Liquid. Admin readback confirmed the policy is auto-managed. Its live HTML uses
only `a`, `div`, `h2`, `li`, `p`, `strong`, `ul`, and `href`.

Decision: preserve Shopify's auto-managed policy and do not create a Store
mutation. Keep unresolved-Liquid rejection as an adversarial pre-cache safety
rule, not a live blocker. Unsafe HTML still fails closed.

A full exact-tag audit then proved:

- all four approved page bodies and all three article bodies currently use only
  `<p>` with no attributes;
- privacy uses `a`, `div`, `h2`, `li`, `p`, `strong`, `ul` and only `href`;
- refund/shipping/terms use `a`, `h2`, `p` and only `href`;
- `data-sharing-opt-out` is an auto-managed page using `script`, `link`, `meta`
  and multiple data attributes.

Decision: query approved pages by exact `page(handle: ...)` aliases. Never use
an unfiltered pages connection and then reject the unrelated auto-managed page.
The parser still rejects any unexpected tag/attribute inside approved content.

### Live Admin discovery

Read-only Admin API 2026-07 inspection confirmed:

```text
shop=Forward
shop GID=gid://shopify/Shop/97847574828
customer account version=NEW_CUSTOMER_ACCOUNTS
login links visible=true
login required at checkout=false
customer account URL=https://shopify.com/97847574828/account
```

The installed Admin app has relevant customer/order read/write scopes. Persistent
QA customer/order creation still requires an exact independent mutation plan.
No Store mutation occurred during preflight.

### Independent pre-code spec review

The normal autoreview wrapper reached Copilot but failed on its known NDJSON
`Extra data` parsing issue. Claude Code was unavailable because the account had
reached its monthly spend limit. A frozen 66 KB source/spec bundle was therefore
reviewed directly with Copilot CLI using `claude-sonnet-4.6`; the reviewer made
no changes.

Although its header said `APPROVE`, the report contained required corrections,
so the result was treated as `CHANGES_REQUIRED`:

1. Make `/api/cart` response-boundary `HttpOnly`/Production `Secure` hardening
   and browser-cookie inspection an explicit release gate.
2. Add a normalized many-variant merchandise-ID seam under `Product`; do not put
   one variant ID on a colorway that can have many sizes.
3. Explicitly remove `/cart`'s current revalidate contract and force dynamic,
   no-store rendering.
4. State that `CUSTOMER_ACCOUNT_SESSION_SECRET` belongs to Forward's
   caller-owned `ShopifyRouteSessionManager`, not `createCustomerSession`.
5. Import Customer Account helpers from the verified package subpath.

All corrections were applied to the spec. `AGENTS.md` was updated from the stale
catalog-only milestone to the approved ordered three-slice milestone.

### Baseline repository gate

`bun run check` passed on the pre-implementation source tree:

```text
typecheck=PASS
lint=PASS with four pre-existing CSS specificity warnings
format=PASS
tests=148/148 PASS
GraphQL check=PASS
build=37 pages PASS
route contract=19 patterns + 4 redirects PASS
```

The build still emitted static journal handles because the current Shopify
adapter intentionally delegates content methods to the static base. That is the
exact seam Slice 1 must replace; it is not an environment-selection failure.

### Slice 1 implementation

The Content Adapter now owns the approved live Shopify Pages, `field-notes`
articles and four policies behind `StorefrontDataSource`:

- four pages are queried by exact `page(handle: ...)` aliases;
- the bounded blog connection requires the exact three article handles and
  rejects pagination, duplicates, missing or unexpected identities;
- policies are read from exact `shop` fields with no Shopify-mode fixture
  fallback;
- the complete aggregate is mapped before Next/process cache eligibility;
- the dependency-free HTML parser rejects Liquid, malformed/disallowed markup,
  every unapproved attribute, unsafe links and credentials;
- normalized policy runs preserve validated internal/external link semantics;
- exact presentation profiles own only labels, reading metadata and imagery;
- unknown live handles return `null`, so routes resolve them to `404`;
- sitemap generation covers product, collection, article, page and policy
  handles while excluding cart/search/account/auth routes;
- route smoke selects static/live content handles from the exact built
  prerender manifest rather than process environment assumptions.

No Shopify resource needed mutation. The auto-managed privacy policy remained
unchanged.

### Review and remediation

The delegated implementation worker timed out after leaving a partial RED tree.
Hermes completed the implementation and verified every accepted finding.

A targeted independent spec/source review returned `CHANGES_REQUIRED` for:

1. the broad `pages(first:)` query;
2. missing exact HTML attribute rejection;
3. raw rather than normalized process-cache reuse.

All three were fixed. Manual source review also found deferred policy-body
parsing, flattened legal links, an incomplete sitemap and a dead live-smoke
fixture; each was fixed before the release gate.

Final direct Copilot exact-tree review using `claude-sonnet-4.6` returned:

```text
VERDICT: APPROVE
No blockers.
```

The reviewer was read-only and made no source changes. Its attempts to rerun
commands were sandbox-denied, so the real local gate outputs below remain the
authoritative execution evidence.

### Slice 1 verification

```text
bun install --frozen-lockfile = PASS, no changes
focused content/data/navigation tests = 61/61 PASS
bun run check = PASS
full tests = 165/165 PASS
GraphQL check = PASS
live build = 36 pages PASS
route contract = 19 patterns + 4 redirects PASS
live production HTTP smoke = 30/30 PASS
explicit-empty-env static build = 37 pages PASS
static production HTTP smoke = 30/30 PASS
final live rebuild = 36 pages PASS
final live production HTTP smoke = 30/30 PASS
```

The read-only live Shopify verifier passed the complete adapter, including all
four pages, three articles, four policies, and the auto-managed privacy policy
normalized into 14 sections with four preserved links.

Local browser QA on port `3334` verified the live article, paragraph-only About
page and full privacy policy. DOM inspection proved every privacy section has
text and all four links remain clickable. `sitemap.xml` returned 21 URLs with
representative product, collection and content resources present and private
routes absent. The owned server was stopped and port `3334` was confirmed
closed. The browser sandbox was fixed at 1280px, so this pass records desktop
visual QA only rather than claiming tablet/mobile screenshots.

### Slice 1 release

Slice 1 was committed as `73d724e94055df87e94395a23a301749a195290b`
(`feat: source storefront content from Shopify`), pushed to `origin/main`, and
released by Git-triggered Vercel Production deployment
`dpl_CTJDaMZnASrzPRnoWZyPwYYEb3Ew`. Hosted smoke passed 30/30 checks and
hosted browser QA passed for the canonical article and privacy policy.

### Slice 2 — Cart and checkout implementation

The Cart slice now uses the pinned Hydrogen preview Cart contract end to end:

- normalized products retain every exact Shopify ProductVariant GID, selected
  option, availability and USD price; PDP selection never reconstructs a
  merchandise identity from labels or handles;
- the request-scoped private Storefront client forwards only the first valid
  Vercel `x-forwarded-for` IP and fails closed on missing/malformed Production
  buyer context;
- `/api/cart` uses Hydrogen server handlers and a hardened `HttpOnly`,
  `SameSite=Lax`, Production `Secure`, path-scoped cart cookie;
- response JSON redacts keyed cart identity while preserving line IDs needed by
  line mutations;
- checkout URLs require HTTPS, default port, no credentials and the configured
  store or an explicit Shopify-owned hostname;
- Shopify mode uses one client cart store across the shell, exact ProductForm
  variant selection, server-seeded dynamic/no-store `/cart`, and standard
  increase/decrease/remove forms;
- static mode retains the deterministic browser-local demo cart and does not
  render the Shopify Standard Actions script;
- cart presentation keeps the canonical Forward layout and reports live Cart
  with Account still honestly marked as demo.

Browser QA found and fixed a color-only product edge case: normalized Color is
owned by `colorwayId`, so the Hydrogen-only input now injects the current fixed
Color option for variant resolution without rendering a duplicate Color picker.
A regression test covers the Ridge 30 Field Pack case.

### Slice 2 verification before independent review

```text
bun install --frozen-lockfile = PASS, no changes
focused cart/catalog/data-source tests = 75/75 PASS
bun run check = PASS
full tests = 177/177 PASS
GraphQL check = PASS
live read-only Shopify verifier = PASS
live build = 35 pages PASS
route contract = 19 patterns + 4 redirects PASS
live production HTTP smoke = 30/30 PASS
explicit-empty-env static build = 36 pages PASS
static production HTTP smoke = 30/30 PASS
final live rebuild = 35 pages PASS
final live production HTTP smoke = 30/30 PASS
```

Live local browser QA completed two mutation cycles without opening checkout:

1. Talus Trail Shoe selected `US 9`, added quantity 2, persisted through the
   `HttpOnly` cookie, increased to 3, then removed to empty.
2. Ridge 30 Field Pack (no non-Color options) added successfully, rendered the
   populated cart without overlap/clipping, exposed a validated Shopify checkout
   handoff, then was removed and persisted empty.

The browser could not read the cart cookie and no Cart GID appeared in rendered
HTML. Checkout stayed on the exact Shopify-owned origin returned by Storefront;
it was not opened. These tests created and mutated only ephemeral Storefront Cart
state. No Shopify Admin mutation, checkout navigation, customer/order creation,
payment, commit, push, deployment, issue, PR, or external message occurred for
Slice 2 before the independent review gate.

### Slice 2 independent review

The standard autoreview wrapper reached Copilot but hit its known NDJSON
`Extra data` parser failure. The frozen 65,266-byte staged diff was therefore
reviewed directly, with tools disabled, by Copilot CLI using
`claude-sonnet-4.6`. It made no source changes and returned:

```text
VERDICT: APPROVE
BLOCKERS: None
```

Five non-blocking notes were adjudicated without source changes:

1. `noreferrer` is optional because the browser Referer is the Forward `/cart`
   URL, not the Shopify-returned checkout URL or cart identity.
2. Cookie names are case-sensitive and pinned `createCartCookie({name: "cart"})`
   fixes the only authoritative cart cookie name to lowercase.
3. Preselecting the first sellable variant is intentional and visible in the
   live ProductForm state; all mutations still carry that exact variant GID.
4. The combined `set-cookie` fallback is unreachable on the route's declared
   Node.js runtime, where `getSetCookie()` is present.
5. The private-token header is package-owned; successful live add/update/remove
   browser QA exercised that seam without printing the token.

### Current state

Slice 1 is released. Slice 2 is implementation-, verification- and
independent-review-complete, pending commit/push, Git-triggered Production
deployment and hosted Cart QA. Slice 3 Customer Account remains pending.
