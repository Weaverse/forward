# Repository guidance

## Project

Forward is a fresh Next.js App Router storefront theme using
`@shopify/hydrogen@preview`, powered by Weaverse.

The current milestone is the issue [#61](https://github.com/Weaverse/forward/issues/61)
**Tailwind presentation migration**
(`.weaverse/specs/2026-08-20--tailwind-presentation-migration/README.md`).
Production polish Phase 1 is complete on `main@8fa94b7`. Migrate in the locked
order: behavior-level UI coverage → effective Tailwind v4 tokens → global shell
→ complete route inventory → ownership/runtime hardening → legacy CSS removal.
This is an architecture migration, not a visual redesign. Preserve the accepted
Production storefront and its live Shopify contracts.

## Architecture constraints

- Implement from scratch in this repository.
- Do not inspect, fork, import, copy, or emulate Pilot code, architecture, sections, or conventions.
- The existing static Forward POC is a visual reference only; do not copy its implementation wholesale.
- Storefront completeness is defined by `.weaverse/specs/2026-08-05--static-demo-productionization/README.md` and the Shopify route contract.
- Build the theme before making deployment or demo-integration decisions.
- `src/app/globals.css` is the only target global stylesheet: Tailwind import,
  one semantic `@theme` token set, and minimal document-level base rules only.
  Components/routes own presentation through utilities; use `cn()` for
  conditions and `cva` for reusable variants. Do not add global component
  selectors to hide a partial migration.
- Replace shopper-visible source-regex assertions with rendered DOM,
  interaction, or browser behavior coverage before migrating their styles.
  JSDOM does not prove layout, overflow, responsive visibility, focus geometry,
  or reduced motion; keep those contracts in the permanent browser suite.
- `canonical-source.css`, `site-header.css`, and `production-polish.css` are
  retired. Do not restore legacy selectors or compatibility imports.

## Storefront data boundary

- Routes and visual components consume storefront data only through the
  `storefront` instance exported from `src/lib/storefront/data-source.ts`.
  Never import fixture objects from `src/lib/storefront/fixtures/`, Shopify
  queries, or raw Shopify shapes directly in pages or components.
- Mode selection is explicit and fails closed: no Shopify environment selects
  the static adapter, a complete environment selects the Shopify adapter, and
  a partial environment throws a sanitized configuration error. Product data
  never falls back in Shopify mode. Only validated navigation and canonical
  collection structure may use their explicit deterministic safeguards.
- Server catalog reads use `PRIVATE_STOREFRONT_API_TOKEN` with the Hydrogen
  `private_no_buyer_context` client. The private token must never reach browser
  code, props, logs, errors, tests, fixtures, or Git. Environment access stays
  in `src/lib/storefront/shopify/env.ts`.
- Unknown dynamic handles resolve to `null` from the data source and routes
  must translate that into `notFound()` — never invent content.
- The demo cart (`src/lib/demo-cart/`) remains browser-local prototype state in
  static mode only. Shopify mode must replace it with the server-owned Cart API
  integration and an honestly validated checkout handoff.
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
- Storefront Content/Cart credentials and Customer Account setup are approved
  for the current ordered slices under the spec's guarded Store-operation
  protocol. Weaverse, public-token browser use, analytics, payment activation,
  and uncontrolled customer/order data remain outside that approval. Never add
  a `.env` file to a repository or worktree.

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
