# Feature: Wire Weaverse markets, translations and per-market SEO

| Field            | Value                                                  |
| ---------------- | ------------------------------------------------------ |
| **Status**       | in-progress                                            |
| **Owner**        | @hta218                                                |
| **Issue**        | [#87](https://github.com/Weaverse/forward/issues/87)   |
| **Branch**       | `feat/weaverse-markets`                                |
| **Created**      | 2026-09-30                                             |
| **Last Updated** | 2026-09-30                                             |

## Original Prompt

> Follow-up to #68 (PR #83). The storefront now routes, reads, links and prices per market, but the Weaverse side still behaves as a single-market theme. Checked against [Weaverse Markets and Localization](https://weaverse.io/docs/features/markets-localization) and `@weaverse/next@0.1.0-alpha.18`.
>
> ## 1. Declare markets in the theme schema
>
> `src/lib/weaverse/theme-schema.ts` has no `i18n` block. Without it, Studio doesn't know the theme's markets, so merchants can't create localized pages. The SDK also skips the static-translation fetch (`server-client.ts`: `/api/translation/static` runs only when the schema declares `i18n`).
>
> - [ ] Add `i18n: { urlStructure: "url-path", defaultLocale, shopLocales, translation: true, staticContent }`
> - [ ] Derive `shopLocales` from `LOCALES` in `src/lib/i18n/locales.ts`, adding `pathPrefix` (`""` for the default market), `hreflang` and `direction`, so the locale table stays the only list
>
> ## 2. Verify localized pages end to end
>
> `loadPage` sends `i18n: { country, language, locale: "de-de" }`. The SDK types and README show `locale` as `en-US`. `loaderLocale` in `src/lib/weaverse/resource.ts` also depends on the current format.
>
> - [ ] Create a localized DE page in Studio and confirm `/de-de` renders it while `/` keeps the default
> - [ ] Confirm the `i18n.locale` format the Builder API expects; adjust `weaverseI18n` and `loaderLocale` if needed
> - [ ] Confirm Studio's market selector switches the preview URL and the section loaders read the chosen market
>
> ## 3. Translate theme-owned static text
>
> Theme UI strings are hardcoded in English ("Filters", "Sold out", "Add to cart", "Route notes", "minute read", …), so `/de-de` stays in English even after the merchant translates them in the Translation Manager.
>
> - [ ] Move theme-owned UI strings into `staticContent` and read them through `useTranslation().t()` from `WeaverseNextRootProvider`
> - [ ] Pass the root provider `merchantOverrides` from `loadThemeSettings()` for the current market
> - [ ] Resolve keys by ownership, not truthiness, so an intentionally empty translation is kept
>
> ## 4. SEO per market
>
> - [ ] Self-canonical URL on every page
> - [ ] `hreflang` alternates for every market, plus `x-default`
> - [ ] Sitemap entries for non-default markets
>
> ## 5. Locale formatting
>
> Money and dates format as `en-US` on every market (`€221.78`, not `221,78 €`).
>
> - [ ] Format money and dates with `localeTag(locale)`
>
> ## 6. Customer account on every market
>
> - [ ] Logging out from `/de-de/account` returns to `/de-de`
> - [ ] Every market home URI is registered as an allowed post-logout destination in the Customer Account settings
>
> ## Verification
>
> - [ ] `bun run check`, `smoke:routes`, both browser matrices
> - [ ] Browser coverage for a translated string and a localized page on a non-default market
>

## Summary

Follow-up to the locale routing of #68: the storefront already serves every market, but Weaverse still treats Forward as a single-market theme. This slice declares the markets in the theme schema so Studio can author localized pages and translations, moves theme-owned copy onto Weaverse's `t()`, and finishes per-market SEO, formatting and account logout.
