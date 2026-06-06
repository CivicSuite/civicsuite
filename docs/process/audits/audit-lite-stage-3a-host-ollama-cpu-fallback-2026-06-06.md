# Audit Lite - Stage 3A Host Ollama CPU Fallback
**Date:** 2026-06-06
**Scope:** Reviewed the Stage 3A installer change that retries the host-Ollama `gemma4:e4b` readiness/prewarm probe with `num_gpu=0` after the bounded GPU profile fails.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this slice to the tester. The change preserves the original bounded GPU attempt, adds an explicit bounded CPU fallback for the available 16GB/VRAM host, and records attempted profiles in lifecycle evidence so fallback success is not hidden.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings
None.

## What's working
- Correctness: `scripts/run-clerk-core-installer.py:57` defines an ordered probe ladder, and `scripts/run-clerk-core-installer.py:566` only passes after an actual Ollama HTTP generation succeeds.
- Evidence: `scripts/run-clerk-core-installer.py:496` and `scripts/run-clerk-core-installer.py:1521` preserve `selected_profile` plus per-attempt options/stderr in readiness and install prewarm lifecycle records.
- Tests: `tests/test_stage2_live_install_blockers.py:314` proves CUDA host allocation failure falls through to `num_gpu=0`; readiness and install tests assert profile evidence.
- Runtime checks: `python -m pytest tests\test_stage2_live_install_blockers.py -q` passed 45/45; `python scripts\verify-installer-plan.py` and `python scripts\verify-suite-state.py --remote-only` passed.

## Escalation recommendation
No escalation needed for this slice. The remaining risk is environmental: the tester must prove whether CPU fallback loads `gemma4:e4b` and completes the proven-suite install on the only available clean machine.
