# Audit Lite - CivicContracts installer integration
**Date:** 2026-06-06
**Scope:** Umbrella installer CivicContracts source pin, proven-suite inclusion, local data/staff-key environment, integration-contract verification, generated installer artifacts, and regression tests.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ready to push after the active CivicProcure clean-machine gate completes. The umbrella installer now pins the verified CivicContracts source head, includes CivicContracts after CivicProcure in the proven-suite profile, starts it with an isolated local data directory and staff key, verifies readiness plus four suite contracts, and includes mutation-style tests for both pass and missing-contract failure paths.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

No findings.

## What's working
- `installer/modules.json` pins CivicContracts to `65b711571cdabd61974aa741f40d0e6e9f9c6567`, declares CivicCore `1.2.0`, requires CivicProcure, and includes CivicContracts in the proven-suite profile after CivicProcure.
- `scripts/run-clerk-core-installer.py` now assigns CivicContracts port `18864`, adds a launcher card, sets `CIVICCONTRACTS_DATA_DIR` and `CIVICCONTRACTS_STAFF_API_KEY`, and verifies `/api/v1/civiccontracts/readiness` plus `/api/v1/civiccontracts/integration-contracts`.
- `tests/test_stage2_live_install_blockers.py` proves the CivicContracts verifier passes with all four contracts, fails when `procurement_handoff` is missing, and injects local data/staff-key env when starting the module service.
- `scripts/verify-installer-plan.py` now treats CivicContracts as part of the proven-suite order and validates the custom CivicContracts dependency path through CivicProcure.
- Regression checks passed: full `tests/test_stage2_live_install_blockers.py`, targeted CivicContracts tests, `python -m py_compile scripts/run-clerk-core-installer.py`, `python scripts/verify-suite-state.py --remote-only`, and `python scripts/verify-installer-plan.py`.

## Watch items

This commit must not be pushed until `TESTER-RESULT-057.md` completes, because `TESTER-DIRECTIVE-057.md` targets the pre-CivicContracts ten-module CivicProcure gate. After CivicProcure passes, push this slice and write the CivicContracts clean-machine directive.

## Escalation recommendation

No escalation needed. Hold push only to avoid moving the active tester target.
