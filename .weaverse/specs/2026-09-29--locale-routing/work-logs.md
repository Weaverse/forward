# Work Logs

## 2026-09-30 — @hta218

- Implemented all seven plan steps on `feat/locale-routing`: locale model and
  any-currency money, per-market data source and request context, routes under
  `app/[locale]/`, theme `Link` and a real market selector, proxy
  redirect/rewrite, route contract and gates, docs.
- Deviations from the plan:
  - The cart endpoint learns the market from a `forward_locale` cookie the
    proxy sets on every page response, instead of a locale in the cart URL.
    `/api/cart` stays one unlocalized handler.
  - The proxy marks its own rewrites with an `x-forward-locale-rewrite`
    request header. `next start --hostname` runs the proxy again on the
    rewritten `/en-us/*` request, which otherwise 308s back to itself.
  - `not-found.tsx` renders with the default locale: Next passes it no params.
  - `sitemap.ts` lists default-market URLs only.
  - `localizePath` is idempotent, so a pathname read back from the URL is not
    prefixed twice.
  - Next's `usePathname` returns the rewrite target (`/en-us/shop`) during
    server rendering, which leaked the default prefix into facet, sort and
    clear-filter URLs. A theme `usePathname` in `locale-context.tsx` drops it,
    and Biome restricts the Next import.
- The live store has only a US market, so non-US locales currently receive
  USD prices. Adding markets in Shopify needs no code change.
