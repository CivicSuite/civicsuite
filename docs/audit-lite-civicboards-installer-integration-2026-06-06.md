# Audit Lite - CivicBoards installer integration

Date: 2026-06-06
Scope: Umbrella installer integration for CivicBoards after module local-first gate.

## TL;DR

Ship this slice to the held local umbrella commit, then wait for the active CivicContracts clean-machine gate before pushing it. CivicBoards is now source-pinned, added to the proven-suite plan, wired into the suite launcher, assigned a bounded local service port, given local data and staff-key environment injection, and independently verified through an installer integration-contract gate.

## Severity rollup

- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

No findings.

## Mutation-proven behavior

- `test_civicboards_verify_requires_ready_contracts` proves the installer verifier passes only when readiness is ready/schema-ready and all four CivicBoards contracts plus downstream handoff strings are present.
- `test_civicboards_verify_fails_without_records_export_contract` proves a missing required contract fails the gate.
- `test_start_civicboards_service_sets_local_data_dir_and_staff_key` proves suite service startup injects local data and staff-key environment and creates the data directory.

## Verification

- `python -m py_compile scripts/run-clerk-core-installer.py scripts/verify-installer-plan.py`: passed.
- `python -m pytest -q tests/test_stage2_live_install_blockers.py -k "civicboards"`: 3 passed.
- `python -m pytest -q tests/test_stage2_live_install_blockers.py`: 82 passed.
- `python scripts/verify-suite-state.py --remote-only`: passed.
- `python scripts/verify-installer-plan.py`: passed.
- `python scripts/plan-installer.py --profile proven-suite --menu-style guided --dry-run --generate-release-artifacts --installer-version 0.1.0`: regenerated the proven-suite package artifacts including CivicBoards.
