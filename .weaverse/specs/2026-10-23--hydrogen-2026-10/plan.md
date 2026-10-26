# Plan: Hydrogen 2026.10 and low-risk dependency bumps

## Context

- Weaverse/weaverse#543 (open epic, "Support Hydrogen 2026.10"): `2026.10.0` is a framework-agnostic rewrite with separate `core` / `react` / `vue` / `vite` entry points and a new cache API. The crash it tracks is in `@weaverse/hydrogen` (`CacheCustom`, `createWithCache`). `@weaverse/next` has no Hydrogen dependency (peers are only `next`, `react`, `react-dom`), so Forward is not blocked by it.
- #96 (Vercel Shop review) recommends moving Forward to stable Hydrogen and lists the breaking changes to check.
- Weaverse/builder#2663 lists "Forward on Hydrogen 2026.10 stable" as a prerequisite for positioning Weaverse as the CMS for Vercel Shop / Hydrogen storefronts.

## Findings (checked 2026-10-23)

### Dependency status (`bun outdated`)

| Package | Current | Latest | Decision |
|---|---|---|---|
| `@shopify/hydrogen` | `0.0.0-preview-116d5d7-20260730141607` | `2026.10.2` | Upgrade |
| `next` | 16.3.0 | 16.4.2 | Upgrade |
| `react` / `react-dom` | 19.2.8 | 19.3.1 | Upgrade |
| `@types/react` / `@types/react-dom` | 19.2.x | 19.3.0 | Upgrade |
| `@types/node` | 22.20.1 | 26.6.5 | Upgrade (follow-up, see below) |
| `@biomejs/biome` | 2.5.7 | 2.6.2 | Upgrade to 2.6.3 (follow-up, see below) |
| `@playwright/test` | 1.62.1 | 1.64.1 | Upgrade |
| `@testing-library/dom` / `react` / `user-event` | 10.4.1 / 16.3.2 / 14.6.5 | 10.4.2 / 16.3.3 / 14.6.8 | Upgrade |
| `typescript` | 5.9.3 | 7.0.2 | Blocked by `gql.tada` (see below) |
| `@happy-dom/global-registrator` | 20.11.6 | 21.0.4 | Upgrade (follow-up, see below) |

`@weaverse/next@1.0.1` is already the latest.

### Vercel Shop reference (`vercel/shop` `package.json`, 2026-10-23)

`@shopify/hydrogen@2026.10.0`, `next@16.4.0`, `react@19.3.0`, `typescript@7.0.2` (with `next typegen && tsc`). This confirms Hydrogen 2026.10 + Next 16.4 + React 19.3 works together. TypeScript 7 does not work here yet (see the follow-up below).

### Hydrogen 2026.10.2 compatibility

Checked against the published tarball:

- Every symbol Forward imports exists:
  - `@shopify/hydrogen`: `createShopifyRequestContext`, `handleShopifyRoutes`, `ShopifyRequestContext`, `StorefrontClient`, `createStorefrontClient`, `createCartServerHandlers`, `getCartId`, `gql`, `CartGetResult`, `CartPostResult`, `CartLine`, `MoneyV2`, `ProductInput`, `ProductVariantInput`
  - `@shopify/hydrogen/react`: `createCartComponents`, `createProductComponents`
  - `@shopify/hydrogen/customer-account`: `CUSTOMER_ACCOUNT_*_PATH`, `CustomerAccountServerHandlers`, `CustomerSession`, `createCustomerAccountServerHandlers`, `createCustomerSession`, `CustomerAccountClient`, `createCustomerAccountClient`, `gql`
  - `@shopify/hydrogen/storefront-api-types` still ships, and the `hydrogen` bin used by `check:graphql` is still there.
- Breaking changes from #96 that do not affect Forward:
  - analytics `subscribe()` removed: not used.
  - `createWithCache` / `Cache*` removed: not used (Forward caches with Next `unstable_cache`).
  - standalone `CartProvider` / `useCartActions` removed: Forward already uses `createCartComponents()`.
  - `ProductPayload.price` is MoneyV2: `src/lib/cart/shopify-cart-react.tsx` already passes `{ amount, currencyCode }`.
