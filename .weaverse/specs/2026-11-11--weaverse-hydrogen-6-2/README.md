# Feature: Move Forward to @weaverse/hydrogen 6.2.0 helpers and fix the sitemap host

| Field            | Value                                                                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**       | in-progress                                                                                                                              |
| **Owner**        | @hta218                                                                                                                                  |
| **Issue**        | [#124](https://github.com/Weaverse/forward/issues/124), related to [Weaverse/weaverse#543](https://github.com/Weaverse/weaverse/issues/543) |
| **Branch**       | `update/124-weaverse-hydrogen-6-2`                                                                                                       |
| **Created**      | 2026-11-11                                                                                                                               |
| **Last Updated** | 2026-11-11                                                                                                                               |

## Original Prompt

> In the Forward theme do one issue + one PR to `main`.
>
> 1. Upgrade `@weaverse/hydrogen` to 6.2.0 (published today). In 6.2.0 the Next.js adapter ships inside `@weaverse/hydrogen` and `@weaverse/next` is deprecated on npm; after `bun install` the lockfile must no longer contain `@weaverse/next`.
> 2. Use the SDK helpers that 6.2.0 now exports (Weaverse/weaverse#590), replacing Forward's own copies:
>    - Translations: replace `src/lib/i18n/translate.ts`'s resolver with `createTranslate` (and `interpolate` if needed) from `@weaverse/hydrogen/next`. Keep Forward's existing tests passing; keep a minimal wrapper if Forward's API differs.
>    - SEO: replace the hand-written Weaverse page SEO mapping in `generateMetadata` with `getWeaverseNextSeoMetadata`, so canonical, Open Graph and Twitter fields are included. Merge with route-specific metadata Forward already sets (don't lose alternates/hreflang).
> 3. Fix the live bug: sitemap and robots.txt advertise `https://forward.example` (hardcoded placeholder in `src/lib/routes/site.ts`). Derive the origin from configuration with a safe fallback; document any new env var in `.env.example`. Production domain is https://forward-shopify-hydrogen.vercel.app (Weaverse/forward#115).
> 4. Security/patch bumps: `next` 16.4.3 → 16.4.5 (7 moderate advisories, 4 in Cache Components) and `@shopify/hydrogen` 2026.10.2 → 2026.10.3. Read the Hydrogen 2026.10.3 release notes; don't adopt new features (e.g. `defineShopifyI18n`) in this PR — just note them.

## Summary

Forward depends on `@weaverse/hydrogen` 6.2.0 (no `@weaverse/next` left in the lockfile), resolves theme copy and Weaverse page SEO through the SDK's own helpers, and advertises a configured origin in `sitemap.xml` and `robots.txt` instead of the `forward.example` placeholder. `next` and `@shopify/hydrogen` take their security and patch releases.
