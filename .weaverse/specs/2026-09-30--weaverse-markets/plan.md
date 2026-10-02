# Plan: Wire Weaverse markets, translations and per-market SEO

## Original Prompt

See `README.md` for the Original Prompt (issue #87, verbatim) and the clarified acceptance criteria.
Planning input: `/work #87`, Leo's answers below, and a Codex review of the first draft (2026-10-01).

## Decisions

| Question | Decision |
| --- | --- |
| Translation architecture (Leo) | Server and client share one key set. Text nodes render through a small client `<T>` leaf, so Studio's live edits reach them inside Server Components. A server `t()` is used only where a client leaf can't go: attributes built on the server, metadata, `aria-*` on server markup. |
| Copy before the merchant translates (Leo) | English `staticContent` only; merchants translate in Studio's Translation Manager |
| Studio verification (Leo) | A separate agent with Studio access, driven by the prompt in step 4 |
| Logout per market (Leo) | One Customer Account runtime per market, each with its own post-logout URI |
| `readThemeSettings` bug (Leo) | Fixed in this PR (step 0) |
| Legacy text settings | Out of scope. `announcement`/`footerTagline` are merchant settings, not theme copy. Per-locale theme settings are a separate question. |

## Findings that shape the plan

- **Three locale identities that must not be conflated:**
  - The URL id, `de-de`, from `LOCALES`.
  - BCP-47, `de-DE`, from `localeTag()`.
  - Shopify's enums, `{ language: "DE", country: "DE" }`.
- **How `loadPage` reaches the Builder:** request-context `i18n` is posted at the top level (`server-client.ts:450-466`). `loadPage({ locale })` travels separately inside `params`.
  - Hydrogen documents that field as BCP-47.
  - Pilot passes only `{ type }` and relies on the top-level `i18n`.
  - So `loadPage.locale` is an experiment, not the fix.
- **Merchant overrides key off `i18n.language` + `i18n.country`** (`server-client.ts:559-590`), and are fetched only when the schema declares `i18n`.
- **`readThemeSettings()` read `theme?.themeSettings`, but the SDK response key is `theme`.** Probed live: `project_configs` returns `{ projectId, theme: null, templateId }`, and the SDK merges schema defaults into `theme`. Every saved theme setting was silently ignored.
  - The header line "Shopify · Hydrogen · Next.js · Weaverse" is hardcoded at `field-index-header.tsx:234`, not the announcement setting.
- **`createTranslate` is client-side only:** it is exported from the client-oriented root entry, not `@weaverse/next/server`. Its nested lookup also does not check own-property ownership.
- **Unsaved Studio static-text edits live in the client `TranslationStore`,** so a server-only `t()` can never show them.
- **Item-level translations of merchant-authored section props are already handled by the SDK.** The `translationMap` sidecar is overlaid in `item.ts:100-135`. The theme adds nothing here; it only verifies.
- **The layout does not mount `WeaverseNextRootProvider`.** Its props map from the theme-settings response:
  - `theme` → `initialThemeSettings`
  - `merchantOverrides`
  - `staticContent`
  - `publicEnv`
  - `schema` → `themeSchema`
- **Account pages pass neutral `/account` paths to `loginHref()`/`refreshHref()`,** which override any runtime default.
- **Account money formatting:** `account-view.ts` formats money itself, in `en-US`.
- **Handles can be localized per market (Translate & Adapt) and resources can be unpublished per market,** so `hreflang` built by prefix-swapping can advertise 404s.
- **AGENTS.md forbids shopper-visible source-regex assertions,** so a "no bare English" source guard is out.

## Requirements

### Functional
- [ ] FR0: Saved theme settings reach the storefront (`readThemeSettings` reads `theme`).
- [ ] FR1: The theme schema declares `i18n` (`urlStructure: "url-path"`, `defaultLocale`, `shopLocales`, `translation: true`, `staticContent`), derived from `LOCALES`.
- [ ] FR2: A localized page authored for DE in Studio renders on `/de-de`, and `/` keeps the default. Item-level translations render on non-default markets, including after client navigation between markets.
- [ ] FR3: Every theme-owned string resolves through one key set. Precedence: live Studio edit → Translation Manager override (current market) → English `staticContent` → key. An intentionally empty override is kept.
- [ ] FR4: Every indexable page emits a self-canonical. `hreflang` (plus `x-default`) lists only verified equivalents. The sitemap lists real per-market URLs.
- [ ] FR5: Money and dates format with the market's `localeTag`, including on account pages (`221,78 €` on `/de-de`).
- [ ] FR6: Login, refresh and logout keep the shopper's market: started on `/de-de/account`, the shopper ends on `/de-de/...`.
- [ ] FR7: `<html dir>` comes from the market (`ltr` for all current markets).

### Non-functional
- [ ] No merchant content, credentials or Shopify payloads reach a Studio payload (AGENTS.md seam rule). `publicEnv` passes through the existing env suppression.
- [ ] Translation keys are type-checked (`TranslationKey`), so a renamed key breaks at compile time.
- [ ] Server components stay server components; only the `<T>` leaf is client.
- [ ] A failed translation fetch never breaks rendering (SDK behavior; keep it).

### Out of scope
- Translating Shopify content: Shopify returns it per `@inContext(language)`.
- Per-locale values for merchant theme settings (`announcement`, `footerTagline`).
- RTL visual work: `dir` is set, styling is not audited.
- AI translation, bundled de/fr/ja copy, and markets beyond the current five.

## Technical Approach

```
LOCALES ──► shopLocales/defaultLocale ─┐
            STATIC_CONTENT (EN) ───────┴─► themeSchema.i18n
   │
   ├─► weaverseI18n(id) { country, language, locale: localeTag(id), pathPrefix, label }
   │        ├─► Builder page selection (top-level i18n)
   │        └─► loadThemeSettings → theme, merchantOverrides, staticContent, publicEnv
   │                 ├─► server: getTranslator(id)  (attributes, metadata)
   │                 └─► layout: <WeaverseNextRootProvider …> → <T k> / useT()
   └─► loaderLocale(context) maps i18n {language, country} back to the URL id
```

### Step 0 — Theme settings read the right key (done)

- `src/lib/weaverse/server.ts`: `readThemeSettings` returns `response?.theme`.
- Verified against the live `project_configs` response.

### Step 1 — Markets in the schema and in the request context

- Extend `LOCALES` entries with derived fields:
  - `pathPrefix`: `""` for the default market, `/${id}` otherwise.
  - `hreflang`: `localeTag(id)`.
  - `direction: "ltr"`.
- Add `shopLocales()` and `defaultShopLocale()` returning `WeaverseNextI18n`.
- `theme-schema.ts`: `i18n: { urlStructure: "url-path", defaultLocale, shopLocales, translation: true, staticContent: STATIC_CONTENT }`.
- `weaverseI18n(id)`: `{ country, language, locale: localeTag(id), pathPrefix, label }`.
- `loaderLocale(context)`: map `i18n.language` + `i18n.country` to the `LOCALES` id. Stop parsing `i18n.locale`, so the Builder's format never leaks into routing.
- `layout.tsx`: `<html dir={LOCALES[locale].direction}>`.
- Do not add `loadPage({ locale })` here. Step 4 decides it from Studio evidence.
- Tests:
  - `shopLocales()` covers `LOCALES` one to one, with `pathPrefix ""` only for the default market.
  - `weaverseI18n` returns BCP-47.
  - `loaderLocale` round-trips every market.

### Step 2 — Translation runtime

- `src/lib/i18n/static-content.ts`: nested English `STATIC_CONTENT` (`as const`), grouped by surface (`header`, `footer`, `market`, `cart`, `product`, `catalog`, `search`, `account`, `journal`, `errors`, `common`). Derive `TranslationKey` from it via a `DotPaths<T>` type.
- `src/lib/i18n/translate.ts`: `createTranslator({ overrides, designOverrides?, staticContent })`.
  - Precedence: design → overrides → static → key.
  - `Object.hasOwn` at every path segment; resolution is nullish, so `""` is kept.
  - `{{var}}` interpolation.
  - About 25 lines. No SDK `createTranslate` and no build spike.
- `src/lib/i18n/translator.ts`: server `getTranslator(id)`, memoized with React `cache()` over `loadWeaverseThemeSettings(id)` (already cached per request). Returns `t(key, vars?)`.
- `src/app/[locale]/layout.tsx`: mount `WeaverseNextRootProvider` above `SiteHeader`, `{children}` and `SiteFooter`, mapping:
  - `initialThemeSettings = response.theme`
  - `merchantOverrides`
  - `staticContent`
  - `publicEnv`
  - `themeSchema = response.schema ?? themeSchema`
- `src/lib/i18n/t.tsx` (client):
  - `useT()`: `useTranslation().t` narrowed to `TranslationKey`.
  - `<T k vars? />`: a text leaf. Server Components render `<T k="cart.title" />`, which keeps live Studio edits working.
- Biome: restrict `useTranslation` from `@weaverse/next` to `src/lib/i18n/t.tsx`.
- Tests:
  - Translator: design wins, an override wins, `""` is kept, inherited/prototype keys are ignored, a missing key returns the key, interpolation works.
  - DOM test: `<T>` re-renders when the `TranslationStore` changes (live edit).

### Step 3 — Move theme copy onto keys, one surface per commit

| Surface | Main files |
| --- | --- |
| Header, market selector, mobile menu | `src/components/site-header/**` (incl. the hardcoded stack line) |
| Footer | `src/components/site-footer*.tsx` |
| Cart drawer, cart page, add to cart | `src/lib/cart/shopify-cart-react.tsx`, `src/components/add-to-cart-form.tsx`, `src/app/[locale]/cart/**`, `src/components/cart*` |
| PDP children | `src/sections/main-product/**` |
| Catalog | `src/components/catalog-*.tsx`, `facet-list.tsx`, `sort-form.tsx`, `product-card.tsx`, `src/sections/main-collection/**`, `src/sections/all-products/**` |
| Search | `src/app/[locale]/search/**` |
| Account | `src/components/account-*.tsx`, `src/app/[locale]/account/**` |
| Journal and article chrome | `src/sections/article-*`, `src/sections/journal-*` |
| Errors and 404 | `src/app/[locale]/error.tsx`, `not-found.tsx` |

Rules:
- Text nodes use `<T>` in Server Components and `useT()` in client components.
- Attributes (`aria-label`, `placeholder`, `title`, `alt` fallbacks) use `useT()` in client components and `getTranslator` in Server Components.
- Merchant-authored Weaverse settings (section headings, button labels) are not theme copy and stay settings. Shopify facet labels stay as Shopify returns them. Theme-defined sort labels get keys.
- Tests assert rendered DOM through `STATIC_CONTENT` values, plus one override per surface. No source-regex guard.

### Step 4 — Studio verification (localized pages, translations, items)

- After steps 1–2 reach the Vercel preview, send the Studio agent this prompt (add the URL):

```
On Weaverse Studio for the Forward project, using the preview <URL>:
1. Confirm the market selector lists United States, United Kingdom, Germany, France, Japan,
   and report the exact locale string Studio shows for Germany.
2. Switch to Germany, open the home page, click "Create localized page", change the first
   heading to "Forward DE — Test", publish.
3. Still on Germany, translate one section field (any heading on the default home) through
   item translation, publish.
4. Translation Manager → German: run Sync Theme Keys, set `catalog.filters` to "Filter", publish.
Don't change the default (US) pages or theme settings. Report each step with screenshots and
any error text.
```

- Verify:
  - `/de-de` shows the localized home and `/` the default.
  - The item translation shows on `/de-de` after reload and after client navigation `/` → `/de-de`. The default item data is unchanged on `/`.
  - `/de-de/shop` shows "Filter" and `/fr-fr/shop` shows "Filters".
  - Studio previews `/de-de` and section loaders read `de-de` through `loaderLocale`.
- If localized pages don't select with top-level `i18n` alone, add `loadPage({ ..., locale })` in the format Studio reports, test it, and log it.
- Add a browser test (live-account-disabled) for the localized home marker, the item translation and the translated key. Record the Studio fixture in `work-logs.md`.

### Step 5 — Per-market SEO

- `src/lib/i18n/alternates.ts`:
  - `marketAlternates({ locale, path, equivalents })` returns Next's `{ canonical, languages }`.
  - `canonical` is always the current market's URL.
  - `languages` lists only the `equivalents` passed in, plus `x-default` when the default market is among them.
- Static, market-invariant routes (home, `/shop`, `/journal`) pass every market.
- Resource routes (product, collection, article, page, policy) resolve equivalents per market by resource id:
  - A per-market read through `getStorefront(id)` returns the localized handle, or `null` when the resource is unpublished there.
  - Only resolved markets are listed.
- Custom Weaverse pages: list only markets whose locale-scoped `fetchCustomPages({ locale })` contains the page.
- Cart, search and account: `robots: noindex` and no alternates.
- `sitemap.ts`: build entries from per-market list reads (localized handles, per-market availability). Each entry carries its own verified `alternates.languages`. Never multiply default-market results.
- Tests:
  - Unit: only verified equivalents, plus `x-default`.
  - Sitemap: a resource missing in one market is absent there.
  - Smoke: `/de-de/shop` has a self-canonical and an `x-default` alternate.

### Step 6 — Locale formatting

- `formatMoney(money, locale: LocaleId)` and `formatDate(iso, locale: LocaleId)`. Formatters are cached per `localeTag|currency`. Drop the `"en-US"` defaults so missing locales fail to compile.
- Callers:
  - Server callers pass the route `locale`; client callers use `useLocale()`.
  - `src/lib/account/account-view.ts` threads `LocaleId` through profile/order mapping and formats through `formatMoney` with each `MoneyV2` currency.
- Tests: de-DE EUR → `221,78 €`, en-US USD → `$248`, ja-JP JPY → `￥3,000`, dates per market, and account order totals per market.

### Step 7 — Customer account per market

- `getCustomerAccountRuntime(source, locale)` memoizes one runtime per locale, each with:
  - `postLogoutRedirectUri = localizePath("/", locale)`
  - `defaultPostLoginRedirectPathname = localizePath("/account", locale)`
- `loginHref(returnTo, locale)` and `refreshHref(returnTo, locale)` localize every explicit return target. Update every caller:
  - account overview, orders, order detail, addresses
  - `account-access.tsx`
  - `account-view.ts`
- `proxy.ts` protocol branch picks the runtime from the `forward_locale` cookie, the same source `/api/cart` uses.
- Store side: register `/`, `/en-gb`, `/de-de`, `/fr-fr`, `/ja-jp` as allowed post-logout URIs in Customer Account settings. Put the store-agent prompt in `work-logs.md`.
- Tests:
  - Unit: per-locale URIs and localized `loginHref`/`refreshHref`.
  - Proxy: logout picks the runtime from the cookie.
  - Browser (live-account-enabled): login from `/de-de/account` returns to `/de-de/account`, and logout lands on `/de-de`.

### Step 8 — Docs and verification

- AGENTS.md, Markets section:
  - The three locale identities and where each is used.
  - Theme copy goes through `<T>`/`useT()`/`getTranslator` with keys in `static-content.ts`.
  - The schema `i18n` derives from `LOCALES`.
  - `hreflang` only for verified equivalents.
- README: the Markets paragraph mentions Studio localized pages and translations.
- `work-logs.md`: decisions, Studio fixture, and the `loadPage.locale` outcome.
- Run the full AGENTS.md verification, plus `test:browser` (both matrices) and `verify:shopify`.

## Implementation Structure

### Files to create

| File | Purpose |
| --- | --- |
| `src/lib/i18n/static-content.ts` | English `STATIC_CONTENT` and `TranslationKey` |
| `src/lib/i18n/translate.ts` | `createTranslator` (precedence, ownership, interpolation) |
| `src/lib/i18n/translator.ts` | Server `getTranslator(id)` |
| `src/lib/i18n/t.tsx` | Client `useT()` and the `<T>` leaf |
| `src/lib/i18n/alternates.ts` | `marketAlternates` |
| `tests/translator.test.ts` | Precedence, ownership, interpolation |
| `tests/dom/translation.test.tsx` | `<T>` live update, override and empty override |
| `tests/alternates.test.ts` | Verified equivalents, `x-default` |
| `tests/browser/weaverse-markets.pw.ts` | Localized page, item translation, translated key, account round-trip |

### Files to modify

| File | Change |
| --- | --- |
| `src/lib/weaverse/server.ts` | Step 0 fix; expose the full theme response for the root provider |
| `src/lib/i18n/locales.ts` | `pathPrefix`, `hreflang`, `direction`; `shopLocales()`, `defaultShopLocale()` |
| `src/lib/weaverse/theme-schema.ts` | `i18n` block |
| `src/lib/weaverse/request-info.ts` | `weaverseI18n` → BCP-47 `locale`, `pathPrefix`, `label` |
| `src/lib/weaverse/resource.ts` | `loaderLocale` maps language + country |
| `src/app/[locale]/layout.tsx` | `dir`, `WeaverseNextRootProvider` |
| `src/app/[locale]/**/page.tsx` | `alternates`/`robots` in `generateMetadata`; copy keys |
| `src/app/[locale]/error.tsx`, `not-found.tsx` | Copy keys |
| `src/app/sitemap.ts` | Per-market reads and verified alternates |
| `src/lib/storefront/data-source.ts` (+ Shopify adapter) | Per-market localized-handle reads for alternates, if not already exposed |
| `src/components/**`, `src/sections/**` | Copy keys; formatter calls pass the locale |
| `src/lib/storefront/format.ts` | `formatMoney`/`formatDate` take `LocaleId` |
| `src/lib/cart/shopify-cart-react.tsx` | Copy and formatting |
| `src/lib/account/account-view.ts` | Locale-aware money; localized return targets |
| `src/lib/account/customer-account.ts` | Per-locale runtime; `loginHref`/`refreshHref` take `LocaleId` |
| `src/components/account-access.tsx` | Localized return targets |
| `src/proxy.ts` | Protocol branch picks the runtime by locale cookie |
| `biome.json` | Restrict `useTranslation` to `src/lib/i18n/t.tsx` |
| `src/lib/routes/route-contract.ts`, `scripts/smoke-routes.mts` | Canonical / `x-default` smoke |
| `tests/**` | Assertions for keys, formatting, account runtime, `loaderLocale` |
| `AGENTS.md`, `README.md` | Markets rules |
| `.weaverse/specs/2026-09-30--weaverse-markets/README.md`, `work-logs.md` | Clarifications, log |

### Folder impact

```plaintext
src/lib/i18n/            locales, locale-context, translate, translator, t, static-content, alternates
src/lib/weaverse/        server, theme-schema, request-info, resource
src/lib/account/         customer-account, account-view
src/lib/storefront/      format, data-source (+ adapter)
src/app/[locale]/        layout, every page (metadata + copy), error, not-found
src/app/sitemap.ts, src/proxy.ts
src/components/, src/sections/   copy + formatting
tests/, tests/browser/
```

## Commit order

1. Theme settings read `theme` (step 0, done)
2. Markets in the schema and request context, plus `dir` (step 1)
3. Translation runtime and root provider (step 2)
4. One commit per surface in step 3
5. Locale formatting, including account (step 6)
6. Per-market SEO (step 5)
7. Customer account per market (step 7)
8. Studio verification and browser tests (step 4), once the Studio agent reports
9. Docs and log (step 8)

## Risks

| Risk | Mitigation |
| --- | --- |
| Builder needs `loadPage.locale` to select localized pages | Step 4 evidence decides it; one call site in `loadWeaversePage` |
| Changing `i18n.locale` to BCP-47 breaks loader routing | `loaderLocale` maps language + country instead and has a round-trip test |
| Moving about 110 strings churns DOM tests | Assert through `STATIC_CONTENT` values, one surface per commit |
| Server-built attributes miss live Studio edits | Accepted for attributes and metadata only; text nodes use `<T>` |
| Per-market equivalence reads add queries to resource pages | One small id-scoped query per market, cached like other reads |
| Saved theme settings now apply (step 0) | Today the project has none saved; defaults match what consumers already assume |
