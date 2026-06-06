# Audit Lite - CivicGrants installer integration
**Date:** 2026-06-06
**Scope:** Umbrella installer CivicGrants source pin, local data/staff-key environment, integration-contract verification, generated installer artifacts, and regression tests.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this slice to the clean-machine gate. The umbrella installer now pins the verified CivicGrants source head, starts CivicGrants with an isolated local data directory and local staff key, verifies readiness plus four suite contracts, and includes mutation-style tests for both pass and missing-contract failure paths.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

No findings.

## What's working
- `installer/modules.json` pins CivicGrants to `fcfbe34c7b921dad44d5329397e058614c7d9ed4`, and `python scripts/verify-suite-state.py --remote-only` confirmed the commit is reachable.
- `scripts/run-clerk-core-installer.py` now sets `CIVICGRANTS_DATA_DIR` and `CIVICGRANTS_STAFF_API_KEY` for the CivicGrants service, then verifies `/api/v1/civicgrants/readiness` and `/api/v1/civicgrants/integration-contracts`.
- `tests/test_stage2_live_install_blockers.py` proves the CivicGrants verifier passes with all four contracts, fails when `audit_file_export` is missing, and injects local data/staff-key env when starting the module service.
- `python scripts/verify-installer-plan.py` passed and refreshed the generated installer artifacts.
- Regression checks passed: full `tests/test_stage2_live_install_blockers.py`, targeted CivicGrants tests, and `python -m py_compile scripts/run-clerk-core-installer.py`.

## Watch items

Clean-machine proof must still exercise the real installed service: public/staff UI routes, readiness, contracts, staff-keyed queue read, application outline, compliance calendar create/fetch, audit export, launcher, and all ten module route checks.

## Escalation recommendation

No escalation needed for this slice. The next required step is the repo-channel clean-machine tester directive.
