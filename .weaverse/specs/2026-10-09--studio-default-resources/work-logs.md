# Work Logs

## 2026-10-09 — @hta218

- Traced the page selector "Not found" for default product/collection/page to the blanked public Storefront token.
- Stopped suppressing it and recorded the approval in AGENTS.md.
- Retest still failed: Studio's theme store had no `publicEnv` at all. The root layout's `loadThemeSettings` never runs in design mode (no search params in a layout), so the SDK never attached it. The layout now passes `weaversePublicEnv(process.env)`.
- Retest passed: Studio's page selector opens the default product, collection and page.
