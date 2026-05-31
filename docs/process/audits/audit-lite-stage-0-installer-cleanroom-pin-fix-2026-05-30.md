# Audit Lite - Stage 0 Installer-Cleanroom Pin Fix

**Date:** 2026-05-30
**Scope:** CI fix slice for `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\.github\workflows\installer-cleanroom.yml`, aligning CivicCode checkout refs with the restored post-PR-#76 source pin.
**Reviewer:** Codex (audit-lite)

## TL;DR

Ship this slice after workflow-cost checks pass. PR #186 exposed a CI drift gap: `installer-cleanroom.yml` still checked out CivicCode at post-PR-#75 head `9284fd1a0704541b3422e5dd0ba47bea3713825a` even though Stage 0 restored the source-of-truth pin to post-PR-#76 head `a960bba0a2249d118b593dd61bee3a65a69a9d77`. The workflow now uses the same CivicCode head as `installer\modules.json` and the lockstep truth files.

## Severity rollup

- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

No open findings after the second pass.

Resolved during this audit:

### STAGE0-CI-LITE-001 Major: Installer-cleanroom workflow used stale CivicCode checkout ref

**Dimension:** Correctness / Runtime / Tests
**Evidence:** PR #186 run `26694318903` had a failed Windows archive readiness job during artifact generation, and static inspection showed `C:\dev\Claude\CivicSuite-live-install-fix-2026-05-29\.github\workflows\installer-cleanroom.yml` still checked out `CivicSuite/civiccode` at `9284fd1a0704541b3422e5dd0ba47bea3713825a` in both package-readiness and lifecycle jobs.
**Why it matters:** The workflow was validating a different CivicCode source tree than the restored city-core source pin, so CI could fail or pass against the wrong product assembly.
**Fix path:** Updated both CivicCode checkout refs in `installer-cleanroom.yml` to `a960bba0a2249d118b593dd61bee3a65a69a9d77`.
**Blast radius:** This touches CI packaging and lifecycle checks only; it does not mutate already-published CivicCode release artifacts.

## What's working

- The CI failure surfaced before merge, which means the release-tag label did its job.
- The fix is narrow: one workflow file, two refs, both matching the current CivicCode default branch and restored source pin.

## Watch items

- Workflow-cost discipline applies because this slice edits `.github\workflows\installer-cleanroom.yml`; keep the workflow-cost ledger with the run evidence.

## Escalation recommendation

No escalation needed. Continue with workflow-cost checks, commit, push, and re-run PR #186 checks.

