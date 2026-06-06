# Audit Lite: Stage 3A Persistent Suite Launcher

Date: 2026-06-06
Branch: stage-3a-baremetal-windows
Scope: Fix the TESTER-RESULT-047 blocker where verify could pass by starting a temporary suite launcher server, while the independent post-verify launcher URL on port 18082 was not persistently served.

## Rollup

Critical: 0
Major: 0
Minor: 0
Nit: 0
Open questions: 0

## Findings Closed

- The installer now starts the copied suite launcher runtime as a persistent local process during install when suite modules are selected.
- Stage verify now requires an already-running persistent listener on `http://127.0.0.1:18082/` and fails if the launcher is missing, unreachable, or serving the wrong content.
- The temporary verify-only Python HTTP server path was removed, so verify can no longer mask a missing launcher process.
- Behavioral tests cover the persistent-listener requirement, wrong-content failure, and persistent launcher start process/log evidence.

## Verification

- `python -m pytest tests\test_stage2_live_install_blockers.py -q` passed: 58 passed.
- `python scripts\verify-installer-plan.py` passed and refreshed installer distribution artifacts.
- `python scripts\verify-suite-state.py --remote-only` passed.
