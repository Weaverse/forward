# Work Logs

## 2026-10-14 — @hta218

- Moved every Weaverse import to `@weaverse/next`, added the Biome restriction, dropped the `StudioConnect` wrapper.
- Verified on the 1.0.1 build overlaid on `node_modules`: `check` passes; `smoke:routes` passes 45 checks with the production Weaverse project and default host. The local `.env.local` points `WEAVERSE_HOST` at a personal dev Studio whose project answers 404, which fails every route locally regardless of this change.
- Pending: bump to the published 1.0.1 and rerun the gates.
