# Plan

## Dependencies

- `@weaverse/hydrogen` 6.1.2 → 6.2.0. It ships the Next.js adapter itself; `@weaverse/next` is gone from `bun.lock`. The SDK env-key coverage test reads the bundle from `@weaverse/hydrogen/next/server` instead of `@weaverse/next/server`.
- `next` 16.4.3 → 16.4.6. 16.4.5 carries the seven moderate advisories (four in Cache Components); 16.4.6 is the following backport-only patch and the version #122 targets.
- `@shopify/hydrogen` 2026.10.2 → 2026.10.3. Not adopted here: `defineShopifyI18n` (Forward still passes a fixed `i18n`, now deprecated but unchanged), `defineShopifyRouteTemplates`, `createContentSecurityPolicy`, `getShopifyScriptHashes`, public `markResponseAsPersonalized`.

## Translations

`createTranslator` becomes a thin typed wrapper over the SDK's `createTranslate` (typed keys, `null` overrides). `useT()` returns the root provider's `t`, which already applies Studio's live edits through the same resolver. Same order, empty translations kept, inherited keys never resolve.

## SEO

The catch-all custom page spreads `getWeaverseNextSeoMetadata(page)` (title, description, keywords, robots, Open Graph, Twitter) and keeps `marketAlternates`; a Studio canonical URL replaces the self-canonical.

## Site origin

`siteBaseUrl()`: `PUBLIC_SITE_URL` → `https://${VERCEL_PROJECT_PRODUCTION_URL}` → `http://localhost:3000`. Never the request `Host`.

## Files touched

- `package.json`, `bun.lock`
- `AGENTS.md`, `.env.example`
- `src/lib/i18n/translate.ts`, `src/lib/i18n/t.tsx`
- `src/app/[locale]/[...slug]/page.tsx`
- `src/lib/routes/site.ts`, `src/app/robots.ts`, `src/app/sitemap.ts`
- `tests/weaverse-env.test.ts`, `tests/site-base-url.test.ts`
- `.weaverse/specs/2026-11-11--weaverse-hydrogen-6-2/`
