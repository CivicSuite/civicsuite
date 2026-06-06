# Audit Lite - Python service pip transient retry

**Date:** 2026-06-06
**Scope:** Review of the install retry fix after `TESTER-RESULT-052.md` failed on a GitHub HTTP 504 while pip installed a module dependency wheel.
**Reviewer:** Codex (audit-lite)

## TL;DR

Ship this fix. Editable Python service installs now retry bounded transient pip/network failures such as HTTP 504 gateway timeouts, while deterministic dependency failures still fail immediately. This addresses the tester's `civicplan` install failure without hiding real dependency errors.

## Severity rollup

- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

No findings.

## What's working

- `scripts/run-clerk-core-installer.py` now wraps `pip install -e <module>` in a bounded transient retry helper.
- Retry markers are limited to transient network/server symptoms: HTTP 500/502/503/504, gateway timeout, connection reset/aborted, read timeout, and temporary unavailability.
- The install lifecycle records per-attempt evidence under `python_service_install_editable.attempts`.
- Non-transient pip failures remain single-attempt failures.

## Verification

- `python -m pytest tests\test_stage2_live_install_blockers.py -q -k "python_service_install"`: 2 passed
- `python -m pytest tests\test_stage2_live_install_blockers.py -q`: 64 passed
- `python -m ruff check scripts\run-clerk-core-installer.py tests\test_stage2_live_install_blockers.py`: passed
- `python scripts\verify-suite-state.py --remote-only`: passed
- `python scripts\verify-installer-plan.py`: passed

## Watch items

- The next tester run must prove the retry path against the real Windows install path if GitHub emits another transient 5xx.
- If GitHub stays unavailable for all retry attempts, the install should still fail with the attempt evidence; that is intentional.

## Escalation recommendation

No escalation needed. This is a scoped resilience fix with behavioral tests and installer verification.
