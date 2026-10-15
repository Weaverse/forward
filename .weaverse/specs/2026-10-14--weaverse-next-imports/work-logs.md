# Work Logs

## 2026-10-14 — @hta218

- Moved every Weaverse import to `@weaverse/next`, added the Biome restriction, dropped the `StudioConnect` wrapper.
- Verified on the 1.0.1 build overlaid on `node_modules`: `check` passes; `smoke:routes` passes 45 checks with the production Weaverse project and default host. The local `.env.local` points `WEAVERSE_HOST` at a personal dev Studio whose project answers 404, which fails every route locally regardless of this change.
- Pending: bump to the published 1.0.1 and rerun the gates.

## 2026-10-15 — @hta218

- `@weaverse/next` 1.0.1 published (Weaverse/weaverse#548). Bumped the exact pin and reinstalled from the registry.
- `bun install --frozen-lockfile`, `bun run check` and `smoke:routes` (45 checks, production Weaverse project) pass.
