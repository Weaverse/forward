# Claude implementation handoff

Read in order:

1. `/Users/hta218/Documents/work/worktrees/forward-advanced-realignment/AGENTS.md`
2. `.weaverse/specs/2026-08-05--advanced-visual-realignment/README.md`
3. `.weaverse/specs/2026-08-05--static-demo-productionization/README.md`
4. Existing `src/lib/storefront/**`, `src/lib/routes/**`, and `src/lib/demo-cart/**` contracts.
5. Current pages/components/styles.

Canonical reference:

`https://weaverse-hydrogen-next-poc.vercel.app/theme-preview-advanced/index.html#/home`

Use its page picker to inspect all listed reference routes. Treat rendered visual behavior—not source code—as canonical. Do not inspect/copy Pilot and do not copy the POC implementation wholesale.

Durable reference/current evidence is available under:

`/Users/hta218/Documents/work/artifacts/forward-advanced-realignment-reference-2026-08-05/`

It includes full-page `reference-{home,shop,pdp}-{desktop,mobile}.png`, matching current-state captures, and desktop/mobile metrics JSON. Read the reference screenshots directly before implementing each corresponding route.

Task:

1. Use `/feature-plan` or equivalent plan-first reasoning to write `plan.md` in this spec folder.
2. Implement the approved visual realignment in this worktree.
3. Preserve the technical substrate and all route/data/cart contracts.
4. Run focused checks while iterating; leave full final verification to Hermes after implementation stabilizes.
5. Update `work-logs.md` with files changed, design mapping, commands/results, known gaps, and any manual QA still required.

Constraints:

- Branch: `feat/advanced-visual-realignment` from `main@962a008`.
- Do not push, open/merge PRs, or deploy.
- Do not add credentials or live Shopify/Weaverse runtime.
- Do not modify the primary checkout or port `3333`.
- Do not replace approved local media with unrelated POC media.
- Do not weaken route, sanitization, or test contracts to make the UI easier.
- Prefer Server Components; use Client Components only for interaction.
- Ensure accessible mobile navigation, controls, focus states, and reduced motion.
