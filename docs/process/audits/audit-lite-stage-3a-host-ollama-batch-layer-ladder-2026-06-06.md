# Audit Lite - Stage 3A Host Ollama Batch/Layer Probe Ladder
**Date:** 2026-06-06
**Scope:** Reviewed the Stage 3A installer change that responds to `TESTER-RESULT-034.md` by adding explicit GPU layer-count, low-batch, and minimal CPU mmap host-Ollama profiles.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this slice to the tester. The gate still requires a real host-Ollama HTTP generation with `gemma4:e4b`; the change broadens the load profiles to test the actual host constraints exposed by the CUDA_Host and CPU_REPACK allocation failures.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings
None.

## What's working
- Correctness: `scripts/run-clerk-core-installer.py:58` keeps the original profiles and adds explicit `num_gpu` layer limits, low `num_batch`, and a final `cpu_tiny_batch` profile with `use_mmap=true` and `use_mlock=false`.
- Evidence: readiness reports now include `tiny_num_ctx` plus each attempt's profile/options/stderr/unload outcome, so a pass cannot hide which resource profile loaded.
- Tests: `tests/test_stage2_live_install_blockers.py:328` proves the order and exact options for low-batch GPU profiles and the final minimal CPU profile.
- Runtime checks: `python -m pytest tests\test_stage2_live_install_blockers.py -q` passed 45/45; `python scripts\verify-installer-plan.py` and `python scripts\verify-suite-state.py --remote-only` passed.

## Escalation recommendation
No escalation needed for this slice. If all profiles still fail on the tester, the next action should be a diagnostic result that captures host free-memory/Ollama version/model metadata before changing product behavior.
