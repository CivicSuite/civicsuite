# Audit Lite - Stage 3A Host Ollama Tags Timeout
**Date:** 2026-06-06
**Scope:** Reviewed the Stage 3A installer fix that responds to `TESTER-RESULT-039.md` by catching host-Ollama `/api/tags` startup probe timeouts and letting the bounded startup loop retry.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this slice to the tester. The isolated host-Ollama server did start, but the first 3-second probe raised an uncaught timeout; this fix captures that as failed startup evidence and continues the bounded wait.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings
None.

## What's working
- Correctness: `scripts/run-clerk-core-installer.py:514` now catches `TimeoutError` and socket timeouts from `/api/tags` and returns a lifecycle-safe failed probe record.
- Runtime behavior: `ensure_host_ollama_server` can now continue polling until the isolated server becomes ready instead of aborting readiness before checks are appended.
- Tests: `tests/test_stage2_live_install_blockers.py` proves timeout capture and retry-to-success behavior.
- Verification: `python -m pytest tests\test_stage2_live_install_blockers.py -q` passed 51/51; `python scripts\verify-installer-plan.py` and `python scripts\verify-suite-state.py --remote-only` passed.

## Escalation recommendation
No escalation needed for this slice. The tester should rerun directive 040 on isolated port `11435` and report whether readiness reaches actual model-load attempts.
