# Plan: Move Forward to @weaverse/hydrogen/next

## Approach

- Replace the `@weaverse/next` 1.0.1 dependency with `@weaverse/hydrogen` 6.1.1 (exact pin). It pins `@weaverse/next` 1.1.2, `@weaverse/react` 6.1.1 and `@weaverse/schema` 0.20.0, and peers on `@shopify/hydrogen >=2026.10.0` (Forward has 2026.10.2). It also brings `react-router` 7 as a dependency; Forward never imports it.
- Run `npx @weaverse/cli@5.9.0 migrate v6`. It rewrites 98 `@weaverse/next` and 3 `@weaverse/next/server` imports in `src/` plus two in `tests/`. Forward uses no renamed `Hydrogen*` type, so there are no type renames. Biome re-sorts two import blocks the rewrite reordered.
- Every name Forward imports is re-exported by `@weaverse/hydrogen/next` (Next adapter names by name, plus `@weaverse/hydrogen` core and `/react`, which carry `@weaverse/schema`) and `@weaverse/hydrogen/next/server`.
- Manual follow-ups the codemod does not cover:
  - `tests/weaverse-env.test.ts` read `node_modules/@weaverse/next/dist/server.mjs`, which now exists only by hoisting. It resolves the bundle through `@weaverse/hydrogen` instead.
  - `biome.json`: point the `@weaverse/schema|react|core` messages and the `useTranslation` restriction at `@weaverse/hydrogen/next`; reject `@weaverse/next`, `@weaverse/next/server` and `@weaverse/hydrogen/react-router`.
  - `AGENTS.md`, `.env.example` and two source comments name the new entries.
- Historical specs under `.weaverse/specs/` keep their `@weaverse/next` wording: they record what was true then.

## SDK changes between @weaverse/next 1.0.1 and 1.1.2

- 1.0.2: `@weaverse/schema` 0.20.0; `WeaverseNextThemeSchema` accepts an optional `outline`. Additive.
- 1.1.0: built with `vp pack`; the client root exports live in a separate `client-boundary` file under a `'use client'` banner (the #542 fix kept). `next` peer becomes optional. Moves to `@weaverse/react` 6.0.0.
- 1.1.1: pins `@weaverse/react` 6.1.0. No code change.
- 1.1.2: pins `@weaverse/react` 6.1.1. The release's `fetchWithCache` fix is in `@weaverse/hydrogen`'s `WeaverseClient`, which Forward does not use.
- `@weaverse/react` 6.x adds `StudioSelectionStore`/`useStudioSelection`; `@weaverse/core` 6.x adds an optional `focalPoint` to `WeaverseImage`. Both additive.
- No Forward source change is required.

## Verification

`bun run check` (typecheck, lint, format:check, test, check:graphql, build, check:theme, check:routes).

## Files touched

| Path | Change |
| ---- | ------ |
| `package.json`, `bun.lock` | `@weaverse/next` 1.0.1 → `@weaverse/hydrogen` 6.1.1 |
| `src/**` (97 files), `tests/dom/translation.test.tsx`, `tests/weaverse-request.test.ts` | Imports → `@weaverse/hydrogen/next[/server]` |
| `tests/weaverse-env.test.ts` | Resolve the SDK server bundle through `@weaverse/hydrogen` |
| `src/lib/weaverse/components.ts`, `src/lib/weaverse/env.ts` | Comments |
| `biome.json` | Import restrictions |
| `AGENTS.md`, `.env.example` | Dependency wording |
| `.weaverse/specs/2026-11-11--weaverse-hydrogen-next/` | This spec |
