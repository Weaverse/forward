# Feature: Wire Weaverse markets, translations and per-market SEO

| Field            | Value                                                  |
| ---------------- | ------------------------------------------------------ |
| **Status**       | in-progress                                            |
| **Owner**        | @hta218                                                |
| **Issue**        | [#87](https://github.com/Weaverse/forward/issues/87)   |
| **Branch**       | `feat/weaverse-markets`                                |
| **Created**      | 2026-09-30                                             |
| **Last Updated** | 2026-10-05                                             |

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

## Clarified Acceptance Criteria

Added 2026-10-01 after a Codex review of the plan. The Original Prompt above stays verbatim; where it conflicts with this section, this section wins.

- **Erratum, §2 of the prompt:** `loadPage` does not turn its `locale` argument into `i18n`.
  - Request-context `i18n` is posted at the top level of the Builder request.
  - An explicit `loadPage({ locale })` travels separately inside `params`.
  - Three identities exist and stay separate: the URL id (`de-de`), BCP-47 (`de-DE`), and Shopify's enums (`{ language: "DE", country: "DE" }`).
- **Clarification, §4 of the prompt:** every indexable page gets a self-canonical. `hreflang` is emitted only on an allowlist of market-invariant paths, never by prefix-swapping a handle, as in Pilot. Shopify handles can be localized and resources unpublished per market. The sitemap stays on the default market.
- **Translation:**
  - Theme copy renders through a client `<T>` leaf and `useT()`, so Studio's live edits reach text inside Server Components.
  - A server `getTranslator` is used only for attributes and metadata.
  - Precedence: live Studio edit → Translation Manager override → English `staticContent` → key. An empty override is kept.
  - Server and client share one resolver that checks own properties; the client never falls back to the SDK's `t`.
- **Item-level translations** of merchant-authored section fields are rendered by the SDK. The theme verifies them, including after client navigation between markets.
- **Account:** a successful login, a refresh and a logout keep the market through a localized `return_to` on the single handler (no runtime per market). A failed login keeps Hydrogen's fixed failure path. Post-logout URIs are registered as absolute URLs for every origin. Account money formats per market.
- **`<html dir>`** comes from the market.
- **Announcement bar and footer tagline** become translation keys, so they localize per market.
- **Saved theme settings must reach the storefront.** `readThemeSettings` read a `themeSettings` key the SDK never returns; it reads `theme` now.

## Summary

Follow-up to the locale routing of #68: the storefront already serves every market, but Weaverse still treats Forward as a single-market theme. This slice declares the markets in the theme schema so Studio can author localized pages and translations, moves theme-owned copy onto Weaverse's `t()`, and finishes per-market SEO, formatting and account logout.
