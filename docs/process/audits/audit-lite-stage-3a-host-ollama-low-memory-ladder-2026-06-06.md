# Audit Lite - Stage 3A Host Ollama Low-Memory Probe Ladder
**Date:** 2026-06-06
**Scope:** Reviewed the Stage 3A installer change that responds to `TESTER-RESULT-033.md` by expanding host-Ollama `gemma4:e4b` readiness/prewarm from GPU plus CPU fallback to a four-profile low-memory ladder with unloads between failed attempts.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this slice to the tester. The change does not weaken the gate: it still requires a real Ollama HTTP generation before install, but now tests the profiles most likely to fit the available 16GB/VRAM host and records every attempt.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings
None.

## What's working
- Correctness: `scripts/run-clerk-core-installer.py:57` now tries `gpu_bounded`, `gpu_low_vram`, `cpu_bounded`, and `cpu_small_context` instead of stopping after the CPU_REPACK failure seen in `TESTER-RESULT-033.md`.
- Runtime hygiene: `scripts/run-clerk-core-installer.py:566` unloads host Ollama after failed profiles so one failed model startup is less likely to contaminate the next attempt.
- Evidence: readiness and install reports include `selected_profile`, `attempts`, profile options, unload return codes, and stderr snippets.
- Tests: `tests/test_stage2_live_install_blockers.py:314` proves the ladder order, `low_vram`, `num_gpu=0`, `num_ctx=512`, and unload calls.
- Verification: `python -m pytest tests\test_stage2_live_install_blockers.py -q` passed 45/45; `python scripts\verify-installer-plan.py` and `python scripts\verify-suite-state.py --remote-only` passed.

## Escalation recommendation
No escalation needed for this slice. The next decision point is external evidence from the tester: whether one of the low-memory profiles loads `gemma4:e4b` and allows the proven-suite install to proceed.
