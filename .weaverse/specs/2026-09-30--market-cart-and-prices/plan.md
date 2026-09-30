# Plan: Cart currency, price formatting and market switching

## 1. Cart currency

Hydrogen's cart handlers have no buyer identity action, and Shopify never
re-prices a cart from `@inContext` (confirmed live: a US cart read and added to
under DE stays USD with `buyerIdentity.countryCode: US`).

Before `/api/cart` GET/POST and `readShopifyCart`, `syncCartCountry` reads the
cart's country and, when it differs from the market in `forward_locale`, runs
`cartBuyerIdentityUpdate`. No cart cookie means nothing to sync. Costs one extra
small read per cart request (marked `ponytail:`).

Store finding: every product is sold out outside the US market (inventory is
not stocked for GB/DE/FR/JP). Moving a cart there zeroes its lines with
`MERCHANDISE_OUT_OF_STOCK`, and the PDP shows "Sold out". That is store
configuration, not theme code.

## 2. Price formatting

`formatMoney` replaces `minimumFractionDigits: 0` with
`trailingZeroDisplay: "stripIfInteger"`: `$248` stays, `£228.2` becomes
`£228.20`.

## 3. Market switching

The selector panel renders only after a click, so it appends
`window.location.search` to each market link without touching server render.

## Files touched

- `src/lib/cart/shopify-cart.ts`
- `src/lib/storefront/format.ts`
- `src/components/site-header/country-control.tsx`
- `tests/shopify-cart.test.ts`
- `tests/format.test.ts`
- `tests/dom/shell-chrome.test.tsx`
- `.weaverse/specs/2026-09-30--market-cart-and-prices/`
- `.weaverse/specs/2026-09-29--locale-routing/work-logs.md`
