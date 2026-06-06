# Audit Lite: Stage 3A Host Memory Floor Fit

Date: 2026-06-06
Branch: stage-3a-baremetal-windows
Scope: Fix the TESTER-RESULT-048 blocker where readiness failed before model probing on the available 16 GB Windows host even though the host has already proven `gemma4:e4b` can run through the CPU mmap fallback profile.

## Rollup

Critical: 0
Major: 0
Minor: 0
Nit: 0
Open questions: 0

## Findings Closed

- The host-Ollama readiness free-memory guard now fits the supported 16 GB CPU mmap path instead of blocking at an artificial 6 GB floor.
- The low-memory fail-fast path remains for genuinely starved runs below the 4 GB floor, preserving a bounded failure before repeated model load attempts.
- A regression test proves the TESTER-RESULT-048 reported memory level proceeds into the real host-Ollama probe instead of returning `blocked-by-host-memory`.

## Verification

- `python -m pytest tests\test_stage2_live_install_blockers.py -q` passed: 59 passed.
- `python scripts\verify-suite-state.py --remote-only` passed.
- `python scripts\verify-installer-plan.py` passed with a 300 second wrapper timeout after the first 120 second wrapper timed out.
