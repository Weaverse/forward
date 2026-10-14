# Feature: Import Weaverse APIs from @weaverse/next only

| Field            | Value                                                                    |
| ---------------- | ------------------------------------------------------------------------ |
| **Status**       | in-progress                                                              |
| **Owner**        | @hta218                                                                  |
| **Issue**        | [#100](https://github.com/Weaverse/forward/issues/100), part of [Weaverse/weaverse#542](https://github.com/Weaverse/weaverse/issues/542) |
| **Branch**       | `fix/weaverse-next-imports`                                              |
| **Created**      | 2026-10-14                                                               |
| **Last Updated** | 2026-10-14                                                               |

## Original Prompt

> vậy thì cần thêm 2 child issue cho issue này để sửa forward và docs nhé, sau đó /goal là chú làm cả 3 luôn cho a, xong thì /commit in multi commits + open PR nhé. A sẽ review mà merge lần lượt

Context: Weaverse/weaverse#542. `@weaverse/next@1.0.0` lost its `'use client'` directives, so any value import from it in server code failed the build. Forward escaped only by importing `createSchema` from `@weaverse/schema`, which is not one of its dependencies.

## Summary

Forward imports every Weaverse API from `@weaverse/next` on 1.0.1, the release that fixes Weaverse/weaverse#542, and Biome rejects imports of the undeclared `@weaverse/schema`, `@weaverse/react` and `@weaverse/core`. The app-owned `StudioConnect` wrapper is gone; the layout renders `WeaverseNextStudioConnect` directly.
