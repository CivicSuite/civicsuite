# Audit Lite - Stage 3A Docker Build Retry
**Date:** 2026-06-05
**Scope:** Reviewed the bounded Docker Compose build retry and reduced build parallelism fix for the Docker Desktop EOF/500 build failure class seen in tester result 018.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this slice to the feature branch. The installer now reduces Docker Compose build pressure with `COMPOSE_PARALLEL_LIMIT=1` and retries only known transient Docker Desktop transport failures once, preserving deterministic Dockerfile/build failures as immediate failures. No audit-lite findings remain for this slice.

## Severity Rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

None.

## What's Working
- `scripts/run-clerk-core-installer.py:73` defines a two-attempt, 15-second retry policy scoped to Docker transport failure strings from result 018, including `failed to receive status`, Docker RPC unavailable, EOF, Docker Desktop Linux engine, and 500 Internal Server Error.
- `scripts/run-clerk-core-installer.py:195` centralizes compose-build retry handling and returns both the final process result and per-attempt evidence.
- `scripts/run-clerk-core-installer.py:310` sets `COMPOSE_PARALLEL_LIMIT=1` when the operator has not already specified a value, reducing concurrent Docker build pressure without overriding an explicit environment choice.
- `scripts/run-clerk-core-installer.py:2464` preserves the existing `compose_build` step contract while adding retry evidence only when a retry occurs.
- `tests/test_stage2_live_install_blockers.py:516` proves a Docker Desktop EOF/RPC failure retries and then succeeds.
- `tests/test_stage2_live_install_blockers.py:548` proves deterministic build failures do not retry.
- `tests/test_stage2_live_install_blockers.py:565` proves the installer subprocess environment lowers Compose parallelism by default.

## Verification
- Stage2 blocker suite: `35 passed in 3.62s`.
- Broader installer-focused suite: `55 passed in 61.19s`.
- Diff review confirmed the retry helper does not alter compose-up retry semantics or workflow proof gates.

## Escalation Recommendation
No escalation needed for this slice. The next tester re-gate should confirm whether the Docker Desktop EOF/500 class is resolved on the Windows tester; if it still fails, the result should retain per-attempt build evidence for diagnosis.
