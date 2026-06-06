# Audit Lite - Stage 3A Host Ollama Access-Denied Fail Fast
**Date:** 2026-06-06
**Scope:** Reviewed the Stage 3A installer change that responds to `TESTER-RESULT-037.md` by failing fast when initial host-Ollama orphan cleanup cannot terminate stale `llama-server` workers due to Windows access denial.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this slice to the tester. The prior behavior kept probing through a poisoned host-Ollama runtime; the new behavior reports the real prerequisite failure before running expensive model-load attempts.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings
None.

## What's working
- Correctness: `scripts/run-clerk-core-installer.py:649` detects access-denied cleanup evidence and returns a failed model-load check without attempting the eight-profile ladder.
- UX/errors: the failure text points to the elevated Windows bootstrapper or a reboot, matching the Stage 3A product path instead of generic memory advice.
- Tests: `tests/test_stage2_live_install_blockers.py:424` proves no host-Ollama generation is attempted when stale workers cannot be terminated.
- Verification: `python -m pytest tests\test_stage2_live_install_blockers.py -q` passed 47/47; `python scripts\verify-installer-plan.py` and `python scripts\verify-suite-state.py --remote-only` passed.

## Escalation recommendation
No escalation needed for this slice. The next tester run must use an elevated Windows context or a reboot-clean host so stale model workers can be cleared.
