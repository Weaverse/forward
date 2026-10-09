# Plan: Let Studio resolve Forward's default resources

## Cause

1. Studio: `navigatePreviewToPage` → `getPagePreviewPath` → `defaultResourceHandle(type, Editor.shopifyResources)` (Weaverse/builder `page-selector/utils.ts`).
2. `Editor.shopifyResources` comes from `/api/public/pages?storefrontAccessToken=<publicEnv.PUBLIC_STOREFRONT_API_TOKEN>` (`app/routes/api/public/$param.ts`). With no token, Builder returns no resources; its Admin API fallback is a `TODO`.
3. Forward listed `PUBLIC_STOREFRONT_API_TOKEN` in `SUPPRESSED_ENV_KEYS`, so `publicEnv` carried an empty token. The handle was `undefined`, and Studio showed "Not found".
4. `ALL_PRODUCTS` needs no handle, so it worked.
5. Second break, found once the token was forwarded: Studio's theme store still had no `publicEnv`. `loadThemeSettings` attaches it only in design mode, read from `?isDesignMode=true`. The root layout calls it with no search params, because Next gives layouts none, so the response never carried `publicEnv`. Hydrogen does not hit this: its root loader sees the request URL.

## Change

- `src/lib/weaverse/env.ts`: drop `PUBLIC_STOREFRONT_API_TOKEN` from `SUPPRESSED_ENV_KEYS`. `WEAVERSE_PUBLIC_API_BASE` stays suppressed.
- `src/lib/weaverse/env.ts`: `weaversePublicEnv(source)` builds `{ PUBLIC_STORE_DOMAIN, PUBLIC_STOREFRONT_API_TOKEN }` from the SDK env. `src/app/[locale]/layout.tsx` passes it to `WeaverseRoot` instead of `themeResponse.publicEnv`.
- `tests/weaverse-env.test.ts`: the resolved config forwards the token, and `weaversePublicEnv` returns both values, or `undefined` without a project.
- `AGENTS.md`, `.env.example`, `src/lib/storefront/shopify/env.ts`: record the approval and the token's one browser use.

The private token is unaffected: it never enters the SDK env object.

## Not in scope

The design-mode gap is generic to Next themes: any layout-mounted root provider gets no `publicEnv` from the SDK. An SDK follow-up could return `publicEnv` from `loadThemeSettings` regardless of design mode, or document that a Next theme must pass it to the root provider itself.

Builder resolving default resources without a public token (its Admin API `TODO`) would let any theme work without sending one. That is a Builder change, not needed here.

## Files touched

| File | Change |
| --- | --- |
| `src/lib/weaverse/env.ts` | Stop suppressing the public token; `weaversePublicEnv` |
| `src/app/[locale]/layout.tsx` | Pass `weaversePublicEnv` to `WeaverseRoot` |
| `tests/weaverse-env.test.ts` | Token forwarded |
| `AGENTS.md` | Approved change |
| `.env.example` | Token documented as used by Studio |
| `src/lib/storefront/shopify/env.ts` | Comment |
| `.weaverse/specs/2026-10-09--studio-default-resources/` | This spec |
