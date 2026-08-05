# Repository guidance

## Project

Forward is a fresh Next.js App Router storefront theme using
`@shopify/hydrogen@preview`, powered by Weaverse. The current milestone is a
complete **static demo**: every storefront surface renders from local fixture
data and no Shopify store is connected.

## Architecture constraints

- Implement from scratch in this repository.
- Do not inspect, fork, import, copy, or emulate Pilot code, architecture, sections, or conventions.
- The existing static Forward POC is a visual reference only; do not copy its implementation wholesale.
- Storefront completeness is defined by `.weaverse/specs/2026-08-05--static-demo-productionization/README.md` and the Shopify route contract.
- Build the theme before making deployment or demo-integration decisions.

## Static data boundary

- Routes and visual components consume storefront data only through the
  `storefront` instance (`StaticStorefrontDataSource`) exported from
  `src/lib/storefront/data-source.ts`. Never import fixture objects from
  `src/lib/storefront/fixtures/` directly in pages or components.
- Unknown dynamic handles resolve to `null` from the data source and routes
  must translate that into `notFound()` — never invent content.
- The demo cart (`src/lib/demo-cart/`) is browser-local prototype state only:
  no checkout, no network writes, honest "demo" labeling in the UI.
- A later Shopify adapter replaces the data source one domain at a time
  without rewriting page composition.

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
- Do not add live Shopify, Customer Account, or Weaverse credentials. Use explicit static/demo states until integration work is approved.

## Required verification

Before handing off a change, run:

```bash
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run format:check
bun test
bun run build
bun run check:routes
bun run smoke:routes
bun run check
```

(`bun run check` composes typecheck → lint → format:check → test → build →
check:routes; `smoke:routes` needs the production build and is run separately.)

Inspect the final git diff and keep generated/build output untracked.

## Safety

- Never commit secrets or `.env` files.
- Do not deploy, force-push, merge, or modify GitHub issues/PRs unless explicitly requested.
- Do not rewrite the fresh root commit or remove the local legacy rollback bundle outside this repository.
