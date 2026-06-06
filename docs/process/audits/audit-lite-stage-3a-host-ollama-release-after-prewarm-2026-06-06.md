# Audit Lite - Stage 3A host Ollama release after prewarm
**Date:** 2026-06-06
**Scope:** Reviewed the host-Ollama model release step added after `TESTER-RESULT-044.md`.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this scoped fix. Result 044 proved `cpu_mmap_default` works but showed the resident `gemma4:e4b` worker consumed enough memory to make a later Python editable install fail, so the installer now records the prewarm proof and then unloads the model before memory-heavy install steps continue.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

No findings.

## What's working
- Correctness: `scripts/run-clerk-core-installer.py:1781` unloads the host-Ollama model only after a successful prewarm and resident-model check, preserving the evidence that the real model loaded.
- Safety: the release step is non-fatal and recorded as `host_ollama_release_model_after_prewarm`; unload failures stay visible with fix steps but do not mask the next install phase.
- Tests: `tests/test_stage2_live_install_blockers.py:688` proves successful prewarm triggers unload, and `tests/test_stage2_live_install_blockers.py:745` proves unload failure is reported as a warning instead of being hidden.

## Verification
- `python -m pytest tests\test_stage2_live_install_blockers.py -q` -> 55 passed
- `python scripts\verify-installer-plan.py` -> passed
- `python scripts\verify-suite-state.py --remote-only` -> passed

## Residual risk
The verify/workflow phase may reload `gemma4:e4b`, so the clean-machine rerun must confirm memory remains sufficient after Python module install and service startup. This fix is intended to prevent prewarm from starving package installation, not to lower the model's true runtime memory requirement.
