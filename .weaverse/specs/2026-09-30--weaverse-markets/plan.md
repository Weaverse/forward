# Plan: Wire Weaverse markets, translations and per-market SEO

## Original Prompt

See `README.md` → Original Prompt (issue #87, verbatim). Planning input:
`/work #87`, plus Leo's answers below.

## Decisions (Leo, 2026-09-30)

| Question | Decision |
| --- | --- |
| Translation architecture | Server `t()` for server components and client `useTranslation()` for client components, over one key set |
| Copy before the merchant translates | English `staticContent` only; merchants translate in Studio's Translation Manager |
| Studio verification | A separate agent with Studio access, driven by a prompt from this plan |
| Logout per market | One Customer Account handler per market, each with its own post-logout URI |

## Findings that shape the plan

- `WeaverseNextLoadPageInput.locale` is documented as "Locale used to select the assigned page", but `loadWeaversePage` calls `client.loadPage({ handle, type })` without it. That is the likely gap for localized pages, so fix it first.
- `WeaverseNextI18n` has `pathPrefix` and `label`. `weaverseI18n()` sends only `{ country, language, locale }`.
- Merchant overrides (`/api/translation/static`) are fetched only when the schema declares `i18n` and the request context has both `language` and `country`. The second condition already holds.
- The layout does not mount `WeaverseNextRootProvider`, so `useTranslation()` would throw today.
- `@weaverse/next`'s main entry calls `createContext` at module scope. Importing `createTranslate` into a Server Component may fail the RSC build, and step 2 opens with a spike to find out.
- About 110 theme-owned strings exist: roughly 40 JSX text nodes and 34 aria/placeholder/title attributes, plus strings inside ternaries and constants. 81 of 112 `.tsx` files are client components.
- 12 files call `formatMoney`/`formatDate`, and both hardcode `en-US`.
- `POST_LOGOUT_REDIRECT_URI = "/"` is fixed when `createCustomerAccountServerHandlers` is constructed.
- No page emits `alternates`, and `sitemap.ts` lists default-market URLs only.

## Requirements

### Functional
- [ ] FR1: The theme schema declares `i18n` (`urlStructure: "url-path"`, `defaultLocale`, `shopLocales`, `translation: true`, `staticContent`), derived from `LOCALES`.
- [ ] FR2: `loadPage` receives the market's `locale`, so a localized page authored for DE renders on `/de-de`, while `/` keeps the default.
- [ ] FR3: Every theme-owned string resolves through `t(key)`. Merchant overrides for the current market win over the English default, and an intentionally empty translation is kept.
- [ ] FR4: Every indexable page emits a self-canonical URL and `hreflang` alternates for every market plus `x-default`. The sitemap lists every market.
- [ ] FR5: Money and dates format with the market's `localeTag` (`221,78 €` on `/de-de`).
- [ ] FR6: Logging out on `/de-de/account` lands on `/de-de`, and login returns to the market it started from.

### Non-functional
- [ ] No merchant content, credentials or Shopify payloads reach a Studio payload (AGENTS.md seam rule).
- [ ] Translation keys are type-checked: a renamed or removed key breaks at compile time, the same way `ThemeSettings` does.
- [ ] Server components stay server components. `t()` must not force a client boundary.
- [ ] A missing translation fetch never breaks rendering; the SDK already guarantees this.

### Out of scope
- Translating Shopify content (products, collections, menus): Shopify returns it per `@inContext(language)` through Translate & Adapt.
- RTL markets: every current market is `ltr`. `direction` is declared but no `dir="rtl"` styling work is done.
- AI translation in Studio and bundled de/fr/ja copy.
- Adding markets beyond the current five.

## Technical Approach

```
LOCALES (src/lib/i18n/locales.ts) ──► shopLocales / defaultLocale ──► themeSchema.i18n
        │                                         staticContent (EN) ─┘
        ├─► weaverseI18n(locale) {country, language, locale, pathPrefix, label}
        │        └─► loadPage({ type, handle, locale })     (localized pages)
        │        └─► loadThemeSettings() → merchantOverrides (per market)
        │
        ├─► server: getTranslator(locale) = translate(staticContent, merchantOverrides)
        └─► client: <WeaverseNextRootProvider staticContent merchantOverrides> → useTranslation().t
```

### Step 1 — Markets in the schema and in `loadPage`

- Extend each `LOCALES` entry with derived fields rather than hand-written ones:
  - `pathPrefix`: `""` for the default market, `/${id}` otherwise.
  - `hreflang`: `localeTag(id)`.
  - `direction: "ltr"`.
- Add `shopLocales()` and `defaultShopLocale()` helpers returning the `WeaverseNextI18n` shape.
- `theme-schema.ts`: add `i18n: { urlStructure: "url-path", defaultLocale, shopLocales, translation: true, staticContent: STATIC_CONTENT }`.
- `weaverseI18n(locale)`: add `pathPrefix` and `label`. Keep `locale` as the lowercase id (`de-de`), the format the docs pass to `loadPage`; step 4 confirms it.
- `loadWeaversePage`: call `client.loadPage({ handle, type, locale })`. Also pass `locale` to `fetchCustomPages` wherever it is used.
- Test: a unit test that `shopLocales()` covers `LOCALES` one to one with `pathPrefix ""` only for the default market. Update the request-info tests.

### Step 2 — Translation runtime

- **Spike.** Import `createTranslate` from `@weaverse/next` into a server module and run `bun run build`.
  - If it builds, use it.
  - If not, write `translate()` in `src/lib/i18n/translate.ts` with the same precedence: overrides → static → key. It must check own-property ownership rather than truthiness, and support `{{var}}` interpolation. About 20 lines plus a test.
- `src/lib/i18n/static-content.ts`: `STATIC_CONTENT` as one nested `as const` English object, grouped by surface (`header`, `footer`, `market`, `cart`, `product`, `catalog`, `search`, `account`, `journal`, `errors`, `common`).
- Derive the key union `TranslationKey` from it with a `DotPaths<T>` type, like `ThemeSettings`.
- Server: `getTranslator(locale)` in `src/lib/i18n/translator.ts`, memoized with React `cache()`.
  - Reads `loadWeaverseThemeSettings(locale)`, which is already per-request cached.
  - Returns `t(key: TranslationKey, vars?)`.
- Client: mount `WeaverseNextRootProvider` in `src/app/[locale]/layout.tsx`, above `SiteHeader` and `{children}`, passing:
  - `themeSchema`
  - `initialThemeSettings`
  - `staticContent`
  - `merchantOverrides` from the same `loadWeaverseThemeSettings(locale)`
- Add a typed wrapper `useT()` in `src/lib/i18n/use-t.ts` over `useTranslation().t` that narrows the key to `TranslationKey`.
- Biome: restrict importing `useTranslation` from `@weaverse/next` outside `use-t.ts`, the same pattern as `usePathname`.
- Test: translator precedence (override, empty-string override, static, missing key → key, interpolation).

### Step 3 — Move theme copy onto `t()`, one surface per commit

| Surface | Main files |
| --- | --- |
| Header, market selector, mobile menu | `src/components/site-header/**` |
| Footer | `src/components/site-footer*.tsx` |
| Cart drawer, cart page, add to cart | `src/lib/cart/shopify-cart-react.tsx`, `src/components/add-to-cart-form.tsx`, `src/app/[locale]/cart/**`, `src/components/cart*` |
| PDP children | `src/sections/main-product/**` |
| Catalog | `src/components/catalog-*.tsx`, `src/components/facet-list.tsx`, `src/components/sort-form.tsx`, `src/components/product-card.tsx`, `src/sections/main-collection/**`, `src/sections/all-products/**` |
| Search | `src/app/[locale]/search/**` |
| Account | `src/components/account-shell.tsx`, `src/app/[locale]/account/**` |
| Journal and article chrome | `src/sections/article-*`, `src/sections/journal-*` |
| Errors and 404 | `src/app/[locale]/error.tsx`, `not-found.tsx` |

Rules:
- Merchant-authored Weaverse settings (section headings, button labels) are not theme copy and stay as settings. Only strings hardcoded in `.tsx` move.
- `SORT_OPTIONS` labels and facet labels that come from Shopify stay as they are. Theme-defined sort labels get keys.
- `aria-label`, `placeholder`, `title` and `alt` fallbacks are included.
- Update DOM tests to assert the English default through the same keys. Do not hardcode new strings in tests.
- Add a guard test: no JSX text node in `src/components`, `src/sections` or `src/app/[locale]` is a bare English word outside an allowlist (brand name, units). This stops regressions.

### Step 4 — Localized pages and translations verified in Studio

- After steps 1–2 are deployed to the Vercel preview, hand the Studio agent the prompt below.
- Then verify:
  - `/de-de` renders the DE localized home while `/` renders the default.
  - `/de-de/shop` shows the German override for one translated key; `/fr-fr` still shows English.
  - Studio's market selector previews `/de-de` and section loaders read `de-de` (`loaderLocale`).
- If the Builder expects another `locale` format (`de-DE`), change `weaverseI18n`, `loadPage` and `loaderLocale` together, add a test, and log it in `work-logs.md`.
- Add a browser test on the live-account-disabled matrix that asserts the localized DE home marker and the translated key. It depends on the Studio fixture, so record the fixture in the spec.

Studio agent prompt (to be finalized with the preview URL once step 2 is deployed):

```
On Weaverse Studio for the Forward project, using the preview <URL>:
1. Confirm the market selector lists United States, United Kingdom, Germany, France, Japan.
2. Switch to Germany, open the home page, click "Create localized page", change the first
   heading to "Forward DE — Test", publish.
3. Open Translation Manager → German: set `catalog.filters` to "Filter", publish.
Don't change the default (US) pages or theme settings. Report each step with screenshots,
and the exact locale string Studio shows for Germany.
```

### Step 5 — Per-market SEO

- `src/lib/i18n/alternates.ts`: `marketAlternates(path)` returns Next's `{ canonical, languages }`.
  - `canonical`: the current market's URL.
  - `languages`: every `localeTag` → `SITE_BASE_URL + localizePath(path, id)`, plus `x-default` → the default-market URL.
  - The path is the unprefixed route path each page already knows.
- Add `alternates` in every indexable page's `generateMetadata`:
  - home, shop, collection, product, journal, article, pages, policies.
  - Account, cart and search get `robots: noindex` if they don't have it already, and no alternates.
- `sitemap.ts`: one entry per market per path, each with `alternates.languages`. Reads stay on the default market's storefront, because handles are market-independent.
- Tests:
  - A unit test for `marketAlternates`.
  - A sitemap test: five markets × paths, no `/en-us`.
  - A smoke check that `/de-de/shop` has `<link rel="alternate" hreflang="x-default">`.

### Step 6 — Locale formatting

- `formatMoney(money, locale: LocaleId)` and `formatDate(iso, locale: LocaleId)` take the market, not a tag. The formatter cache is keyed by `localeTag|currency`.
- Server callers pass the route's `locale`; client callers use `useLocale()`.
- Remove the `"en-US"` defaults so a caller that forgets the market fails to compile.
- Tests:
  - de-DE EUR renders `221,78 €`; en-US USD renders `$248`; ja-JP JPY renders `￥3,000`.
  - Dates render in the market's language.

### Step 7 — Customer account per market

- `getCustomerAccountRuntime(source, locale)` memoizes one runtime per locale. Each has:
  - `postLogoutRedirectUri`: `localizePath("/", locale)`.
  - `defaultPostLoginRedirectPathname`: `localizePath("/account", locale)`.
- `proxy.ts` protocol branch: pick the runtime from the `forward_locale` cookie, the same source `/api/cart` uses. The logout form posts from a localized page, so the cookie is current.
- Check the return-target flow: login started on `/de-de/account` must return there. `sanitizeReturnTarget` already accepts same-origin paths.
- Store side: register each market home as an allowed post-logout URI in Customer Account settings (`/`, `/en-gb`, `/de-de`, `/fr-fr`, `/ja-jp`) on the storefront origin. Add a prompt for the store agent to `work-logs.md`.
- Tests: `customer-account` unit tests for per-locale URIs; the proxy test for logout picks the runtime from the cookie. Add a live-account-enabled browser test: from `/de-de/account`, sign out and land on `/de-de`.

### Step 8 — Docs and verification

- AGENTS.md, Markets section:
  - Theme copy goes through `t()`/`useT()` with keys in `static-content.ts`.
  - The schema `i18n` derives from `LOCALES`.
  - Every indexable page emits `marketAlternates`.
- README: Markets paragraph mentions Studio localized pages and translations.
- Spec `work-logs.md` records decisions, the locale-format finding and the Studio fixture.
- Run the full required verification from AGENTS.md, plus `test:browser` (both matrices) and `verify:shopify`.

## Implementation Structure

### Files to create

| File | Purpose |
| --- | --- |
| `src/lib/i18n/static-content.ts` | English `STATIC_CONTENT` and the `TranslationKey` type |
| `src/lib/i18n/translate.ts` | `translate()` only if the step 2 spike rules out the SDK's `createTranslate` |
| `src/lib/i18n/translator.ts` | Server `getTranslator(locale)` |
| `src/lib/i18n/use-t.ts` | Typed client `useT()` |
| `src/lib/i18n/alternates.ts` | `marketAlternates(path)` |
| `tests/translator.test.ts` | Precedence and interpolation |
| `tests/alternates.test.ts` | Canonical, hreflang, x-default |
| `tests/theme-copy-guard.test.ts` | No bare English JSX text outside the allowlist |
| `tests/browser/weaverse-markets.pw.ts` | Localized page, translated key, logout per market |

### Files to modify

| File | Change |
| --- | --- |
| `src/lib/i18n/locales.ts` | `pathPrefix`, `hreflang`, `direction`; `shopLocales()`, `defaultShopLocale()` |
| `src/lib/weaverse/theme-schema.ts` | `i18n` block |
| `src/lib/weaverse/request-info.ts` | `weaverseI18n` adds `pathPrefix`, `label` |
| `src/lib/weaverse/server.ts` | `loadPage({ …, locale })`; expose `merchantOverrides`/`staticContent` |
| `src/lib/weaverse/resource.ts` | `loaderLocale` if the Builder format differs |
| `src/app/[locale]/layout.tsx` | Mount `WeaverseNextRootProvider` |
| `src/app/[locale]/**/page.tsx` | `alternates` in `generateMetadata`, `t()` copy |
| `src/app/[locale]/error.tsx`, `not-found.tsx` | `t()` copy |
| `src/app/sitemap.ts` | All markets with `alternates.languages` |
| `src/components/**`, `src/sections/**` | Theme copy → `t()`/`useT()`; formatter calls pass the locale |
| `src/lib/storefront/format.ts` | `formatMoney`/`formatDate` take `LocaleId` |
| `src/lib/cart/shopify-cart-react.tsx` | Copy and formatting |
| `src/lib/account/customer-account.ts` | Per-locale runtime and redirect URIs |
| `src/proxy.ts` | Protocol branch picks the runtime by locale cookie |
| `biome.json` | Restrict `useTranslation` to `use-t.ts` |
| `src/lib/routes/route-contract.ts`, `scripts/smoke-routes.mts` | hreflang smoke check |
| `tests/**` | Updated assertions for keys, formatting, account runtime |
| `AGENTS.md`, `README.md` | Markets rules |
| `.weaverse/specs/2026-09-30--weaverse-markets/work-logs.md` | Log |

### Folder impact

```plaintext
src/lib/i18n/            locales, locale-context, translator, use-t, static-content, alternates
src/lib/weaverse/        theme-schema, request-info, server, resource
src/lib/account/         customer-account
src/app/[locale]/        layout, every page (metadata + copy), error, not-found
src/app/sitemap.ts
src/components/, src/sections/   copy + formatting
tests/, tests/browser/
```

## Commit order

1. Markets in the schema and `loadPage` locale (step 1)
2. Translation runtime and root provider (step 2)
3. One commit per surface in step 3
4. Locale formatting (step 6)
5. Per-market SEO (step 5)
6. Customer account per market (step 7)
7. Studio verification and browser tests (step 4), once the Studio agent reports
8. Docs and log (step 8)

## Risks

| Risk | Mitigation |
| --- | --- |
| The SDK main entry can't be imported by RSC | Step 2 spike; a local `translate()` with the same precedence |
| The Builder ignores `loadPage.locale` or expects `de-DE` | Step 4 verification; one change point in `weaverseI18n` |
| Studio live edits don't update server-rendered strings | Accepted (Leo's decision); they update after a reload or revalidation |
| Moving about 110 strings churns DOM tests | Assert through `STATIC_CONTENT` values, one surface per commit |
| Per-locale account runtimes multiply session state | Runtimes share the same `customerSession` config; only redirect targets differ |
| hreflang for markets with no Shopify price | Every market in `LOCALES` exists in Shopify (#83 store setup) |
