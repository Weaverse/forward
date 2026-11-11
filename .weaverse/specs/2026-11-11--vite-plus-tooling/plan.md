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
- [x] Editor setup: shared `.vscode/settings.json` + `extensions.json` (#121)

## Trials (measured, not adopted)

- **Oxlint default categories**: `correctness` adds 16 warnings, none a real
  bug (`<td>` flagged as a control, `type="module"` script flagged as sync,
  intentional latest-handler ref, route-change state resets, a Next rule in a
  test). `suspicious` is dominated by `react-in-jsx-scope` (1118, wrong for
  the automatic JSX runtime); `perf` by `no-await-in-loop` (65). Categories
  stay off.
- **`vp check` type-aware** (`lint.options.typeAware` + `typeCheck`,
  tsgolint on TS 7): no errors on 349 files in 2.1s vs `tsc` 4.5s; a probe
  file's TS2307/TS2322 were reported. Not adopted yet: TS 7 vs the pinned
  TS 5.8 and Next/Hydrogen TS plugins; revisit when Builder settles its type
  gate.
- **`vp run`**: runs package scripts, but script caching is off by default,
  so it adds nothing over `bun run` for the `check` chain.
- **`vp staged`** with `staged: { "*.{js,mjs,ts,tsx,json}": "vp check --fix" }`:
  formatted and re-staged a probe file. Not adopted: Forward has no
  pre-commit hooks today; installing one is a team decision.

## Files touched

- `vite.config.ts` (new), `package.json`, `bun.lock`, `biome.json` (removed)
- `src/lib/account/addresses.ts`, `tests/fixtures/*.ts` (suppression comments)
- `src/app/globals.css` (stale Biome comments)
- Oxfmt reformat: `src/components/{buttons,catalog-toolbar,heading,paragraph,section,section-content,subheading}/…`,
  `src/lib/weaverse/{components,section-schemas,settings/types}.ts`
- `tests/**/*.test.ts(x)`, `tests/dom/preload.ts`, `tests/dom/bun-test.d.ts` (removed)
- `AGENTS.md`, `README.md`
- `.vscode/settings.json`, `.vscode/extensions.json`, `.gitignore`
- `.weaverse/specs/2026-11-11--vite-plus-tooling/`
