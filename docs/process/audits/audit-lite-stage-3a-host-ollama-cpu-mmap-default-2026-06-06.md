# Audit Lite - Stage 3A host Ollama CPU mmap default fallback
**Date:** 2026-06-06
**Scope:** Reviewed the `cpu_mmap_default` host-Ollama fallback added after `TESTER-RESULT-043.md`.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this scoped fix. The installer now tries native host-Ollama first, then a CPU mmap profile without forced context or batch settings before it reaches the older GPU/CPU ladder that repeatedly failed on the tester host.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

No findings.

## What's working
- Correctness: `scripts/run-clerk-core-installer.py:88` adds `cpu_mmap_default` immediately after the plain native request, isolating the observed CUDA host allocation failure without going straight into the stack-buffer-overrun-prone tiny profile.
- Runtime evidence: if this path succeeds, lifecycle evidence will show `selected_profile=cpu_mmap_default` and the attempt options `{num_gpu: 0, use_mmap: true, use_mlock: false}`.
- Tests: `tests/test_stage2_live_install_blockers.py:451` proves native failure can be followed by CPU mmap success before any forced GPU profiles run, and `tests/test_stage2_live_install_blockers.py:337` still covers the full fallback ladder if CPU mmap also fails.

## Verification
- `python -m pytest tests\test_stage2_live_install_blockers.py -q` -> 54 passed
- `python scripts\verify-installer-plan.py` -> passed
- `python scripts\verify-suite-state.py --remote-only` -> passed

## Residual risk
This is still constrained by the tester host's real ability to load `gemma4:e4b`. If CPU mmap also returns an Ollama allocation failure, the installer is correctly reporting a host/model readiness failure rather than masking it.
