# Plan: Vite+ tooling for Forward

## Context

Builder now runs on Vite+ 1.3.0 (`vite-plus`, the `vp` CLI): Oxlint, Oxfmt and
Vitest configured in `vite.config.ts`. Vite+ has no official Next.js template
(voidzero-dev/vite-plus#998) and `vp migrate` does not convert Biome, so the
port is manual. `vp dev` / `vp build` are Vite's commands and do not apply to a
Next.js app.

## Decisions

- **Version**: `vite-plus` 1.3.0 and the `vite` →
  `@voidzero-dev/vite-plus-core@1.3.0` alias, the same as Builder. Bun needs
  the alias as a direct dev dependency (no catalog outside a workspace).
- **Stays**: `next dev` / `next build` / `next start`, Bun as package manager
  and script runner, `tsc --noEmit` (Next/Hydrogen TS plugins; tsgo/tsrs not
  adopted), the `check` script chain, Playwright browser matrices.
- **Lint** (`vp lint`): category defaults off, only rules mapped from Biome
  `recommended` + `react`/`next` domains run (Builder's mapping). Errors fail,
  warnings never do. `noRestrictedImports` → `no-restricted-imports` with
  `importNames`, wrapper-file override kept. `biome-ignore` comments become
  `oxlint-disable-next-line`; CSS ones are dropped (CSS is no longer linted).
- **Format** (`vp fmt`): Oxfmt with the Biome style (double quotes,
  semicolons, `all` trailing commas, width 80, 2 spaces) and `sortImports`
  replacing organizeImports. Churn is 11 source files, all cosmetic
  (`extends` wrapping, `main-collection-list` vs `main-collection/` sort).
- **Tests** (`vp test`, Vitest 5.0.5): two projects, `node` and `dom`, so the
  node suite keeps running without DOM globals. `node:test` / `bun:test`
  imports → `vite-plus/test`; `mock.module` → `vi.mock` in the DOM setup
  file; `jest.*` timers → `vi.*`. `tests/dom/bun-test.d.ts` is removed.

## Findings during the port

- `@weaverse/next` imports extensionless `next/navigation`, which Node's
  strict ESM loader rejects (`next` has no exports map). Fixed with
  `test.server.deps.inline: [/@weaverse\//]`.
- Testing Library only advances fake timers when a global `jest` exists (Bun
  provided one); the DOM setup file installs a minimal `jest` shim backed by
  `vi.advanceTimersByTime`.
- Oxlint `jsx-a11y/autocomplete-valid` rejects valid tokens (`given-name`,
  `family-name`); not mapped.
- `no-unused-vars` needs `ignoreRestSiblings` to match Biome.

## Verification

- [x] `vp lint` clean; restricted imports verified with a probe
      (`next/link`, `usePathname`, `useTranslation` flagged; `useRouter` not)
- [x] `vp fmt --check` clean
- [x] `vp test`: 38 files, 590 tests (= Bun's 372 node + 218 DOM)
- [x] `tsc --noEmit`
- [x] `bun run check` (typecheck → lint → format → test → GraphQL → `next build` → theme → routes)
- [ ] Editor setup: Oxc VS Code extension instead of Biome (not in repo)

## Not done / follow-ups

- `vp check` with type-aware lint (tsgolint, TS 7) — not adopted while
  `tsc` + Next's TS plugin is the type gate.
- `vp staged` / pre-commit hooks — Forward has none today.
- `vp run` tasks for the `check` chain — the Bun script chain works as is.

## Files touched

- `vite.config.ts` (new), `package.json`, `bun.lock`, `biome.json` (removed)
- `src/lib/account/addresses.ts`, `tests/fixtures/*.ts` (suppression comments)
- `src/app/globals.css` (stale Biome comments)
- Oxfmt reformat: `src/components/{buttons,catalog-toolbar,heading,paragraph,section,section-content,subheading}/…`,
  `src/lib/weaverse/{components,section-schemas,settings/types}.ts`
- `tests/**/*.test.ts(x)`, `tests/dom/preload.ts`, `tests/dom/bun-test.d.ts` (removed)
- `AGENTS.md`, `README.md`
- `.weaverse/specs/2026-11-11--vite-plus-tooling/`
