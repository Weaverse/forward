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
- The browser swatch contract moved from 44px targets to the WCAG 2.2 AA
  target-size minimum (2.5.8: centres 24px apart), matching the looser
  product-card swatch design from `081a84d`. Code unchanged; decided by Leo.
- Menus were empty on every non-default market: Shopify prefixes menu URLs
  with the market subfolder. Tracked as #84 and fixed here; see
  `.weaverse/specs/2026-09-30--market-menus/`.
- Checked every sitemap route on all five markets: all 200, no `/en-us` or
  unprefixed internal links. Three more bugs, tracked as #85 and fixed here
  (cart currency, trailing zero, selector query string); see
  `.weaverse/specs/2026-09-30--market-cart-and-prices/`.
- Store finding: every product is sold out outside the US market, so non-US
  PDPs show "Sold out" and a cart moved there loses its lines.
- Every PDP on a non-default market jumped back to US: the canonical selection
  `router.replace` bypassed the theme `Link`. The address Server Action's
  redirect had the same gap. Tracked as #86 and fixed here; see
  `.weaverse/specs/2026-09-30--market-redirects/`.
