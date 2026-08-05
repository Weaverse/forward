# Repository guidance

## Project

Forward is a fresh Next.js App Router storefront theme using
`@shopify/hydrogen@preview`, powered by Weaverse.

## Architecture constraints

- Implement from scratch in this repository.
- Do not inspect, fork, import, copy, or emulate Pilot code, architecture, sections, or conventions.
- The existing static Forward POC is a visual reference only; do not copy its implementation wholesale.
- Storefront completeness is defined by `.weaverse/specs/2026-08-05--fresh-next-theme-foundation/README.md` and the Shopify route contract.
- Build the theme before making deployment or demo-integration decisions.

## Tooling

- Package manager: npm.
- Framework: Next.js App Router with strict TypeScript.
- Shopify runtime: the preview-tagged `@shopify/hydrogen` package bootstrapped
  with `npx @shopify/hydrogen@preview setup`. Follow the generated
  `.agents/skills/` guidance for Hydrogen wiring in this Next.js app.
- Use Server Components by default; add Client Components only for real interactivity.
- Keep route definitions and route-check fixtures centralized rather than duplicating path strings.
- Do not add live Shopify, Customer Account, or Weaverse credentials. Use explicit shell/placeholder states until integration work is approved.

## Required verification

Before handing off a change, run the available equivalents of:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run check:routes
npm run smoke:routes
```

Inspect the final git diff and keep generated/build output untracked.

## Safety

- Never commit secrets or `.env` files.
- Do not deploy, force-push, merge, or modify GitHub issues/PRs unless explicitly requested.
- Do not rewrite the fresh root commit or remove the local legacy rollback bundle outside this repository.
