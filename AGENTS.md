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
- The catalog is the store's. No theme-side table decides which products are
  approved, what category or activities they have, or which facets exist:
  `category` is `productType`, `activities` are the product's tags, colorway
  ids derive from the published Color values, related products are the store's
  other items of the same type, and facets come from the Storefront API's own
  filter connection. A facet value's `input` is opaque Shopify JSON that
  round-trips through the URL untouched, so a filter a merchant enables in
  Search & Discovery works with no code change. Sort options are Shopify sort
  keys. Never reintroduce an approved-handle allowlist or a presentation
  profile table — both made the theme unable to run on another store.
- Build the theme before making deployment or demo-integration decisions.
- Routes compose named sections from `src/sections/`; they do not inline
  section markup. A section is pure presentation: every piece of content and
  data arrives as props, and the page owns the `storefront` reads. Sections
  never import the data source, and a section reused by more than one route
  takes its variations as props rather than forking into a near-copy.
- Functional, stateful, and security-owned surfaces are not sections and stay
  theme-owned: Cart and `/account/**`. Header and Footer are theme-owned
  components configured through theme settings, never Weaverse global sections.
- Approved change (2026-09-22): catalog browsing is composed. A collection is
  the `main-collection` tree — `mc--toolbar` and `mc--content`, with
  `mc--filters` and `mc--product-grid` under content — and `/shop` is the
  `ALL_PRODUCTS` page type with the `all-products` tree (`ap--toolbar`,
  `ap--product-grid`). Query state stays theme-owned: the route validates the
  facet params, the sort and the cursor, reads one page through
  `getCollectionPage`/`getProductsPage`, and hands the result down as `browse`.
  A section never parses a param or decides what a filter means, so reordering
  the tree cannot change which products a URL selects. `collection-grid`, `catalog-facets.ts`,
  `FilterSidebar` and `product-results` are retired.
- Approved change (2026-09-18): the PDP buy block is the composable
  `main-product` section, split into `mp--media`, `mp--info` and one `mp--*`
  child per element. The section shell alone owns the `colorway`/`size` query
  state and shares the resolved selection through `MainProductContext`; all
  cart logic stays inside the shared `AddToCartForm`.
- Approved exception (2026-09-15): `product-spotlight` may embed the shared
  `AddToCartForm` (`src/components/add-to-cart-form.tsx`) with a selection held
  in component state. It never reads or writes the PDP's `colorway`/`size`
  query state, and all cart logic stays inside the shared form.
- A Weaverse component is the default export of its file and exports its
  `schema` from that same file, so settings and markup cannot drift apart and
  the registry cannot pair them up wrongly. This is the one place beyond Next's
  route files where a default export is correct: the SDK reads `default` off
  the module. Sections that are *not* Weaverse components keep named exports.
  The registry in `src/lib/weaverse/components.ts` is the only list the SDK
  sees; a component absent from it cannot be composed.
- A Weaverse project always ships its default templates. A page renders
  exactly as authored — an empty template renders empty — and no route or
  section substitutes a default composition for what the page omits. A route
  with no Weaverse page answers `notFound()`.
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

## Markets

- The locale list is the `LOCALES` const in `src/lib/i18n/locales.ts`; a
  market is added there and nowhere else.
- Rendered routes live under `src/app/[locale]/`. The default locale never
  appears in a URL: `src/proxy.ts` 308-redirects `/en-us/*` to the unprefixed
  path and rewrites unprefixed paths to `/en-us/*`. Route handlers, `robots`
  and `sitemap` stay outside the segment.
- Every read is scoped to the request's market through
  `getStorefront(locale)`; Weaverse loaders read it with `loaderLocale`.
  Prices carry their own currency and are never derived from the locale.
- `next/link` is imported only by `src/components/link.tsx`; everything else
  uses that `Link`, which prefixes the current market (Biome enforces this).
- Client code reads the path through `usePathname` from
  `src/lib/i18n/locale-context.tsx`, never `next/navigation`'s: during server
  rendering Next reports the proxy's `/en-us/*` rewrite target (Biome enforces
  this too).
