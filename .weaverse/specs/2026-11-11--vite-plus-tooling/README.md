# Feature: Move lint, format and tests to Vite+ (vp)

| Field            | Value                                                  |
| ---------------- | ------------------------------------------------------ |
| **Status**       | completed                                              |
| **Owner**        | @hta218                                                |
| **Issue**        | [#119](https://github.com/Weaverse/forward/issues/119) |
| **Branch**       | `update/119-vite-plus-tooling`                         |
| **Created**      | 2026-11-11                                             |
| **Last Updated** | 2026-11-11                                             |

## Original Prompt

> We're switching to the vite-plus stack (check builder) — see what Forward can move over.

> Search the internet once for how it works in a Next project and what the vite config looks like there; read the vite-plus docs too.

> Use /create-task to create an issue in the forward repo first, then check out a new worktree and do the work. Note down anything that still needs testing; do the parts that are certain first. When done, /commit in multiple commits and open a PR.

## Summary

Forward's lint, format and test tooling moves from Biome + `bun test` to Vite+
(`vp lint` / `vp fmt` / `vp test`), matching Builder. `vite.config.ts` is
tooling-only: Next.js still owns dev and build, Bun stays the package manager,
and type checking stays on `tsc --noEmit`.
