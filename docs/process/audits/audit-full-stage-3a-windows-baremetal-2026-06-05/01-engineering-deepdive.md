# Principal Engineer Deep Dive

## Scope

Reviewed the Stage 3A Windows bare-metal bootstrapper, progress wrapper, Docker Desktop spike integration, Stage4 evidence assertion, generated Windows artifact, release hashes, and tester channel state at `d318fbeb00549f39cab812eba7af1e7474941c6c`.

## Findings

None.

## What Is Working

- Stage1 resume cleanup is explicit: resumed runs call `Unregister-ScheduledTask` and record `resume_cleanup` in the structured result.
- Stage4 evidence assertion parses the lifecycle JSON for `draft_response_letter`, then fails unless the evidence says `generation_source=ollama` and `generation_model=gemma4:e4b`.
- Failure handling is phase-aware. Stage2 failures now direct the operator to Docker/Ollama prerequisites rather than generic Stage0/Stage1 advice.
- Terminal result JSON is written in the catch path, avoiding stale green/partial results after later-stage failures.
- The generated customer artifact includes the audited bootstrapper and progress wrapper, not only the source tree copy.

## Verification Evidence

- `tests/test_windows_baremetal_bootstrap.py::test_stage1_resume_run_self_unregisters_resume_task`
- `tests/test_windows_baremetal_bootstrap.py::test_stage4_fails_template_fallback_lifecycle_evidence`
- `tests/test_windows_baremetal_bootstrap.py::test_stage2_failure_uses_stage2_actionable_message`
- Generated zip inspection confirmed `civicsuite-baremetal-bootstrap.ps1`, `civicsuite-baremetal-progress.ps1`, `docker-desktop-spike.ps1`, and `scripts/run-clerk-core-installer.py` are present.

## Blast Radius Notes

No active findings. Any future change to Stage4 evidence shape must update `Assert-Stage4Evidence`, lifecycle proof generation, generated artifact regeneration, and the Stage4 template-fallback tests together.
