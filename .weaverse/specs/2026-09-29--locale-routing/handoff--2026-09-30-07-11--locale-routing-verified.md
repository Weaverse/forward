# Handoff Context - 2026-09-30 07:11

## Project
- Repository: Weaverse/forward
- Branch: `feat/locale-routing` (from `main`)
- PR: [#83](https://github.com/Weaverse/forward/pull/83) (draft), closes #68
- Spec: `.weaverse/specs/2026-09-29--locale-routing/` (README status `in-progress`)
- Last Updated: 2026-09-30 07:11

## Current Status

### What's Been Done
All seven plan steps are implemented, pushed and verified.

| Commit | Step |
| --- | --- |
| `49c0302` | Spec and plan |
| `9998dee` | Locale model (`src/lib/i18n/locales.ts`), money in any ISO 4217 currency |
| `1a58125` | `getStorefront(locale)` per market; Weaverse request context `i18n` per locale |
| `972c239` | Rendered routes moved under `src/app/[locale]/` |
| `052e88f` | Theme `Link` (`src/components/link.tsx`) prefixes the market; topbar `MarketSelector` |
| `1662568` | `src/proxy.ts` redirect `/en-us/*` → unprefixed (308), rewrite unprefixed → `/en-us/*` |
| `cb9f584`, `329e6d5` | `globals.css` back at `src/app/globals.css` (see Known Issues) |
| `be93859` | Rewrite marker header `x-forward-locale-rewrite` |
| `79729a8` | Theme `usePathname` in `src/lib/i18n/locale-context.tsx`; Biome restricts Next's |
| `a16495c` | `LOCALE_SMOKES` in route contract, smoke, `tests/browser/locale.pw.ts` |
| `d79f8c6` | AGENTS.md Markets section, README Markets note, spec work log |

Verification on 2026-09-30:
- `bun run check`: pass.
- `smoke:routes`: 41 checks pass.
- `verify:shopify`: pass.
- Both browser matrices: all pass once the swatch test change below is in.

### What's In Progress
Swatch browser contract (committed with this handoff):
- `tests/browser/shell.pw.ts` now checks the WCAG 2.2 AA 2.5.8 target-size minimum: swatch centres at least 24px apart.
- It used to require 44px targets. Leo chose to keep the `081a84d` design and change only the test.
- It passes on all three viewports.

### What's Next
1. **Shopify Markets on the live store.** Leo is handing a prompt to another agent to create GB/GBP, DE/EUR, FR/EUR and JP/JPY markets and publish the de/fr/ja shop locales. Until that is done, non-US locales show USD. Afterwards:
   - Run `bun run verify:shopify` and `bun run smoke:routes`.
   - Open `/de-de/shop` and `/ja-jp/products/<handle>` and confirm EUR/JPY prices.
   - Test add-to-cart on `/de-de`. The cart reads the `forward_locale` cookie, so the checkout should carry EUR.
2. Leo manual test pass, then mark PR #83 ready for review.
3. On merge (a normal merge, never squash): set the spec README status to `completed` and update `Last Updated`.

## Technical Context

### Key Files
- `src/lib/i18n/locales.ts`: `LOCALES`, `DEFAULT_LOCALE`, `localizePath` (idempotent), `splitLocale`, `LOCALE_COOKIE`.
- `src/lib/i18n/locale-route.ts`: `resolveLocaleRoute`, which returns one of redirect, serve or rewrite.
- `src/proxy.ts`:
  - The locale branch runs before the account boundary.
  - Protocol account paths are answered only when unprefixed.
- `src/lib/i18n/locale-context.tsx`: `LocaleProvider`, `useLocale`, `usePathname`.
- `src/lib/storefront/data-source.ts`: `getStorefront(locale)`, memoized per locale.
- `src/lib/cart/shopify-cart.ts`: the market comes from the locale cookie.
- `src/lib/weaverse/resource.ts`: `loaderLocale(context)` for section loaders.
- `src/lib/routes/route-contract.ts`: `normalizeAppRoutePattern` drops `[locale]`; `LOCALE_SMOKES`.

### Key Decisions
- The default locale never appears in a URL. An unknown prefix returns 404 through `routeLocale` → `notFound()`.
- `/api/cart`, `/api/weaverse/revalidate`, `/account/status`, `robots` and `sitemap` stay unlocalized. The sitemap lists default-market URLs only.
- `not-found.tsx` renders with the default locale, because Next passes it no params.
- `next/link` and Next's `usePathname` are importable only through the theme wrappers (enforced by Biome `noRestrictedImports`).
- Prices are never derived from `LOCALES[x].currency`. The Storefront API decides the currency, and the mapper rejects mixed currencies within a product.

### Known Issues
- **`cb9f584` fails to build on its own.** It holds only the CSS move; `329e6d5` completes it. Squashing them would need a force-push, and Leo has not asked for one.
- **Two lint warnings also exist on main:** unused `optionCombinations` in `src/lib/storefront/shopify/mapper.ts` and an unused import in `tests/shopify-catalog-adapter.test.ts`. Not in scope.
- **Older specs still record 44px swatch targets** (for example `2026-09-07--forward-weaverse-contract/README.md:215`). They are historical and left unchanged.

## Dependencies & Prerequisites
- Bun at the pinned version; run `bun install --frozen-lockfile`.
- Shopify env vars are required for build, check, smoke and browser runs. Never add a `.env` file to the repo.
- Restart any running `next dev`. Stale `.next/dev/types` from the old route tree break `tsc`; delete that folder if needed.
- Kill leftover servers by port (`lsof -ti tcp:PORT | xargs kill`). `next start` forks `next-server`, which `pkill -f "next start"` misses.

## Additional Notes
- Handoff written so Leo can continue from the office.
- Browser runs: `bun run test:browser` stops after the first matrix fails. Run `test:browser:live-account-enabled` separately when you need both results.