- A market has three identities, never interchanged: the URL id (`de-de`),
  BCP-47 (`de-DE`, `localeTag`), and Shopify's enums (`{ language: "DE",
  country: "DE" }`). Weaverse's request `i18n.locale` is BCP-47; loaders map
  `language` + `country` back to the URL id (`loaderLocale`).
- The theme schema's `i18n` (markets, `staticContent`, `translation: true`) is
  derived from `LOCALES`, so Studio's market selector and Translation Manager
  see exactly the markets the storefront serves.
- Theme-owned copy lives in `src/lib/i18n/static-content.ts` (English) and is
  never hardcoded in markup: client components use `useT()`, Server
  Components render text through `<T k>` (so Studio's live edits reach it) and
  use `getTranslator(locale)` only for attributes and metadata. Server
  components that DOM tests render take the page's `t` as a prop. Every path
  resolves through `createTranslator`, which checks own properties and keeps
  an empty translation; the SDK's `useTranslation` is restricted to
  `src/lib/i18n/t.tsx` (Biome). Merchant-authored settings and Shopify
  content are not theme copy.
- Money and dates format with the market (`formatMoney(money, locale)`,
  `formatDate(iso, locale)`); there is no default.
- Every indexable page sets `alternates: marketAlternates(path, locale)`: a
  self-canonical always, `hreflang` + `x-default` only for the
  market-invariant allowlist in `src/lib/i18n/alternates.ts`. Handle routes
  never get prefix-swapped `hreflang`, and the sitemap stays on the default
  market, because Shopify handles are per-market data.
- Account flows keep the market through a localized `return_to` on the single
  Customer Account handler; protocol paths themselves stay unprefixed.

## Storefront data boundary

- Routes and visual components consume storefront data only through
  `getStorefront(locale)` exported from `src/lib/storefront/data-source.ts`.
  Never import Shopify queries or raw Shopify shapes directly in pages or
  components.
- Forward always runs against a real Shopify store. There is no static mode:
  an absent, partial or malformed Shopify environment throws a sanitized
  configuration error, so a build or route without credentials fails closed.
  Nothing falls back to fixtures — products, collections, content and menus
  alike.
  Menus are the merchant's as arranged: a menu the store has not set up is
  empty, and a link to another origin or to a route the theme lacks is left
  out. Failing closed is
  about malformed data, not about unfamiliar data: a product the theme has not
  seen, a colour it does not recognise, a collection it did not expect and a
  facet it has no renderer for are all ordinary, and only a truncated page, a
  broken shape or a media map that does not cover its colours is an error.
- Server catalog reads use `PRIVATE_STOREFRONT_API_TOKEN` with the Hydrogen
  `private_no_buyer_context` client. The private token must never reach browser
  code, props, logs, errors, tests, fixtures, or Git. Environment access stays
  in `src/lib/storefront/shopify/env.ts`.
- Unknown dynamic handles resolve to `null` from the data source and routes
  must translate that into `notFound()` — never invent content.
- Fixtures live in `tests/fixtures/storefront/` and are test data only; no
  runtime module under `src/` imports them (a test enforces it).
- The cart is the server-owned Shopify Cart API with a validated checkout
  handoff. There is no browser-local cart.
- Theme-owned copy (announcement, footer tagline, fallback imagery) comes from
  Weaverse theme settings; an unset setting renders nothing.
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
production build and is run separately.) `build`, and therefore `check`,
requires the Shopify environment.

Further credential-dependent gates:

- `bun run verify:live` requires the complete live Shopify configuration and
  runs the live build/route/read-only gates for both account-disabled and
  account-enabled states.
- `bun run verify:shopify` is the opt-in live read-only catalog verification.
  It asserts rules that hold for any store, never a fixed catalog.
- `bun run test:browser` aggregates `test:browser:live-account-disabled` and
  `test:browser:live-account-enabled` against fresh production builds. It fails when a required credential matrix
  cannot be established rather than skipping it.

Inspect the final git diff and keep generated/build output untracked.

## Safety

- Never commit secrets or `.env` files.
- Do not deploy, force-push, merge, or modify GitHub issues/PRs unless explicitly requested.
- Do not rewrite the fresh root commit or remove the local legacy rollback bundle outside this repository.
