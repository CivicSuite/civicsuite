# Audit Lite - Stage 0 Recovery Baseline

**Date:** 2026-05-30
**Scope:** Recovery baseline slice for CivicSuite city-core after the deleted `C:\dev\Claude` workspace, including the tracked recovery document, pre-push hook installer, and restored CivicCode post-PR-#76 lockstep source pin.
**Reviewer:** Codex (audit-lite)

## TL;DR

Ship this slice. The lite pass found four Major recovery gaps: a fresh clone had no active pre-push hook, the first hook installer used unavailable `pwsh`, the generated hook initially had a UTF-8 BOM that Git could not spawn, and `verify-suite-state.py --remote-only` exposed the lost CivicCode post-PR-#76 source pin. The slice now fixes those with tracked hook source, a Windows-compatible ASCII hook installer, a local installed hook, and restored CivicCode lockstep truth files.

## Severity rollup

- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

No open findings after the second pass.

Resolved during this audit:

### STAGE0-LITE-001 Major: Fresh recovery clone did not have an active pre-push hook

**Dimension:** Tests / Runtime / Process
**Evidence:** Before the fix, `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\.git\hooks\` contained only Git sample hooks, including `pre-push.sample`; no active `pre-push` hook existed.
**Why it matters:** Scott's stage process requires every slice push to be gated. Without an installed hook, Stage 0 would repeat the exact durability failure the recovery process is meant to prevent.
**Fix path:** Added `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\hooks\pre-push.ps1`, added `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\install-git-hooks.ps1`, installed the local hook at `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\.git\hooks\pre-push`, and documented the hook paths in `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\process\city-core-recovery-baseline-2026-05-30.md`.
**Blast radius:** Future recovered or fresh clones must run `scripts\install-git-hooks.ps1`; the tracked source makes the hook reconstructable even though `.git\hooks` is not tracked by Git.

### STAGE0-LITE-002 Major: Hook installer used `pwsh`, which is not on this host's PATH

**Dimension:** Runtime
**Evidence:** `pwsh -NoProfile -Command "$PSVersionTable.PSVersion.ToString()"` failed with `The term 'pwsh' is not recognized...`.
**Why it matters:** A pre-push hook that depends on a missing executable silently turns the new durability rule into another local-environment trap.
**Fix path:** Updated `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\install-git-hooks.ps1` so the generated hook invokes `powershell.exe`, which is available on this Windows host.
**Blast radius:** Fresh Windows clones should run the hook without installing PowerShell 7. If a future Linux checkout needs the same hook, add a platform-aware installer rather than changing this Windows recovery hook in place.

### STAGE0-LITE-003 Major: Umbrella CivicCode source pin lagged the recovered module head

**Dimension:** Correctness / Docs / Runtime
**Evidence:** `python scripts\verify-suite-state.py --remote-only` failed because `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\modules.json` pinned CivicCode to `9284fd1a0704541b3422e5dd0ba47bea3713825a` while the remote default branch and recovered local clone were at `a960bba0a2249d118b593dd61bee3a65a69a9d77`.
**Why it matters:** Pushing a recovery baseline with a known lockstep verifier failure would preserve drift instead of recovering from it. The next installer slice would build from the wrong CivicCode source.
**Fix path:** Restored the CivicCode source pin to `a960bba0a2249d118b593dd61bee3a65a69a9d77` in `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\installer\modules.json`, `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\CivicSuiteUnifiedSpec.md`, `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\release-recovery-status.md`, `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\docs\release-lockstep\downstream-pins.md`, and `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\CHANGELOG.md`.
**Blast radius:** This is a source pin recovery only; it does not change already-published CivicCode v1.0.8 release artifacts.

### STAGE0-LITE-004 Major: Generated hook used UTF-8 BOM, making Git unable to spawn it

**Dimension:** Runtime
**Evidence:** The first `git push -u origin stage-0-recovery-baseline-2026-05-30` failed with `error: cannot spawn .git/hooks/pre-push: No such file or directory`. `Format-Hex` showed bytes `239, 187, 191` before the hook shebang.
**Why it matters:** A pre-push gate that prevents all pushes because Git cannot execute it is still a broken gate.
**Fix path:** Updated `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\scripts\install-git-hooks.ps1` to write the generated `.git\hooks\pre-push` file with ASCII encoding.
**Blast radius:** Recovered and fresh Windows clones get a spawnable hook file when they run the installer.

## What's working

- The recovery baseline document captures the recovered source paths, active workspace paths, repo heads, lost uncommitted files, surviving evidence, and the new nine-stage durability process.
- The hook installer makes the local `.git\hooks\pre-push` file reproducible from tracked source without a UTF-8 BOM.
- The pre-push hook blocks direct pushes from `main` or `master`, blocks pushes with uncommitted changes, verifies a full 40-character HEAD SHA, and requires the Stage 0 recovery baseline document on Stage 0 branches.
- The lockstep truth files now point the city-core CivicCode source pin at the recovered post-PR-#76 default-branch head.

## Watch items

- The Stage 0 hook is deliberately minimal. Later stages should expand the hook only when the check is deterministic enough to run before every push.
- The deleted implementation patch is reconstructable from memory and surviving live evidence, but it is not restored as editable code. Stage 1 must rebuild it in small pushed slices.

## Escalation recommendation

No escalation needed for this slice. Continue to Stage 0 commit/push, then run audit-full on the pushed branch as the stage-level gate.
