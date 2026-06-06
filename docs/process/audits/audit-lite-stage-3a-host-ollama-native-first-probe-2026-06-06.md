# Audit Lite - Stage 3A host Ollama native-first probe
**Date:** 2026-06-06
**Scope:** Reviewed the native-first host-Ollama probe order change after `TESTER-RESULT-042.md`.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this scoped fix. `TESTER-RESULT-042.md` proved the native request was present but ran only after eight failing forced profiles, so the installer now tries the plain host-Ollama request first and only falls back to synthetic profiles if native generation fails.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

No findings.

## What's working
- Correctness: `scripts/run-clerk-core-installer.py:88` makes `native_default` the first model-load profile, preserving the forced profile ladder as fallback evidence rather than the first path.
- Runtime evidence: successful native readiness now records a single `native_default` attempt with `options: null`; if native fails, the lifecycle still records the subsequent bounded GPU/CPU attempts.
- Tests: `tests/test_stage2_live_install_blockers.py:412` proves a successful native request is attempted first and stops further probing, while `tests/test_stage2_live_install_blockers.py:337` still proves fallback through the forced profiles when native fails.

## Verification
- `python -m pytest tests\test_stage2_live_install_blockers.py -q` -> 53 passed
- `python scripts\verify-installer-plan.py` -> passed
- `python scripts\verify-suite-state.py --remote-only` -> passed

## Residual risk
The tester host still has stale inaccessible default-port `llama-server.exe` workers in the last two results. This code gives the native path a clean first request, but if the host itself cannot load `gemma4:e4b` before any installer probing, the clean-machine gate will still correctly fail.
