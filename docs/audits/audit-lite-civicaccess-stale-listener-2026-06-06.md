# Audit Lite - CivicAccess stale-listener installer fix
**Date:** 2026-06-06
**Scope:** Reviewed the installer fix that prevents Python service startup from passing against a stale localhost listener and adds CivicAccess local data-dir wiring.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship for tester retry. The patch closes the observed false-positive start path from TESTER-RESULT-053 by stopping existing listeners before launch and failing if the newly spawned uvicorn process exits even when `/health` responds.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

None.

## What's working
- `scripts/run-clerk-core-installer.py` now records `pre_port_stop`, launches the Python service with module-specific environment, and rejects the stale-listener path with `failure=process_exited_after_start`.
- `tests/test_stage2_live_install_blockers.py` mutation-proves the previously failing case: a stale `/health` response cannot pass when the new process exits.
- CivicAccess suite installs now receive `CIVICACCESS_DATA_DIR` under the install root, keeping review persistence local to the CivicSuite runtime.

## Verification
- `pytest tests\test_stage2_live_install_blockers.py -q -k "start_python_service or python_service_install"`: 4 passed
- `pytest tests\test_stage2_live_install_blockers.py -q`: 67 passed
- `ruff check scripts\run-clerk-core-installer.py tests\test_stage2_live_install_blockers.py`: passed
- `python scripts\verify-suite-state.py --remote-only`: passed
- `python scripts\plan-installer.py --profile proven-suite --menu-style guided --dry-run`: passed

## Escalation recommendation
No escalation needed for this scoped installer fix. The clean-machine retry remains the required evidence gate.
