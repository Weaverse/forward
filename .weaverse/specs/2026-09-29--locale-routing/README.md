# Feature: Add locale routing for Shopify Markets

| Field            | Value                                                  |
| ---------------- | ------------------------------------------------------ |
| **Status**       | completed                                              |
| **Owner**        | @hta218                                                |
| **Issue**        | [#68](https://github.com/Weaverse/forward/issues/68)   |
| **Branch**       | `feat/locale-routing`                                  |
| **Created**      | 2026-09-29                                             |
| **Last Updated** | 2026-09-30                                             |

## Original Prompt

> Baseline: `main@0c84182`. Tracked by Weaverse/builder#2660 under epic Weaverse/builder#2663, which lists Markets/localization as its own bounded slice after the first Weaverse connection.
>
> ## What
>
> Move the rendered routes under an `app/[locale]/...` segment, the way Pilot uses a `:locale?` prefix and the Next POC uses `app/[locale]/`, so the storefront can serve more than one market.
>
> The default locale stays invisible in the URL. The POC's shape is the reference:
>
> - `/en-us*` addressed directly → 308 redirect to the unprefixed canonical path
> - a non-default locale → passed through
> - everything else → rewritten internally to `/en-us*` so it resolves under `app/[locale]/`
>
> ## What this is NOT for
>
> **It does not fix 404 status codes.** That was investigated at length under #65 and the cause was a root `loading.tsx`: it wrapped every route in a Suspense boundary, so Next streamed a shell and committed the response to `200` before any component ran, leaving `notFound()` able to produce only a soft 404. Removing that file restored real 404s, and the custom-page route now sits at the app root with no locale segment and no proxy filtering.
>
> So do this slice for Markets, not for routing behaviour. Nothing currently depends on it.
>
> ## Scope
>
> - 18 route files move under `[locale]`: every `page.tsx`, plus `layout.tsx`, `error.tsx`, and `not-found.tsx`.
> - Route handlers and root metadata stay where they are and are never localized: `api/cart`, `api/weaverse/revalidate`, `account/status`, `robots.ts`, `sitemap.ts`.
> - `proxy.ts` gains the locale redirect and rewrite. It is currently the account boundary and fails closed, so the locale logic must branch before that and leave the account path untouched.
> - The route contract, its `20 + 4` counts, `check:routes`, `smoke:routes`, and the browser matrices all encode unprefixed paths and will need updating together.
> - `CATALOG_I18N` in `src/lib/storefront/shopify/client.ts` is currently the single hardcoded market and is also what the Weaverse request context reports as `i18n`. Both become per-request.
>
> ## Why it is its own issue
>
> It touches every route file, the proxy, the route contract, and every verification gate at once. Landing it inside a Weaverse composition PR would make both unreviewable, and #65 explicitly deferred Markets.

## Summary

Rendered routes move under an `app/[locale]/` segment so the storefront can
serve more than one Shopify market, with the default locale kept out of the
URL through the proxy's redirect and rewrite. The market each request reads
(`CATALOG_I18N` today) becomes per-request for both Shopify and Weaverse.
