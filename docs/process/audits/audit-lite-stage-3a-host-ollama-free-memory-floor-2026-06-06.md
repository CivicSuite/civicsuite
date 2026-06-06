# Audit Lite - Stage 3A host Ollama free-memory floor
**Date:** 2026-06-06
**Scope:** Reviewed the free-memory readiness guard added after `TESTER-RESULT-046.md`.
**Reviewer:** Codex (audit-lite)

## TL;DR
Ship this scoped fix. Result 046 started readiness with only about 3.7 GB available RAM, so the installer now fails fast below a 6 GB available-memory floor instead of spending minutes attempting model profiles that cannot load `gemma4:e4b`.

## Severity rollup
- Blocker: 0
- Critical: 0
- Major: 0
- Minor: 0
- Nit: 0

## Findings

No findings.

## What's working
- Correctness: `scripts/run-clerk-core-installer.py:621` checks available host memory before starting the host-Ollama server or trying model profiles.
- Evidence: low-memory failures now include detected available bytes, required bytes, and fix steps that tell the tester/operator to free RAM before rerunning.
- Tests: `tests/test_stage2_live_install_blockers.py:309` proves the exact low-memory condition from result 046 fails before any Ollama model probe.

## Verification
- `python -m pytest tests\test_stage2_live_install_blockers.py -q` -> 57 passed
- `python scripts\verify-installer-plan.py` -> passed
- `python scripts\verify-suite-state.py --remote-only` -> passed

## Residual risk
The floor is evidence-based for the available 16 GB tester host and `cpu_mmap_default` profile. It is a readiness guard, not a guarantee that every later phase has enough memory under arbitrary background load; the clean-machine rerun still has to prove install, verify, launcher, and live routes.
