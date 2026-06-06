# Audit Lite - CivicProcure installer integration
**Date:** 2026-06-06
**Scope:** Umbrella installer CivicProcure source pin, local data/staff-key environment, integration-contract verification, generated installer artifacts, and regression tests.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this slice to the clean-machine gate after the active CivicGrants gate clears. The umbrella installer now pins the verified CivicProcure source head, starts CivicProcure with an isolated local data directory and local staff key, verifies readiness plus four suite contracts, and includes mutation-style tests for both pass and missing-contract failure paths.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

No findings.

## What's working
- `installer/modules.json` pins CivicProcure to `1a6f44a09d85fdd7e8153455b16c5ec4baa63311`, and `python scripts/verify-suite-state.py --remote-only` confirmed the commit is reachable.
- `scripts/run-clerk-core-installer.py` now sets `CIVICPROCURE_DATA_DIR` and `CIVICPROCURE_STAFF_API_KEY` for the CivicProcure service, then verifies `/api/v1/civicprocure/readiness` and `/api/v1/civicprocure/integration-contracts`.
- `tests/test_stage2_live_install_blockers.py` proves the CivicProcure verifier passes with all four contracts, fails when `award_packet` is missing, and injects local data/staff-key env when starting the module service.
- `python scripts/verify-installer-plan.py` passed and refreshed the generated installer artifacts.
- Regression checks passed: full `tests/test_stage2_live_install_blockers.py`, targeted CivicProcure tests, and `python -m py_compile scripts/run-clerk-core-installer.py`.

## Watch items

Clean-machine proof must still exercise the real installed service: public/staff UI routes, readiness, contracts, staff-keyed queue read, RFP create/fetch, award packet create/fetch, procurement context, launcher, and all ten module route checks.

## Escalation recommendation

No escalation needed for this slice. The next required step is the repo-channel clean-machine tester directive after CivicGrants has a passing result.
