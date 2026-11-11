# Feature: Move Forward to @weaverse/hydrogen/next

| Field            | Value                                                                    |
| ---------------- | ------------------------------------------------------------------------ |
| **Status**       | in-progress                                                              |
| **Owner**        | @hta218                                                                  |
| **Issue**        | [#117](https://github.com/Weaverse/forward/issues/117), part of [Weaverse/weaverse#543](https://github.com/Weaverse/weaverse/issues/543) |
| **Branch**       | `update/117-weaverse-hydrogen-next`                                      |
| **Created**      | 2026-11-11                                                               |
| **Last Updated** | 2026-11-11                                                               |

## Original Prompt

> Implement Weaverse/forward#117 ("Move Forward to @weaverse/hydrogen/next") in the Forward theme (Next.js 16 + Shopify Hydrogen 2026.10.2 + Weaverse) and open a PR to `main`.

Issue #117:

> Weaverse SDK 6 ships the Next.js adapter as entry points of one package: `@weaverse/hydrogen/next` and `@weaverse/hydrogen/next/server` (Weaverse/weaverse#547). `@weaverse/next` is planned to become a deprecated package that only re-exports them (Weaverse/weaverse#581).
>
> Forward still depends on `@weaverse/next` 1.0.1 directly and imports from `@weaverse/next` (98 imports) and `@weaverse/next/server` (3). Move it to the 6.x entries:
>
> - Depend on `@weaverse/hydrogen` 6.1.1 instead of `@weaverse/next` (it pins its own `@weaverse/next` and `@weaverse/react`, so neither is listed directly)
> - Rewrite imports with `npx @weaverse/cli migrate v6` (`@weaverse/next` → `@weaverse/hydrogen/next`, `@weaverse/next/server` → `@weaverse/hydrogen/next/server`) and apply the v6 type renames
> - Update docs, agent instructions and tests that name `@weaverse/next`
> - Typecheck, tests, build and the Weaverse Studio preview still pass

## Summary

Forward depends on `@weaverse/hydrogen` 6.1.1 alone and imports every Weaverse API from `@weaverse/hydrogen/next` and `@weaverse/hydrogen/next/server`. Biome now also rejects direct `@weaverse/next` and `@weaverse/hydrogen/react-router` imports.
