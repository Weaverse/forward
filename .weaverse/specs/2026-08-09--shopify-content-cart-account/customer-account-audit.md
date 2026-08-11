# Shopify Customer Account — Read-only Audit

Date: 2026-08-11

## Scope

This audit covers only configuration discovery and implementation prerequisites for Slice 3. It performed no Shopify, Vercel, customer, order, credential, callback, or environment mutation. Credential values were neither printed nor copied.

## Repository baseline

```text
branch=feat/customer-account
base=c93eff87f25333f1dd073b5746607566c62b05a0
base source=clean synced origin/main
Next.js=16.3.0 App Router
Hydrogen=0.0.0-preview-116d5d7-20260730141607
```

## Verified Shopify state

A fresh read-only Admin API 2026-07 query through the existing store-operations client confirmed:

```text
shop=forward-xbirmxxt.myshopify.com
shop GID=gid://shopify/Shop/97847574828
customerAccountsVersion=NEW_CUSTOMER_ACCOUNTS
loginLinksVisibleOnStorefrontAndCheckout=true
loginRequiredAtCheckout=false
customer account URL=https://shopify.com/97847574828/account
```

The existing Admin installation exposes customer/order read and write scopes. Those scopes do not authorize persistent QA mutations here; no mutation was run.

The shop's public OpenID discovery endpoint is live and reports:

```text
issuer=https://shopify.com/authentication/97847574828
authorization endpoint=https://shopify.com/authentication/97847574828/oauth/authorize
token endpoint=https://shopify.com/authentication/97847574828/oauth/token
logout endpoint=https://shopify.com/authentication/97847574828/logout
response type=code
PKCE method=S256
required account scope=customer-account-api:full
```

## Verified package/runtime contract

The exact installed `@shopify/hydrogen/customer-account` subpath exports working runtime functions for:

- `createCustomerSession`;
- `createCustomerAccountServerHandlers`;
- `createCustomerAccountClient`;
- Customer Account `gql`.

The exact installed core package exports `createShopifyRequestContext` and `handleShopifyRoutes`.

Pinned declarations require an app-owned `ShopifyRouteSessionManager` with read, write, remove, origin, and optional commit boundaries. Default account handlers own:

- `GET /account/login`;
- `GET /account/authorize`;
- `GET /account/refresh`;
- `POST /account/logout`.

The pinned Next guidance requires registration before App Router through `proxy.ts`, raw full-page links/forms for redirects, dynamic/no-store account reads, and writable session access only where the returned response commits cookies.

## Environment/configuration status

Secret-safe key-name inspection found only catalog credentials in Forward local/Vercel environments. These required account keys are not configured in either location:

```text
SHOP_ID
PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID
CUSTOMER_ACCOUNT_SESSION_SECRET
PUBLIC_STOREFRONT_ORIGIN
```

`SHOP_ID` is the numeric string `97847574828`, not a GID, domain, storefront ID, publication ID, or catalog ID.

The authoritative Customer Account API client UUID and currently registered callback/logout origins remain **UNKNOWN**. Shopify documents their supported source as Shopify Admin → Headless storefront → Customer Account API settings. Automated read-only browser inspection was blocked by Shopify's connection-verification page, and Admin GraphQL does not expose that client configuration through the audited shop fields.

No credential from Pilot or another storefront may be copied or reused.

## Locked origin contract

The intended canonical Production settings are:

```text
callback URL=https://forward-sandy.vercel.app/account/authorize
post-logout redirect URI=https://forward-sandy.vercel.app/
```

Any preview callback must use an exact stable HTTPS preview/branch origin observed after deployment and must be separately registered before hosted OAuth QA. `localhost`, plain HTTP, inferred wildcard origins, and arbitrary forwarding headers are invalid.

Creating or changing the Headless client/callback configuration is a persistent Store operation and remains approval-gated. The session secret must be newly generated in protected local/Vercel storage, never committed or copied from another app.

## Implementation disposition

Source implementation may proceed behind fail-closed account configuration with synthetic OAuth/session tests. Live provider redirect, callback, refresh, logout, profile/order/address queries, and repeated hosted login cycles remain blocked until the authoritative client ID, exact callback/logout registrations, session secret, and controlled QA mailbox are available.
