# Audit Full - Stage 3A Windows Bare-Metal Installer

**Date:** 2026-06-05  
**Scope:** `stage-3a-baremetal-windows` at `d318fbeb00549f39cab812eba7af1e7474941c6c`  
**Mode:** Scoped five-role release-gate audit, run sequentially in Codex because no authorized subagent tool was used.

## Executive Summary

No Blocker, Critical, Major, Minor, or Nit findings remain in the audited Stage 3A Windows bare-metal installer slice. The earlier truth-drift found during this audit was fixed before this package was finalized: current docs now state that tester result 021 is prior green customer-artifact evidence and tester directive 022 is pending for the later `a53bad3` artifact refresh. Source, generated bundle, release hashes, tests, and docs now align around the same claim: the installer requires real `generation_source=ollama` and `generation_model=gemma4:e4b` evidence, surfaces phase-specific failure guidance, and does not promote, merge, tag, or claim procurement readiness. Stage closeout still depends on `TESTER-RESULT-022.md` because the downloadable Windows artifact changed after result 021.

## Severity Roll-Up

- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Top Findings

None.

## What Is Working

- `installer/baremetal/windows/civicsuite-baremetal-bootstrap.ps1` unregisters the resume task on resumed Stage1 runs and records `resume_cleanup`.
- Stage4 independently parses lifecycle evidence and checks `generation_source=ollama` plus `generation_model=gemma4:e4b`; it does not trust static required-value literals alone.
- The generated Windows bundle and zip contain the phase-aware Stage2 failure guidance and independent Stage4 assertion logic.
- `civicsuite-baremetal-progress.ps1` renders stage statuses, log paths, actionable failures, and final local URLs only after the bootstrap result is not failed.
- Docs and tests now distinguish prior green evidence from the current pending artifact refresh re-gate.

## Verification

- `python -m pytest tests/test_windows_baremetal_bootstrap.py tests/test_windows_baremetal_progress.py tests/test_docker_desktop_spike.py tests/test_stage2_live_install_blockers.py` -> 57 passed.
- `CIVICSUITE_ONE_CLICK_SMOKE_ONLY=1 installer/dist/CivicSuite-city-core-windows-0.1.2.cmd` -> smoke passed.
- Generated zip inspection confirmed required installer scripts are present and contain phase-aware Stage2 guidance plus independent Ollama/gemma4 assertions.
- `git diff --check` -> clean apart from Git CRLF conversion warnings.

## Gate Status

Audit status is green with 0/0/0/0/0 findings. Stage 3A is not ready to close until the external tester writes `test-comms/TESTER-RESULT-022.md` for the `a53bad3` artifact refresh and it passes.

## Cross-Role Reports

- Engineering: `01-engineering-deepdive.md`
- UI/UX: `02-uiux-deepdive.md`
- Documentation: `03-documentation-deepdive.md`
- Test Engineering: `04-test-deepdive.md`
- QA: `05-qa-deepdive.md`
