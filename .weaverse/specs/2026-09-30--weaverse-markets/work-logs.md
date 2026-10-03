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
