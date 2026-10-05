# Handoff Context - 2026-10-05 07:24

## Project
- Repository: Weaverse/forward
- Branch: `feat/weaverse-markets` (from `main@2653379`), 26 commits ahead, all pushed
- PR: [#88](https://github.com/Weaverse/forward/pull/88) (draft), closes #87
- Spec: `.weaverse/specs/2026-09-30--weaverse-markets/` (README, plan, work-logs)
- Last Updated: 2026-10-05 07:24

## Current Status

### What's Been Done
Plan steps 0–3 and 5–8 are implemented and verified. Step 4 (Studio) is in progress.

- **Step 0:** `readThemeSettings` reads `theme`. It used a `themeSettings` key the SDK never returns, so saved settings were ignored.
- **Step 1:** the theme schema declares `i18n`, derived from `LOCALES`.
  - The Weaverse `i18n.locale` is BCP-47 (`de-DE`).
  - `loaderLocale` maps `language` + `country` back to the URL id.
  - `<html dir>` is set.
- **Step 2:** one translator for server and client.
  - `src/lib/i18n/translate.ts`, `t.tsx` (`useT`, `<T>`), `translator.ts` (`getTranslator`, `translatedMetadata`).
  - `WeaverseRoot` is mounted in the layout.
- **Step 3:** about 300 keys in `src/lib/i18n/static-content.ts`. All theme copy moved onto them; announcement and footer tagline are now keys.
- **Step 6:** `formatMoney` / `formatDate` require a `LocaleId`, account money included.
- **Step 5:** `marketAlternates`. Every page gets a canonical; `hreflang` + `x-default` only on `/`, `/shop` and `/journal`. The sitemap stays on the default market.
- **Step 7:** a localized `return_to` for login, refresh, logout and address saves.
- **Step 8:** docs (AGENTS.md Markets section, README, `work-logs.md`).
- **Ponytail review:** items 1 and 6 applied (`translatedMetadata`, the `renderInShell` alias dropped). Items 2–5 rejected with Leo.
- **2026-10-05:** Studio's address bar snapped back to `/` after navigating. Fixed in `76e51ba`, where `buildRequestContext` reports the market-prefixed path. SDK follow-up: Weaverse/weaverse#534.

Last full verification (before the address-bar fix):
- `bun run check` passed.
- `smoke:routes` 41/41.
- Both browser matrices passed (145 and 148).
- `verify:shopify`: 1 FAIL caused by store data, see Known Issues.

After the fix: typecheck and 365 node + 199 DOM tests pass.

### What's In Progress
Leo's manual test, group A (Studio):
- A1 ✅ Studio's market selector lists all 5 markets.
- A2 in progress. Switching to Germany works in the preview frame, and the address bar bug is now fixed.
  - **Re-check:** after navigating in Germany, the address bar must stay on `localhost:3333/de-de`. Reload the Studio tab first.
  - **Then:** "Create localized page" for Home in Germany and publish.
  - **After publishing,** ask the agent to probe whether `/de-de` resolves to a different page id (see Technical Context).

### What's Next
Remaining manual checklist (agreed in session):

**A. Studio**
3. Translate one section field on Home (item translation) in Germany, then publish.
4. Translation Manager → German:
   - Run Sync Theme Keys and confirm groups such as `header`, `cart` and `catalog`, plus `announcement.text` and `footer.tagline`, are listed.
   - Set `catalog.filters` = "Filter", `announcement.text` = "Kostenloser Versand ab 100 €", `footer.tagline` = "" (empty). Publish.
5. Edit `header.search` in Translation Manager without publishing. The preview must update live.

**B. Storefront content per market**
6. `/de-de` shows the localized home; `/` shows the default.
7. The item translation shows on `/de-de`, after a reload and after switching market from `/`.
8. Translated theme copy:
   - `/de-de/shop/<collection>` shows "Filter"; `/fr-fr` still shows "Filters".
   - `/de-de` shows the German announcement; `/` shows none.
   - The `/de-de` footer has no tagline.
9. Untranslated copy everywhere (header, mini-cart, cart, PDP, search, `/de-de/abc` 404) shows English, never raw keys.

**C. Formatting and SEO**
10. Money and dates:
    - `/de-de` PDP shows `221,78 €`, `/ja-jp` shows JPY, `/` shows `$248`.
    - A journal date on `/de-de` reads "21. Juli 2026".
11. View source:
    - `/de-de/shop` has a canonical `/de-de/shop` and 5 `hreflang` + `x-default`.
    - A PDP has a canonical only.
    - `<html lang="de-DE" dir="ltr">`.

**D. Account (accounts enabled)**
12. Login from `/de-de/account` returns to `/de-de/account`.
13. Logout returns to `/de-de`. Register the post-logout URIs first (store-agent prompt in `work-logs.md`).
14. On `/de-de` account pages: EUR/DE money, translated statuses, and an address save stays on `/de-de/account/addresses`.

**E. Regression**
15. Set `pageWidth` in Studio theme settings; the layout width must follow (the step 0 fix).
16. The footer shows an empty "Your Privacy Choices" column. This is known store drift (see Known Issues).

**After the manual test:**
- Update the browser tests with the Studio fixture (localized home marker, item translation, translated keys, empty tagline) in `tests/browser/weaverse-markets.pw.ts`, as listed in the plan.
- Update the PR #88 description (it still reads "spec only"), then mark it ready.
- Merge with a normal merge (never squash), then set the spec README Status to `completed`.

## Technical Context

### Key Files
- `src/lib/weaverse/request-info.ts`:
  - `weaverseI18n` reports BCP-47.
  - `buildRequestContext` reports the market-prefixed `pathname`/`url` (the Studio address-bar fix).
  - `loaderLocale` maps the Storefront pair back to the URL id.
- `src/lib/weaverse/theme-schema.ts`: the `i18n` block and `shopLocale()`.
- `src/lib/weaverse/root.tsx`: `WeaverseRoot`, the client boundary around `WeaverseNextRootProvider`.
- `src/lib/weaverse/server.ts`: `readThemeSettings` reads `.theme`. `loadWeaversePage` does **not** pass `locale` to `loadPage` yet.
- `src/lib/i18n/{static-content,translate,t,translator,alternates}.ts`
- `src/lib/storefront/format.ts`: locale-required formatters.
- `src/components/account-shell.tsx`: the logout form posts to `/account/logout?return_to=<localized home>`.

### Key Decisions
- **English copy only.** Merchants translate in the Translation Manager.
- **Copy rendering:** text nodes use `<T>`, which carries live Studio edits. Attributes and metadata use `getTranslator`. Account pages use the server `t()` because they are not Studio-previewable.
- **SEO** follows Pilot: an allowlist for `hreflang`; handle routes get a canonical only.
- **Account flows:** one Customer Account handler plus a localized `return_to`; no runtime per market.

### Known Issues
- **Localized page selection is unverified.**
  - On 2026-10-05 a direct Builder probe returned the same INDEX page id for `/` and `/de-de`. This was probably before the DE localized page existed.
  - If it still matches after A2 is published, add `locale` to `client.loadPage({ handle, type, locale })` in `src/lib/weaverse/server.ts`. Try BCP-47 `de-DE` first, else `de-de`.
  - Re-probe with the script approach from the session: build `createWeaverseNextServerClient` with `weaverseI18n(locale)` and compare `page.id`.
- **`verify:shopify` FAIL "live footer has the canonical three-column tree".** The store's footer menu gained a top-level "Your Privacy Choices" item with no children (likely added by Shopify after the EU markets setup in #83). The theme renders it as an empty column. Not caused by #87; a separate issue is proposed but not yet created.
- **Two pre-existing lint warnings on main**, out of scope: `mapper.ts:667` and `tests/shopify-catalog-adapter.test.ts:28`.
- **Stale dev types:** restart `next dev` and delete `.next/dev/types` if `tsc` complains about the old route tree.

## Dependencies & Prerequisites
- Bun (pinned) and `bun install --frozen-lockfile`. Shopify and Weaverse env are in `.env.local`; never add a `.env` file to the repo.
- Dev server: `bun run dev` (port 3333). Studio previews against it.
- Store-side and Studio-side work cannot be done from code:
  - No Content API endpoint exists for Translation Manager or item translations.
  - Localized pages could be created through the Content API with an API key, but Leo chose to do them in Studio.

## Additional Notes
- Leo's request: "phần cần check vào specs của issue này đang làm nhé (phần markets), để a lên cty làm tiếp".
- Resume point: manual test group A, step 2 (re-check the address bar, then create and publish the DE localized home), then continue A3–E above.
