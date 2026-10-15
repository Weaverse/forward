# Plan: Import Weaverse APIs from @weaverse/next only

## Change

- 71 source files import `createSchema`, `IMAGES_PLACEHOLDERS`, `SchemaType` and `InspectorGroup` from `@weaverse/next` instead of `@weaverse/schema`. `@weaverse/next` re-exports the whole `@weaverse/schema` surface.
- `biome.json` `noRestrictedImports` rejects `@weaverse/schema`, `@weaverse/react` and `@weaverse/core`.
- `src/app/[locale]/layout.tsx` renders `WeaverseNextStudioConnect` directly; `src/lib/weaverse/studio-connect.tsx` is deleted. 1.0.1 ships the component under its own `'use client'` boundary, so the wrapper no longer earns its place.
- `src/lib/weaverse/root.tsx` and `page.tsx` stay client modules: the root imports the theme schema (which can hold functions) and renders `PageWidthStyle` with a hook, and the page boundary ships the client registry.
- `@weaverse/next` `1.0.0` → `1.0.1` (exact pin), published 2026-10-15.

## Ordering

This branch requires 1.0.1: on 1.0.0, the schema files imported by the server registry fail the build. It merges after the SDK release.

## Verification

- With the 1.0.1 build overlaid on `node_modules/@weaverse/next`: `bun run check` passes (372 node + 218 DOM tests, build, theme, routes) and `smoke:routes` passes 45 checks against the production Weaverse project.
- On the published 1.0.1: `bun install --frozen-lockfile`, `bun run check` (372 node + 218 DOM tests, build, theme, routes) and `smoke:routes` (45 checks) pass.

## Files touched

| File | Change |
| --- | --- |
| `src/**` (71 files) | `@weaverse/schema` → `@weaverse/next` |
| `biome.json` | Restricted Weaverse imports |
| `src/app/[locale]/layout.tsx` | `WeaverseNextStudioConnect` directly |
| `src/lib/weaverse/studio-connect.tsx` | Deleted |
| `tests/weaverse-registry.test.ts` | Layout assertion |
| `AGENTS.md` | Weaverse import rule |
| `package.json`, `bun.lock` | `@weaverse/next` 1.0.1 |
| `.weaverse/specs/2026-10-14--weaverse-next-imports/` | This spec |
