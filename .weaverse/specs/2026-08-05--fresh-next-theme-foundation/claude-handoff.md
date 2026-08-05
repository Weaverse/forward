# Claude implementation handoff

## Repository state

- Repository: `/Users/hta218/Documents/work/workspace/forward`
- Branch: `feat/fresh-next-theme-foundation`
- Base/root commit: `92c2196ff2daa19a6995829ca4e346e2fb7eb676`
- Shared contract: `0.3-draft`
- The repository intentionally contains only the fresh reset plus this spec commit.

## Task

Implement `.weaverse/specs/2026-08-05--fresh-next-theme-foundation/README.md` completely.

## Required constraints

- Read `AGENTS.md` and the spec first.
- Do not inspect or read Pilot. Do not copy another storefront implementation.
- Build a fresh Next.js App Router application using current pinned versions from the spec.
- Do not use any live credential or add `.env` values.
- Do not deploy, push, merge, force-push, create/edit issues, or open/edit PRs.
- Do not commit; Hermes will review and create logical commits.
- Preserve the repo-local spec and append a concise implementation work log with files changed and commands actually run.
- Keep the implementation within the foundation slice; do not invent live commerce integration.

## Acceptance gates

Run and report actual results for:

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run check:routes
npm run smoke:routes
```

If a command cannot pass, leave the concrete failure in the work log. Do not claim success without execution.

## Expected output

- Working code in the current working tree.
- `package-lock.json`.
- Branded responsive route shell.
- Central route contract.
- Build-manifest checker.
- Production HTTP route smoke.
- Focused tests.
- Updated README.
- Appended spec work log.