- **Required change:** `createStorefrontClient({ type: "private" })` no longer accepts `config.buyerIp`. The buyer IP comes only from the request context (`ShopifyRequestContextWithBuyerIp`), which Forward already sets. Found by `typecheck`, not listed in #96.
- **Required change:** the default API version moves from `2026-04` (preview) to `2026-10`. In the Customer Account schema, `CustomerAddressInput` has only `countryCode` / `zoneCode` (no `territoryCode`), and `CustomerAddress.territoryCode` is deprecated in favor of `countryCode`. Address create/update mutations break until migrated. `countryCode` is the `CountryCode` enum, not a string, so the parsed address is typed with `CountryCode` from `@shopify/hydrogen/customer-account-api-types` after the existing alpha-2 shape check.

### Follow-up majors (2026-10-26)

First deferred, then tried in a scratch worktree. All but TypeScript 7 are taken in this PR:

- **TypeScript 7.0.2: blocked.** `typecheck` and `next build` pass unchanged, but `check:graphql` fails: `hydrogen gql check` runs `gql.tada`, which calls the TypeScript JS compiler API (`parseConfigFileTextToJson`), and TypeScript 7 ships no JS API. Forcing `gql.tada@1.11.4` (it lists `typescript ^7` as a peer) through `overrides` fails the same way. The `next` and `@shopify/hydrogen/ts-plugin` editor plugins in `tsconfig.json` are language-service plugins, which TypeScript 7 does not load either. Vercel Shop gets away with TypeScript 7 because it has no GraphQL check. Stay on 5.9 until `gql.tada` works on TypeScript 7.
- **happy-dom 21.0.4:** all DOM tests pass unchanged.
- **`@types/node` 26:** typecheck passes. `engines` still says Node >= 22.18, so the types now allow APIs newer than the minimum runtime; Vercel Shop uses the same types.
- **Next 16.4.3:** a patch released after the first bump.
- **Biome 2.6.3:** needed config changes and small fixes:
  - its new Markdown formatter rewrote `AGENTS.md`, `README.md`, `docs/` and `scripts/README.md`, so `markdown.formatter.enabled` is `false`;
  - real dead code removed: `optionCombinations` and its `VariantSelectedOption` type in `src/lib/storefront/shopify/mapper.ts`, and an unused import in `tests/shopify-catalog-adapter.test.ts`;
  - `usePlaywrightValidDescribeCallback` flagged a local `describe()` in `scripts/seed-weaverse.mts`, renamed to `describePage()`;
  - `noComponentHookFactories` flagged the `next/font/google` mocks, so it is off for `tests/dom/preload.ts`;
  - `useDomNodeTextContent` flagged Playwright `locator.innerText()`, which is not the DOM property, so it is off for `tests/browser/**`.

### Agent skills sync

`hydrogen skills sync` refuses to overwrite `.agents/skills/hydrogen-*` because they were copied in by hand (`78fc16d`) and carry no Hydrogen marker. They had no local edits since, so `--force` is safe. The sync also writes a second copy to `.claude/skills`; Forward keeps only `.agents/skills`, so that copy is not committed.

## Steps

1. Bump `@shopify/hydrogen` to `2026.10.2` and the low-risk deps above; reinstall with `bun install`. Drop `config.buyerIp` from the private cart client.
2. Migrate addresses from `territoryCode` to `countryCode`:
   - form parsing, validation and mutation input in `src/lib/account/addresses.ts`
   - address selection in `src/lib/account/queries.ts`
   - form field name and labels in `src/app/[locale]/account/addresses/page.tsx`
   - related tests under `tests/`
3. Resync Hydrogen agent skills (`hydrogen skills sync --force`).
4. Run `bun run format` and `bun run lint`.
5. Run `typecheck`, `check:graphql`, then the full `check` before pushing.

## Out of scope

- TypeScript 7, until `gql.tada` supports it.
- Vercel Shop-style features from #96: Cache Components with `"use cache"` + `cacheTag`, HMAC Shopify webhooks, predictive search handlers, Hydrogen analytics, JSON-LD / OpenGraph. `cacheComponents` also needs `@weaverse/next` validated in that mode first.

## Files and folders touched

- `package.json`, `bun.lock`, `biome.json`
- `src/lib/storefront/shopify/mapper.ts`, `scripts/seed-weaverse.mts`, `tests/shopify-catalog-adapter.test.ts` (Biome 2.6 fixes)
- `src/lib/cart/shopify-cart.ts`
- `src/lib/account/addresses.ts`
- `src/lib/account/queries.ts`
- `src/app/[locale]/account/addresses/page.tsx`
- `tests/` (address-related tests)
- `.agents/skills/hydrogen-*` (skills sync)
- `.weaverse/specs/2026-10-23--hydrogen-2026-10/`
