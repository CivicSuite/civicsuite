# Test Engineer Deep Dive

## Scope

Reviewed Stage 3A bootstrap tests, progress wrapper tests, Docker Desktop spike tests, installer truth tests, artifact smoke, and generated bundle inspection.

## Findings

None.

## What Is Working

- Behavioral tests cover the audit findings that mattered most: self-terminating resume task, independent Stage4 evidence parsing, template fallback failure, Stage2 actionable failure guidance, stale-result prevention, and truth-doc currency.
- The focused Stage 3A suite passes end to end: 57 tests.
- The one-click wrapper smoke path passes with `CIVICSUITE_ONE_CLICK_SMOKE_ONLY=1`.
- The generated artifact was inspected directly, closing the source-vs-distributable blind spot.

## Verification Evidence

- `python -m pytest tests/test_windows_baremetal_bootstrap.py tests/test_windows_baremetal_progress.py tests/test_docker_desktop_spike.py tests/test_stage2_live_install_blockers.py` -> 57 passed.
- `CIVICSUITE_ONE_CLICK_SMOKE_ONLY=1 installer/dist/CivicSuite-city-core-windows-0.1.2.cmd` -> smoke passed.

## Coverage Boundary

Local tests do not replace the bare Windows tester run. Tester directive 022 is required because artifact bytes changed after tester result 021.
