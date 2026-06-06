# Audit Lite - Stage 3A host Ollama readiness release and reuse
**Date:** 2026-06-06
**Scope:** Reviewed the readiness unload and single-install host-Ollama prewarm reuse fix after `TESTER-RESULT-045.md`.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this scoped fix. Result 045 showed readiness left a large CPU model worker resident and install then tried to reload the same host model for clerk after records had already proved it, so the installer now unloads after readiness proof and reuses the first successful host-Ollama install prewarm proof for later host-Ollama targets.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

No findings.

## What's working
- Correctness: `scripts/run-clerk-core-installer.py:602` records `release_after_probe` for successful readiness model checks, preventing readiness from starving the subsequent install process.
- Install behavior: `scripts/run-clerk-core-installer.py:1698` reuses a prior successful host-Ollama prewarm proof inside the same install context instead of forcing a second `gemma4:e4b` load for clerk.
- Evidence: reused prewarm steps are explicit via `reused_prior_host_ollama_prewarm`, so the lifecycle does not silently skip model proof.
- Tests: `tests/test_stage2_live_install_blockers.py:158` proves readiness unloads after a successful host-Ollama probe, and `tests/test_stage2_live_install_blockers.py:786` proves clerk reuses records' host-Ollama proof without a second model load.

## Verification
- `python -m pytest tests\test_stage2_live_install_blockers.py -q` -> 56 passed
- `python scripts\verify-installer-plan.py` -> passed
- `python scripts\verify-suite-state.py --remote-only` -> passed

## Residual risk
The clean-machine rerun must still prove that releasing after readiness/prewarm leaves enough memory for Python module installation and that verify/workflow proof can reload the model when it actually needs generation.
