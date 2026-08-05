# Claude implementation handoff — Forward static demo

Implement the approved spec at:

```text
.weaverse/specs/2026-08-05--static-demo-productionization/README.md
```

## Repository state

```text
workdir=/Users/hta218/Documents/work/worktrees/forward-static-demo
branch=feat/static-demo
base=4e9754e5e39e180a2ace5447ea0b16a68663de9f
primary checkout=/Users/hta218/Documents/work/workspace/forward
primary dev server=owned by Leo; do not stop or modify its process
```

Read `AGENTS.md`, the new spec, the existing fresh-foundation spec, and the central route contract before editing.

## Exact scope

1. Migrate npm/ESLint to Bun/Biome 2.5.7 with a committed `bun.lock`, no `package-lock.json`, accurate scripts/docs, and preserved Node runtime compatibility.
2. Build the replaceable static storefront data-source boundary described in the spec.
3. Copy only the 24 approved branded product WebPs and normalize their manifest into repository-owned public assets/data.
4. Download/optimize only the bounded rendered Unsplash source set needed by the new pages; localize every used editorial image and record source/role/license details.
5. Implement polished, responsive, interaction-complete static versions of every required route/state while preserving the route contract and real 404 behavior for unknown handles.
6. Add focused tests for data-source behavior, unknown handles, product colorway/gallery/deep-link state, search states, cart demo state, and route coverage where practical.
7. Update the spec work log and repository docs with exact results.

## Design constraints

- Use the live Advanced POC only as visual/art-direction reference: expedition field journal × refined outdoor editorial. Do not inspect or copy its source.
- Never inspect, derive from, or import Pilot.
- Use approved branded catalog assets, not stock substitutes, for products.
- Avoid generic card-grid/SaaS styling. Give home/editorial, PLP/search, PDP, and cart/account different page-surface compositions appropriate to their jobs.
- Keep polished English storefront copy.
- Static/demo account/cart/checkout behavior must be labeled honestly and make no network writes.
- Do not wire Storefront API, Hydrogen handlers, Weaverse, analytics, credentials, `.env`, deployment, or external side effects.

## Execution rules

- Work only in the isolated worktree.
- Do not modify, stop, or inspect implementation from the user's primary running server.
- Do not push, deploy, open PRs, or mutate GitHub/Shopify.
- Make logical local commits after gates pass.
- Do not report success based only on code generation: run Bun install/check/build/route/smoke gates and inspect the final status/diff.
- If broad browser QA is not available to you, leave exact local route/state notes for Hermes to verify independently.

## Required final report

Return:

- commits and exact SHA;
- files/architecture added;
- asset count and source record path;
- route/state coverage;
- exact command results;
- any failures or remaining risks;
- git status and whether anything was pushed/deployed.
