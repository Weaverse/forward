# Work Logs

## 2026-10-03 — @hta218

- Implemented plan steps 0–3 and 5–8 on `feat/weaverse-markets`. Step 4
  (Studio verification) waits on a preview deploy and the Studio agent below.
- Deviations from the plan:
  - **Account pages:** they resolve copy with the server `t()` rather than
    `<T>`. They sit behind sign-in and Studio cannot preview them, so live
    edits there buy nothing.
  - **Components that take `t` as a prop:** `AccountShell`,
    `AccountAccessPanel` and `PolicyDocument` take the page's `t` (and
    `locale`) instead of reading the server translator. DOM tests render them,
    and they must not import the server-only seam.
  - **Root provider inputs:** `WeaverseRoot` imports `themeSchema` and
    `STATIC_CONTENT` instead of taking `response.schema`. A schema can hold
    functions that cannot cross from server to client. `theme`,
    `merchantOverrides` and `publicEnv` still come from the response.
  - **Address errors:** they are translation keys
    (`account.addressErrors.*`), rendered by the client form.
  - **Order statuses:** they get `statusKey`, with the English label kept as
    the fallback for a status Shopify adds later.
  - **Account money:** it now formats through `formatMoney(money, locale)`;
    the session carries its market.
  - **Section placeholders:** these are shown until a product is picked.
    They are theme copy too and became keys.
  - **Relative alternates:** canonicals and `hreflang` are root-relative,
    because `SITE_BASE_URL` is still a placeholder domain. Next resolves them
    against the deployment's origin.
  - **No smoke check for alternates:** `hreflang`/canonical is covered by
    `tests/browser/locale.pw.ts`, not by `smoke:routes`. The smoke harness
    has no `<link>` assertion.
- Pending (step 4), Studio agent prompt (add the preview URL):

```
On Weaverse Studio for the Forward project, using the preview <URL>:
1. Confirm the market selector lists United States, United Kingdom, Germany, France, Japan,
   and report the exact locale string Studio shows for Germany.
2. Switch to Germany, open the home page, click "Create localized page", change the first
   heading to "Forward DE — Test", publish.
3. Still on Germany, translate one section field (any heading on the default home) through
   item translation, publish.
4. Translation Manager → German: run Sync Theme Keys, set `catalog.filters` to "Filter",
   `announcement.text` to "Kostenloser Versand ab 100 €", and `footer.tagline` to an empty
   string; publish. Confirm both migrated keys are listed.
Don't change the default (US) pages or theme settings. Report each step with screenshots and
any error text.
```

- Pending (step 7, store side), store agent prompt:

```
On the Forward dev store (forward-xbirmxxt.myshopify.com), Customer Account API settings:
add these as allowed logout redirect URIs for every origin that runs the account flow
(production domain, the Vercel preview origin, and the local tunnel origin in use):
<origin>/, <origin>/en-gb, <origin>/de-de, <origin>/fr-fr, <origin>/ja-jp.
Keep existing entries. Change nothing else. Report the final list.
```

## 2026-10-05 — @hta218

- Studio's address bar snapped back to the default market after navigating:
  `requestInfo.pathname` was the unprefixed route path. `buildRequestContext`
  now reports the market-prefixed path (76e51ba). The Builder strips
  `i18n.pathPrefix` itself; this was verified against the live API.
- The SDK should own this rule: Weaverse/weaverse#534. Remove the
  `localizePath` in `buildRequestContext` once `@weaverse/next` applies
  `i18n.pathPrefix`.
- Manual test re-check (storefront probes against `bun run dev`):
  - A2/B6 pass: `/de-de` resolves its own localized INDEX page while every
    other market keeps the default. `loadPage` needs no `locale`.
  - C10/C11 pass: `134,52 €` / `￥23,751` / `$148`, `5. August 2026`;
    canonical + 5 `hreflang` + `x-default` on `/de-de` and `/de-de/shop`,
    canonical only on PDP and articles; `<html lang="de-DE" dir="ltr">`.
  - A4/B8 open: `/api/translation/static?locale=de-de` returns the synced
    keys with English values only, so the German Translation Manager values
    are not published yet. Studio-side, no code change.
- `pageWidth` did not follow Studio's slider: the layout rendered it on the
  server from the theme response, so live edits to the root theme-settings
  store never reached it. `WeaverseRoot` now renders it through
  `useThemeSettings()`; the server `<style>` is gone.
