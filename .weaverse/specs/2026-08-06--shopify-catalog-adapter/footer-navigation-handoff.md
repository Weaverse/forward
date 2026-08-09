# Footer navigation adapter handoff

## Workspace

```text
repository=/Users/hta218/Documents/work/workspace/forward
branch=main
baseline=e662503315646605b8171b7c70ed8b6f07b530de
shared-contract=0.9-draft
```

Work directly in the primary checkout. Do not create a worktree or branch.
Do not publish an older split-source Footer candidate.

## Goal

Replace fixture-backed Footer navigation with one strictly validated Shopify
Storefront menu while preserving the approved Footer layout and normalized
`StorefrontDataSource` boundary.

This is a Footer navigation slice, not the page/article/policy body adapter.

## Authoritative live contract

The single Store-owned menu handle is `footer`. Its exact ordered two-level tree
is:

```text
Shop -> /collections/forward
  All products -> /collections/forward
  Outerwear -> /collections/outerwear
  Packs -> /collections/packs
  Footwear -> /collections/footwear

Company -> /pages/about-forward
  About Forward -> /pages/about-forward
  Field Repair -> /pages/field-repair
  Shipping & Returns -> /pages/shipping-returns
  Contact -> /pages/contact

Support -> /account
  Account -> /account
  Shipping -> /policies/shipping-policy
  Returns -> /policies/refund-policy
  Privacy -> /policies/privacy-policy
  Terms -> /policies/terms-of-service
```

The Theme normalizes Shopify collection/blog/policy destinations to canonical
Forward routes. In particular, Shopify refund policy maps to
`/policies/return-policy`.

Shopify owns all Footer headings, labels, order, hierarchy, and destinations.
The Theme owns only Footer presentation, wordmark, tagline, and runtime status.

Rejected behavior:

- deriving Footer Shop from Header `main-menu`;
- querying `forward-footer`;
- keeping Support navigation theme-owned in Shopify mode;
- combining multiple source trees into Footer columns.

## Runtime contract

- Query `footer` through the existing server-owned Storefront navigation
  transport. Components never query Shopify directly.
- Keep `PUBLIC_MAIN_MENU_HANDLE` and Header `main-menu` behavior unchanged.
- Strictly validate exact handle, three roots, child counts/order/labels/routes,
  maximum depth, no query/hash, and relative or exact configured HTTPS Shopify
  hostname with no credentials/non-default port.
- A malformed/unavailable `footer` tree falls back as one deterministic whole
  Footer unit.
- Header navigation, Footer navigation, and canonical collections have
  independently scoped fallbacks. A `footerMenu` GraphQL field error affects
  only Footer mapping.
- Partial GraphQL responses must not be persisted by `unstable_cache`; unscoped
  or malformed errors fail safely for every affected structure.
- Live products/catalog remain fail-closed. Footer fallback never converts a
  product failure to fixture success.
- Static mode stays deterministic and network-independent.
- Footer bottom status is mode-aware and provider-normalized.
- Preserve component data boundaries, accessibility, three-column geometry,
  tablet/mobile visibility, and Header query persistence.

## Required tests

Cover at minimum:

1. query variable/cache identity use handle `footer` and contain no
   `forward-footer` dependency;
2. exact full three-column mapping from one nested menu tree;
3. no Footer dependency on `main-menu` or theme-owned Support navigation;
4. missing/null/wrong handle/count/order/label/route/depth;
5. query/hash, cross-store, non-HTTPS, credentialed, and non-default-port URL
   rejection;
6. whole-Footer fallback with live Header/collections preserved;
7. Header fallback with a separately valid live Footer preserved;
8. field-scoped and unscoped GraphQL error behavior;
9. product/catalog fail-closed behavior;
10. deterministic destination resolution and truthful mode status;
11. all three columns visible at desktop, 1024px tablet, and 390px mobile;
12. live verifier requires exact three-column tree and no Footer fallback.

Use synthetic fixtures for tests. Do not print credentials or raw live
responses.

## Store state

The existing Shopify default menu was positively identified and adopted in
place as:

```text
handle=footer
id=gid://shopify/Menu/308140671276
title=Footer menu
roots=Shop, Company, Support
maximumDepth=2
```

D-021 replaced only its former Shopify defaults `Search` and
`Your Privacy Choices` through approved plan hash
`86d84ffca58eee49f4f5f28853bb89d10e059d689d681261562ce27be69aa6a8`.
Admin readback proved exact resource-linked items and every non-target menu
unchanged; an immediate same-hash rerun performed no mutation. Storefront
readback maps three live Footer columns with no safeguard. `forward-footer`
remains untouched legacy data and is not consumed by the Theme.

## Verification

```bash
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run format:check
bun test
bun run check:graphql
bun run build
bun run check:routes
bun run smoke:routes
bun run verify:shopify
bun run check
```

Run static/no-env and live gates separately, then exact desktop/tablet/mobile
browser QA. Freeze the final staged tree/diff hash and obtain an independent
read-only verdict before commit, push, or deployment.
