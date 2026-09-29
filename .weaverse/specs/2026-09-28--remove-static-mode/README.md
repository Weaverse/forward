# Feature: Remove static mode

| Field            | Value                                                  |
| ---------------- | ------------------------------------------------------ |
| **Status**       | completed                                              |
| **Owner**        | @hta218                                                |
| **Issue**        | [#81](https://github.com/Weaverse/forward/issues/81)   |
| **Branch**       | `feat/remove-static-mode`                              |
| **Created**      | 2026-09-28                                             |
| **Last Updated** | 2026-09-29                                             |

## Original Prompt

> ## Context
>
> Forward still has a static mode. When no Shopify environment is set, `StaticStorefrontDataSource` serves the whole storefront from `src/lib/storefront/fixtures/`. This keeps a second, invented catalog alive next to the real one, so the theme can look correct while running on data no store has.
>
> PR #79 already removed every Shopify-mode read of fixtures except three: the Search and utility navigation links, the theme content, and the demo cart seed. This issue removes static mode entirely. From now on Forward always runs against a real Shopify store.
>
> ## Scope
>
> - [ ] Delete `StaticStorefrontDataSource` and the no-credential adapter selection. A missing or partial Shopify environment fails at startup with a sanitized configuration error.
> - [ ] Keep fixtures only as test data. No runtime code imports `src/lib/storefront/fixtures/`.
> - [ ] Remove the browser-local demo cart (`src/lib/demo-cart/`) and `getDemoCartSeed`.
> - [ ] Move the theme-owned Search and utility links (Account, Cart) and the theme content (announcement, footer tagline, images) into Weaverse theme settings instead of fixtures.
> - [ ] Drop `verify:static` and `test:browser:static`. Make `build`, `check:routes`, `smoke:routes` and previews run with credentials.
> - [ ] Update the mode-selection rule in `AGENTS.md`, and retire the `2026-08-05--static-demo-productionization` spec.
>
> ## Done when
>
> - The app cannot start without a complete Shopify environment.
> - No runtime code path reads a fixture.
> - `bun run check`, `smoke:routes`, `verify:live` and `test:browser` pass against the live store.
> - `AGENTS.md` and the specs no longer describe a static mode.
>
> Follow-up to #79. Approved by Leo.

## Summary

Forward stops shipping a second, invented catalog: without a complete Shopify
environment the app refuses to start, and no runtime code reads a fixture.
Theme-owned navigation and copy move into Weaverse theme settings, and the
browser-local demo cart goes with the static adapter.
