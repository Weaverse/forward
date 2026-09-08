# Repository guidance

## Project

Forward is a fresh Next.js App Router storefront theme using
`@shopify/hydrogen@preview`, powered by Weaverse.

## Architecture constraints

- Implement from scratch in this repository.
- Do not fork, import, copy, port, or emulate Pilot code, architecture,
  sections, or visual design. Reading Pilot to learn how a Weaverse theme
  *organizes* its files was authorized by Leo on 2026-09-08 and is the only
  permitted use: layout conventions may be adopted, implementation may not.
  Nothing in this repository is a translation of Pilot source.
- The existing static Forward POC is a visual reference only; do not copy its implementation wholesale.
- Storefront completeness is defined by `.weaverse/specs/2026-08-05--static-demo-productionization/README.md` and the Shopify route contract.
- Build the theme before making deployment or demo-integration decisions.
- Routes compose named sections from `src/sections/`; they do not inline
  section markup. A section is pure presentation: every piece of content and
  data arrives as props, and the page owns the `storefront` reads. Sections
  never import the data source, and a section reused by more than one route
  takes its variations as props rather than forking into a near-copy.
- Functional, stateful, and security-owned surfaces are not sections and stay
  theme-owned: the PDP buy block and its `colorway`/`size` query state, the
  collection and Shop grid behavior, Cart, and `/account/**`. Header and
  Footer are theme-owned components configured through theme settings, never
  Weaverse global sections.
- A Weaverse component is the default export of its file and exports its
  `schema` from that same file, so settings and markup cannot drift apart and
  the registry cannot pair them up wrongly. This is the one place beyond Next's
  route files where a default export is correct: the SDK reads `default` off
  the module. Sections that are *not* Weaverse components keep named exports.
  The registry in `src/lib/weaverse/components.ts` is the only list the SDK
  sees; a component absent from it cannot be composed.
- Theme settings live one group per file under `src/lib/weaverse/settings/`,
  each declared `as const satisfies WeaverseNextThemeSchemaGroup`.
  `settings/types.ts` derives `ThemeSettings` from those declarations, so
  renaming an input breaks its consumers at compile time instead of silently
  reading `undefined`.
- Shared editorial elements — `Heading`, `Subheading`, `Paragraph`, `Button` —
  are registered Weaverse components that render through the existing
  presentation recipes, so copy authored in Studio and copy authored in a
  route render identically.
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

- Package manager and script runner: **Bun**, pinned by `packageManager` in
  `package.json` (`bun.lock` is committed; there is no `package-lock.json`).
  Match that version. An older Bun silently ignores the node suite's
  `--path-ignore-patterns`, so DOM tests run without their preload and report
  failures the pinned version does not have.
- Lint + format: **Biome 2.5.7** (`biome.json`). ESLint has been removed.
- Framework: Next.js App Router with strict TypeScript. Bun is a tooling
  decision only; the application stays Node-compatible.
- Shopify runtime: the preview-tagged `@shopify/hydrogen` package bootstrapped
  with `npx @shopify/hydrogen@preview setup`. Follow the generated
  `.agents/skills/` guidance for Hydrogen wiring in this Next.js app.
- Use Server Components by default; add Client Components only for real interactivity.
- Keep route definitions and route-check fixtures centralized rather than duplicating path strings.
- Storefront Content/Cart credentials, Customer Account setup, and the
  Weaverse connection are approved for the current ordered slices under the
  spec's guarded Store-operation protocol. Public-token browser use, payment
  activation, and uncontrolled customer/order data remain outside that
  approval. Never add a `.env` file to a repository or worktree.
- Install only an exact registry-verified `@weaverse/next` version. The npm
  `latest` tag is stale and must never be installed. Keep the Shopify data
  seam and the Weaverse composition seam separate: no Shopify credential,
  private token, or raw API payload may reach a Studio payload. Analytics
  pageview transport and deduplication are owned by the SDK; the theme must
  not reimplement them.

## Required verification

Before handing off a change, run:

```bash
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run format:check
bun run test
bun run check:graphql
bun run build
bun run check:theme
bun run check:routes
bun run smoke:routes
bun run check
```

(`bun run check` composes typecheck → lint → format:check → test →
check:graphql → build → check:theme → check:routes; `smoke:routes` needs the
production build and is run separately.)

Credential-dependent gates are never part of `check`:

- `bun run verify:static` builds and runs the route/smoke contract with every
  Shopify credential removed in a script-owned child environment.
- `bun run verify:live` requires the complete live Shopify configuration and
  runs the live build/route/read-only gates for both account-disabled and
  account-enabled states.
- `bun run verify:shopify` is the opt-in live read-only catalog verification.
- `bun run test:browser` aggregates `test:browser:static`,
  `test:browser:live-account-disabled`, and `test:browser:live-account-enabled`
  against fresh production builds. It fails when a required credential matrix
  cannot be established rather than skipping it.

Inspect the final git diff and keep generated/build output untracked.

## Safety

- Never commit secrets or `.env` files.
- Do not deploy, force-push, merge, or modify GitHub issues/PRs unless explicitly requested.
- Do not rewrite the fresh root commit or remove the local legacy rollback bundle outside this repository.
