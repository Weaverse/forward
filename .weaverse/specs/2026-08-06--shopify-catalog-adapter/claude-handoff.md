# Claude implementation handoff — Shopify Catalog Adapter Slice 1

Implement the specification in:

```text
.weaverse/specs/2026-08-06--shopify-catalog-adapter/README.md
```

## Workspace

```text
repository=/Users/hta218/Documents/work/workspace/forward-shopify-catalog-adapter
branch=feat/shopify-catalog-adapter
base=9a69d0a5d275a7c5137412f277d7991ca4a8bb01
```

The only expected initial diff is this spec folder. Preserve it.

## Goal

Add a production-grade, read-only Shopify Storefront API catalog adapter behind
the existing normalized `StorefrontDataSource`. Preserve the user-approved
canonical presentation and route contracts.

Implement products, normalized search/filter/sort, and canonical route
collection product resolution. Keep collection presentation records, content,
navigation, demo cart, and demo account domains static.

## Mandatory discovery

Before editing:

1. Read `AGENTS.md` and update stale milestone wording only where this approved
   slice supersedes the previous static-only restriction.
2. Read the full slice spec.
3. Read current storefront types, data source, fixtures, product state, product
   card/PDP/cart consumers, route checks, and tests.
4. Read the installed generated skills for:
   - storefront client;
   - GraphQL query validation;
   - Next.js static/private client boundaries;
   - image handling and caching where relevant.
5. Inspect the approved seed manifest for field semantics only; do not import it
   into app code.
6. Do not inspect Pilot source.

## Credential safety

This worktree intentionally has no `.env` file.

- Do not read `/Users/hta218/Documents/work/workspace/forward/.env`.
- Do not request, discover, print, copy, or create token values.
- Implement and test with synthetic GraphQL-shaped fixtures only.
- Hermes will run the live read-only verification after your process exits.
- Do not add `.env`, live response dumps, authorization headers, CDN query
  signatures, or token-like fixtures.

## Implementation constraints

- Use the exact installed Hydrogen APIs; do not downgrade or change framework.
- Use `private_no_buyer_context` for the server-owned catalog adapter.
- Public token/Studio/ShopifyScripts wiring is deferred.
- Keep Color out of normalized `Product.options`; map it to colorways.
- Preserve canonical colorway IDs so demo cart/account references remain valid.
- Resolve media roles only through the metafield's ordered Shopify media IDs.
- Keep `field-gear`, `high-route`, and `camp-craft` route records static.
- Shopify mode must fail closed once selected; no runtime fallback to fixtures.
- Static mode must remain the no-env default for deterministic tests.
- Preserve `generateStaticParams`, `dynamicParams=false`, route 404s, metadata,
  current markup/classes/CSS, and accessibility.
- Keep raw Shopify types and queries out of pages/components.
- Do not implement real cart/account/navigation/content/Weaverse/analytics.

## Required tests and checks

Implement all test cases and gates listed in the spec. During implementation run
focused tests and, before stopping, run at least:

```bash
bun run typecheck
bun run lint
bun run format:check
bun test
bunx hydrogen gql check
bun run build
bun run check:routes
```

Do not run credentialed live tests.

## Deliverable

Leave a complete uncommitted working-tree diff and append to:

```text
.weaverse/specs/2026-08-06--shopify-catalog-adapter/work-logs.md
```

Record:

- files changed;
- architecture and mapping decisions;
- exact commands and results;
- any remaining risk or manual/live gate;
- no overclaim about live Shopify behavior.

Do not commit, push, open a PR, deploy, or modify GitHub/external systems.
