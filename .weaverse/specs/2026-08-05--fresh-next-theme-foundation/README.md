# Fresh Next.js Theme Foundation

Date: 2026-08-05
Status: approved for implementation
Shared contract: `0.3-draft`

## Goal

Create the first production-theme slice for Forward as a fresh Next.js App Router application. This slice establishes the repository foundation, branded global shell, complete Shopify storefront route topology, route-contract validation, and executable quality gates. It does not connect to live Shopify, Customer Account, Weaverse Studio, or deployment infrastructure.

## Non-goals

- No Pilot inspection, fork, code reuse, architecture reuse, or parity work.
- No deployment or hosting setup.
- No live Shopify/Customer Account/Weaverse credentials.
- No final commerce loaders, cart mutations, account OAuth, locale/market routing, or Studio bridge.
- No full visual implementation of every commerce surface.
- No generated non-product imagery.

## Technology baseline

- Node.js: `>=22` (local verification currently uses `26.3.0`).
- npm.
- Next.js App Router `16.3.0`.
- React/React DOM `19.2.8`.
- Strict TypeScript.
- Tailwind CSS v4 or a comparably small first-party CSS setup; avoid a component-framework dependency in this foundation slice.
- ESLint using the Next.js-supported flat configuration.

Versions must be pinned by the generated lockfile. Do not copy package configuration from another storefront.

## Route contract

### Canonical HTML routes

```text
/
/shop
/shop/[collectionHandle]
/products/[productHandle]
/search
/cart
/journal
/journal/[articleHandle]
/pages/[pageHandle]
/policies/[policyHandle]
/account
/account/orders
/account/orders/[orderId]
/account/addresses
/account/login
```

### Account protocol surfaces

```text
/account/authorize
/account/logout
```

In this foundation slice these must be explicit, safe placeholders or route handlers with no credential assumptions. They must not pretend authentication is implemented.

### Metadata/resource routes

```text
/robots.txt
/sitemap.xml
```

### Compatibility redirects

```text
/collections/all                         → /shop
/collections/[collectionHandle]          → /shop/[collectionHandle]
/blogs/journal                           → /journal
/blogs/journal/[articleHandle]            → /journal/[articleHandle]
```

Use permanent redirects and preserve path parameters. Canonical pages must not be duplicated at compatibility URLs.

### Supporting framework states

Provide branded:

```text
not-found
error
loading
```

Locale prefixes remain out of scope because markets/locales are still `TBD` in Shared Contract `0.3-draft`.

## Route ownership and validation

Create one route-contract module that owns:

- Required manifest patterns.
- Canonical smoke paths using safe fixture handles.
- Redirect smoke cases and expected targets.
- Route categories/labels used by shell UI or tests where useful.

Add:

```text
npm run check:routes
```

It must inspect actual Next build output (for example the generated App Router paths manifest) and fail when a required route pattern/resource route is absent. Do not validate only source filenames.

Add:

```text
npm run smoke:routes
```

It must hit a running production build and verify:

- Canonical fixture paths return the expected successful status.
- Compatibility URLs return permanent redirects to the expected custom canonical paths.
- `robots.txt` and `sitemap.xml` return successful responses.
- No shell route relies on live external data.

The smoke command may start/stop the production server itself, or use a deterministic companion command documented in README. It must be runnable non-interactively in CI.

## Branded shell

Build a coherent, responsive Forward shell rather than blank placeholder pages:

- `FOR / WARD` wordmark treatment.
- Header with Shop, Journal, and Search navigation.
- Mobile navigation that remains usable without JavaScript where practical; if interactive, implement keyboard/focus behavior.
- Footer with theme/store utility links.
- Forward color tokens, typography hierarchy, borders, spacing, and focus treatment.
- Route-specific shell content that clearly identifies the surface and its future live-data dependency.
- Polished English storefront copy.

The shell should feel like Forward, but broad final visual implementation remains a later slice. Do not copy static POC HTML/CSS wholesale.

## Data boundaries

Use typed local shell data only where needed to make routes reviewable. Clearly isolate fixtures from future Shopify data clients. Do not hard-code unresolved final collection, page, policy, menu, or article handles into production contracts.

Approved product handles may be used only as smoke fixtures:

```text
weatherline-shell
ridge-30-field-pack
talus-trail-shoe
```

Use neutral fixture handles such as `field-gear`, `walking-the-long-light`, `about-forward`, and `shipping-policy` for unresolved resource classes, clearly labeled as route-smoke fixtures.

## Package scripts and quality gates

At minimum provide working scripts for:

```text
dev
build
start
typecheck
lint
test
check:routes
smoke:routes
check
```

`check` should compose deterministic static gates without leaving a server running. Unit tests must cover route-contract normalization and required-route failure behavior. Redirect behavior must be verified against the production server.

## Documentation

Update `README.md` with:

- Setup and commands.
- Current foundation scope.
- Canonical/compatibility route table.
- Explicit integration/deployment deferral.
- The distinction between Shopify's `shopify hydrogen check routes` and this Next.js repo's route checker.

## Acceptance criteria

1. Fresh Next.js app installs from `package-lock.json` with npm.
2. No Pilot-derived files, imports, naming, or architecture.
3. All canonical, account, resource, and compatibility routes above exist in actual build output or redirect configuration.
4. `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run check:routes`, and `npm run smoke:routes` pass.
5. Production smoke leaves no server process running.
6. Representative desktop and mobile routes render without broken assets, horizontal overflow, or console errors.
7. Repository diff excludes `.next`, `node_modules`, logs, credentials, and deployment configuration.
8. No deploy, push, merge, issue, or PR side effect occurs during Claude implementation.

## Handoff record

Implementation handoff: `claude-handoff.md` in this folder.
Verification results and follow-up slices must be appended to this spec after implementation.
Implementation work log with verification results: `work-logs.md` (2026-08-05).
