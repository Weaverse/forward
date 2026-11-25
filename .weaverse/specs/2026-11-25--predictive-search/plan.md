# Plan

## Backend

- `PREDICTIVE_SEARCH_HANDLERS` (`src/lib/routes/shopify-routes.ts`):
  `createPredictiveSearchServerHandlers({ path: "/api/predictive-search",
  limit: 4 })`, Hydrogen's built-in fragments (product: variant image and
  price; collection and article: image; page; query suggestion). No custom
  `gql()` document, so `check:graphql` is unchanged.
- `src/proxy.ts` passes it as `handlers` to the existing `shopifyRoute`
  `handleShopifyRoutes` call. Nothing else in the proxy changes.
- Market: the browser calls `localizePath("/api/predictive-search", locale)`.
  Hydrogen matches `/de-de` against `SHOPIFY_I18N`, strips the prefix before
  matching the handler, and the Storefront client fills `@inContext` from that
  locale. The unprefixed path is the default market. The URL alone decides
  the market (no `Referer`), so a cached response cannot leak into another
  market.
- Contract: `GET ?q=` (plus optional `limit`, `types`, ...), `200` with
  `{ term, total, items: { products, collections, pages, articles, queries } }`,
  or `400` `{ error: { code: "invalid_predictive_search_request", message } }`.

## UI

- `PredictiveSearchForm` (`src/components/predictive-search-form.tsx`)
  replaces the search page's form markup, same GET form and styling.
  `PredictiveSearchProvider` (Hydrogen's store) debounces 200 ms and aborts a
  stale request.
- ARIA combobox: `input[role=combobox]` with `aria-expanded`,
  `aria-controls`, `aria-activedescendant`, `aria-autocomplete=list`; a
  `listbox` of labelled `group`s, each option a `Link` with `role=option`.
  ArrowDown/ArrowUp move (wrapping), Enter opens the active option (or
  submits the form when none is active), Escape closes. Focus never leaves
  the field. Keys are left alone while an IME composes (`isComposing`, or
  Safari's `keyCode` 229). The active option belongs to one option list:
  when results arrive or change, nothing is active, so Enter submits to
  `/search` rather than opening an option the shopper didn't pick.
- Hydrogen's store keeps the previous result while loading and after a
  failure, so results show only when `result.term` matches the current
  input and the status is not `error`. A `role=status` line announces
  loading, a failure ("Suggestions are unavailable. Press Enter to search."),
  the empty state (only after a successful search) and the count.
- Last option is always "View all results" to `/search?q=`.
- Thumbnails only for URLs `isShopifyProductImageUrl` accepts; price via
  `formatMoney`. The only transition is a colour change, off under reduced
  motion. Options do not prefetch.
- `ProductCard` is not reused: its links and swatch radios cannot live inside
  an `option`.

## Out of scope

- Header overlay search (the header search link still opens `/search`).
- Subscriptions, gift cards, bundles.

## Files touched

- `src/lib/routes/shopify-routes.ts`
- `src/proxy.ts`
- `src/lib/storefront/predictive-search.ts` (new)
- `src/components/predictive-search-form.tsx` (new)
- `src/app/[locale]/search/page.tsx`
- `src/lib/i18n/static-content.ts`
- `tests/predictive-search.test.ts` (new)
- `tests/dom/predictive-search-form.test.tsx` (new)
- `tests/browser/presentation.pw.ts` (search field role is now `combobox`)
