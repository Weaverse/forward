# Plan: Adopt @weaverse/next 1.0.0

## Change

- `@weaverse/next` `0.1.0-alpha.20` → `1.0.0` (exact pin). The code is identical to alpha.20 and its dependencies are unchanged (`@weaverse/react` 5.22.1, `@weaverse/schema` 0.18.0), so no source change is needed.
- `AGENTS.md`: the exact-version rule stays; its reason is no longer "the package is still a prerelease" but that every upgrade is a reviewed change.
- `.env.example`: drop the stale dist-tag note (`latest` = alpha.0, `alpha` = alpha.16).

## Not in scope

- Weaverse/weaverse#540 (`publicEnv` outside design mode) is deferred, so `weaversePublicEnv` in the root layout stays.

## Verification

- `bun run check`, then `smoke:routes`.
- Production: after merge, the Vercel deployment serves Forward on `1.0.0`, and Studio still connects, edits and navigates.

## Files touched

| File | Change |
| --- | --- |
| `package.json`, `bun.lock` | `@weaverse/next` 1.0.0 |
| `AGENTS.md` | Exact-version rule reason |
| `.env.example` | Stale dist-tag note removed |
| `.weaverse/specs/2026-10-09--weaverse-next-1-0/` | This spec |
