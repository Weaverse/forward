# Changelog

## 2026.11.13

- [feature] Switch versioning from semver to date-based (`YYYY.M.D`), like Pilot and the other Weaverse themes. The previous release was `1.0.0`
- [feature] Opt-in Content Security Policy set by `CSP_MODE`: `report-only` (default) reports violations without blocking, `enforce` blocks, `off` sends no header. Weaverse Studio's sources are added in design mode, and the optional `PUBLIC_CHECKOUT_DOMAIN` allows Shopify videos served from the store's own domain (#127)
- [fix] Signing out returns the shopper to the home page of the market they were browsing (`/de-de` instead of `/`). Every sign-out lands on `/account/signed-out`, which redirects on the server. Register `https://<your-domain>/account/signed-out` as a Logout URI in the Customer Account API settings; until then, sign-out still works but returns to `/` (#132)
- [fix] The cart keeps the market of the page it is used from: prefetching another market no longer switches it, and switching market reloads the cart totals in the new currency (#129, #130)
- [fix] `sitemap.xml` and `robots.txt` advertise the configured site origin (`PUBLIC_SITE_URL`, or the Vercel production domain) instead of `forward.example` (#124)
- [breaking] Weaverse APIs come from `@weaverse/hydrogen/next` (now 6.3.1) instead of `@weaverse/next`. Markets are defined with `defineShopifyI18n`, theme copy resolves through `createTranslate`, and Weaverse page SEO maps through `getWeaverseNextSeoMetadata`. Forks that import from `@weaverse/next` can run `npx @weaverse/cli@latest migrate v6` (#117, #124, #126)
- [breaking] Lint, format and tests run on Vite+ (`vp check`, `vp test`) instead of Biome and `bun test` (#119, #121)
- Upgrade to `@shopify/hydrogen` 2026.10.3 and Next 16.4.6, and update other dependencies to their latest minor and patch versions (#109, #122)
- [docs] Rewrite the README for theme users (#106)

---

> Versioning switched from semver to date-based (YYYY.M.D) on 2026.11.13.
> The release before it was `1.0.0`; see its GitHub release.
