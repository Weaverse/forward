# Feature: Public AGENTS.md, LICENSE and version 1.0.0

| Field            | Value                                                                    |
| ---------------- | ------------------------------------------------------------------------ |
| **Status**       | in-progress                                                              |
| **Owner**        | @hta218                                                                  |
| **Issue**        | [#103](https://github.com/Weaverse/forward/issues/103), part of [Weaverse/weaverse#541](https://github.com/Weaverse/weaverse/issues/541) |
| **Branch**       | `chore/public-agents-license-1-0`                                        |
| **Created**      | 2026-10-15                                                               |
| **Last Updated** | 2026-10-15                                                               |

## Original Prompt

> AGENTS.md and LICENSE: fix them in the Forward repo, in parallel. Versioning: still do it (Forward 1.0.0, semver tags, GitHub Releases).

Context: `@weaverse/cli create --template forward` (Weaverse/weaverse#541) scaffolds Forward for customers from the `main` zip and removes `.weaverse/` and `.github/`.

## Summary

The root `AGENTS.md` becomes owner-neutral guidance for anyone building on Forward; Weaverse-internal rules (named approvals, the Pilot policy, internal spec paths, store-operation approvals, the rollback bundle) move to `.weaverse/AGENTS.md`, which scaffolded copies do not receive. Forward ships Pilot's MIT license as `LICENSE.md` and is versioned `1.0.0`, released as semver tags with GitHub Releases.
