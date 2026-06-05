# Audit Lite - Stage 3A Phase-Aware Failure Message
**Date:** 2026-06-05
**Scope:** Reviewed the Stage 3A bootstrapper UX fix that replaces the stale Stage0/Stage1-only fallback message with phase-aware remediation text.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this slice. The bootstrapper now reports Stage2, Stage3, Stage4, Stage1, or Stage0 remediation guidance based on the failed phase instead of sending operators to Stage0/Stage1 for every exception. The new regression test proves a failed Docker Desktop spike produces Stage2-specific guidance and does not contain the old Stage0/Stage1 text.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

None.

## What's working
- `installer/baremetal/windows/civicsuite-baremetal-bootstrap.ps1` centralizes fallback remediation copy in `Get-FailureActionableMessage`, using existing stage result state plus the requested stage to infer the phase that failed.
- `tests/test_windows_baremetal_bootstrap.py::test_stage2_failure_uses_stage2_actionable_message` mutation-protects the bug shown in tester result 020: Stage2 Docker failure no longer prints the old Stage0/Stage1 prerequisite message.
- Existing Stage3 terminal-failure behavior remains covered by `test_stage3_failure_writes_terminal_failed_result_json`.

## Verification
- `python -m pytest tests/test_windows_baremetal_bootstrap.py::test_stage2_failure_uses_stage2_actionable_message tests/test_windows_baremetal_bootstrap.py::test_stage3_failure_writes_terminal_failed_result_json tests/test_windows_baremetal_progress.py` -> 4 passed.
- `python -m pytest tests/test_windows_baremetal_bootstrap.py tests/test_windows_baremetal_progress.py tests/test_docker_desktop_spike.py tests/test_stage2_live_install_blockers.py` -> 57 passed.
- `CIVICSUITE_ONE_CLICK_SMOKE_ONLY=1` with `installer/dist/CivicSuite-city-core-windows-0.1.2.cmd` -> `CivicSuite bare-metal wrapper smoke check passed.`
- `git diff --check` -> clean, with only Git CRLF conversion warnings.

## Escalation recommendation
No escalation needed for this scoped UX/diagnostic fix. It reduces operator confusion without changing install sequencing, prerequisite mutation behavior, or Stage4 evidence requirements.
