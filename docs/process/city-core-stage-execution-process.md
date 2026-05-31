# City-Core Stage Execution Process

## Purpose

This process keeps city-core release work recoverable from GitHub. Stage work must not depend on unpushed local files, local memory, or temporary installer output.

## Stage Branches

Each stage uses a dedicated branch cut from the current default branch.

Branch naming:

```text
stage-<number>-<short-purpose>-<YYYY-MM-DD>
```

Each stage ends with:

- a merged PR into the default branch;
- a pushed stage tag on the merge commit;
- a bridge closeout message;
- a tracked stage ledger in `docs/process/stages/`.

## Slice Loop

Each stage is split into slices small enough to audit and push before moving on.

For every slice:

1. Make the scoped change.
2. Run `audit-lite` on the slice diff.
3. Fix every audit-lite finding.
4. Re-run `audit-lite`.
5. Repeat until the slice has zero open Blocker, Critical, Major, Minor, and Nit findings, or a genuine human-required blocker.
6. Run the relevant local checks.
7. Commit with a Conventional Commits subject and DCO Signed-off-by trailer.
8. Push the branch before starting the next slice.

## Stage Closeout Loop

After the last slice:

1. Push the final branch head.
2. Run `audit-full` on the pushed branch.
3. Fix every audit-full finding.
4. Re-run `audit-full`.
5. Repeat until the stage has zero open Blocker, Critical, Major, Minor, and Nit findings, or a genuine human-required blocker.
6. Open or update the stage PR.
7. Wait for required CI checks to pass.
8. Merge the PR.
9. Push a stage tag on the merge commit.
10. Write bridge closeout state.
11. Report to Scott.

## Recovery Rule

If the machine reboots, the checkout is deleted, or a Codex session is compacted, resume from the last pushed branch head and the tracked stage ledger. Do not rely on untracked `.agent-runs/` evidence as the only copy of any stage-critical fact.

## Evidence Rule

Each slice records the following in the stage ledger:

- slice name;
- changed files with full drive paths;
- audit-lite report path;
- local checks run;
- pushed commit SHA, recorded in the next slice or the stage closeout so the ledger does not require a self-referential commit hash;
- open findings, if any.

Each stage records:

- audit-full package path;
- PR URL;
- merge commit;
- tag;
- CI checks and run IDs when available.
