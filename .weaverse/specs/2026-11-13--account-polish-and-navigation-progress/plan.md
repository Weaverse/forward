# Plan

1. **Header label**: the account item always reads "Account". Drop the `/account/status` fetch, the route itself, and the `header.signedIn` copy; nothing else reads them.
2. **Sign-out**: render it as the last nav row (same size, weight and rule as Overview/Orders/Addresses), still a POST form.
3. **Orders**:
   - Query line item `image`, `variantOptions`, `sku`, `price`, plus order `financialStatus`, `statusPageUrl`, `lineItemsSummary`, `fulfillments` (status, tracking, estimated delivery) and `billingAddress`.
   - One shared order list (overview + orders page): thumbnails of the first items, item count, date, payment and fulfillment status, total.
   - Order detail: line rows with image, variant pills, SKU, unit price × quantity and line total; tracking card; delivery and billing addresses; totals; link to Shopify's order status page.
   - Images render through `next/image` only when they pass `isShopifyProductImageUrl`.
4. **Back link**: small "← Orders" link instead of the full-width text link.
5. **Addresses**: cards with a gap between them, compact text actions, the add-address card in the same grid, and a `confirm()` before delete (the form still posts without JavaScript).
6. **Navigation progress**: `NavigationProgress` in the locale layout. The theme `Link` starts it from `onNavigate` when the target path or query differs; it completes when the pathname or search params change, with a 10s safety stop.
7. **Mock (temporary)**: `src/lib/account/mock.ts`, enabled only when `NODE_ENV !== "production"` and `FORWARD_ACCOUNT_MOCK=1`. Hooks in `proxy.ts`, `readAccountSession`, the profile, order and address reads, and the address action. Removed before merge.

## Files

- `src/components/site-header/{field-index-header,mobile-menu,header-navigation}.ts(x)`, `src/app/account/status/route.ts` (deleted), `src/proxy.ts`
- `src/components/account-shell.tsx`, `src/components/account-orders.tsx` (new), `src/components/navigation-progress.tsx` (new), `src/components/link.tsx`
- `src/app/[locale]/layout.tsx`, `src/app/[locale]/account/**`
- `src/lib/account/{queries,account-view,addresses,address-actions,mock}.ts`
- `src/translations/*.json`, tests touching the removed route
