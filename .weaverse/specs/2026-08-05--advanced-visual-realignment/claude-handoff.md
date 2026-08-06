# Claude implementation handoff — superseded

The original `feat/advanced-visual-realignment` handoff and the later Home-only screenshot correction are complete/rejected. Their screenshot-first instructions are invalid for the next pass.

For the next implementation, read and follow:

```text
.weaverse/specs/2026-08-05--advanced-visual-realignment/full-canonical-source-port-handoff.md
```

That handoff pins:

- Forward base `main@cf289917091e7a1aeb54d8521402a4b58ab50717`;
- canonical POC source `Weaverse/weaverse-hydrogen-next-poc@7e416404b5c9d7d8b9fed27bed2b897c36c9b7a4`;
- every canonical route render function and effective CSS range;
- full Forward route mapping, normalized data, and interaction seams;
- per-route overlay/diff verification.

Do not reuse the old branch, removed worktree, Home-only scope, or screenshot-reconstruction method. Do not inspect/copy Pilot. Port the owned canonical POC DOM/CSS source directly across the shared shell and every rendered Next.js route as specified.
