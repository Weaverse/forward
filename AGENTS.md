# Repository guidance

## Project

Forward is a fresh Next.js App Router storefront theme using
`@shopify/hydrogen@preview`, powered by Weaverse.

The current milestone is **Shopify catalog adapter — Slice 1**
(`.weaverse/specs/2026-08-06--shopify-catalog-adapter/README.md`): products,
normalized search/filter/sort, and canonical-route collection product
resolution are read from the live Storefront API when Shopify credentials are
present. Every other domain — canonical route collection presentation records,
content, navigation, demo cart, demo account — is still static fixture data,
and static mode remains the deterministic default when no Shopify credential is
configured.

## Architecture constraints

- Implement from scratch in this repository.
- Do not inspect, fork, import, copy, or emulate Pilot code, architecture, sections, or conventions.
- The existing static Forward POC is a visual reference only; do not copy its implementation wholesale.
- Storefront completeness is defined by `.weaverse/specs/2026-08-05--static-demo-productionization/README.md` and the Shopify route contract.
- Build the theme before making deployment or demo-integration decisions.

## Storefront data boundary

- Routes and visual components consume storefront data only through the
  `storefront` instance exported from `src/lib/storefront/data-source.ts`.
  Never import fixture objects from `src/lib/storefront/fixtures/`, Shopify
  queries, or raw Shopify shapes directly in pages or components.
- Mode selection is explicit and fails closed: no Shopify environment selects
  the static adapter, a complete environment selects the Shopify catalog
  adapter, and a partial environment throws a sanitized configuration error.
  Once Shopify mode is selected there is no runtime fallback to fixtures.
- Server catalog reads use `PRIVATE_STOREFRONT_API_TOKEN` with the Hydrogen
  `private_no_buyer_context` client. The private token must never reach browser
  code, props, logs, errors, tests, fixtures, or Git. Environment access stays
  in `src/lib/storefront/shopify/env.ts`.
- Unknown dynamic handles resolve to `null` from the data source and routes
  must translate that into `notFound()` — never invent content.
- The demo cart (`src/lib/demo-cart/`) is browser-local prototype state only:
  no checkout, no network writes, honest "demo" labeling in the UI.
- The Shopify adapter continues to replace the data source one domain at a
  time without rewriting page composition.
- Run `bun run check:graphql` (`hydrogen gql check`) after adding or changing
  any `gql()` document; the editor plugin does not run during `tsc`.

## Tooling

- Package manager and script runner: **Bun** (`bun.lock` is committed; there is
  no `package-lock.json`).
- Lint + format: **Biome 2.5.7** (`biome.json`). ESLint has been removed.
- Framework: Next.js App Router with strict TypeScript. Bun is a tooling
  decision only; the application stays Node-compatible.
- Shopify runtime: the preview-tagged `@shopify/hydrogen` package bootstrapped
  with `npx @shopify/hydrogen@preview setup`. Follow the generated
  `.agents/skills/` guidance for Hydrogen wiring in this Next.js app.
- Use Server Components by default; add Client Components only for real interactivity.
- Keep route definitions and route-check fixtures centralized rather than duplicating path strings.
- Storefront API catalog credentials are approved for Slice 1 only. Customer
  Account, Weaverse, public-token, and analytics credentials remain unapproved:
  keep explicit static/demo states for those surfaces until that work is
  approved. Never add a `.env` file to a repository or worktree.

## Required verification

Before handing off a change, run:

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
bun run check
```

(`bun run check` composes typecheck → lint → format:check → test →
check:graphql → build → check:routes; `smoke:routes` needs the production build
and is run separately. `bun run verify:shopify` is the opt-in live read-only
catalog verification and requires credentials, so it is never part of `check`.)

Inspect the final git diff and keep generated/build output untracked.

## Safety

- Never commit secrets or `.env` files.
- Do not deploy, force-push, merge, or modify GitHub issues/PRs unless explicitly requested.
- Do not rewrite the fresh root commit or remove the local legacy rollback bundle outside this repository.
