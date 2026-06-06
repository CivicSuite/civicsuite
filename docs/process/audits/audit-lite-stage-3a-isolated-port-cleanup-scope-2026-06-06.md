# Audit Lite - Stage 3A Isolated Port Cleanup Scope
**Date:** 2026-06-06
**Scope:** Reviewed the Stage 3A installer fix that responds to `TESTER-RESULT-040.md` by allowing isolated host-Ollama ports to continue probing when stale default-port workers cannot be terminated.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this slice to the tester. The isolated server on `11435` started successfully; stale default-port worker cleanup should be recorded but not block isolated-port model probes.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings
None.

## What's working
- Correctness: `scripts/run-clerk-core-installer.py:747` keeps access-denied cleanup as fatal on default port `11434`, but lets isolated-port runs continue to the actual model-load probe.
- Evidence: the initial cleanup result is still recorded in lifecycle evidence, so default-port contamination is visible even when it is not blocking isolated-port readiness.
- Tests: `tests/test_stage2_live_install_blockers.py` proves default-port access-denied fail-fast remains and isolated-port access-denied cleanup still reaches `host_ollama_generate`.
- Verification: `python -m pytest tests\test_stage2_live_install_blockers.py -q` passed 52/52; `python scripts\verify-installer-plan.py` and `python scripts\verify-suite-state.py --remote-only` passed.

## Escalation recommendation
No escalation needed for this slice. The tester should rerun isolated port `11435` and confirm the ladder reaches actual model-load attempts.
