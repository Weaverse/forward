# Verification scripts

These scripts verify the production build, route contract, browser behavior,
and optional live Shopify integration. Run them through the matching Bun
commands in `package.json`.

| Script | Command | Purpose |
| --- | --- | --- |
| `check-tailwind-theme.mts` | `bun run check:theme` | Confirms the built CSS contains every source theme token and representative semantic utilities. Requires a production build. |
| `check-routes.mts` | `bun run check:routes` | Checks the Next.js build manifests for every required route and permanent redirect. Requires a production build. |
| `smoke-routes.mts` | `bun run smoke:routes` | Starts the production server, checks routes and redirects over HTTP, then stops the server. |
| `env-matrix.mts` | Used by the matrix runners | Creates the controlled live child environments without logging credential values. |
| `verify-matrix.mts` | `bun run verify:live` | Coordinates clean builds, route checks, and HTTP smoke checks for both account modes. |
| `browser-matrix.mts` | `bun run test:browser` | Builds each account mode separately and runs Playwright on desktop, short-desktop, and mobile projects. |
| `verify-shopify.mts` | `bun run verify:shopify` | Performs opt-in, read-only checks against the live Shopify clients and normalized storefront data source. |

## Credential modes

- `live-account-disabled`: requires live catalog credentials and clears account credentials.
- `live-account-enabled`: requires complete live catalog and account credentials.

Both modes require the Shopify catalog credentials; there is no credential-free
mode. Missing credentials fail verification.
The scripts never print credential values. Do not commit `.env` files.

## Normal local verification

`bun run check` covers the production build, Tailwind theme, and route-manifest
checks. Run `bun run smoke:routes` afterward to verify the built application over
real HTTP. Live and browser matrices are explicit, slower gates for their
respective environments.

