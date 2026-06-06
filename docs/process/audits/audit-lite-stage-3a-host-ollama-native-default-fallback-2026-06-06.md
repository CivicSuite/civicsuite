# Audit Lite - Stage 3A host Ollama native-default fallback
**Date:** 2026-06-06
**Scope:** Reviewed the Stage 3A host-Ollama model-load fallback added after `TESTER-RESULT-041.md`.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this scoped fix. The change preserves the existing forced GPU/CPU profile ladder, then adds one final `native_default` HTTP generation request without synthetic Ollama options, matching the available host path Scott reported as working.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

No findings.

## What's working
- Correctness: `scripts/run-clerk-core-installer.py:87` appends `native_default` after the existing bounded profiles, so prior evidence remains visible before the final plain request is attempted.
- Runtime evidence: `scripts/run-clerk-core-installer.py:633` omits the `options` payload only for the native profile, and `scripts/run-clerk-core-installer.py:783` records that attempt with `options: null`.
- Tests: `tests/test_stage2_live_install_blockers.py:412` proves that all forced profiles can fail while the final native request succeeds, and it asserts the native request contains no `options` field.

## Verification
- `python -m pytest tests\test_stage2_live_install_blockers.py -q` -> 53 passed
- `python scripts\verify-installer-plan.py` -> passed
- `python scripts\verify-suite-state.py --remote-only` -> passed

## Residual risk
The actual proof still requires the tester host. This local fix can prove request selection and evidence shape, but only the clean-machine rerun can prove the host Ollama runtime accepts the native request and carries install/verify/live routes through.
